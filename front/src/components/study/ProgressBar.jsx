export default function ProgressBar({ current, total, className = '' }) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-2">
        <span>{current} из {total}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}