// 실제 요리 데이터셋 (이미지 기반)
export interface RecipeDatasetItem {
  food_title: string;
  TPO: string;
  category: string;
  ingredients: string;
  difficulty: string;
  time: string;
  TPO_new: string;
}

// 데이터셋에서 추출한 실제 요리 데이터
export const RECIPE_DATASET: RecipeDatasetItem[] = [
  { food_title: "ABCT떡볶 끓이기", TPO: "간식", category: "밥/죽/떡", ingredients: "[재료] 떡ㆍ2인분", difficulty: "초급", time: "30분이내", TPO_new: "배지라이프,저속노화 식단,뷰티 핏" },
  { food_title: "ABC건강쿠키타", TPO: "다이어트", category: "차/음료/술", ingredients: "[재료] 사과2인분", difficulty: "초급", time: "30분이내", TPO_new: "뷰티 핏" },
  { food_title: "ABC다크쿠키타", TPO: "다이어트", category: "차/음료/술", ingredients: "[재료] 배1인분", difficulty: "아릿나", time: "30분이내", TPO_new: "뷰티 핏" },
  { food_title: "ABC밥 끓이기", TPO: "일상", category: "밥/죽/떡", ingredients: "[재료] 쌀 1인분", difficulty: "아릿나", time: "30분이내", TPO_new: "" },
  { food_title: "ABC주스 기타", TPO: "기타", category: "기타", ingredients: "[재료] 사과1인분", difficulty: "아릿나", time: "30분이내", TPO_new: "" },
  { food_title: "ABC주스 기타", TPO: "일상", category: "차/음료/술", ingredients: "[재료] 사과1인분", difficulty: "아릿나", time: "30분이내", TPO_new: "" },
  { food_title: "ACC주스 기타", TPO: "조스피드", category: "차/음료/술", ingredients: "[재료] 딸기1인분", difficulty: "아릿나", time: "30분이내", TPO_new: "배지라이프" },
  { food_title: "BCC주스 기타", TPO: "조스피드", category: "차/음료/술", ingredients: "[재료] 버나나1인분", difficulty: "아릿나", time: "30분이내", TPO_new: "" },
  { food_title: "BELT샌드위치타", TPO: "간식", category: "빵", ingredients: "[재료] 양상4인분", difficulty: "아릿나", time: "30분이내", TPO_new: "프로틴 업,저속노화 식단" },
  { food_title: "BLT샌드위치 기타", TPO: "간식", category: "빵", ingredients: "[재료] 식빵1인분", difficulty: "초급", time: "30분이내", TPO_new: "저속노화 식단" },
  { food_title: "BLT샌드위치 기타", TPO: "일상", category: "샐러드", ingredients: "[재료] 양2인분", difficulty: "초급", time: "30분이내", TPO_new: "저속노화 식단" },
  { food_title: "BLT스시롤 기타", TPO: "손님접대", category: "밥/죽/떡", ingredients: "[재료] 배이2인분", difficulty: "중급", time: "30분이내", TPO_new: "저속노화 식단" },
  { food_title: "BLT토스트 기타", TPO: "조스피드", category: "빵", ingredients: "[주재료] 2,2인분", difficulty: "아릿나", time: "30분이내", TPO_new: "프로틴 업" },
  { food_title: "BLT팬케이크", TPO: "간식", category: "빵", ingredients: "[재료] 달걀3인분", difficulty: "아릿나", time: "30분이내", TPO_new: "프로틴 업,저속노화 식단" },
  { food_title: "BLT피자 끓기", TPO: "빵", category: "빵", ingredients: "[재료] 또띠2인분", difficulty: "초급", time: "90분이내", TPO_new: "저속노화 식단,뷰티 핏" },
  { food_title: "BMS크림스북음", TPO: "손님접대", category: "양식", ingredients: "[재료] 스파2인분", difficulty: "아릿나", time: "30분이내", TPO_new: "프로틴 업,배지라이프,저속노화 식단" },
  { food_title: "CCA주스 기타", TPO: "다이어트", category: "차/음료/술", ingredients: "[재료] 양배2인분", difficulty: "아릿나", time: "30분이내", TPO_new: "배지라이프,뷰티 핏" },
  { food_title: "CCT피타트 김", TPO: "다이어트", category: "빵", ingredients: "[재료] 달걀1인분", difficulty: "아릿나", time: "90분이내", TPO_new: "프로틴 업,저속노화 식단,뷰티 핏" },
  { food_title: "KFC디스켓끓기", TPO: "간식", category: "과자", ingredients: "[재료] 버섯6인분이상", difficulty: "초급", time: "90분이내", TPO_new: "프로틴 업" },
  { food_title: "KFC디스켓끓기", TPO: "간식", category: "과자", ingredients: "[재료] 떡?6인분이상", difficulty: "초급", time: "90분이내", TPO_new: "프로틴 업" },
  { food_title: "KFC지킨 튀김", TPO: "간식", category: "메인반찬", ingredients: "[재료] 달걀C2인분", difficulty: "아릿나", time: "60분이내", TPO_new: "" },
  { food_title: "KFC크림플빌빌", TPO: "일상", category: "샐러드", ingredients: "[재료] 양배2인분", difficulty: "초급", time: "30분이내", TPO_new: "배지라이프" },
  { food_title: "LA갈비 끓기", TPO: "손님접대", category: "메인반찬", ingredients: "[재료] LA3인분", difficulty: "초급", time: "60분이내", TPO_new: "배지라이프,뷰티 핏" },
  { food_title: "LA갈비감기조림", TPO: "손님접대", category: "메인반찬", ingredients: "[재료] la24인분", difficulty: "초급", time: "60분이내", TPO_new: "배지라이프,뷰티 핏" },
  { food_title: "LA갈비김치 끓이기", TPO: "일상", category: "밥/죽/떡", ingredients: "[재료] 김치3인분", difficulty: "중급", time: "30분이내", TPO_new: "배지라이프,저속노화 식단,뷰티 핏" },
  { food_title: "LA갈비구수끓기", TPO: "손님접대", category: "메인반찬", ingredients: "[재료] LA4인분", difficulty: "중급", time: "60분이내", TPO_new: "" },
  { food_title: "LA갈비구스북음", TPO: "", category: "민간뜬", ingredients: "[재료] 파ㆍ1인분", difficulty: "초급", time: "30분이내", TPO_new: "저속노화 식단" },
  { food_title: "LA갈비구수끓기", TPO: "일상", category: "밥/죽/떡", ingredients: "[재료] LA1인분", difficulty: "아릿나", time: "30분이내", TPO_new: "" },
  { food_title: "LA갈비구수끓기", TPO: "일상", category: "메인반찬", ingredients: "[재료] LA4인분", difficulty: "초급", time: "60분이내", TPO_new: "프로틴 업" },
  { food_title: "LA갈비단호북음", TPO: "손님접대", category: "메인반찬", ingredients: "[LA 갈비 [4인분", difficulty: "아릿나", time: "60분이내", TPO_new: "배지라이프" },
  { food_title: "LA갈비당흘끓기", TPO: "일상", category: "밥/죽/떡", ingredients: "[재료] 사치1인분", difficulty: "아릿나", time: "30분이내", TPO_new: "" },
  { food_title: "LA갈비달윽플이기", TPO: "간식", category: "찜", ingredients: "[재료] 닭고기3인분", difficulty: "중급", time: "60분이내", TPO_new: "프로틴 업" },
  { food_title: "LA갈비진끓플이기", TPO: "일상", category: "국/찌", ingredients: "[재료] 양상4인분", difficulty: "아릿나", time: "60분이내", TPO_new: "프로틴 업,배지라이프" },
  { food_title: "LA갈비조흘조림", TPO: "일상", category: "찜", ingredients: "[재료] 시E2인분", difficulty: "아릿나", time: "30분이내", TPO_new: "" },
  { food_title: "LA갈비버섯끓이기", TPO: "영운", category: "메인반찬", ingredients: "[재료] LA4인분", difficulty: "초급", time: "60분이내", TPO_new: "프로틴 업,배지라이프" },
  { food_title: "LA갈비버터빙빙", TPO: "일상", category: "민간뜬", ingredients: "[재료] 두곡3인분", difficulty: "중급", time: "30분이내", TPO_new: "프로틴 업" },
  { food_title: "LA갈비밥 끓기", TPO: "손님접대", category: "밥/죽/떡", ingredients: "[재료] 돼식4인분", difficulty: "중급", time: "60분이내", TPO_new: "" },
  { food_title: "LA갈비철 끓기", TPO: "일상", category: "메인반찬", ingredients: "[재료] 돼식2인분", difficulty: "중급", time: "60분이내", TPO_new: "" },
  { food_title: "LA갈비맛남끓기", TPO: "손님접대", category: "메인반찬", ingredients: "[재료] LA5인분", difficulty: "초급", time: "60분이내", TPO_new: "" },
  { food_title: "LA갈비접 끓이기", TPO: "일상", category: "국/찌", ingredients: "[재료] 양상4인분", difficulty: "아릿나", time: "60분이내", TPO_new: "프로틴 업,배지라이프" },
  { food_title: "LA갈비접 끓", TPO: "일상", category: "메인반찬", ingredients: "[재료] 시E2인분이상", difficulty: "초급", time: "30분이내", TPO_new: "배지라이프" },
  { food_title: "LA갈비밤 끓이기", TPO: "일상", category: "국/찌", ingredients: "[재료] LA4인분", difficulty: "초급", time: "60분이내", TPO_new: "" },
  { food_title: "LA갈빔 기타", TPO: "일상", category: "밥/죽/떡", ingredients: "[재료] 야ㆍ1인분", difficulty: "아릿나", time: "30분이내", TPO_new: "프로틴 업,배지라이프" },
  { food_title: "LA데지감닝끓기", TPO: "손님접대", category: "메인반찬", ingredients: "[재료] 돼짚2인분", difficulty: "초급", time: "60분이내", TPO_new: "배지라이프" },
  { food_title: "LA수갈비 끓", TPO: "일상", category: "민간뜬", ingredients: "[재료] 두곡4인분", difficulty: "중급", time: "60분이내", TPO_new: "프로틴 업" },
  { food_title: "LA치갈냠 끓", TPO: "일상", category: "메인반찬", ingredients: "[재료] la4인분", difficulty: "아릿나", time: "30분이내", TPO_new: "배지라이프" },
  { food_title: "LA수갈비티밍빙", TPO: "일상", category: "민간뜬", ingredients: "[재료] 디곡5인분이상", difficulty: "초급", time: "30분이내", TPO_new: "배지라이프" },
  { food_title: "LA양삼당늘끓기", TPO: "영운", category: "메인반찬", ingredients: "[재료] LA6인분", difficulty: "중급", time: "60분이내", TPO_new: "" },
  { food_title: "LA양삼담늘끓기", TPO: "손님접대", category: "메인반찬", ingredients: "[재료] la4인분", difficulty: "초급", time: "60분이내", TPO_new: "" },
];

// 재료 매핑 (재료명을 정규화하기 위한 매핑)
export const INGREDIENT_MAPPING: { [key: string]: string[] } = {
  "떡": ["떡", "떡볶이떡", "가래떡", "떡국떡"],
  "사과": ["사과", "apple"],
  "배": ["배", "pear"],
  "쌀": ["쌀", "밥", "rice"],
  "딸기": ["딸기", "strawberry"],
  "바나나": ["바나나", "banana"],
  "양상추": ["양상추", "상추", "lettuce"],
  "식빵": ["식빵", "빵", "bread"],
  "양파": ["양파", "onion"],
  "베이컨": ["베이컨", "bacon"],
  "달걀": ["달걀", "계란", "egg"],
  "또띠아": ["또띠아", "토르티야"],
  "스파게티": ["스파게티", "pasta", "파스타"],
  "양배추": ["양배추", "cabbage"],
  "버섯": ["버섯", "mushroom", "양송이"],
  "닭고기": ["닭고기", "닭", "chicken"],
  "갈비": ["갈비", "LA갈비", "소갈비"],
  "김치": ["김치", "배추김치"],
  "파": ["파", "대파", "쪽파"],
  "당근": ["당근", "carrot"],
  "감자": ["감자", "potato"],
  "돼지고기": ["돼지고기", "돼지", "pork"],
  "두부": ["두부", "tofu"],
  "고추": ["고추", "청양고추"],
  "마늘": ["마늘", "garlic"],
  "토마토": ["토마토", "tomato"],
  "치즈": ["치즈", "cheese"],
  "우유": ["우유", "milk"],
  "버터": ["버터", "butter"],
};

// 재료 추출 함수 (대괄호 안 재료 텍스트 파싱)
export function extractIngredients(ingredientText: string): string[] {
  const match = ingredientText.match(/\[재료\]\s*(.+?)(?:\d|$)/);
  if (!match) return [];
  
  const ingredientPart = match[1];
  // 쉼표, 띄어쓰기, ㆍ 등으로 분리
  return ingredientPart.split(/[,ㆍ\s]+/).filter(ing => ing.length > 0);
}

// 재료 정규화 함수
export function normalizeIngredient(ingredient: string): string {
  const cleaned = ingredient.trim().toLowerCase();
  
  for (const [standard, variations] of Object.entries(INGREDIENT_MAPPING)) {
    if (variations.some(v => cleaned.includes(v.toLowerCase()))) {
      return standard;
    }
  }
  
  return ingredient;
}

// 사용자 재료와 레시피 재료 매칭
export function calculateIngredientMatch(userIngredients: string[], recipeIngredients: string[]): number {
  const normalizedUserIngredients = userIngredients.map(ing => normalizeIngredient(ing));
  const normalizedRecipeIngredients = recipeIngredients.map(ing => normalizeIngredient(ing));
  
  const matchCount = normalizedRecipeIngredients.filter(recipeIng =>
    normalizedUserIngredients.some(userIng => 
      recipeIng.includes(userIng) || userIng.includes(recipeIng)
    )
  ).length;
  
  return normalizedRecipeIngredients.length > 0 
    ? Math.round((matchCount / normalizedRecipeIngredients.length) * 100)
    : 0;
}

// 난이도 매핑
export function mapDifficulty(difficulty: string): '쉬움' | '중간' | '어려움' {
  if (difficulty.includes('초급')) return '쉬움';
  if (difficulty.includes('중급')) return '중간';
  if (difficulty.includes('고급') || difficulty.includes('아릿나')) return '어려움';
  return '중간';
}

// 조리시간 매핑
export function mapCookingTime(time: string): number {
  if (time.includes('30분')) return 30;
  if (time.includes('60분')) return 60;
  if (time.includes('90분')) return 90;
  return 30;
}

// TPO를 healthTags로 매핑
export function mapHealthTags(tpo: string, tpoNew: string): string[] {
  const tags: string[] = [];
  const combined = `${tpo} ${tpoNew}`.toLowerCase();
  
  if (combined.includes('다이어트') || combined.includes('뷰티') || combined.includes('뷰티 핏')) {
    tags.push('뷰티 핏');
  }
  if (combined.includes('프로틴') || combined.includes('단백질')) {
    tags.push('프로틴 업');
  }
  if (combined.includes('저속노화') || combined.includes('안티에이징')) {
    tags.push('저속노화 식단');
  }
  if (combined.includes('배지라이프') || combined.includes('채식')) {
    tags.push('배지라이프');
  }
  
  return [...new Set(tags)];
}

// 카테고리 매핑
export function mapCategory(category: string): '한식' | '중식' | '일식' | '양식' | '디저트' | '기타' {
  if (category.includes('양식')) return '양식';
  if (category.includes('일식') || category.includes('스시')) return '일식';
  if (category.includes('중식')) return '중식';
  if (category.includes('한식') || category.includes('김치') || category.includes('밥') || category.includes('국')) return '한식';
  if (category.includes('디저트') || category.includes('빵') || category.includes('과자')) return '디저트';
  return '기타';
}
