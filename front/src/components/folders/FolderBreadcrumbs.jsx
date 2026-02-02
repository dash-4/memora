import { Home, ChevronRight } from 'lucide-react';

export default function FolderBreadcrumbs({ breadcrumbs = [], onNavigate }) {
  if (!breadcrumbs?.length) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-wrap">
      <button
        onClick={() => onNavigate(null)}
        className="hover:text-blue-600 transition flex items-center gap-1"
      >
        <Home className="w-4 h-4" />
      </button>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.id} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => onNavigate(crumb.id)}
            className={`
              hover:text-blue-600 transition
              ${index === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : ''}
            `}
          >
            {crumb.name}
          </button>
        </div>
      ))}
    </div>
  );
}