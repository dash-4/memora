import { Plus, Folder, Trash2 } from 'lucide-react';
import FolderTree from './FolderTree';

export default function FolderSidebar({
  folders,
  selectedFolderId,
  onFolderSelect,
  onCreateFolder,
  expandedFolders,
  onToggleExpand,
  onDeleteFolder,
}) {
  return (
    <div className="w-72 bg-white border-r border-gray-200 h-full overflow-y-auto flex-shrink-0 shadow-sm">
      <div className="p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Папки</h2>
          <button
            onClick={onCreateFolder}
            className="p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
            title="Создать новую папку"
            aria-label="Создать папку"
          >
            <Plus className="w-6 h-6 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <button
          onClick={() => onFolderSelect(null)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium
            ${
              selectedFolderId === null
                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <Folder 
            className={`w-5 h-5 ${selectedFolderId === null ? 'text-blue-600' : 'text-gray-500'}`} 
          />
          Все колоды
        </button>
      </div>

      <div className="p-3">
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
                onDeleteFolder={onDeleteFolder}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Folder className="w-14 h-14 mx-auto text-gray-300 mb-4" />
            <p className="text-base font-medium text-gray-700">Папок пока нет</p>
            <p className="text-sm text-gray-500 mt-2">
              Нажмите + чтобы создать первую
            </p>
          </div>
        )}
      </div>
    </div>
  );
}