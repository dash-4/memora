const ratings = [
  { value: 1, label: 'Снова', emoji: '😵', desc: '< 10 мин', color: 'red' },
  { value: 2, label: 'Тяжело', emoji: '😓', desc: '1 день', color: 'orange' },
  { value: 3, label: 'Хорошо', emoji: '🙂', desc: '3–5 дней', color: 'blue' },
  { value: 4, label: 'Легко', emoji: '😎', desc: '6+ дней', color: 'green' },
];

export default function RatingButtons({ onRate, disabled = false }) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <p className="text-center text-base sm:text-lg font-medium text-gray-700">
        Насколько хорошо ты запомнил эту карточку?
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {ratings.map(r => (
          <button
            key={r.value}
            type="button"
            disabled={disabled}
            onClick={() => onRate(r.value)}
            className={`
              group relative flex flex-col items-center justify-center p-5 sm:p-6 lg:p-8
              border-2 rounded-2xl transition-all duration-300 ease-out
              ${disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-' + r.color + '-400 hover:bg-' + r.color + '-50/60'
              }
              border-${r.color}-200 bg-white
            `}
          >
            <span className="text-4xl sm:text-5xl mb-3 transition-transform duration-300 group-hover:scale-110">
              {r.emoji}
            </span>
            
            <span className={`
              font-bold text-base sm:text-lg lg:text-xl
              text-${r.color}-700 group-hover:text-${r.color}-800 transition-colors
            `}>
              {r.label}
            </span>
            
            <span className="text-xs sm:text-sm text-gray-500 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              {r.desc}
            </span>

            <div className={`
              absolute inset-0 rounded-2xl bg-${r.color}-100/30 opacity-0 
              group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
            `} />
          </button>
        ))}
      </div>
    </div>
  );
}