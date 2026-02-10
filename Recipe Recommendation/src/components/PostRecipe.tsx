import { useState } from 'react';
import { Plus, Minus, Save, Upload, X } from 'lucide-react';
import { Recipe, RecipeIngredient } from '../types';
import { EQUIPMENT_OPTIONS, HEALTH_TAG_OPTIONS } from '../data/mockRecipes';
import axios from 'axios';

interface PostRecipeProps {
  onSubmit: (recipe: Omit<Recipe, 'id' | 'createdAt'> | Recipe) => void | Promise<void>;
  onCancel: () => void;
  recipe?: Recipe | null;
  currentUser: string | null;
}

export function PostRecipe({ onSubmit, onCancel, recipe, currentUser }: PostRecipeProps) {
  const [name, setName] = useState(recipe?.name || '');
  const [cookingTime, setCookingTime] = useState(recipe?.cookingTime?.toString() || '');
  const [difficulty, setDifficulty] = useState<'쉬움' | '중간' | '어려움' | '보통'>(recipe?.difficulty || '보통');
  const [category, setCategory] = useState<string>(recipe?.category || '양식');
  const [dishwashing, setDishwashing] = useState<'적음' | '중간' | '많음' | '보통'>(recipe?.dishwashing || '보통');
  const [lateNightSuitable, setLateNightSuitable] = useState(recipe?.lateNightSuitable || false);
  const [healthTags, setHealthTags] = useState<string[]>(recipe?.healthTags || []);
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>(recipe?.requiredEquipment || []);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    recipe?.ingredients.length ? recipe.ingredients : [{ name: '', amount: '' }]
  );
  const [steps, setSteps] = useState<string[]>(recipe?.steps.length ? recipe.steps : ['']);
  const [imageQuery, setImageQuery] = useState('');
  const [recipeImage, setRecipeImage] = useState(recipe?.image || '');

  const handleHealthTagToggle = (tag: string) => {
    setHealthTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleEquipmentToggle = (equipment: string) => {
    setRequiredEquipment(prev =>
      prev.includes(equipment) ? prev.filter(e => e !== equipment) : [...prev, equipment]
    );
  };

  const handleIngredientChange = (index: number, field: 'name' | 'amount', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };


  // src/components/PostRecipe.tsx 내부

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    const recipeData = {
      ...(recipe || {}), // 기존 레시피 데이터 유지 (수정 시 ID 등 포함)
      name,
      cookingTime: parseInt(cookingTime),
      difficulty,
      category,
      dishwashing,
      lateNightSuitable,
      healthTags,
      requiredEquipment,
      ingredients: ingredients.filter(ing => ing.name && ing.amount),
      steps: steps.filter(step => step.trim()),
      image: recipeImage || imageQuery,
      author: currentUser,
    };

    onSubmit(recipeData as Recipe);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecipeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setRecipeImage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="mb-6">{recipe ? '레시피 수정' : '레시피 등록'}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-gray-700 mb-2">레시피 이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                placeholder="예: 엄마표 특제 파스타"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">요리 시간 (분) *</label>
                <input
                  type="number"
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                  placeholder="30"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">난이도 *</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as '쉬움' | '중간' | '어려움')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                >
                  <option value="쉬움">쉬움</option>
                  <option value="중간">중간</option>
                  <option value="어려움">어려움</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">카테고리 *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as '한식' | '일식' | '중식' | '양식' | '디저트' | '기타')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                >
                  <option value="한식">한식</option>
                  <option value="일식">일식</option>
                  <option value="중식">중식</option>
                  <option value="양식">양식</option>
                  <option value="디저트">디저트</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">설거지 양 *</label>
                <select
                  value={dishwashing}
                  onChange={(e) => setDishwashing(e.target.value as '적음' | '중간' | '많음')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                >
                  <option value="적음">적음</option>
                  <option value="중간">중간</option>
                  <option value="많음">많음</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">이미지 검색어</label>
                <input
                  type="text"
                  value={imageQuery}
                  onChange={(e) => setImageQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                  placeholder="예: 파스타, 스테이크, 샐러드"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lateNightSuitable}
                  onChange={(e) => setLateNightSuitable(e.target.checked)}
                  className="w-4 h-4 rounded focus:ring-2"
                  style={{ accentColor: '#808000' }}
                />
                <span className="text-gray-700">야식 적합 (냄새와 소음이 적음)</span>
              </label>
            </div>

            {/* Health Tags */}
            <div>
              <label className="block text-gray-700 mb-2">건강 식단</label>
              <div className="flex flex-wrap gap-2">
                {HEALTH_TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleHealthTagToggle(tag)}
                    className={`px-3 py-2 rounded-lg transition-colors capitalize ${healthTags.includes(tag)
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    style={healthTags.includes(tag) ? { backgroundColor: '#808000' } : {}}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Required Equipment */}
            <div>
              <label className="block text-gray-700 mb-2">필요한 조리기구</label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <button
                    key={equipment}
                    type="button"
                    onClick={() => handleEquipmentToggle(equipment)}
                    className={`px-3 py-2 rounded-lg transition-colors capitalize ${requiredEquipment.includes(equipment)
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    style={requiredEquipment.includes(equipment) ? { backgroundColor: '#808000' } : {}}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-gray-700 mb-2">재료 *</label>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                      placeholder="재료 이름"
                      required
                    />
                    <input
                      type="text"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                      placeholder="양"
                      required
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Minus size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus size={18} />
                  재료 추가
                </button>
              </div>
            </div>

            {/* Steps */}
            <div>
              <label className="block text-gray-700 mb-2">요리 순서 *</label>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center mt-2" style={{ backgroundColor: '#808000' }}>
                      {index + 1}
                    </div>
                    <textarea
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                      style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
                      rows={2}
                      placeholder="Describe this cooking step..."
                      required
                    />
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg self-start mt-2"
                      >
                        <Minus size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStep}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus size={18} />
                  단계 추가
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 mb-2">레시피 이미지 업로드</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {recipeImage ? (
                  <div className="relative">
                    <img
                      src={recipeImage}
                      alt="레시피 이미지"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">이미지를 업로드하거나 위의 이미지 검색어를 입력하세요</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="recipeImageUpload"
                    />
                    <label
                      htmlFor="recipeImageUpload"
                      className="inline-flex items-center gap-2 px-6 py-2 text-white rounded-lg cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: '#808000' }}
                    >
                      <Upload size={18} />
                      이미지 선택
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: '#808000' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6b6b00')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#808000')}
              >
                <Save size={20} />
                {recipe ? '레시피 수정' : '레시피 등록'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}