export default function Skeleton({ className = '', lines = 1 }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {lines === 1 ? (
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      ) : (
        Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded mt-2" style={{ width: i === lines - 1 ? '50%' : '100%' }} />
        ))
      )}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-[48px]">
      <div className="h-[200px] bg-gray-200 rounded-2xl" />
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
        <div className="grid grid-cols-2 gap-[24px]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
      <div>
        <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
