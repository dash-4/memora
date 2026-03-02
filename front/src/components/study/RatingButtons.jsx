import { useState } from 'react';

const ratings = [
  { value: 1, label: 'Снова', emoji: '🤯', desc: '< 10 мин', color: 'red' },
  { value: 2, label: 'Тяжело', emoji: '😖', desc: '1 день', color: 'orange' },
  { value: 3, label: 'Хорошо', emoji: '🧐', desc: '3–5 дней', color: 'blue' },
  { value: 4, label: 'Легко', emoji: '🤓', desc: '6+ дней', color: 'green' },
];

export default function RatingButtons({ onRate, disabled = false }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-center text-base sm:text-lg font-medium text-gray-700">
        Насколько легко вспомнил?
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {ratings.map((r) => (
          <button
            key={r.value}
            type="button"
            disabled={disabled}
            onClick={() => onRate(r.value)}
            onMouseEnter={() => setHovered(r.value)}
            onMouseLeave={() => setHovered(null)}
            className={`
              group relative flex flex-col items-center justify-center p-4 sm:p-5
              border-2 rounded-xl transition-all duration-300 bg-white
              border-${r.color}-200 hover:border-${r.color}-400
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95'}
              focus-visible:ring-2 focus-visible:ring-${r.color}-400 focus-visible:ring-offset-2
            `}
          >
            <span className={`
              text-5xl sm:text-6xl mb-2 transition-all duration-300
              ${hovered === r.value ? 'scale-125 rotate-6' : 'scale-100 group-hover:scale-110'}
            `}>
              {r.emoji}
            </span>

            <span className={`
              font-semibold text-base sm:text-lg
              text-${r.color}-700 group-hover:text-${r.color}-800 transition-colors
            `}>
              {r.label}
            </span>

            <span className={`
              text-xs sm:text-sm text-gray-500 mt-1
              opacity-70 group-hover:opacity-100 transition-opacity
            `}>
              {r.desc}
            </span>

            <div className={`
              absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none
              bg-${r.color}-100
            `} />
          </button>
        ))}
      </div>
    </div>
  );
}