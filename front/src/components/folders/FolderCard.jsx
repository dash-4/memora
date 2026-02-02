import { Folder } from 'lucide-react';

export default function FolderCard({ folder, onClick }) {
  return (
    <div
      onClick={() => onClick(folder.id)}
      className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-3">
        <Folder className="w-6 h-6" style={{ color: folder.color || '#6366f1' }} />
      </div>
      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{folder.name}</h3>
      <p className="text-sm text-gray-600">
        {folder.decks_count || 0} {folder.decks_count === 1 ? 'колода' : 'колод'}
      </p>
    </div>
  );
}