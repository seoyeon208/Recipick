from django.db import models
from django.contrib.auth.models import User

# 1. 재료 모델 (기존 유지)
class Ingredient(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.name

# 2. 레시피(게시글) 모델 (기존 + AI 기능 + 회원 연동 통합)
class Recipe(models.Model):
    DIFFICULTY_CHOICES = [
        ('쉬움', '쉬움'),
        ('중간', '중간'),
        ('어려움', '어려움'),
        ('보통', '보통'), # AI가 '보통'을 줄 때가 있어서 추가
    ]

    DISHWASHING_CHOICES = [
        ('적음', '적음'),
        ('중간', '중간'),
        ('많음', '많음'),
        ('보통', '보통'), # fallback용
    ]

    CATEGORY_CHOICES = [
        ('한식', '한식'),
        ('중식', '중식'),
        ('일식', '일식'),
        ('양식', '양식'),
        ('디저트', '디저트'),
        ('퓨전', '퓨전'), # AI가 자주 줌
        ('기타', '기타'),
    ]

    # 작성자: User 모델과 연결 (로그인한 사람이 작성자가 됨)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipes')
    
    name = models.CharField(max_length=100)
    cooking_time = models.PositiveIntegerField(help_text="분 단위", default=20)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='보통')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='기타')
    dishwashing = models.CharField(max_length=10, choices=DISHWASHING_CHOICES, default='보통')
    
    # 💡 [중요] 이미지 경로 저장 (URL이 길어질 수 있으므로 TextField 권장)
    image = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True)
    
    # 💡 [추가] AI가 생성해주는 상세 정보들 (JSON으로 저장)
    tips = models.JSONField(default=list, blank=True)
    nutrition = models.JSONField(default=dict, blank=True)
    required_equipment = models.JSONField(default=list, blank=True)
    health_tags = models.JSONField(default=list, blank=True)
    late_night_suitable = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# 3. 레시피-재료 연결 (중간 테이블)
class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recipe_ingredients') # related_name 통일
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    amount = models.CharField(max_length=50, default="적당량")

    def __str__(self):
        return f"{self.recipe.name} - {self.ingredient.name}"

# 4. 요리 순서 (Step)
class Step(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='steps')
    order = models.PositiveIntegerField()
    content = models.TextField()

    class Meta:
        ordering = ["order"]

# 5. 유저 냉장고 재료
class UserIngredient(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_ingredients')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}의 재료: {self.name}"

# 6. 즐겨찾기
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe')

# 7. 댓글 (작성자 연결)
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    rating = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

# 8. 최근 본 레시피
class RecentlyViewed(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-viewed_at']