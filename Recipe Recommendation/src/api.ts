import axios from 'axios';

// Django 서버 주소 (배포 시에는 이 주소만 바꾸면 됩니다)
const API_BASE_URL = 'http://localhost:8000/api';

// axios 인스턴스 생성 (기본 설정)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const recipeApi = {
  // 1. 회원가입 & 로그인
  signup: (userData: any) => api.post('/signup/', userData),
  login: (credentials: any) => api.post('/login/', credentials),

  // 2. 레시피 추천 (AI)
  recommend: (ingredients: string[]) => api.post('/recommend/', { ingredients }),

  // 3. 내 재료 관리
  getUserIngredients: (username: string) => api.get(`/user/ingredients/?username=${username}`),
  updateUserIngredients: (username: string, ingredients: string[]) => api.post('/user/ingredients/', { username, ingredients }),

  // 4. 즐겨찾기
  getFavorites: (username: string) => api.get(`/user/favorites/?username=${username}`),
  toggleFavorite: (username: string, recipeId: number | string) => api.post('/user/favorites/', { username, recipe_id: recipeId }),
  
  // 5. 댓글
  getComments: (recipeId: number | string) => api.get(`/recipe/${recipeId}/comments/`),
  addComment: (recipeId: number | string, username: string, content: string) => api.post(`/recipe/${recipeId}/comments/`, { username, content }),

  // 6. 레시피 CRUD
  getAllRecipes: () => api.get('/recipes/'),
  createRecipe: (recipeData: any) => api.post('/recipes/create/', recipeData),
  updateRecipe: (recipeId: string, recipeData: any) => api.put(`/recipes/${recipeId}/update/`, recipeData),
  deleteRecipe: (recipeId: string) => api.delete(`/recipes/${recipeId}/delete/`),
};

export default api;