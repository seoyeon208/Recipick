import { Trash2, AlertCircle } from 'lucide-react';
import { Ingredient } from '../types';

interface IngredientListProps {
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
}

export function IngredientList({ ingredients, onRemove }: IngredientListProps) {
  const getDaysUntilExpiration = (expirationDate: string) => {
    if (!expirationDate) return null;
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationStatus = (days: number | null) => {
    if (days === null) return { text: '유통기한 미설정', color: 'text-gray-600 bg-gray-50' };
    if (days < 0) return { text: '유통기한 지남', color: 'text-red-600 bg-red-50' };
    if (days === 0) return { text: '오늘 만료', color: 'text-orange-600 bg-orange-50' };
    if (days <= 3) return { text: `${days}일 남음`, color: 'text-orange-600 bg-orange-50' };
    if (days <= 7) return { text: `${days}일 남음`, color: 'text-yellow-600 bg-yellow-50' };
    return { text: `${days}일 남음`, color: 'text-green-600 bg-green-50' };
  };

  const sortedIngredients = [...ingredients].sort((a, b) => {
    const daysA = getDaysUntilExpiration(a.expirationDate);
    const daysB = getDaysUntilExpiration(b.expirationDate);
    if (daysA === null && daysB === null) return 0;
    if (daysA === null) return 1; // Items without expiration go last
    if (daysB === null) return -1;
    return daysA - daysB;
  });

  if (ingredients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="mb-6">내 냉장고</h2>
        <p className="text-gray-500 text-center py-8">
          냉장고가 비어있습니다. 재료를 추가해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="mb-4">내 냉장고 (재료 {ingredients.length}개)</h2>
      <div className="space-y-3">
        {sortedIngredients.map((ingredient) => {
          const days = getDaysUntilExpiration(ingredient.expirationDate);
          const status = getExpirationStatus(days);
          
          return (
            <div
              key={ingredient.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-colors"
              style={{ borderColor: 'inherit' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#808000')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgb(229, 231, 235)')}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="capitalize">{ingredient.name}</h3>
                  {days !== null && days <= 3 && <AlertCircle size={18} className="text-orange-500" />}
                </div>
                <div className="flex gap-4 mt-1 text-gray-600">
                  <span>수량: {ingredient.quantity}</span>
                  {ingredient.expirationDate && (
                    <>
                      <span>•</span>
                      <span>유통기한: {new Date(ingredient.expirationDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full ${status.color}`}>
                  {status.text}
                </span>
                <button
                  onClick={() => onRemove(ingredient.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Remove ingredient"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}