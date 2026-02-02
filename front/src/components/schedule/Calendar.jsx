import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ data, onDayClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      const dayData = data.find(d => d.date === dateString);

      days.push({
        day: i,
        date: date,
        dateString,
        count: dayData?.count || 0,
        byDeck: dayData?.by_deck || [],
      });
    }

    return days;
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const days = getDaysInMonth();
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>

        <h3 className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
          {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </h3>

        <button
          onClick={() => changeMonth(1)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 pb-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((dayData, index) => {
          if (!dayData) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const today = isToday(dayData.date);
          const past = isPast(dayData.date);
          const hasCards = dayData.count > 0;

          return (
            <button
              key={dayData.dateString}
              onClick={() => onDayClick?.(dayData.dateString)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg
                transition-all relative text-xs sm:text-sm
                ${today ? 'bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700' : ''}
                ${!today && hasCards ? 'bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200' : ''}
                ${!today && !hasCards && !past ? 'text-gray-700 hover:bg-gray-100' : ''}
                ${!today && !hasCards && past ? 'text-gray-400 hover:bg-gray-50' : ''}
              `}
            >
              <span>{dayData.day}</span>
              
              {hasCards && (
                <span className={`
                  text-[9px] sm:text-[10px] font-normal mt-0.5
                  ${today ? 'text-white' : 'text-blue-600'}
                `}>
                  {dayData.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
