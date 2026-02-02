import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FlashCard({
  card,
  isFlipped = false,
  onFlip,
  className = '',
  disabled = false,
}) {
  const [flipped, setFlipped] = useState(isFlipped);

  useEffect(() => {
    setFlipped(isFlipped);
  }, [isFlipped]);

  const handleClick = () => {
    if (disabled) return;
    const newFlipped = !flipped;
    setFlipped(newFlipped);
    onFlip?.(newFlipped);
  };

  return (
    <div
      className={`
        perspective-[1200px] w-full max-w-3xl mx-auto
        ${className}
      `}
    >
      <div
        className={`
          relative w-full h-[380px] sm:h-[420px] lg:h-[480px]
          transition-transform duration-700 ease-out
          preserve-3d cursor-pointer
          ${flipped ? 'rotate-y-180' : ''}
          ${disabled ? 'pointer-events-none opacity-80' : ''}
        `}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={flipped ? 'Показать вопрос' : 'Показать ответ'}
      >
        {/* Передняя сторона (вопрос) */}
        <div className="
          absolute inset-0 backface-hidden
          bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-10 lg:p-12
          flex flex-col items-center justify-center text-center
        ">
          <div className="w-full max-h-full overflow-y-auto">
            <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 mb-4">
              Вопрос
            </p>
            <h2 className="
              text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900
              leading-tight break-words whitespace-pre-wrap
            ">
              {card?.front || 'Нет вопроса'}
            </h2>

            {card?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {card.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {!flipped && !disabled && (
            <div className="mt-8 text-gray-400 text-sm flex items-center gap-2">
              <ChevronDown size={16} className="animate-bounce" />
              Нажмите, чтобы показать ответ
            </div>
          )}
        </div>

        <div className="
          absolute inset-0 backface-hidden rotate-y-180
          bg-gradient-to-b from-white to-gray-50 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-10 lg:p-12
          flex flex-col items-center justify-center text-center
        ">
          <div className="w-full max-h-full overflow-y-auto">
            <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 mb-4">
              Ответ
            </p>
            <p className="
              text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800
              leading-relaxed break-words whitespace-pre-wrap
            ">
              {card?.back || 'Нет ответа'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}