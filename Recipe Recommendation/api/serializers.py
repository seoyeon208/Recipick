from rest_framework import serializers
from django.contrib.auth.models import User
from recipes.models import Recipe, UserIngredient, Favorite, Comment, RecentlyViewed

# 회원가입용
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# 내 재료용
class UserIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserIngredient
        fields = ['id', 'name']

# 즐겨찾기용
class FavoriteSerializer(serializers.ModelSerializer):
    recipe_name = serializers.ReadOnlyField(source='recipe.name')
    recipe_image = serializers.ReadOnlyField(source='recipe.image')
    
    class Meta:
        model = Favorite
        fields = ['id', 'recipe', 'recipe_name', 'recipe_image', 'created_at']

# 댓글용
class CommentSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Comment
        fields = ['id', 'user', 'username', 'recipe', 'content', 'rating', 'created_at']