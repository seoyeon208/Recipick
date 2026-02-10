export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  expirationDate: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  cookingTime: number; // minutes
  prepTime?: number;
  servings?: number;
  difficulty: '쉬움' | '중간' | '어려움' | '보통';
  category: string;
  dishwashing: '적음' | '중간' | '많음' | '보통';
  lateNightSuitable: boolean;
  healthTags: string[];
  requiredEquipment: string[];
  availableEquipment?: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
  image: string;
  tips?: string[];
  nutrition?: {
    calories: number;
    carbohydrate: number;
    protein: number;
    fat: number;
    sodium: number;
  };
  history?: string;
  isUserRecipe?: boolean;
  author?: string;
  likes?: number;
  rating?: number;
  commentCount?: number;
  createdAt?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface Filters {
  maxCookingTime: number | null;
  categories: string[];
  dishwashing: string[];
  lateNightOnly: boolean;
  healthTags: string[];
  requiredEquipment: string[];
  availableEquipment: string[];
}

export interface Comment {
  id: string;
  recipeId: string;
  author: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: string;
}