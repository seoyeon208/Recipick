import { Clock, ChefHat, Tag, Droplet, Moon, Heart, User } from 'lucide-react';
import { Recipe, Ingredient } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  userIngredients: Ingredient[];
  matchPercentage: number;
  onClick: () => void;
  onFavoriteToggle: () => void;
  isFavorite: boolean;
  onViewProfile?: (username: string) => void;
}

export function RecipeCard({ recipe, userIngredients, matchPercentage, onClick, onFavoriteToggle, isFavorite, onViewProfile }: RecipeCardProps) {
  const userIngredientNames = userIngredients.map(i => i.name.toLowerCase());
  
  // 데이터 누락 방어: ingredients가 없으면 빈 배열 사용
  const recipeIngredients = recipe.ingredients || [];
  
  const matchedIngredients = recipeIngredients.filter(ing =>
    ing?.name && userIngredientNames.includes(ing.name.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      <div onClick={onClick} className="cursor-pointer flex-1 flex flex-col">
        <div className="relative">
          <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover" />
          <div className="absolute top-3 right-3 text-white px-3 py-1 rounded-full bg-olive" style={{backgroundColor: '#808000'}}>
            {matchPercentage}% 일치
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="mb-3 font-semibold">{recipe.name}</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4 text-gray-600">
            <div className="flex items-center gap-2"><Clock size={18} /><span>{recipe.cookingTime}분</span></div>
            <div className="flex items-center gap-2"><ChefHat size={18} /><span>{recipe.difficulty}</span></div>
            <div className="flex items-center gap-2"><Tag size={18} /><span>{recipe.category}</span></div>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-2">
              일치 재료: {matchedIngredients.length} / {recipeIngredients.length}
            </p>
            <div className="flex flex-wrap gap-1">
              {recipeIngredients.slice(0, 4).map((ing, idx) => (
                <span key={idx} className={`px-2 py-1 rounded text-xs ${userIngredientNames.includes(ing.name.toLowerCase()) ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {ing.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-5">
        <button onClick={(e) => { e.stopPropagation(); onFavoriteToggle(); }} className="w-full flex justify-center items-center gap-2 py-2 border rounded-lg">
          <Heart size={18} fill={isFavorite ? 'red' : 'none'} className={isFavorite ? 'text-red-500' : ''} />
          {isFavorite ? '즐겨찾기 됨' : '즐겨찾기'}
        </button>
      </div>
    </div>
  );
}