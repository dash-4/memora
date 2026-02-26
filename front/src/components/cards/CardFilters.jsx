export const CardFilters = ({ 
  filters, 
  onFilterChange, 
  showDeckFilter = false,
  decks = []
}) => {
  const hasActiveFilters = filters.search || filters.status || filters.deck_id;

  const resetFilters = () => {
    onFilterChange('search', '');
    onFilterChange('status', '');
    onFilterChange('tag', '');
    if (showDeckFilter) {
      onFilterChange('deck_id', '');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none"
            >
              <path 
                d="M7 13A6 6 0 1 0 7 1a6 6 0 0 0 0 12zM13 13l2.5 2.5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
            
            <input
              type="text"
              placeholder="Поиск по карточкам..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors"
                aria-label="Очистить поиск"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {showDeckFilter && decks.length > 0 && (
          <div className="min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Колода
            </label>
            <select
              value={filters.deck_id || ''}
              onChange={(e) => onFilterChange('deck_id', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            >
              <option value="">Все колоды</option>
              {decks.map(deck => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Статус
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
          >
            <option value="">Все</option>
            <option value="new">🆕 Новые</option>
            <option value="learning">📚 Изучаются</option>
            <option value="mastered">✅ Выучены</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            aria-label="Сбросить все фильтры"
          >
            <svg 
              className="transform rotate-45" 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none"
            >
              <path 
                d="M8 2v4M8 10v4M2 8h4M10 8h4" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
            Сбросить
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500">
            Активные фильтры:
          </span>
          
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium">
              Поиск: "{filters.search}"
              <button 
                onClick={() => onFilterChange('search', '')}
                className="hover:bg-blue-100 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.status && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium">
              Статус: {
                filters.status === 'new' ? 'Новые' :
                filters.status === 'learning' ? 'Изучаются' :
                'Выучены'
              }
              <button 
                onClick={() => onFilterChange('status', '')}
                className="hover:bg-blue-100 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </span>
          )}
          
        </div>
      )}
    </div>
  );
};
