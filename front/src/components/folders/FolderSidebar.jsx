import { Plus, Folder } from 'lucide-react';
import FolderTree from './FolderTree';

export default function FolderSidebar({
  folders,
  selectedFolderId,
  onFolderSelect,
  onCreateFolder,
  expandedFolders,
  onToggleExpand,
}) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Папки</h2>
          <button
            onClick={onCreateFolder}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
            title="Создать папку"
          >
            <Plus className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
          </button>
        </div>

        <button
          onClick={() => onFolderSelect(null)}
          className={`
            w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
            ${
              selectedFolderId === null 
                ? 'bg-blue-50 text-blue-700 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <Folder className={`w-4 h-4 ${selectedFolderId === null ? 'text-blue-600' : ''}`} />
          Все колоды
        </button>
      </div>

      <div className="p-2">
        {folders?.length > 0 ? (
          <div className="space-y-1">
            {folders.map(folder => (
              <FolderTree
                key={folder.id}
                folder={folder}
                level={0}
                isSelected={selectedFolderId === folder.id}
                onSelect={onFolderSelect}
                expandedFolders={expandedFolders}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <Folder className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 font-medium">Нет папок</p>
            <p className="text-xs text-gray-400 mt-1">Создайте первую папку</p>
          </div>
        )}
      </div>
    </div>
  );
}
