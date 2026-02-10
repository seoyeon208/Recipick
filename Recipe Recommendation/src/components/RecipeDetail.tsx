import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ChefHat, Tag, Droplet, Moon, Heart, Wrench, MessageCircle, Star, Send, AlertCircle, Lightbulb, ChevronRight, Edit2, Trash2, User } from 'lucide-react';
import { Recipe, Ingredient, Comment } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ALTERNATIVE_INGREDIENTS } from '../data/alternativeIngredients';

interface RecipeDetailProps {
  recipe: Recipe;
  userIngredients: Ingredient[];
  comments: Comment[];
  allRecipes: Recipe[];
  currentUser: string | null;
  onClose: () => void;
  onFavoriteToggle: () => void;
  onAddComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  onRecipeClick?: (recipe: Recipe) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onViewProfile: (username: string) => void;
  isFavorite: boolean;
}

export function RecipeDetail({ 
  recipe, 
  userIngredients, 
  comments,
  allRecipes,
  currentUser,
  onClose, 
  onFavoriteToggle, 
  onAddComment,
  onRecipeClick,
  onEditRecipe,
  onDeleteRecipe,
  onViewProfile,
  isFavorite 
}: RecipeDetailProps) {
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);

  // 컴포넌트 마운트 시 스크롤 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [recipe.id]);

  const userIngredientNames = userIngredients.map(i => i.name.toLowerCase());
  const matchedIngredients = recipe.ingredients.filter(ing =>
    userIngredientNames.includes(ing.name.toLowerCase())
  );
  const missingIngredients = recipe.ingredients.filter(ing =>
    !userIngredientNames.includes(ing.name.toLowerCase())
  );

  const matchPercentage = Math.round((matchedIngredients.length / recipe.ingredients.length) * 100);

  const recipeComments = comments.filter(c => c.recipeId === recipe.id);
  const averageRating = recipeComments.length > 0
    ? (recipeComments.reduce((sum, c) => sum + c.rating, 0) / recipeComments.length).toFixed(1)
    : '없음';

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && currentUser) {
      onAddComment({
        recipeId: recipe.id,
        author: currentUser.trim(),
        content: commentText.trim(),
        rating,
      });
      setCommentText('');
      setRating(5);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft size={24} />
            <span>돌아가기</span>
          </button>
          {/* <button
            onClick={onFavoriteToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isFavorite
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? '즐겨찾기 됨' : '즐겨찾기 추가'}
          </button> */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="relative">
            <ImageWithFallback
              src={recipe.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop`}
              alt={recipe.name}
              className="w-full h-80 object-cover"
            />
            {recipe.isUserRecipe && currentUser === recipe.author && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => onEditRecipe(recipe)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  <span>수정</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('정말 이 레시피를 삭제하시겠습니까?')) {
                      onDeleteRecipe(recipe.id);
                      onClose();
                    }
                  }}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg transition-colors hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  <span>삭제</span>
                </button>
              </div>
            )}
            <div className="absolute bottom-4 right-4 text-white px-4 py-2 rounded-full" style={{ backgroundColor: '#808000' }}>
              {matchPercentage}% 일치
            </div>
            {recipe.isUserRecipe && (
              <div className="absolute bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full">
                커뮤니티 레시피
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h1>{recipe.name}</h1>
              <button
                onClick={onFavoriteToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isFavorite
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? '즐겨찾기 됨' : '즐겨찾기 추가'}
              </button>
            </div>

            {/* 작성자 정보 */}
            {recipe.isUserRecipe && recipe.author && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <User size={24} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 mb-1">레시피 작성자</p>
                    <button
                      onClick={() => {
                        onViewProfile(recipe.author);
                        onClose();
                      }}
                      className="text-gray-900 hover:underline flex items-center gap-2"
                      style={{ fontWeight: 600 }}
                    >
                      {recipe.author}
                      <ChevronRight size={18} style={{ color: '#808000' }} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock size={24} style={{ color: '#808000' }} />
                <div>
                  <div className="text-gray-500">요리시간</div>
                  <div>{recipe.cookingTime}분</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ChefHat size={24} style={{ color: '#808000' }} />
                <div>
                  <div className="text-gray-500">난이도</div>
                  <div>{recipe.difficulty}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Tag size={24} style={{ color: '#808000' }} />
                <div>
                  <div className="text-gray-500">카테고리</div>
                  <div>{recipe.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Droplet size={24} style={{ color: '#808000' }} />
                <div>
                  <div className="text-gray-500">설거지</div>
                  <div>{recipe.dishwashing}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {recipe.lateNightSuitable && (
                <span className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Moon size={18} />
                  야식 적합
                </span>
              )}
              {recipe.healthTags.map((tag, idx) => (
                <span key={idx} className="px-3 py-2 rounded-lg capitalize" style={{ backgroundColor: '#f5f5dc', color: '#808000' }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <h2 className="mb-4" style={{ fontWeight: 600 }}>재료</h2>
              
              {/* 부족 재료 알림 */}
              {missingIngredients.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={24} className="text-orange-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-orange-900 mb-2" style={{ fontWeight: 600 }}>부족한 재료 {missingIngredients.length}개</h3>
                      <p className="text-orange-700 mb-2">
                        {missingIngredients.map(i => i.name).join(', ')}
                      </p>
                      <p className="text-orange-600">아래 대체 재료를 확인해보세요!</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recipe.ingredients.map((ing, idx) => {
                  const isMatched = userIngredientNames.includes(ing.name.toLowerCase());
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg relative ${
                        isMatched
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{ing.name}</span>
                          <span className="text-gray-600 ml-2">{ing.amount}</span>
                        </div>
                        {!isMatched && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm" style={{ fontWeight: 500 }}>
                            부족
                          </span>
                        )}
                        {isMatched && (
                          <span className="text-green-600">✓ 보유</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 대체 재료 안내 */}
            {missingIngredients.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={24} style={{ color: '#808000' }} />
                  <h2 style={{ fontWeight: 600 }}>대체 재료 제안</h2>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-blue-900 mb-4">부족한 재료 대신 이런 재료를 사용해보세요:</p>
                  <div className="space-y-3">
                    {missingIngredients.map((ing, idx) => {
                      const alternatives = ALTERNATIVE_INGREDIENTS[ing.name] || ['대체 재료 정보 없음'];
                      return (
                        <div key={idx} className="bg-white rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-gray-700" style={{ fontWeight: 500 }}>{ing.name}</span>
                            <ChevronRight size={18} className="text-blue-500" />
                            <span className="text-blue-700">{alternatives[0]}</span>
                          </div>
                          {alternatives.length > 1 && (
                            <div className="flex flex-wrap gap-2 ml-6 mt-2">
                              {alternatives.slice(1).map((alt, altIdx) => (
                                <span key={altIdx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                  {alt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Required Equipment */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Wrench size={24} style={{ color: '#808000' }} />
                <h2>필요한 조리기구</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {recipe.requiredEquipment.map((equipment, idx) => (
                  <span key={idx} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg capitalize">
                    {equipment}
                  </span>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="mb-8">
              <h2 className="mb-4">요리 순서</h2>
              <ol className="space-y-4">
                {recipe.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center" style={{ backgroundColor: '#808000' }}>
                      {idx + 1}
                    </div>
                    <p className="flex-1 pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* 유사 레시피 추천 */}
        {allRecipes && allRecipes.length > 0 && (() => {
          // 유사 레시피 찾기 (같은 카테고리, 비슷한 난이도, 비슷한 조리시간)
          const similarRecipes = allRecipes
            .filter(r => r.id !== recipe.id)
            .map(r => {
              let score = 0;
              if (r.category === recipe.category) score += 3;
              if (r.difficulty === recipe.difficulty) score += 2;
              if (Math.abs(r.cookingTime - recipe.cookingTime) <= 10) score += 2;
              if (r.lateNightSuitable === recipe.lateNightSuitable) score += 1;
              
              // 공통 건강 태그
              const commonHealthTags = r.healthTags.filter(tag => 
                recipe.healthTags.includes(tag)
              );
              score += commonHealthTags.length;
              
              return { recipe: r, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.recipe);

          if (similarRecipes.length === 0) return null;

          return (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <ChefHat size={24} style={{ color: '#808000' }} />
                  <h2 style={{ fontWeight: 600 }}>이런 레시피는 어때요?</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  이 레시피와 비슷한 다른 요리를 추천해드려요
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {similarRecipes.map(similarRecipe => {
                    const userIngredientNames = userIngredients.map(i => i.name.toLowerCase());
                    const matchedCount = similarRecipe.ingredients.filter(ing => 
                      userIngredientNames.includes(ing.name.toLowerCase())
                    ).length;
                    const matchPercentage = Math.round(
                      (matchedCount / similarRecipe.ingredients.length) * 100
                    );

                    return (
                      <div
                        key={similarRecipe.id}
                        onClick={() => onRecipeClick && onRecipeClick(similarRecipe)}
                        className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <div className="relative">
                          <ImageWithFallback
                            src={similarRecipe.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop`}
                            alt={similarRecipe.name}
                            className="w-full h-32 object-cover"
                          />
                          <div
                            className="absolute top-2 right-2 text-white px-2 py-1 rounded text-sm"
                            style={{ backgroundColor: '#808000' }}
                          >
                            {matchPercentage}% 일치
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="mb-2" style={{ fontWeight: 600 }}>
                            {similarRecipe.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {similarRecipe.cookingTime}분
                            </div>
                            <div className="flex items-center gap-1">
                              <ChefHat size={14} />
                              {similarRecipe.difficulty}
                            </div>
                          </div>
                          {similarRecipe.category === recipe.category && (
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                              같은 카테고리
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle size={24} style={{ color: '#808000' }} />
              <h2>댓글 & 후기 ({recipeComments.length})</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Star size={20} className="text-yellow-500" fill="currentColor" />
                <span>평균 평점: {averageRating}</span>
              </div>
            </div>

            {/* Add Comment Form */}
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="mb-4">리뷰 남기기</h3>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">평점</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5점)</option>
                    <option value={4}>⭐⭐⭐⭐ (4점)</option>
                    <option value={3}>⭐⭐⭐ (3점)</option>
                    <option value={2}>⭐⭐ (2점)</option>
                    <option value={1}>⭐ (1점)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">후기</label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                    style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                    rows={4}
                    placeholder="이 레시피에 대한 경험을 공유해주세요..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                  style={{ backgroundColor: '#808000' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6b6b00')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#808000')}
                >
                  <Send size={18} />
                  댓글 작성
                </button>
              </form>
            ) : (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">댓글을 작성하려면 로그인이 필요합니다.</p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {recipeComments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">아직 댓글이 없습니다. 첫 번째 후기를 남겨보세요!</p>
              ) : (
                recipeComments
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((comment) => (
                    <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-gray-900">{comment.author}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={star <= comment.rating ? 'text-yellow-500' : 'text-gray-300'}
                                  fill={star <= comment.rating ? 'currentColor' : 'none'}
                                />
                              ))}
                            </div>
                            <span className="text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}