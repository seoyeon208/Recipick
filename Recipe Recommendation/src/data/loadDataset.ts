import Papa from 'papaparse';

export interface RecipeDataRow {
  food_title: string;
  TPO: string;
  category: string;
  ingredients: string;
  difficulty: string;
  time: string;
  TPO_new: string;
}

/**
 * CSV 데이터셋 로딩 (public 폴더 방식)
 * 
 * 사용법:
 * 1. CSV 파일을 public/recipe_dataset.csv에 저장
 * 2. 터미널에서: npm install papaparse @types/papaparse
 * 3. const data = await loadRecipeDataset();
 */
export async function loadRecipeDataset(): Promise<RecipeDataRow[]> {
  try {
    const response = await fetch('/recipe_dataset.csv');
    
    if (!response.ok) {
      throw new Error(`CSV 파일을 찾을 수 없습니다: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    const result = Papa.parse<RecipeDataRow>(csvText, {
      header: true,           // 첫 행을 헤더로 사용
      skipEmptyLines: true,   // 빈 줄 건너뛰기
      dynamicTyping: false,   // 모든 값을 문자열로 유지
      encoding: 'UTF-8',      // 한글 인코딩
      transformHeader: (header) => header.trim(), // 헤더 공백 제거
    });
    
    if (result.errors.length > 0) {
      console.warn('⚠️ CSV 파싱 경고:', result.errors);
    }
    
    console.log(`✅ CSV 로딩 성공: ${result.data.length}개 레시피`);
    console.log('📊 칼럼:', Object.keys(result.data[0] || {}));
    
    return result.data;
  } catch (error) {
    console.error('❌ CSV 로딩 실패:', error);
    console.log('💡 해결 방법:');
    console.log('1. public/recipe_dataset.csv 파일이 있는지 확인');
    console.log('2. npm install papaparse @types/papaparse 실행');
    console.log('3. CSV 파일이 UTF-8 인코딩인지 확인');
    return [];
  }
}

/**
 * 재료 추출 함수
 * "[재료] 떡ㆍ2인분" → ["떡"]
 */
export function extractIngredients(ingredientText: string): string[] {
  if (!ingredientText) return [];
  
  // [재료] 또는 [주재료] 패턴 매칭
  const match = ingredientText.match(/\[(재료|주재료)\]\s*(.+?)(?:\d|$)/);
  if (!match) {
    // 매칭 실패 시 전체 텍스트에서 추출 시도
    return ingredientText
      .split(/[,ㆍ\s]+/)
      .filter(ing => ing.length > 1)
      .map(ing => ing.replace(/\d+인분|개|g|ml|큰술|작은술/g, '').trim())
      .filter(ing => ing.length > 0);
  }
  
  const ingredientPart = match[2];
  
  // 쉼표, 띄어쓰기, ㆍ 등으로 분리
  return ingredientPart
    .split(/[,ㆍ\s]+/)
    .filter(ing => ing.length > 0)
    .map(ing => ing.replace(/\d+인분|개|g|ml|큰술|작은술/g, '').trim())
    .filter(ing => ing.length > 0);
}

/**
 * 재료 정규화 (유사 재료 통합)
 */
export function normalizeIngredient(ingredient: string): string {
  const cleaned = ingredient.trim().toLowerCase();
  
  const mapping: { [key: string]: string[] } = {
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
    "토마토": ["토마토", "tomato"],
    "치즈": ["치즈", "cheese"],
    "우유": ["우유", "milk"],
    "버터": ["버터", "butter"],
    "마늘": ["마늘", "garlic"],
    "파": ["파", "대파", "쪽파", "green onion"],
    "고추": ["고추", "청양고추", "pepper"],
    "감자": ["감자", "potato"],
    "당근": ["당근", "carrot"],
    "양배추": ["양배추", "cabbage"],
    "버섯": ["버섯", "mushroom", "양송이", "표고버섯"],
    "닭고기": ["닭고기", "닭", "chicken", "닭가슴살", "닭다리"],
    "돼지고기": ["돼지고기", "돼지", "pork", "삼겹살"],
    "소고기": ["소고기", "소", "beef", "갈비"],
    "두부": ["두부", "tofu"],
    "김치": ["김치", "배추김치"],
    "스파게티": ["스파게티", "pasta", "파스타"],
  };
  
  for (const [standard, variations] of Object.entries(mapping)) {
    if (variations.some(v => cleaned.includes(v.toLowerCase()) || v.toLowerCase().includes(cleaned))) {
      return standard;
    }
  }
  
  return ingredient;
}

/**
 * 사용자 재료와 레시피 재료 매칭률 계산
 */
export function calculateIngredientMatch(
  userIngredients: string[],
  recipeIngredients: string[]
): number {
  if (recipeIngredients.length === 0) return 0;
  
  const normalizedUserIngredients = userIngredients.map(ing => normalizeIngredient(ing));
  const normalizedRecipeIngredients = recipeIngredients.map(ing => normalizeIngredient(ing));
  
  const matchCount = normalizedRecipeIngredients.filter(recipeIng =>
    normalizedUserIngredients.some(userIng => 
      recipeIng.includes(userIng) || 
      userIng.includes(recipeIng) ||
      recipeIng === userIng
    )
  ).length;
  
  return Math.round((matchCount / normalizedRecipeIngredients.length) * 100);
}

/**
 * 사용자 재료로 데이터셋에서 매칭되는 레시피 찾기
 */
export function findMatchingRecipes(
  userIngredients: string[],
  dataset: RecipeDataRow[],
  minMatchPercentage: number = 50
): Array<RecipeDataRow & { matchPercentage: number }> {
  const recipesWithMatch = dataset.map(recipe => {
    const recipeIngredients = extractIngredients(recipe.ingredients);
    const matchPercentage = calculateIngredientMatch(userIngredients, recipeIngredients);
    
    return {
      ...recipe,
      matchPercentage
    };
  });
  
  // 매칭률 필터링 및 정렬
  return recipesWithMatch
    .filter(r => r.matchPercentage >= minMatchPercentage)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

/**
 * 난이도 매핑
 */
export function mapDifficulty(difficulty: string): '쉬움' | '중간' | '어려움' {
  if (!difficulty) return '중간';
  
  const cleaned = difficulty.toLowerCase().trim();
  
  if (cleaned.includes('초급') || cleaned.includes('쉬움') || cleaned.includes('easy')) {
    return '쉬움';
  }
  if (cleaned.includes('중급') || cleaned.includes('중간') || cleaned.includes('medium')) {
    return '중간';
  }
  if (cleaned.includes('고급') || cleaned.includes('어려움') || cleaned.includes('hard') || cleaned.includes('아릿나')) {
    return '어려움';
  }
  
  return '중간';
}

/**
 * 조리시간 매핑
 */
export function mapCookingTime(time: string): number {
  if (!time) return 30;
  
  const cleaned = time.toLowerCase();
  
  if (cleaned.includes('30')) return 30;
  if (cleaned.includes('60')) return 60;
  if (cleaned.includes('90')) return 90;
  if (cleaned.includes('120')) return 120;
  
  // 숫자만 추출
  const match = time.match(/\d+/);
  if (match) {
    return parseInt(match[0]);
  }
  
  return 30;
}

/**
 * TPO를 healthTags로 매핑
 */
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

/**
 * 카테고리 매핑
 */
export function mapCategory(category: string): '한식' | '중식' | '일식' | '양식' | '디저트' {
  if (!category) return '한식';
  
  const cleaned = category.toLowerCase();
  
  if (cleaned.includes('양식') || cleaned.includes('western')) return '양식';
  if (cleaned.includes('일식') || cleaned.includes('스시') || cleaned.includes('japanese')) return '일식';
  if (cleaned.includes('중식') || cleaned.includes('chinese')) return '중식';
  if (cleaned.includes('디저트') || cleaned.includes('빵') || cleaned.includes('과자') || cleaned.includes('dessert')) return '디저트';
  
  return '한식';
}

/**
 * 한글 요리명을 영어 키워드로 변환 (Unsplash 검색용)
 */
export function translateToEnglish(koreanName: string): string {
  const mapping: { [key: string]: string } = {
    '떡볶이': 'tteokbokki korean rice cake',
    '김치': 'kimchi',
    '불고기': 'bulgogi korean beef',
    '비빔밥': 'bibimbap korean rice bowl',
    '삼겹살': 'samgyeopsal pork belly',
    '파스타': 'pasta',
    '샌드위치': 'sandwich',
    '샐러드': 'salad',
    '스튜': 'stew',
    '볶음': 'stir fry',
    '구이': 'grilled',
    '찜': 'steamed',
    '조림': 'braised',
    '튀김': 'fried',
    '전골': 'hot pot',
    '국': 'soup',
    '찌개': 'stew',
    '밥': 'rice',
    '죽': 'porridge',
    '면': 'noodles',
    '빵': 'bread',
    '쿠키': 'cookie',
    '주스': 'juice',
    '갈비': 'ribs',
    '닭': 'chicken',
    '돼지': 'pork',
    '소': 'beef',
    '생선': 'fish',
    '새우': 'shrimp',
  };
  
  // 매핑에서 찾기
  for (const [korean, english] of Object.entries(mapping)) {
    if (koreanName.includes(korean)) {
      return english;
    }
  }
  
  // 없으면 "korean food"로 기본 반환
  return 'korean food dish';
}
