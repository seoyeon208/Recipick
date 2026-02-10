import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Ingredient } from '../types';
import { COMMON_INGREDIENTS } from '../data/mockRecipes';

interface IngredientInputProps {
  onAdd: (ingredient: Omit<Ingredient, 'id'>) => void;
}

export function IngredientInput({ onAdd }: IngredientInputProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (name) {
      const filtered = COMMON_INGREDIENTS.filter(ingredient =>
        ingredient.toLowerCase().includes(name.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && quantity) {
      onAdd({ name, quantity, expirationDate: expirationDate || '' });
      setName('');
      setQuantity('');
      setExpirationDate('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="mb-6" style={{ fontWeight: 600 }}>재료 추가</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-gray-700 mb-2" style={{ fontWeight: 500 }}>재료명</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => name && setShowSuggestions(true)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
            placeholder="예: 토마토"
            required
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left transition-colors"
                  style={{ ':hover': { backgroundColor: '#f5f5dc' } }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5dc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2" style={{ fontWeight: 500 }}>수량</label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
            placeholder="예: 3개"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2" style={{ fontWeight: 500 }}>유통기한 (선택)</label>
          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
          />
        </div>

        <button
          type="submit"
          className="w-full text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          style={{ backgroundColor: '#808000', fontWeight: 500 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6b6b00')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#808000')}
        >
          <Plus size={20} />
          냉장고에 추가
        </button>
      </form>
    </div>
  );
}