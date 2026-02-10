import { Recipe } from '../types';

export const normalizeRecipe = (data: any): Recipe => {
    return {
        ...data,
        id: String(data.id), // ID는 무조건 문자열로

        // 필수 데이터 안전 처리
        name: data.name || "이름 없는 요리",
        image: data.image || "https://source.unsplash.com/800x600/?food",
        category: data.category || "기타",
        difficulty: data.difficulty || "보통",
        cookingTime: Number(data.cookingTime) || 20,

        // 배열 데이터 안전 처리
        ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
        steps: Array.isArray(data.steps) ? data.steps : [],

        // 상세 페이지에서 에러를 유발하는 누락된 필드들 (기본값 채우기)
        description: data.description || "AI 셰프가 추천하는 특별한 레시피입니다.",
        prepTime: data.prepTime || 10,
        servings: data.servings || 1,

        // 영양소 정보가 없으면 0으로 채움
        nutrition: data.nutrition || {
            calories: 0,
            carbohydrate: 0,
            protein: 0,
            fat: 0,
            sodium: 0
        },

        // 기타 필드 안전 처리
        healthTags: data.healthTags || [],
        requiredEquipment: data.requiredEquipment || [],
        availableEquipment: [],
        dishwashing: data.dishwashing || "보통",
        lateNightSuitable: data.lateNightSuitable || false,
        tips: data.tips || [],
        history: data.history || "",

        // 유저 관련
        author: data.author || "AI 셰프",
        likes: data.likes || 0,
        rating: data.rating || 0,
        commentCount: data.commentCount || 0,
        isUserRecipe: data.isUserRecipe || false,
    };
};

export const getRecipeImageUrl = (recipeName: string, category?: string) => {
    const query = encodeURIComponent(
        `${recipeName} ${category ?? ''} food`
    );

    return `https://source.unsplash.com/800x600/?${query}`;
};
