import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Ingredient, Recipe } from '../types';

interface AIRecipeGeneratorProps {
  ingredients: Ingredient[];
  onRecipeGenerated: (recipe: Recipe) => void;
}

export function AIRecipeGenerator({ ingredients, onRecipeGenerated }: AIRecipeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      setError('재료를 먼저 추가해주세요');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const ingredientNames = ingredients.map(ing => ing.name).join(', ');

      // GPT API 호출
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_OPENAI_API_KEY_HERE`, // 실제 API 키로 교체 필요
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '당신은 전문 요리사입니다. 주어진 재료로 만들 수 있는 창의적이고 맛있는 레시피를 JSON 형식으로 제공해주세요.',
            },
            {
              role: 'user',
              content: `다음 재료들을 사용하여 레시피를 만들어주세요: ${ingredientNames}

응답은 반드시 다음 JSON 형식을 따라주세요:
{
  "name": "레시피 이름",
  "cookingTime": 조리시간(분),
  "difficulty": "쉬움/중간/어려움 중 하나",
  "category": "한식/중식/일식/양식/디저트/기타 중 하나",
  "dishwashing": "적음/중간/많음 중 하나",
  "lateNightSuitable": true/false,
  "healthTags": ["뷰티 핏", "프로틴 업", "저속노화 식단", "배지라이프" 중 해당되는 것들],
  "requiredEquipment": ["필요한 조리기구 리스트"],
  "ingredients": [
    {"name": "재료명", "amount": "양"},
    ...
  ],
  "steps": ["조리 순서 1", "조리 순서 2", ...],
  "imageKeyword": "이미지 검색을 위한 영어 키워드 (예: korean stew, pasta dish 등)"
}`,
            },
          ],
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error('API 호출 실패. 실제 OpenAI API 키를 설정해주세요.');
      }

      const data = await response.json();
      const recipeData = JSON.parse(data.choices[0].message.content);

      // Unsplash API로 이미지 검색
      const imageKeyword = recipeData.imageKeyword || 'food dish';
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(imageKeyword)}&client_id=YOUR_UNSPLASH_ACCESS_KEY_HERE&per_page=1`
      );

      let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop';
      
      if (unsplashResponse.ok) {
        const imageData = await unsplashResponse.json();
        if (imageData.results && imageData.results.length > 0) {
          imageUrl = imageData.results[0].urls.regular;
        }
      }

      // 레시피 객체 생성
      const newRecipe: Recipe = {
        id: `ai-${Date.now()}`,
        name: recipeData.name,
        cookingTime: recipeData.cookingTime,
        difficulty: recipeData.difficulty,
        category: recipeData.category,
        dishwashing: recipeData.dishwashing,
        lateNightSuitable: recipeData.lateNightSuitable,
        healthTags: recipeData.healthTags || [],
        requiredEquipment: recipeData.requiredEquipment || [],
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
        image: imageUrl,
        isUserRecipe: false,
      };

      onRecipeGenerated(newRecipe);
      setIsGenerating(false);
    } catch (err) {
      console.error('Recipe generation error:', err);
      setError('레시피 생성 중 오류가 발생했습니다. API 키를 확인해주세요.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles size={28} style={{ color: '#9333ea' }} />
          <div>
            <h3 className="text-gray-900" style={{ fontWeight: 600 }}>
              AI 레시피 추천
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              보유한 재료로 AI가 창의적인 레시피를 만들어드립니다
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-2">
          <X size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700">{error}</p>
            <p className="text-red-600 text-sm mt-1">
              참고: 이 기능을 사용하려면 OpenAI API 키와 Unsplash Access Key가 필요합니다.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={generateRecipe}
        disabled={isGenerating || ingredients.length === 0}
        className="w-full px-6 py-3 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ 
          backgroundColor: isGenerating || ingredients.length === 0 ? '#9ca3af' : '#9333ea',
        }}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            <span>AI가 레시피를 생성하는 중...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} />
            <span>AI 레시피 생성하기</span>
          </>
        )}
      </button>

      {ingredients.length === 0 && (
        <p className="text-gray-500 text-sm mt-3 text-center">
          재료를 추가하면 AI 레시피 생성이 가능합니다
        </p>
      )}

      <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
        <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>
          💡 개발자 안내
        </p>
        <p className="text-sm text-gray-600 mt-2">
          이 기능을 활성화하려면 <code className="bg-gray-100 px-2 py-1 rounded text-xs">AIRecipeGenerator.tsx</code> 파일에서:
        </p>
        <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
          <li>• <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">YOUR_OPENAI_API_KEY_HERE</code>를 실제 OpenAI API 키로 교체</li>
          <li>• <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">YOUR_UNSPLASH_ACCESS_KEY_HERE</code>를 실제 Unsplash Access Key로 교체</li>
        </ul>
      </div>
    </div>
  );
}
