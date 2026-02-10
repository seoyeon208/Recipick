import { useState, useEffect } from 'react';
import { AlertTriangle, Star, History, Search } from 'lucide-react';
import { Ingredient, Recipe, Filters, Comment } from './types';
import { MOCK_RECIPES } from './data/mockRecipes';
import { normalizeRecipe } from './utils/recipeUtils';
import { Navigation } from './components/Navigation';
import { IngredientInput } from './components/IngredientInput';
import { IngredientList } from './components/IngredientList';
import { FilterPanel } from './components/FilterPanel';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { PostRecipe } from './components/PostRecipe';
import { MyPage } from './components/MyPage';
import { Auth } from './components/Auth';
import { CommunityBoard } from './components/CommunityBoard';
import { AIRecommendations } from './components/AIRecommendations';
import { recipeApi } from './api'; // 우리가 만든 통신 모듈 가져오기

type ViewMode = 'all' | 'favorites' | 'recent';
type Page = 'home' | 'post-recipe' | 'my-page' | 'login' | 'community';



export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('currentUser');
  });
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    maxCookingTime: null,
    categories: [],
    dishwashing: [],
    lateNightOnly: false,
    healthTags: [],
    requiredEquipment: [],
    availableEquipment: [],
  });
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Load current user from localStorage on mount
  // [수정] 유저가 바뀌면 서버(Django)에서 데이터(재료, 즐겨찾기) 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          // 1. 내 재료 가져오기
          const ingResponse = await recipeApi.getUserIngredients(currentUser);
          setIngredients(ingResponse.data);

          // 2. 즐겨찾기 가져오기
          const favResponse = await recipeApi.getFavorites(currentUser);
          // 서버는 객체 배열로 주는데, 프론트는 ID 배열만 필요하므로 변환
          const favIds = favResponse.data.map((item: any) => item.recipe);
          setFavorites(favIds);

          console.log("✅ 서버에서 데이터 불러오기 성공");
        } catch (error) {
          console.error("❌ 데이터 불러오기 실패:", error);
        }
      } else {
        // 로그아웃 시 초기화
        setIngredients([]);
        setFavorites([]);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Load global data (userRecipes and comments)
  useEffect(() => {
    const savedUserRecipes = localStorage.getItem('userRecipes');
    if (savedUserRecipes) setUserRecipes(JSON.parse(savedUserRecipes));

    const savedComments = localStorage.getItem('comments');
    if (savedComments) setComments(JSON.parse(savedComments));
  }, []);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', currentUser);
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);


  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(`${currentUser}_recentlyViewed`, JSON.stringify(recentlyViewed));
      } catch (e) {
        console.error("❌ 로컬 스토리지 저장 실패 (RecentlyViewed):", e);
      }
    }
  }, [recentlyViewed, currentUser]);

  // 🚨 가장 용량을 많이 차지하는 부분 (이미지 포함된 레시피)
  // 💡 [수정됨] 스마트 저장 로직 (용량 부족 시 오래된 것부터 삭제하며 저장 시도)
  useEffect(() => {
    const saveToStorage = (data: Recipe[]) => {
      try {
        localStorage.setItem('userRecipes', JSON.stringify(data));
      } catch (e: any) {
        // 용량 초과 에러(QuotaExceededError)인지 확인
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          console.warn("⚠️ 저장 공간 부족! 가장 오래된 레시피를 삭제하고 재시도합니다.");

          if (data.length > 0) {
            // 가장 오래된(배열의 첫 번째) 항목을 제거하고 나머지로 다시 저장 시도
            // (보통 배열 뒤쪽에 최신 데이터가 쌓인다고 가정)
            const smallerData = data.slice(1);

            // 현재 상태도 업데이트 해줘야 화면에서도 사라짐 (선택 사항이지만 권장)
            // setUserRecipes(smallerData); // 무한 루프 위험이 있으므로 로컬스토리지 저장만 재귀로 처리

            saveToStorage(smallerData); // 재귀 호출
          } else {
            console.error("❌ 공간이 너무 부족하여 레시피를 저장할 수 없습니다.");
          }
        } else {
          console.error("❌ 로컬 스토리지 저장 실패 (기타 에러):", e);
        }
      }
    };

    saveToStorage(userRecipes);
  }, [userRecipes]);

  useEffect(() => {
    try {
      localStorage.setItem('comments', JSON.stringify(comments));
    } catch (e) {
      console.error("❌ 로컬 스토리지 저장 실패 (Comments):", e);
    }
  }, [comments]);

  // Background AI recipe generation when ingredients change
  // 140행: Background AI recipe generation when ingredients change
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // App.tsx 내부 generateAIRecipes 함수 안의 fetch 부분 수정

    const generateAIRecipes = async () => {
      if (ingredients.length < 3 || !currentUser) return;

      setIsGenerating(true);

      try {
        // 0. 가용 재료 취합
        const ingredientNames = ingredients.map(ing => ing.name);

        // 1. 서버(Django) 추천 요청
        const response = await recipeApi.recommend(ingredientNames);

        // 2. 응답 데이터 처리
        const data = response.data;

        if (Array.isArray(data)) {
          // 💡 받아온 데이터를 normalizeRecipe로 안전하게 변환!
          const safeRecipes = data.map(item => normalizeRecipe(item));

          const validData = safeRecipes.filter(item =>
            item.ingredients && item.ingredients.length > 0
          );

          setUserRecipes(prev => {
            const existingIds = new Set(prev.map(r => r.id));
            const uniqueNewRecipes = validData.filter(r => !existingIds.has(r.id));

            console.log(`✅ 신규 레시피 ${uniqueNewRecipes.length}개 안전 변환 완료`);
            return [...prev, ...uniqueNewRecipes];
          });
        }

      } catch (error) {
        console.error("❌ 장고 API 호출 실패:", error);
      } finally {
        setIsGenerating(false);
      }
    };

    const timer = setTimeout(() => {
      generateAIRecipes();
    }, 2000);

    return () => clearTimeout(timer);
  }, [ingredients, currentUser]); // userRecipes는 제외하여 무한루프 방지

  // [수정] 재료 추가 시 서버 동기화
  const handleAddIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    // 1. 화면에 먼저 반영 (Optimistic UI)
    const newIngredient = { ...ingredient, id: Date.now().toString() };
    const updatedIngredients = [...ingredients, newIngredient];
    setIngredients(updatedIngredients);

    // 2. 서버에 저장 요청
    if (currentUser) {
      try {
        // 현재 리스트 전체를 서버로 전송 (이름만 추출)
        const ingredientNames = updatedIngredients.map(i => i.name);
        await recipeApi.updateUserIngredients(currentUser, ingredientNames);
      } catch (e) {
        console.error("재료 서버 저장 실패:", e);
      }
    }
  };

  // [수정] 재료 삭제 시 서버 동기화
  const handleRemoveIngredient = async (id: string) => {
    const updatedIngredients = ingredients.filter(ing => ing.id !== id);
    setIngredients(updatedIngredients);

    if (currentUser) {
      try {
        const ingredientNames = updatedIngredients.map(i => i.name);
        await recipeApi.updateUserIngredients(currentUser, ingredientNames);
      } catch (e) {
        console.error("재료 삭제 서버 반영 실패:", e);
      }
    }
  };

  const handlePostRecipe = (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: `user-${Date.now()}`,
      author: currentUser || 'Anonymous',
      createdAt: new Date().toISOString(),
    };
    setUserRecipes([...userRecipes, newRecipe]);
    setCurrentPage('my-page');
  };



  const handleUpdateRecipe = async (updatedRecipe: Recipe) => { // 👈 async 붙여주세요

    // 1. DB 레시피인지 확인 ('db-'로 시작하는 ID)
    if (typeof updatedRecipe.id === 'string' && updatedRecipe.id.startsWith('db-')) {
      try {
        // 'db-15' -> '15'로 숫자만 추출
        const realId = updatedRecipe.id.replace('db-', '');

        // 서버로 수정 요청 전송 (PUT)
        await recipeApi.updateRecipe(realId, {
          name: updatedRecipe.name,
          description: updatedRecipe.description,
          cookingTime: updatedRecipe.cookingTime,
          difficulty: updatedRecipe.difficulty,
          category: updatedRecipe.category,
          ingredients: updatedRecipe.ingredients,
          steps: updatedRecipe.steps,
          author: currentUser, // 본인 확인용
        });

        console.log("✅ 서버 레시피 수정 완료");

        // (선택) 수정 후 커뮤니티 목록을 다시 불러오게 하려면 페이지를 새로고침하거나 상태를 초기화해야 합니다.
        alert("레시피가 수정되었습니다!");

      } catch (error) {
        console.error("❌ 레시피 수정 실패:", error);
        alert("서버 오류로 수정하지 못했습니다.");
        return; // 실패하면 아래 로컬 업데이트도 하지 않음
      }
    }

    // 2. 기존 로컬 상태(화면) 업데이트 (이건 그대로 둡니다)
    setUserRecipes(userRecipes.map(recipe =>
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    ));

    // 커뮤니티 데이터도 갱신되면 좋겠지만, 일단 화면 이동
    setEditingRecipe(null);
    setCurrentPage('community'); // 수정 끝나면 커뮤니티로 이동
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setCurrentPage('post-recipe');
  };

  const handleDeleteRecipe = async (id: string) => {

    // 1. 서버(DB) 데이터인지 확인 ('db-'로 시작하는지)
    if (id.startsWith('db-')) {
      try {
        const realId = id.replace('db-', '');

        // 서버에 삭제 요청 전송 (DELETE)
        await recipeApi.deleteRecipe(realId);

        console.log("✅ 서버 레시피 삭제 완료");
        alert("레시피가 삭제되었습니다.");

      } catch (error) {
        console.error("❌ 삭제 실패:", error);
        alert("서버 오류로 삭제하지 못했습니다.");
        return; // 실패하면 화면에서도 지우지 않음
      }
    }

    // 2. 화면(로컬 상태)에서 지우기 (기존 코드 유지)
    setUserRecipes(userRecipes.filter(recipe => recipe.id !== id));
    setFavorites(favorites.filter(fav => fav !== id));
    setRecentlyViewed(recentlyViewed.filter(rv => rv !== id));

    // 삭제 후 홈이나 커뮤니티로 이동
    setCurrentPage('community');
    setSelectedRecipe(null);
  };

  const handleAddComment = (comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    if (!expirationDate) return null;
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // src/App.tsx

  const calculateMatchPercentage = (recipe: Recipe) => {
    // recipe나 ingredients가 아예 없으면 0 반환
    if (!recipe || !recipe.ingredients || !Array.isArray(recipe.ingredients)) return 0;

    const recipeIngs = recipe.ingredients;
    if (recipeIngs.length === 0) return 0; // 0으로 나누기 방지

    const userIngNames = ingredients.map(i => i.name.toLowerCase().trim());
    const matchedCount = recipeIngs.filter(ing =>
      ing && ing.name && userIngNames.includes(ing.name.toLowerCase().trim())
    ).length;

    return Math.round((matchedCount / recipeIngs.length) * 100);
  };

  const getExpiringIngredientsCount = (recipe: Recipe) => {
    const userIngredientNames = ingredients.map(i => i.name.toLowerCase());
    const matchedIngredients = recipe.ingredients.filter(ing =>
      userIngredientNames.includes(ing.name.toLowerCase())
    );

    return matchedIngredients.filter(ing => {
      const ingredient = ingredients.find(i => i.name.toLowerCase() === ing.name.toLowerCase());
      if (!ingredient) return false;
      const days = getDaysUntilExpiration(ingredient.expirationDate);
      return days !== null && days <= 3;
    }).length;
  };

  // [수정] 필터링 로직 (데이터가 없는 경우 방어 코드 추가)
  const filterRecipes = (recipes: Recipe[]) => {
    return recipes.filter(recipe => {
      // 1. Time filter
      if (filters.maxCookingTime && recipe.cookingTime > filters.maxCookingTime) {
        return false;
      }

      // 2. Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(recipe.category)) {
        return false;
      }

      // 3. Dishwashing filter (방어 코드 추가: || [])
      if (filters.dishwashing.length > 0) {
        // dishwashing 정보가 없으면 '보통'으로 간주하거나 필터 통과 안 시킴
        if (!recipe.dishwashing || !filters.dishwashing.includes(recipe.dishwashing)) {
          return false;
        }
      }

      // 4. Late night filter
      if (filters.lateNightOnly && !recipe.lateNightSuitable) {
        return false;
      }

      // 5. Health tags filter (방어 코드 추가: || [])
      if (filters.healthTags.length > 0) {
        const recipeTags = recipe.healthTags || []; // 👈 데이터 없으면 빈 배열
        const hasMatchingTag = filters.healthTags.some(tag => recipeTags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // 6. Equipment filter (🚨 에러 발생 지점 수정)
      if (filters.availableEquipment.length > 0) {
        const recipeEquipment = recipe.requiredEquipment || []; // 👈 데이터 없으면 빈 배열로 처리!

        const hasRequiredEquipment = recipeEquipment.every(equipment =>
          filters.availableEquipment.includes(equipment)
        );
        if (!hasRequiredEquipment) return false;
      }

      return true;
    });
  };

  function getMinMatchPercentage(userIngredientCount: number) {
    if (userIngredientCount <= 2) return 0;    // 1개라도 OK
    if (userIngredientCount <= 4) return 30;
    if (userIngredientCount <= 6) return 40;
    return 50;
  }

  const getAllRecipes = () => {
    return [...MOCK_RECIPES, ...userRecipes];
  };

  const getDisplayedRecipes = () => {
    let recipesToDisplay = getAllRecipes();

    console.log(`📊 전체 레시피 수: ${recipesToDisplay.length}개`);

    if (viewMode === 'favorites') {
      recipesToDisplay = recipesToDisplay.filter(recipe => favorites.includes(recipe.id));
    } else if (viewMode === 'recent') {
      recipesToDisplay = recipesToDisplay.filter(recipe => recentlyViewed.includes(recipe.id));
      recipesToDisplay.sort((a, b) => {
        return recentlyViewed.indexOf(b.id) - recentlyViewed.indexOf(a.id);
      });
    }

    if (searchQuery.trim()) {
      recipesToDisplay = recipesToDisplay.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const filtered = filterRecipes(recipesToDisplay);
    console.log(`🔍 필터 적용 후: ${filtered.length}개`);

    const userIngredientCount = ingredients.length;
    const minMatchPercentage = getMinMatchPercentage(userIngredientCount);

    let matchFiltered = filtered;

    if (ingredients.length > 0) {
      matchFiltered = filtered.filter(recipe => {
        // 1. 매칭률 계산
        const percentage = calculateMatchPercentage(recipe);

        // ❌ 핵심 조건: 매칭률이 0%면 무조건 제외 (1% 이상만 통과)
        if (percentage === 0) return false;

        // 2. AI/DB 추천 레시피는 0%만 아니면(위에서 걸러짐) 무조건 통과
        if (recipe.author === 'AI 추천' || (recipe.id && recipe.id.toString().startsWith('db-'))) {
          return true;
        }

        // 3. 일반 레시피는 재료 개수에 따른 최소 기준(minMatchPercentage)도 통과해야 함
        // (예: 재료가 많으면 0%는 당연히 안 되고, 30~50% 이상이어야 나올 수 있음)
        return percentage >= minMatchPercentage;
      });
    }

    // Sort by match percentage and expiring ingredients
    const sorted = matchFiltered.sort((a, b) => {
      const expiringA = getExpiringIngredientsCount(a);
      const expiringB = getExpiringIngredientsCount(b);

      // 유통기한 임박 재료 우선
      if (expiringA !== expiringB) {
        return expiringB - expiringA;
      }

      // 그 다음 매칭률 기준
      const matchA = calculateMatchPercentage(a);
      const matchB = calculateMatchPercentage(b);
      return matchB - matchA;
    });

    console.log(`🎯 최종 표시 레시피: ${sorted.length}개`);
    return sorted;
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);

    // Add to recently viewed
    const newRecentlyViewed = [
      recipe.id,
      ...recentlyViewed.filter(id => id !== recipe.id)
    ].slice(0, 20); // Keep only last 20
    setRecentlyViewed(newRecentlyViewed);
  };

  // [수정] 즐겨찾기 토글 (서버 동기화)
  const handleFavoriteToggle = async (recipeId: string) => {
    // 1. 화면 먼저 갱신 (반응속도 향상)
    if (favorites.includes(recipeId)) {
      setFavorites(favorites.filter(id => id !== recipeId));
    } else {
      setFavorites([...favorites, recipeId]);
    }

    // 2. 서버에 요청 전송
    if (currentUser) {
      try {
        await recipeApi.toggleFavorite(currentUser, recipeId);
      } catch (e) {
        console.error("즐겨찾기 서버 동기화 실패:", e);
        // 실패 시 롤백 로직을 넣을 수도 있지만, 일단은 에러 로그만 출력
      }
    }
  };

  const expiringIngredientsCount = ingredients.filter(ing => {
    const days = getDaysUntilExpiration(ing.expirationDate);
    return days !== null && days <= 3;
  }).length;


  // Navigation handler
  // App.tsx 내부의 handleNavigate 함수

  const handleNavigate = async (page: string) => { // 👈 async 키워드 확인!
    // 로그인이 필요한 페이지 체크
    if ((page === 'post-recipe' || page === 'my-page') && !currentUser) {
      setCurrentPage('login');
      return;
    }

    // 마이페이지로 이동할 때 viewingUser를 리셋
    if (page === 'my-page') {
      setViewingUser(null);
    }

    // 💡 [여기가 수정된 부분] 3번 코드 적용
    // 커뮤니티나 홈으로 갈 때 서버 데이터를 가져오고, normalizeRecipe로 안전하게 변환

    setCurrentPage(page as Page);
    setSelectedRecipe(null);
  };

  // Login handler
  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setCurrentPage('home');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // View profile handler
  const handleViewProfile = (username: string) => {
    setViewingUser(username);
    setCurrentPage('my-page');
  };

  // Render recipe detail if selected
  if (selectedRecipe) {
    return (
      <>
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <RecipeDetail
          recipe={selectedRecipe}
          userIngredients={ingredients}
          comments={comments}
          allRecipes={getAllRecipes()}
          currentUser={currentUser}
          onClose={() => setSelectedRecipe(null)}
          onFavoriteToggle={() => handleFavoriteToggle(selectedRecipe.id)}
          onAddComment={handleAddComment}
          onRecipeClick={handleRecipeClick}
          onEditRecipe={handleEditRecipe}
          onDeleteRecipe={handleDeleteRecipe}
          onViewProfile={handleViewProfile}
          isFavorite={favorites.includes(selectedRecipe.id)}
        />
      </>
    );
  }

  // Render Post Recipe page
  if (currentPage === 'post-recipe') {
    return (
      <>
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <PostRecipe
          onSubmit={(data) => {
            if (editingRecipe) {
              handleUpdateRecipe(data as Recipe);
            } else {
              handlePostRecipe(data as Omit<Recipe, 'id' | 'createdAt'>);
            }
          }}
          onCancel={() => {
            setEditingRecipe(null);
            setCurrentPage('home');
          }}
          recipe={editingRecipe}
          currentUser={currentUser}
        />
      </>
    );
  }

  // Render My Page
  if (currentPage === 'my-page') {
    return (
      <>
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <MyPage
          userRecipes={getAllRecipes()}
          favorites={favorites}
          ingredients={ingredients}
          currentUser={currentUser}
          viewingUser={viewingUser}
          onRecipeClick={handleRecipeClick}
          onFavoriteToggle={handleFavoriteToggle}
          onDeleteRecipe={handleDeleteRecipe}
          onEditRecipe={handleEditRecipe}
          onViewProfile={handleViewProfile}
          onBack={() => {
            setViewingUser(null);
            setCurrentPage('home');
          }}
        />
      </>
    );
  }

  // Render Login Page
  if (currentPage === 'login') {
    return (
      <>
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <Auth
          onLogin={handleLogin}
          onCancel={() => setCurrentPage('home')}
        />
      </>
    );
  }

  // Render Community Page
  if (currentPage === 'community') {
    return (
      <>
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <CommunityBoard
          allRecipes={getAllRecipes()}
          userIngredients={ingredients}
          favorites={favorites}
          onRecipeClick={handleRecipeClick}
          onFavoriteToggle={handleFavoriteToggle}
          onViewProfile={handleViewProfile}
        />
      </>
    );
  }

  // Render Home page
  const displayedRecipes = getDisplayedRecipes();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Ingredient Management */}
        <div className="space-y-6 mb-8">
          <IngredientInput onAdd={handleAddIngredient} />

          {expiringIngredientsCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-orange-900">
                  재료 {expiringIngredientsCount}개 유통기한 임박!
                </h3>
                <p className="text-orange-700 mt-1">
                  재료가 상하기 전에 아래 레시피로 활용해보세요.
                </p>
              </div>
            </div>
          )}

          <IngredientList
            ingredients={ingredients}
            onRemove={handleRemoveIngredient}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Recipe List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="mb-4">레시피 추천</h2>

              {/* ⭐ 추가된 부분: Search Bar */}
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="레시피, 재료, 카테고리로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                />
              </div>

              {/* View Mode Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setViewMode('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'all'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  style={viewMode === 'all' ? { backgroundColor: '#808000' } : {}}
                >
                  전체 레시피
                </button>
                <button
                  onClick={() => setViewMode('favorites')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'favorites'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  style={viewMode === 'favorites' ? { backgroundColor: '#808000' } : {}}
                >
                  <Star size={18} />
                  즐겨찾기 ({favorites.length})
                </button>
                <button
                  onClick={() => setViewMode('recent')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'recent'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  style={viewMode === 'recent' ? { backgroundColor: '#808000' } : {}}
                >
                  <History size={18} />
                  최근 본 레시피 ({recentlyViewed.length})
                </button>
              </div>

              <p className="text-gray-600">
                검색된 레시피 {displayedRecipes.length}개
                {ingredients.length > 0 && ` • 매칭률 및 유통기한 임박 재료 기준 정렬`}
              </p>
            </div>

            {/* AI 스마트 추천 섹션 */}
            {ingredients.length >= 1 && viewMode === 'all' && (
              <AIRecommendations
                recipes={getAllRecipes()}
                userIngredients={ingredients}
                favoriteRecipes={favorites}
                recentlyViewed={recentlyViewed}
                onSelectRecipe={handleRecipeClick}
                onFavoriteToggle={handleFavoriteToggle}
              />
            )}

            {displayedRecipes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <h3 className="text-gray-500 mb-2">레시피를 찾을 수 없습니다</h3>
                <p className="text-gray-400">
                  {viewMode === 'favorites'
                    ? '아직 즐겨찾기한 레시피가 없습니다'
                    : viewMode === 'recent'
                      ? '아직 본 레시피가 없습니다'
                      : ingredients.length === 0
                        ? '재료를 추가하면 맞춤 레시피를 추천해드립니다'
                        : '필터를 조정하면 더 많은 레시피를 볼 수 있습니다'}
                </p>
              </div>
            ) : (
              <>
                {/* 구분선 */}
                {ingredients.length >= 1 && viewMode === 'all' && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <span className="text-gray-500 px-4">전체 레시피</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedRecipes.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      userIngredients={ingredients}
                      matchPercentage={calculateMatchPercentage(recipe)}
                      onClick={() => handleRecipeClick(recipe)}
                      onFavoriteToggle={() => handleFavoriteToggle(recipe.id)}
                      isFavorite={favorites.includes(recipe.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}