# recipes/utils.py
import pandas as pd
from .models import Recipe, Ingredient, RecipeIngredient, Step

def load_and_match_csv(user_ingredients):
    # CSV 로드
    df = pd.read_csv('public/recipe_dataset.csv')
    
    # 단순 매칭 로직 (재료 문자열 포함 여부 확인)
    # 실제로는 프론트의 extractIngredients 로직을 파이썬으로 구현하여 정교화 가능
    matched_recipes = []
    for _, row in df.iterrows():
        recipe_ings = str(row['ingredients'])
        # 사용자가 입력한 재료 중 하나라도 포함되어 있는지 확인
        match_count = sum(1 for ing in user_ingredients if ing in recipe_ings)
        
        if match_count > 0:
            matched_recipes.append({
                'title': row['food_title'],
                'ingredients': row['ingredients'],
                'time': row['time'],
                'difficulty': row['difficulty'],
                'category': row['category'],
                'match_count': match_count
            })
    
    # 매칭 개수 순 정렬
    matched_recipes.sort(key=lambda x: x['match_count'], reverse=True)
    return matched_recipes[:10] # 상위 10개 반환