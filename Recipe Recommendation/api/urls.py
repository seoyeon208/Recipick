from django.urls import path
from . import views

urlpatterns = [
    # AI 레시피 추천
    path('recommend/', views.recommend_recipes, name='recommend_recipes'),

    # 인증 (Auth)
    path('signup/', views.signup, name='signup'),
    path('login/', views.login_view, name='login'),

    # 기능 (Features)
    path('user/ingredients/', views.user_ingredients, name='user_ingredients'),
    path('user/favorites/', views.favorites, name='favorites'),
    path('recipe/<int:recipe_id>/comments/', views.comments, name='comments'),
    path('recipes/create/', views.create_user_recipe),
    path('recipes/', views.get_all_recipes),
    path('recipes/<int:recipe_id>/update/', views.update_recipe),
    path('recipes/<int:recipe_id>/delete/', views.delete_recipe),
    path('recommend/ai/', views.recommend_recipes_ai),
    
]