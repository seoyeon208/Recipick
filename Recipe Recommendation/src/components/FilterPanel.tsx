import React, { useState, useEffect, useRef } from 'react';

interface Filters {
  maxCookingTime: number | null;
  categories: string[];
  dishwashing: string[];
  lateNightOnly: boolean;
  healthTags: string[];
  requiredEquipment: string[];
  availableEquipment: string[];
}

const EQUIPMENT_OPTIONS = ['인덕션', '가스레인지', '에어프라이어', '전자레인지', '오븐'];
const HEALTH_TAG_OPTIONS = ['뷰티핏', '프로틴 업', '저속노화 식단', '배지라이프'];
const CATEGORIES = ['한식', '일식', '중식', '양식', '디저트', '기타'];

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [scrollY, setScrollY] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const [initialTop, setInitialTop] = useState(0);

  useEffect(() => {
    // 초기 위치 저장
    if (panelRef.current) {
      setInitialTop(panelRef.current.offsetTop);
    }

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 스크롤 위치에 따라 패널 위치 계산
  const panelTop = Math.max(0, scrollY - initialTop + 20); // 96px → 20px (더 위로 붙게 수정)

  const handleTimeChange = (value: string) => {
    onFilterChange({
      ...filters,
      maxCookingTime: value ? parseInt(value) : null,
    });
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleDishwashingChange = (level: string) => {
    const newDishwashing = filters.dishwashing.includes(level)
      ? filters.dishwashing.filter(d => d !== level)
      : [...filters.dishwashing, level];
    onFilterChange({ ...filters, dishwashing: newDishwashing });
  };

  const handleHealthTagChange = (tag: string) => {
    const newTags = filters.healthTags.includes(tag)
      ? filters.healthTags.filter(t => t !== tag)
      : [...filters.healthTags, tag];
    onFilterChange({ ...filters, healthTags: newTags });
  };

  const handleEquipmentChange = (equipment: string) => {
    const newEquipment = filters.availableEquipment.includes(equipment)
      ? filters.availableEquipment.filter(e => e !== equipment)
      : [...filters.availableEquipment, equipment];
    onFilterChange({ ...filters, availableEquipment: newEquipment });
  };

  const checkboxStyle = {
    accentColor: '#808000',
  };

  return (
    <div className="relative" ref={panelRef}>
      <div 
        className="bg-white rounded-lg p-6 transition-all duration-200 ease-out"
        style={{ 
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          transform: `translateY(${panelTop}px)`
          // maxHeight와 overflowY 제거 (내부 스크롤 제거)
        }}
      >
        <h2 className="mb-6 text-xl font-bold">필터</h2>

        {/* Cooking Time */}
        <div className="mb-8">
          <label className="block text-gray-900 mb-3" style={{ fontWeight: 600 }}>
            최대 요리 시간
          </label>
          <select
            value={filters.maxCookingTime || ''}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#808000' } as React.CSSProperties}
          >
            <option value="">제한 없음</option>
            <option value="10">10분</option>
            <option value="15">15분</option>
            <option value="20">20분</option>
            <option value="30">30분</option>
            <option value="45">45분</option>
            <option value="60">1시간</option>
          </select>
        </div>

        {/* Category */}
        <div className="mb-8">
          <label className="block text-gray-900 mb-3" style={{ fontWeight: 600 }}>
            요리 종류
          </label>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="w-4 h-4 rounded focus:ring-2"
                  style={checkboxStyle}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>

          {/* Late Night Suitable */}
          <div className="pt-3 border-t border-gray-200 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.lateNightOnly}
                onChange={(e) => onFilterChange({ ...filters, lateNightOnly: e.target.checked })}
                className="w-4 h-4 rounded focus:ring-2"
                style={checkboxStyle}
              />
              <span className="text-gray-700">야식 적합 음식만</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">냄새와 소음이 적은 요리</p>
          </div>
        </div>

        {/* Dishwashing */}
        <div className="mb-8">
          <label className="block text-gray-900 mb-3" style={{ fontWeight: 600 }}>
            설거지 양
          </label>
          <div className="space-y-2">
            {['적음', '중간', '많음'].map((level) => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.dishwashing.includes(level)}
                  onChange={() => handleDishwashingChange(level)}
                  className="w-4 h-4 rounded focus:ring-2"
                  style={checkboxStyle}
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Health Goals */}
        <div className="mb-8">
          <label className="block text-gray-900 mb-3" style={{ fontWeight: 600 }}>
            건강 식단
          </label>
          <div className="space-y-2">
            {HEALTH_TAG_OPTIONS.map((tag) => (
              <label key={tag} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.healthTags.includes(tag)}
                  onChange={() => handleHealthTagChange(tag)}
                  className="w-4 h-4 rounded focus:ring-2"
                  style={checkboxStyle}
                />
                <span className="capitalize">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Equipment Available */}
        <div className="mb-8">
          <label className="block text-gray-900 mb-3" style={{ fontWeight: 600 }}>
            보유한 조리기구
          </label>
          <div className="space-y-2">
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <label key={equipment} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availableEquipment.includes(equipment)}
                  onChange={() => handleEquipmentChange(equipment)}
                  className="w-4 h-4 rounded focus:ring-2"
                  style={checkboxStyle}
                />
                <span className="capitalize">{equipment}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => onFilterChange({
            maxCookingTime: null,
            categories: [],
            dishwashing: [],
            lateNightOnly: false,
            healthTags: [],
            requiredEquipment: [],
            availableEquipment: [],
          })}
          className="w-full px-4 py-2 border rounded-lg transition-colors"
          style={{ color: '#808000', borderColor: '#808000', fontWeight: 500 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5dc')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
        >
          필터 초기화
        </button>
      </div>
    </div>
  );
}