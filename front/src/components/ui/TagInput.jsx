import React, { useState, useEffect } from 'react';
import { cardsAPI } from '../../services/api';

export const TagInput = ({ value = [], onChange, placeholder = 'Добавить теги...' }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await cardsAPI.getPopularTags();
        setSuggestions(response.data);
      } catch (error) {
        console.error('Ошибка загрузки тегов:', error);
      }
    };
    loadTags();
  }, []);

  const addTag = (tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    s => s.name.toLowerCase().includes(input.toLowerCase()) && !value.includes(s.name)
  );

  return (
    <div className="relative w-full">
      {/* Контейнер с тегами и инпутом */}
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white min-h-[42px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        {/* Список выбранных тегов */}
        {value.map(tag => (
          <span 
            key={tag} 
            className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md text-sm font-medium animate-fadeIn"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
              aria-label={`Удалить тег ${tag}`}
            >
              ×
            </button>
          </span>
        ))}

        {/* Поле ввода */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 border-none outline-none text-sm min-w-[150px] bg-transparent"
        />
      </div>

      {/* Подсказки */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 animate-slideDown">
          {filteredSuggestions.slice(0, 10).map(suggestion => (
            <button
              key={suggestion.name}
              type="button"
              onClick={() => addTag(suggestion.name)}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-700">#{suggestion.name}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                {suggestion.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
