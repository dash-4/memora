const ratings = [
  { value: 1, label: 'Снова', emoji: '😵', desc: '< 10 мин', border: 'border-red-200', hoverBorder: 'hover:border-red-400', hoverBg: 'hover:bg-red-50', text: 'text-red-700', hoverOverlay: 'group-hover:bg-red-100/30' },
  { value: 2, label: 'Тяжело', emoji: '😓', desc: '1 день', border: 'border-orange-200', hoverBorder: 'hover:border-orange-400', hoverBg: 'hover:bg-orange-50', text: 'text-orange-700', hoverOverlay: 'group-hover:bg-orange-100/30' },
  { value: 3, label: 'Хорошо', emoji: '🙂', desc: '3–5 дней', border: 'border-blue-200', hoverBorder: 'hover:border-blue-400', hoverBg: 'hover:bg-blue-50', text: 'text-blue-700', hoverOverlay: 'group-hover:bg-blue-100/30' },
  { value: 4, label: 'Легко', emoji: '😎', desc: '6+ дней', border: 'border-green-200', hoverBorder: 'hover:border-green-400', hoverBg: 'hover:bg-green-50', text: 'text-green-700', hoverOverlay: 'group-hover:bg-green-100/30' },
];

export default function RatingButtons({ onRate, disabled = false }) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <p className="text-center text-base sm:text-lg font-medium text-gray-700">
        Насколько хорошо ты запомнил эту карточку?
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {ratings.map((r) => (
          <button
            key={r.value}
            type="button"
            disabled={disabled}
            onClick={() => onRate(r.value)}
            className={`
              group relative flex flex-col items-center justify-center p-5 sm:p-6 lg:p-8
              border-2 rounded-2xl transition-all duration-300 ease-out bg-white
              ${r.border} ${disabled ? 'opacity-50 cursor-not-allowed' : `cursor-pointer hover:shadow-xl hover:-translate-y-1 ${r.hoverBorder} ${r.hoverBg}`}
              focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
            `}
          >
            <span className="text-4xl sm:text-5xl mb-3 transition-transform duration-300 group-hover:scale-110">
              {r.emoji}
            </span>
            <span className={`font-bold text-base sm:text-lg lg:text-xl ${r.text} transition-colors`}>
              {r.label}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              {r.desc}
            </span>
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${r.hoverOverlay}`} />
          </button>
        ))}
      </div>
    </div>
  );
}