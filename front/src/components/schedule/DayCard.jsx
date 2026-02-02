export default function DayCard({ date, onClick }) {
  if (!date) {
    return <div className="aspect-square" />;
  }

  const isToday = date.dateString === new Date().toISOString().split('T')[0];
  const hasCards = date.count > 0;

  return (
    <div
      onClick={onClick}
      className={`
        aspect-square p-1 sm:p-2 rounded-lg text-center cursor-pointer transition-all
        ${hasCards ? 'bg-blue-50 hover:bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}
        ${isToday ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
          {date.day}
        </span>
        {date.count > 0 && (
          <span className="text-[10px] sm:text-xs font-bold text-blue-600 mt-0.5">
            {date.count}
          </span>
        )}
      </div>
    </div>
  );
}