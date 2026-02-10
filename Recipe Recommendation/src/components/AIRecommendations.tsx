import { Recipe, Ingredient } from "../types";

import {
  Sparkles,
  Clock,
  ShoppingBag,
  Heart,
} from "lucide-react";

import { RecipeCard } from "./RecipeCard";

interface AIRecommendationsProps {
  recipes: Recipe[];

  userIngredients: Ingredient[];

  favoriteRecipes: string[];

  recentlyViewed: string[];

  onSelectRecipe: (recipe: Recipe) => void;

  onFavoriteToggle?: (recipeId: string) => void;
}

interface RecommendationSection {
  title: string;

  icon: any;

  color: string;

  recipes: Recipe[];

  description: string;
}

export function AIRecommendations({
  recipes,

  userIngredients,

  favoriteRecipes,

  recentlyViewed,

  onSelectRecipe,

  onFavoriteToggle,
}: AIRecommendationsProps) {
  // 현재 시간대 판단

  const getCurrentTimeSlot = () => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 10) return "아침";

    if (hour >= 10 && hour < 14) return "점심";

    if (hour >= 14 && hour < 18) return "오후";

    if (hour >= 18 && hour < 22) return "저녁";

    return "야식";
  };

  const timeSlot = getCurrentTimeSlot();

  // 1️⃣ 지금 만들기 좋은 레시피

  const getTimeBasedRecommendations = (): Recipe[] => {
    const now = new Date().getHours();

    return recipes

      .filter((recipe) => {
        // 야식 시간대 (22시~6시)

        if ((now >= 22 || now < 6) && !recipe.lateNightSuitable)
          return false;

        // 아침 시간대 (6시~10시) - 간단한 요리

        if (now >= 6 && now < 10 && recipe.cookingTime > 30)
          return false;

        // 점심/저녁 시간대 - 모든 레시피 가능

        return true;
      })

      .sort((a, b) => {
        // 재료 매칭률 계산

        const matchA = calculateMatchRate(a, userIngredients);

        const matchB = calculateMatchRate(b, userIngredients);

        // 매칭률 우선, 그 다음 조리시간 짧은 순

        if (matchB !== matchA) return matchB - matchA;

        return a.cookingTime - b.cookingTime;
      })

      .slice(0, 3);
  };

  // 2️⃣ 거의 만들 수 있는 레시피 (재료 1-2개만 더 있으면)

  const getAlmostMakeableRecipes = (): Recipe[] => {
    const userIngredientNames = userIngredients.map((ing) =>
      ing.name.toLowerCase(),
    );

    return recipes

      .map((recipe) => {
        const recipeIngredients = recipe.ingredients.map(
          (ing) => ing.name.toLowerCase(),
        );

        const missingIngredients = recipeIngredients.filter(
          (ing) => !userIngredientNames.includes(ing),
        );

        return {
          recipe,

          missingCount: missingIngredients.length,

          missing: missingIngredients,
        };
      })

      .filter(
        (item) =>
          item.missingCount >= 1 && item.missingCount <= 2,
      )

      .sort((a, b) => a.missingCount - b.missingCount)

      .slice(0, 3)

      .map((item) => item.recipe);
  };

  // 3️⃣ 당신이 좋아할 만한 레시피 (취향 기반)

  const getPersonalizedRecommendations = (): Recipe[] => {
    // 즐겨찾기와 최근 본 레시피 패턴 분석

    const favoriteRecipesList = recipes.filter((r) =>
      favoriteRecipes.includes(r.id),
    );

    const recentRecipesList = recipes.filter((r) =>
      recentlyViewed.includes(r.id),
    );

    // 선호하는 카테고리 분석

    const categoryCount: Record<string, number> = {};

    const difficultyCount: Record<string, number> = {};

    [...favoriteRecipesList, ...recentRecipesList].forEach(
      (recipe) => {
        categoryCount[recipe.category] =
          (categoryCount[recipe.category] || 0) + 1;

        difficultyCount[recipe.difficulty] =
          (difficultyCount[recipe.difficulty] || 0) + 1;
      },
    );

    const preferredCategory = Object.keys(categoryCount).sort(
      (a, b) => categoryCount[b] - categoryCount[a],
    )[0];

    const preferredDifficulty = Object.keys(
      difficultyCount,
    ).sort(
      (a, b) => difficultyCount[b] - difficultyCount[a],
    )[0];

    // 선호 패턴과 유사한 레시피 추천

    return recipes

      .filter(
        (r) =>
          !favoriteRecipes.includes(r.id) &&
          !recentlyViewed.includes(r.id),
      )

      .sort((a, b) => {
        let scoreA = 0;

        let scoreB = 0;

        if (
          preferredCategory &&
          a.category === preferredCategory
        )
          scoreA += 2;

        if (
          preferredCategory &&
          b.category === preferredCategory
        )
          scoreB += 2;

        if (
          preferredDifficulty &&
          a.difficulty === preferredDifficulty
        )
          scoreA += 1;

        if (
          preferredDifficulty &&
          b.difficulty === preferredDifficulty
        )
          scoreB += 1;

        return scoreB - scoreA;
      })

      .slice(0, 3);
  };

  // 재료 매칭률 계산

  const calculateMatchRate = (
    recipe: Recipe,
    ingredients: Ingredient[],
  ): number => {
    if (recipe.ingredients.length === 0) return 0;

    const userIngredientNames = ingredients.map((ing) =>
      ing.name.toLowerCase(),
    );

    const recipeIngredientNames = recipe.ingredients.map(
      (ing) => ing.name.toLowerCase(),
    );

    const matchCount = recipeIngredientNames.filter((ing) =>
      userIngredientNames.includes(ing),
    ).length;

    return Math.round(
      (matchCount / recipeIngredientNames.length) * 100,
    );
  };

  // 부족한 재료 개수 계산

  const getMissingIngredientsCount = (
    recipe: Recipe,
  ): number => {
    const userIngredientNames = userIngredients.map((ing) =>
      ing.name.toLowerCase(),
    );

    const recipeIngredients = recipe.ingredients.map((ing) =>
      ing.name.toLowerCase(),
    );

    return recipeIngredients.filter(
      (ing) => !userIngredientNames.includes(ing),
    ).length;
  };

  const sections: RecommendationSection[] = [
    {
      title: `${timeSlot} 추천 레시피`,

      icon: Clock,

      color: "#808000",

      recipes: getTimeBasedRecommendations(),

      description: `지금 ${timeSlot} 시간대에 딱 좋은 레시피예요`,
    },

    {
      title: "거의 만들 수 있어요",

      icon: ShoppingBag,

      color: "#d97706",

      recipes: getAlmostMakeableRecipes(),

      description: "재료 1-2개만 더 있으면 바로 만들 수 있어요",
    },

    {
      title: "당신이 좋아할 만한",

      icon: Heart,

      color: "#dc2626",

      recipes: getPersonalizedRecommendations(),

      description: "취향 분석 결과 이런 레시피는 어때요?",
    },
  ];

  // 추천할 레시피가 없으면 표시 안 함

  if (
    sections.every((section) => section.recipes.length === 0)
  ) {
    return null;
  }

  return (
    <div className="space-y-6 mb-8">
      {/* 헤더 */}

      <div className="flex items-center gap-3">
        <Sparkles size={32} style={{ color: "#808000" }} />

        <div>
          <h2 className="text-2xl font-bold">AI 스마트 추천</h2>

          <p className="text-gray-600">
            당신을 위한 맞춤 레시피를 골라봤어요
          </p>
        </div>
      </div>

      {/* 추천 섹션들 */}

      {sections.map((section, idx) => {
        if (section.recipes.length === 0) return null;

        const Icon = section.icon;

        return (
          <div key={idx} className="space-y-4">
            {/* 섹션 헤더 */}

            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: `${section.color}20`,
                }}
              >
                <Icon
                  size={24}
                  style={{ color: section.color }}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold">
                  {section.title}
                </h3>

                <p className="text-sm text-gray-600">
                  {section.description}
                </p>
              </div>
            </div>

            {/* 레시피 카드 */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.recipes.map((recipe) => {
                const matchPercentage = calculateMatchRate(
                  recipe,
                  userIngredients,
                );

                const isFavorite = favoriteRecipes.includes(
                  recipe.id,
                );

                const isAlmostMakeable =
                  section.title === "거의 만들 수 있어요";

                return (
                  <div
                    key={recipe.id}
                    className="relative h-full"
                  >
                    <RecipeCard
                      recipe={recipe}
                      onClick={() => onSelectRecipe(recipe)}
                      userIngredients={userIngredients}
                      matchPercentage={matchPercentage}
                      onFavoriteToggle={() =>
                        onFavoriteToggle?.(recipe.id)
                      }
                      isFavorite={isFavorite}
                      hideMatchBadge={isAlmostMakeable}
                    />

                    {/* 거의 만들 수 있는 레시피에 배지 추가 */}

                    {isAlmostMakeable && (
                      <div
                        className="absolute top-2 right-2 px-3 py-1 rounded-full text-white text-sm font-semibold shadow-lg z-10"
                        style={{
                          backgroundColor: section.color,
                        }}
                      >
                        +{getMissingIngredientsCount(recipe)}
                        개만 더!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}