import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ data = [], onDayClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = (firstDay.getDay() || 7) - 1; // пн = 0

  const todayStr = new Date().toISOString().split('T')[0];

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split('T')[0];
    const entry = data.find(e => e.date === dateStr);
    days.push({
      day: d,
      dateStr,
      count: entry?.count || 0,
      isToday: dateStr === todayStr,
      isPast: date < new Date().setHours(0,0,0,0),
    });
  }

  return (
    <div className="w-full max-w-md mx-auto select-none">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft size={18} className="text-neutral-400" />
        </button>

        <h2 className="text-lg font-medium text-neutral-800 tracking-tight">
          {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </h2>

        <button
          onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          aria-label="Следующий месяц"
        >
          <ChevronRight size={18} className="text-neutral-400" />
        </button>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 text-xs font-medium text-neutral-400 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>

      {/* Календарь */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const { day, dateStr, count, isToday, isPast } = cell;
          const active = count > 0;

          let cn = `
            aspect-square rounded-full flex items-center justify-center
            text-sm font-medium transition-all duration-200
            relative
          `;

          if (isToday) {
            cn += ' bg-blue-600 text-white font-semibold shadow-sm';
          } else if (active) {
            cn += ' bg-blue-50 text-blue-700 hover:bg-blue-100';
          } else if (isPast) {
            cn += ' text-neutral-300';
          } else {
            cn += ' text-neutral-700 hover:bg-blue-50';
          }

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick?.(dateStr)}
              className={cn}
              disabled={!active && !isToday}
            >
              {day}
              {active && !isToday && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}