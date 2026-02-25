import { ChevronDown, ChevronRight, Folder, FolderOpen, Trash2 } from 'lucide-react';

export default function FolderTree({
  folder,
  level = 0,
  isSelected,
  onSelect,
  expandedFolders,
  onToggleExpand,
  onDeleteFolder,
}) {
  const isExpanded = expandedFolders.has(folder.id);
  const hasChildren = folder.subfolders?.length > 0;

  return (
    <div key={folder.id}>
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
          transition-all hover:bg-gray-100
          ${isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(folder.id)}
      >
        {hasChildren ? (
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleExpand(folder.id);
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-5" />
        )}


        {isExpanded ? (
          <FolderOpen className="w-4 h-4" style={{ color: folder.color || '#6366f1' }} />
        ) : (
          <Folder className="w-4 h-4" style={{ color: folder.color || '#6366f1' }} />
        )}

        <span className="flex-1 font-medium text-sm truncate">{folder.name}</span>

        {folder.decks_count > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mr-1">
            {folder.decks_count}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onDeleteFolder) onDeleteFolder(folder.id);
          }}
          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
          title="Удалить папку"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {folder.subfolders.map(sub => (
            <FolderTree
              key={sub.id}
              folder={sub}
              level={level + 1}
              isSelected={false} 
              onSelect={onSelect}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}