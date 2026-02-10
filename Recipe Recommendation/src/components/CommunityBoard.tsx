import { useState, useEffect } from 'react';
import axios from 'axios';
import { Recipe, Ingredient } from '../types';
import { RecipeCard } from './RecipeCard';
import { Users, Search, TrendingUp, Clock } from 'lucide-react';

interface CommunityBoardProps {
  allRecipes: Recipe[];
  userIngredients: Ingredient[];
  favorites: string[];
  onRecipeClick: (recipe: Recipe) => void;
  onFavoriteToggle: (recipeId: string) => void;
  onViewProfile: (username: string) => void;
}

type SortType = 'recent' | 'popular' | 'time';

export function CommunityBoard({
  allRecipes,
  userIngredients,
  favorites,
  onRecipeClick,
  onFavoriteToggle,
  onViewProfile,
}: CommunityBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('recent');

  // ✅ [필수] 이 줄이 없어서 에러가 났던 것입니다.
  const [serverRecipes, setServerRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ DB 데이터 + 목업 데이터 합치고 필터링하기
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/recipes/');
        
        // 1. DB 데이터(response.data) + 목업 데이터(allRecipes) 합치기
        const combinedRecipes = [...response.data, ...allRecipes];
        
        // 2. "유저가 쓴 레시피(isUserRecipe: true)"만 커뮤니티에 보여주기
        const userOnlyRecipes = combinedRecipes.filter(recipe => recipe.isUserRecipe === true);
        
        setServerRecipes(userOnlyRecipes);

      } catch (error) {
        console.error("서버 연결 실패, 목업 데이터 중 유저 레시피만 보여줍니다.", error);
        // 에러 시 목업 데이터 중 유저 레시피만 사용
        setServerRecipes(allRecipes.filter(r => r.isUserRecipe === true));
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [allRecipes]);

  const calculateMatchPercentage = (recipe: Recipe) => {
    const userIngredientNames = userIngredients.map(i => i.name.toLowerCase());
    const matchedCount = recipe.ingredients.filter(ing =>
      userIngredientNames.includes(ing.name.toLowerCase())
    ).length;
    return Math.round((matchedCount / recipe.ingredients.length) * 100);
  };

  // ✅ 필터링된 데이터 사용 (serverRecipes)
  const communityRecipes = serverRecipes;

  // 검색 필터링
  let filteredRecipes = communityRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 정렬 로직
  filteredRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortType === 'time') {
      return a.cookingTime - b.cookingTime;
    }
    // 기본은 최신순
    return 0;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">레시피 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users size={32} style={{ color: '#808000' }} />
            <h1 className="text-2xl font-bold text-gray-900">레시피 커뮤니티</h1>
          </div>
          <p className="text-gray-600">
            다른 사용자들이 공유한 맛있는 레시피를 둘러보세요
          </p>
        </div>

        {/* 검색 및 필터 바 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* 검색 */}
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="레시피 이름이나 카테고리로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808000]"
              />
            </div>

            {/* 정렬 버튼들 */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortType('recent')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  sortType === 'recent'
                    ? 'text-white'
                    : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                style={sortType === 'recent' ? { backgroundColor: '#808000' } : {}}
              >
                <Clock size={18} />
                최신순
              </button>
              <button
                onClick={() => setSortType('popular')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  sortType === 'popular'
                    ? 'text-white'
                    : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                style={sortType === 'popular' ? { backgroundColor: '#808000' } : {}}
              >
                <TrendingUp size={18} />
                인기순
              </button>
              <button
                onClick={() => setSortType('time')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  sortType === 'time'
                    ? 'text-white'
                    : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                style={sortType === 'time' ? { backgroundColor: '#808000' } : {}}
              >
                <Clock size={18} />
                소요 시간
              </button>
            </div>
          </div>

          {/* 레시피 카운트 */}
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} style={{ color: '#808000' }} />
            <span>
              {searchQuery ? `검색 결과: ${filteredRecipes.length}개` : `전체 레시피: ${communityRecipes.length}개`}
            </span>
          </div>
        </div>

        {/* 레시피 그리드 */}
        {filteredRecipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 mb-2 font-semibold">
              {searchQuery ? '검색 결과가 없습니다' : '아직 공유된 레시피가 없습니다'}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? '다른 검색어로 시도해보세요'
                : '첫 번째로 레시피를 공유해보세요!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                userIngredients={userIngredients}
                matchPercentage={calculateMatchPercentage(recipe)}
                onClick={() => onRecipeClick(recipe)}
                onFavoriteToggle={() => onFavoriteToggle(recipe.id)}
                isFavorite={favorites.includes(recipe.id)}
                // 작성자 프로필 보기 연결
                onViewProfile={recipe.author ? () => onViewProfile(recipe.author!) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}