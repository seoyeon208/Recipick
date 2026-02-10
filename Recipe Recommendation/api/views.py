import os
import json
import json_repair
import requests
import pandas as pd
import traceback
import base64
import uuid
import re
from openai import OpenAI

from django.core.files.base import ContentFile
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from dotenv import load_dotenv

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from recipes.models import Recipe, Ingredient, RecipeIngredient, Step, UserIngredient, Favorite, Comment, RecentlyViewed
from .serializers import UserSerializer, UserIngredientSerializer, FavoriteSerializer, CommentSerializer

# .env 로드
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
env_path = os.path.join(root_dir, '.env')
load_dotenv(env_path)

# 키 설정 (공백 제거)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY", "").strip()

# ==========================================
# 1. AI 로직 (Upstage Solar & Gemini)
# ==========================================

def get_gemini_recipe_text(recipe_name, ingredients_str):
    """ 텍스트 레시피 생성 (Upstage Solar-pro2 사용) """
    
    fallback_data = {
        "description": "맛있는 요리를 위한 레시피입니다.",
        "cooking_time": 20,
        "difficulty": "보통",
        "category": "기타",
        "steps": ["재료를 손질합니다.", "맛있게 조리합니다.", "완성입니다."],
        "tips": ["신선한 재료를 사용하세요."],
        "nutrition": {"calories": 0, "carbohydrate": 0, "protein": 0, "fat": 0, "sodium": 0},
        "required_equipment": ["프라이팬", "냄비"],
        "alternative_ingredients": {},
        "late_night_suitable": False,
        "health_tags": []
    }
    
    print(f"🚀 [AI 텍스트 요청] 모델: solar-pro2 / 요리명: {recipe_name}")

    try:
        # 1. API 키 확인
        if not UPSTAGE_API_KEY:
            print("❌ [오류] UPSTAGE_API_KEY가 없습니다.")
            return fallback_data

        # 2. 클라이언트 설정
        client = OpenAI(
            api_key=UPSTAGE_API_KEY,
            base_url="https://api.upstage.ai/v1"
        )
        
        system_message = "당신은 미슐랭 3스타 셰프이자 식품 영양학 전문가입니다. JSON 형식으로 응답하세요."
        
        user_message = f"""
        요리명: {recipe_name}
        가용 재료: {ingredients_str}
        
        다음 정보를 포함하여 완벽한 JSON 데이터를 만드세요.

        [헬스 태그(health_tags) 선정 기준]
        1. 뷰티 핏: 다이어트 식단 (저칼로리, 저탄수화물, 체중 감량용)
        2. 프로틴 업: 고단백 식단 (닭가슴살, 계란, 콩 등 단백질 함량이 높음)
        3. 배지라이프: 비건 식단 (고기, 해산물, 유제품 등 동물성 재료 없음)
        4. 저속노화 식단: 자극적이지 않고 건강한 식단 (저당, 저염, 가공식품 최소화, 통곡물/채소 위주)
        (위 기준에 부합하는 경우에만 해당 태그를 리스트에 담아주세요. 없으면 빈 배열)
        
        [필수 JSON 포맷]
        {{
            "description": "요리 설명 (한글, 50자 내외)",
            "cooking_time": 숫자(분),
            "difficulty": "초급/중급/고급",
            "category": "한식/양식/중식/일식/디저트/기타 중 택1",
            "late_night_suitable": true 또는 false,
            "health_tags": ["뷰티 핏", "프로틴 업" 등 해당되는 것],
            "ingredients": [{{"name": "이름", "amount": "양"}}],
            "required_equipment": ["필요한 도구 리스트"],
            "alternative_ingredients": {{ "원래재료": ["대체재료1", "대체재료2"] }},
            "steps": ["조리과정1", "조리과정2"], 
            "tips": ["팁1", "팁2"],
            "nutrition": {{"calories": 0, "carbohydrate": 0, "protein": 0, "fat": 0, "sodium": 0}}
        }}

        [주의사항]
        1. steps 문장 앞에 번호를 붙이지 마세요.
        2. 오직 순수한 JSON만 응답하세요.
        """

        # 3. AI 요청
        response = client.chat.completions.create(
            model="solar-pro2",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            stream=False,
        )

        response_text = response.choices[0].message.content
        
        # 4. JSON 파싱 (json_repair 적용)
        try:
            data = json_repair.loads(response_text)
            
            # steps 번호 제거 처리
            if 'steps' in data and isinstance(data['steps'], list):
                data['steps'] = [re.sub(r'^\d+\.\s*', '', str(step)) for step in data['steps']]
            
            return data
            
        except Exception as e:
            print(f"⚠️ [Solar JSON 복구 실패]: {e}")
            return fallback_data

    # ✅ [중요] 이 부분이 빠져서 에러가 났던 것입니다!
    except Exception as e:
        print(f"❌ [Solar 생성 실패]: {e}")
        return fallback_data

def save_image_from_gemini(recipe_name):
    """ 이미지 생성 (Gemini 2.0 Flash Exp Image Generation) """
    if not GEMINI_API_KEY:
        print("⚠️ [이미지 생성 건너뜀] Gemini API Key가 없습니다.")
        return None

    print(f"🎨 [AI 이미지 요청] {recipe_name} 그리는 중...")
    try:
        url = f"https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key={GEMINI_API_KEY}"
        headers = { 'Content-Type': 'application/json' }
        prompt = f"High-quality professional food photography of {recipe_name}, delicious, cinematic lighting, 4k"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": { "responseModalities": ["TEXT", "IMAGE"] }
        }

        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            print(f"⚠️ [이미지 생성 오류] {response.status_code}: {response.text}")
            return None

        result = response.json()
        parts = result.get('candidates', [])[0].get('content', {}).get('parts', [])
        
        for part in parts:
            if 'inlineData' in part:
                img_data_b64 = part['inlineData']['data']
                img_data = base64.b64decode(img_data_b64)
                
                file_name = f"{uuid.uuid4()}.jpg"
                media_root = settings.MEDIA_ROOT
                if not os.path.exists(media_root):
                    os.makedirs(media_root)
                
                file_path = os.path.join(media_root, file_name)
                with open(file_path, "wb") as f:
                    f.write(img_data)
                
                # 주의: 배포 시에는 도메인 변경 필요
                return f"http://127.0.0.1:8000/media/{file_name}"
        
        print("⚠️ [이미지 데이터 없음]")
        return None
    except Exception as e:
        print(f"⚠️ 이미지 저장 실패: {e}")
        return None

# ==========================================
# 2. 뷰 로직 (통합)
# ==========================================

@api_view(["POST"])
@permission_classes([AllowAny])
def recommend_recipes(request):
    try:
        # 사용자가 입력한 재료 (공백 제거)
        user_ingredients = [u.strip() for u in request.data.get("ingredients", [])]
        
        csv_path = os.path.join(root_dir, 'backend_dj', 'recipe_dataset.csv')
        if not os.path.exists(csv_path): 
            csv_path = os.path.join(root_dir, 'recipe_dataset.csv')
        
        matched_list = []
        
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path, on_bad_lines='skip')
            for _, row in df.iterrows():
                ingredients_raw = str(row.get('ingredients', ''))
                
                # 💡 [핵심 수정 1] 재료명만 깔끔하게 추출해서 리스트로 만들기
                # 예: "돼지고기 300g|양파 1/2개" -> ["돼지고기", "양파"]
                recipe_ing_names = []
                for raw in ingredients_raw.split('|'):
                    raw = raw.strip()
                    if not raw: continue
                    # 뒤에서부터 공백으로 잘라서 이름만 추출 (예: "양파 1/2개" -> "양파")
                    parts = raw.rsplit(' ', 1)
                    recipe_ing_names.append(parts[0].strip())

                total_count = len(recipe_ing_names)
                
                # 💡 [핵심 수정 2] 정확한 단어 매칭 ("파"가 "양파"에 포함되지 않도록)
                match_count = 0
                for u_ing in user_ingredients:
                    for r_ing in recipe_ing_names:
                        # 사용자가 입력한 재료가 레시피 재료명에 정확히 포함되거나 같은지 확인
                        # 예: "김치" == "묵은지 김치" (O), "파" == "양파" (X)
                        if u_ing == r_ing or (len(u_ing) > 1 and u_ing in r_ing and r_ing != "양파" and u_ing != "파"): 
                            match_count += 1
                            break # 중복 카운트 방지
                
                if total_count > 0:
                    match_rate = (match_count / total_count) * 100
                    
                    # 💡 [필터링] 10% 이상인 것만 통과
                    if match_rate >= 10:
                        matched_list.append({
                            'title': row.get('food_title', '이름 없는 요리'),
                            'ingredients_raw': ingredients_raw,
                            'time': int(''.join(filter(str.isdigit, str(row.get('time', '20')))) or 20),
                            'difficulty': row.get('difficulty', '초급'),
                            'category': row.get('cartegory', '기타'),
                            'match_count': match_count
                        })
            
            matched_list = sorted(matched_list, key=lambda x: x['match_count'], reverse=True)[:3]
        else:
            if user_ingredients:
                matched_list = [{'title': f"{user_ingredients[0]} 요리", 'ingredients_raw': '|'.join(user_ingredients), 'time': 20, 'difficulty': '초급', 'category': '기타', 'match_count': 1}]
            else:
                matched_list = []

        final_results = []

        for item in matched_list:
            recipe, created = Recipe.objects.get_or_create(
                name=item['title'],
                defaults={
                    'cooking_time': item['time'],
                    'difficulty': item['difficulty'],
                    'category': item['category']
                }
            )

            if not RecipeIngredient.objects.filter(recipe=recipe).exists():
                for raw_ing in item['ingredients_raw'].split('|'):
                    parts = raw_ing.strip().rsplit(' ', 1)
                    if not parts[0]: continue
                    ing_obj, _ = Ingredient.objects.get_or_create(name=parts[0])
                    RecipeIngredient.objects.get_or_create(recipe=recipe, ingredient=ing_obj, defaults={'amount': parts[1] if len(parts)>1 else '적당량'})

            # AI 텍스트 생성
            if not recipe.steps.exists():
                ai_data = get_gemini_recipe_text(item['title'], item['ingredients_raw'])
                
                if hasattr(recipe, 'description'): recipe.description = ai_data.get('description', '')
                if hasattr(recipe, 'tips'): recipe.tips = ai_data.get('tips', [])
                if hasattr(recipe, 'nutrition'): recipe.nutrition = ai_data.get('nutrition', {})
                recipe.save()
                
                for i, s in enumerate(ai_data.get('steps', []), 1): 
                    Step.objects.create(recipe=recipe, order=i, content=s)
            
            # AI 이미지 생성
            if not recipe.image or "unsplash" in str(recipe.image):
                image_url = save_image_from_gemini(item['title'])
                if image_url:
                    recipe.image = image_url
                    recipe.save()
                elif not recipe.image:
                    recipe.image = f"https://source.unsplash.com/800x600/?{recipe.name},food"
                    recipe.save()

            recipe_ings = RecipeIngredient.objects.filter(recipe=recipe)
            recipe_steps = Step.objects.filter(recipe=recipe).order_by('order')
            
            current_ai_data = ai_data if 'ai_data' in locals() else {}

            final_results.append({
                "id": f"db-{recipe.id}", 
                "name": recipe.name,
                "cookingTime": current_ai_data.get('cooking_time', recipe.cooking_time),
                "difficulty": current_ai_data.get('difficulty', recipe.difficulty),
                "category": current_ai_data.get('category', recipe.category),
                "lateNightSuitable": current_ai_data.get('late_night_suitable', False),
                "healthTags": current_ai_data.get('health_tags', []),
                "ingredients": [{"name": i.ingredient.name, "amount": i.amount} for i in recipe_ings],
                "steps": [s.content for s in recipe_steps],
                "image": recipe.image,
                "description": getattr(recipe, 'description', current_ai_data.get('description', '')),
                "tips": getattr(recipe, 'tips', current_ai_data.get('tips', [])),
                "nutrition": getattr(recipe, 'nutrition', current_ai_data.get('nutrition', {})),
                "requiredEquipment": current_ai_data.get('required_equipment', ["조리 도구"]),
                "alternativeIngredients": current_ai_data.get('alternative_ingredients', {}),
                "author": "AI 셰프",
                "isUserRecipe": False,
            })

        return Response(final_results)
    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

# ==========================================
# 3. 기타 유저/커뮤니티 API
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": "회원가입 성공!", "user": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        return Response({"message": "로그인 성공", "user": {"id": user.id, "username": user.username}})
    return Response({"error": "아이디/비번 불일치"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([AllowAny])
def user_ingredients(request):
    username = request.GET.get('username') or request.data.get('username')
    if not username: return Response({"error": "유저 정보 필요"}, 400)
    try: user = User.objects.get(username=username)
    except User.DoesNotExist: return Response({"error": "존재하지 않는 유저"}, 404)

    if request.method == 'GET':
        ings = UserIngredient.objects.filter(user=user)
        return Response(UserIngredientSerializer(ings, many=True).data)
    elif request.method == 'POST':
        UserIngredient.objects.filter(user=user).delete()
        for item in request.data.get('ingredients', []):
            ing_name = item if isinstance(item, str) else item.get('name')
            if ing_name: UserIngredient.objects.create(user=user, name=ing_name)
        return Response({"message": "저장 완료"})

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def favorites(request):
    username = request.data.get('username') or request.GET.get('username')
    if not username: return Response({"error": "유저 정보 필요"}, 400)
    user = User.objects.get(username=username)

    if request.method == 'GET':
        favs = Favorite.objects.filter(user=user)
        return Response(FavoriteSerializer(favs, many=True).data)
    elif request.method == 'POST':
        recipe_id = request.data.get('recipe_id')
        if isinstance(recipe_id, str) and recipe_id.startswith('db-'):
            recipe_id = int(recipe_id.replace('db-', ''))
        recipe = Recipe.objects.get(id=recipe_id)
        fav, created = Favorite.objects.get_or_create(user=user, recipe=recipe)
        if not created:
            fav.delete()
            return Response({"message": "삭제됨", "status": "removed"})
        return Response({"message": "추가됨", "status": "added"})

# backend_dj/api/views.py

@api_view(['POST'])
@permission_classes([AllowAny]) # 👈 [중요] 누구나 요청 가능하게 변경 (아이디로 직접 찾기 위함)
def create_user_recipe(request):
    """ 사용자가 직접 레시피를 등록하는 API """
    try:
        data = request.data
        
        # 1. 작성자 찾기 (프론트에서 보낸 'author'로 유저 찾기)
        username = data.get('author')
        if not username:
             return Response({"error": "작성자 정보(author)가 필요합니다."}, status=400)
             
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "존재하지 않는 사용자입니다."}, status=404)

        # 2. 레시피 기본 정보 저장
        recipe = Recipe.objects.create(
            author=user, # 찾아낸 유저 연결
            name=data.get('name'),
            description=data.get('description', ''),
            cooking_time=data.get('cookingTime', 20),
            difficulty=data.get('difficulty', '보통'),
            category=data.get('category', '기타'),
            dishwashing=data.get('dishwashing', '보통'),
            late_night_suitable=data.get('lateNightSuitable', False),
            health_tags=data.get('healthTags', []),
            required_equipment=data.get('requiredEquipment', []),
            image=data.get('image', '')
        )

        # 3. 재료 저장
        ingredients = data.get('ingredients', [])
        for ing_data in ingredients:
            ing_name = ing_data.get('name')
            amount = ing_data.get('amount', '적당량')
            if ing_name:
                ing_obj, _ = Ingredient.objects.get_or_create(name=ing_name)
                RecipeIngredient.objects.create(recipe=recipe, ingredient=ing_obj, amount=amount)

        # 4. 조리 순서 저장
        steps = data.get('steps', [])
        for idx, content in enumerate(steps):
            if content.strip():
                Step.objects.create(recipe=recipe, order=idx+1, content=content)
            
        return Response({"message": "레시피가 등록되었습니다!", "recipe_id": recipe.id}, status=201)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
    

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_recipes(request):
    """ 모든 레시피 조회 (상세 정보 포함) """
    # 최신순 정렬
    recipes = Recipe.objects.all().order_by('-created_at')[:100]
    data = []
    for r in recipes:
        ings = RecipeIngredient.objects.filter(recipe=r)
        steps = Step.objects.filter(recipe=r).order_by('order')
        
        # 작성자 이름 처리
        author_name = r.author.username if r.author else "AI 셰프"
        is_user_recipe = True if r.author else False

        data.append({
            "id": f"db-{r.id}",
            "name": r.name,
            "cookingTime": r.cooking_time,
            "difficulty": r.difficulty,
            "category": r.category,
            "dishwashing": r.dishwashing,           # 추가됨
            "lateNightSuitable": r.late_night_suitable, # 추가됨
            "healthTags": r.health_tags,            # 추가됨
            "requiredEquipment": r.required_equipment, # 추가됨
            "ingredients": [{"name": i.ingredient.name, "amount": i.amount} for i in ings],
            "steps": [s.content for s in steps],
            "image": r.image,
            "description": r.description,
            "author": author_name,
            "isUserRecipe": is_user_recipe,
            "createdAt": r.created_at
        })
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def comments(request, recipe_id):
    """ 레시피 댓글 조회 및 작성 """
    try:
        # 댓글 조회
        if request.method == 'GET':
            comments_qs = Comment.objects.filter(recipe_id=recipe_id).order_by('-created_at')
            return Response(CommentSerializer(comments_qs, many=True).data)
        
        # 댓글 작성
        elif request.method == 'POST':
            # 1. 로그인한 유저 찾기 (토큰 인증 방식이면 request.user 사용 권장)
            # 여기서는 프론트에서 username을 보내준다고 가정 (기존 로직 유지)
            username = request.data.get('username')
            if not username:
                return Response({"error": "유저 정보가 필요합니다."}, status=400)
                
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({"error": "존재하지 않는 유저입니다."}, status=404)

            content = request.data.get('content')
            if not content:
                 return Response({"error": "내용을 입력해주세요."}, status=400)

            # 2. 레시피 찾기
            try:
                recipe = Recipe.objects.get(id=recipe_id)
            except Recipe.DoesNotExist:
                return Response({"error": "존재하지 않는 레시피입니다."}, status=404)

            # 3. 저장
            comment = Comment.objects.create(user=user, recipe=recipe, content=content)
            return Response(CommentSerializer(comment).data, status=201)

    except Exception as e:
        # 에러 로그 출력
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

# backend_dj/api/views.py 맨 아래에 추가

@api_view(['PUT'])
@permission_classes([AllowAny]) # 실제 서비스에선 IsAuthenticated 권장
def update_recipe(request, recipe_id):
    """ 레시피 수정 API """
    try:
        # 1. 레시피 찾기
        try:
            recipe = Recipe.objects.get(id=recipe_id)
        except Recipe.DoesNotExist:
            return Response({"error": "레시피를 찾을 수 없습니다."}, status=404)

        # 2. 본인 확인 (여기서는 아이디 비교로 간단히 처리)
        # request.user.username과 recipe.author가 같은지 확인하는 로직 권장
        if request.data.get('author') and recipe.author.username != request.data.get('author'):
             return Response({"error": "수정 권한이 없습니다."}, status=403)

        data = request.data

        # 3. 기본 정보 업데이트
        recipe.name = data.get('name', recipe.name)
        recipe.description = data.get('description', recipe.description)
        recipe.cooking_time = data.get('cookingTime', recipe.cooking_time)
        recipe.difficulty = data.get('difficulty', recipe.difficulty)
        recipe.category = data.get('category', recipe.category)
        recipe.save()

        # 4. 재료 업데이트 (기존 재료 삭제 후 다시 등록)
        if 'ingredients' in data:
            RecipeIngredient.objects.filter(recipe=recipe).delete()
            for ing_data in data['ingredients']:
                ing_name = ing_data.get('name')
                amount = ing_data.get('amount', '적당량')
                if ing_name:
                    ing_obj, _ = Ingredient.objects.get_or_create(name=ing_name)
                    RecipeIngredient.objects.create(recipe=recipe, ingredient=ing_obj, amount=amount)

        # 5. 조리 순서 업데이트 (기존 순서 삭제 후 다시 등록)
        if 'steps' in data:
            Step.objects.filter(recipe=recipe).delete()
            for idx, content in enumerate(data['steps']):
                if content.strip():
                    Step.objects.create(recipe=recipe, order=idx+1, content=content)

        return Response({"message": "수정 성공!"}, status=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

# backend_dj/api/views.py 맨 아래

@api_view(['DELETE'])
@permission_classes([AllowAny]) # 실제 서비스에선 작성자 본인 확인 필요
def delete_recipe(request, recipe_id):
    """ 레시피 삭제 API """
    try:
        # 1. 레시피 찾기
        recipe = Recipe.objects.get(id=recipe_id)
        
        # 2. 삭제하기
        recipe.delete()
        
        return Response({"message": "삭제되었습니다."}, status=200)

    except Recipe.DoesNotExist:
        return Response({"error": "이미 삭제되었거나 없는 레시피입니다."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    

# backend_dj/api/views.py

@api_view(['POST'])
@permission_classes([AllowAny])
def recommend_recipes_ai(request):
    """ 사용자의 상황(시간, 재료, 취향)에 맞는 AI 맞춤 추천 """
    try:
        data = request.data
        ingredients = data.get('ingredients', [])
        time_slot = data.get('timeSlot', '점심') # 아침, 점심, 저녁, 야식
        preferences = data.get('preferences', '') # 예: 매운거 좋아함, 다이어트 중

        # 1. AI 프롬프트 작성 (상황극 부여)
        prompt = f"""
        나는 지금 냉장고에 {', '.join(ingredients)}을(를) 가지고 있어.
        지금 시간은 '{time_slot}'이고, 나의 취향은 '{preferences}'야.
        
        이 상황에 가장 잘 어울리는 창의적인 레시피 3가지를 추천해줘.
        
        [조건]
        1. '{time_slot}' 시간대에 먹기 부담스럽지 않거나 어울리는 메뉴여야 해.
        2. 내가 가진 재료를 최대한 활용해야 해.
        3. 응답은 반드시 아래 JSON 리스트 형식으로만 줘. (설명 금지)

        [
            {{
                "name": "요리 이름",
                "description": "왜 이 시간/취향에 맞는지 한 줄 설명",
                "cooking_time": 20,
                "difficulty": "쉬움",
                "category": "한식",
                "ingredients": [{{"name": "재료1", "amount": "1개"}}],
                "steps": ["단계1", "단계2"],
                "health_tags": ["다이어트", "저염"]
            }}
        ]
        """

        # 2. AI 요청 (Upstage Solar 사용 예시)
        if not UPSTAGE_API_KEY:
             return Response({"error": "AI 키가 설정되지 않았습니다."}, status=500)

        client = OpenAI(api_key=UPSTAGE_API_KEY, base_url="https://api.upstage.ai/v1")
        response = client.chat.completions.create(
            model="solar-pro2",
            messages=[{"role": "user", "content": prompt}]
        )

        # 3. 응답 파싱
        response_text = response.choices[0].message.content
        import json_repair # (설치 필요: pip install json_repair)
        recipes_data = json_repair.loads(response_text)

        # 4. 이미지 생성 및 데이터 가공 (기존 로직 재활용 가능)
        # (여기서는 간단히 데이터만 리턴합니다. 필요하면 DB 저장 로직 추가)
        
        return Response(recipes_data, status=200)

    except Exception as e:
        print(f"❌ AI 추천 실패: {e}")
        return Response({"error": str(e)}, status=500)