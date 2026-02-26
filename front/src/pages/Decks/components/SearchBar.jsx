import { Search } from 'lucide-react';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onClear,
}) {
  const hasActive = searchQuery || sortBy !== 'recent';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск колод..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="recent">Недавние</option>
          <option value="name">По алфавиту</option>
          <option value="cards">Больше карточек</option>
        </select>
      </div>

      {hasActive && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-500">Активные фильтры:</span>
          
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm">
              Поиск: "{searchQuery}"
              <button onClick={() => onSearchChange('')} className="hover:bg-blue-100 rounded-full w-4 h-4 flex items-center justify-center">×</button>
            </span>
          )}
          
          {sortBy !== 'recent' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-sm">
              Сортировка: {sortBy === 'name' ? 'По алфавиту' : sortBy === 'cards' ? 'По карточкам' : 'По повторениям'}
              <button onClick={() => onSortChange('recent')} className="hover:bg-purple-100 rounded-full w-4 h-4 flex items-center justify-center">×</button>
            </span>
          )}

          <button onClick={onClear} className="text-sm text-red-600 hover:text-red-700 font-medium">
            Сбросить всё
          </button>
        </div>
      )}
    </div>
  );
}