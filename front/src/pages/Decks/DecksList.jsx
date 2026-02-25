import { useState, useEffect } from 'react';
import {
  Plus,
  Search as SearchIcon,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import api from '@/services/api';
import Layout from '@/components/layout/Layout';
import Card from '@/components/cards/Card';
import Button from '@/components/ui/Button';
import DeckCard from '@/components/decks/DeckCard';
import FolderSidebar from '@/components/folders/FolderSidebar';
import FolderCard from '@/components/folders/FolderCard';
import FolderBreadcrumbs from '@/components/folders/FolderBreadcrumbs';
import SearchBar from './components/SearchBar';
import CreateFolderModal from '@/components/folders/modals/CreateFolderModal';
import CreateDeckModal from '@/components/folders/modals/CreateDeckModal';
import toast from 'react-hot-toast';

export default function DecksList() {
  const [decks, setDecks] = useState([]);
  const [filteredDecks, setFilteredDecks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [subfolders, setSubfolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchFoldersTree();
    fetchAllDecks();
  }, []);

  useEffect(() => {
    if (selectedFolderId) {
      fetchFolderContents(selectedFolderId);
    } else {
      fetchAllDecks();
    }
  }, [selectedFolderId]);

  useEffect(() => {
    applyFilters();
  }, [decks, debouncedSearch, sortBy]);

  const fetchFoldersTree = async () => {
    try {
      const { data } = await api.get('/folders/tree/');
      setFolders(data);
    } catch (err) {
    }
  };

  const fetchAllDecks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/decks/');
      setDecks(data.results || data);
      setCurrentFolder(null);
      setSubfolders([]);
    } catch (err) {
      toast.error('Ошибка загрузки колод');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderContents = async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/folders/${id}/contents/`);
      setCurrentFolder(data.folder);
      setSubfolders(data.subfolders || []);
      setDecks(data.decks || []);
    } catch (err) {
      toast.error('Ошибка загрузки содержимого папки');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...decks];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'cards':
        result.sort((a, b) => (b.total_cards || 0) - (a.total_cards || 0));
        break;
      case 'due':
        result.sort((a, b) => (b.cards_due_today || 0) - (a.cards_due_today || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredDecks(result);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('recent');
  };

  const handleFolderSelect = (id) => {
    setSelectedFolderId(id);
    setIsSidebarOpen(false);
  };

  const handleDeleteFolder = async (id) => {
    if (!window.confirm('Удалить папку? Все вложенные колоды останутся без папки.')) return;
    try {
      await api.delete(`/folders/${id}/`);
      if (selectedFolderId === id) {
        setSelectedFolderId(null);
      }
      fetchFoldersTree();
    } catch {
      toast.error('Не удалось удалить папку');
    }
  };

  const handleToggleExpand = (id) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen">
          <div className="hidden lg:block">
            <FolderSidebar
              folders={folders}
              selectedFolderId={selectedFolderId}
              onFolderSelect={handleFolderSelect}
              onCreateFolder={() => setShowCreateFolderModal(true)}
              expandedFolders={expandedFolders}
              onToggleExpand={handleToggleExpand}
              onDeleteFolder={handleDeleteFolder}
            />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </div>
      </Layout>
    );
  }

  const showDecks = filteredDecks.length > 0;

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden lg:block">
          <FolderSidebar
            folders={folders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={handleFolderSelect}
            onCreateFolder={() => setShowCreateFolderModal(true)}
            expandedFolders={expandedFolders}
            onToggleExpand={handleToggleExpand}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>

        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <div className="h-full bg-white shadow-xl">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-bold text-gray-900">Папки</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <FolderSidebar
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                  onFolderSelect={handleFolderSelect}
                  onCreateFolder={() => {
                    setShowCreateFolderModal(true);
                    setIsSidebarOpen(false);
                  }}
                  expandedFolders={expandedFolders}
                  onToggleExpand={handleToggleExpand}
                  onDeleteFolder={handleDeleteFolder}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            <div className="lg:hidden">
              <Button
                variant="secondary"
                onClick={() => setIsSidebarOpen(true)}
                className="w-full mb-4"
              >
                <Menu size={20} className="mr-2" />
                Открыть папки
              </Button>
            </div>

            <FolderBreadcrumbs
              breadcrumbs={currentFolder?.breadcrumbs || []}
              onNavigate={handleFolderSelect}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto">
                <h1 className="heading-page">
                  {currentFolder ? currentFolder.name : 'Все колоды'}
                </h1>
                {currentFolder?.description && (
                  <p className="text-muted text-sm sm:text-base mt-1">
                    {currentFolder.description}
                  </p>
                )}
                <p className="text-muted text-sm sm:text-base mt-2">
                  {filteredDecks.length}{' '}
                  {filteredDecks.length !== decks.length && `из ${decks.length}`}{' '}
                  {filteredDecks.length === 1 ? 'колода' : filteredDecks.length < 5 ? 'колоды' : 'колод'}
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                
                <Button
                  onClick={() => setShowCreateDeckModal(true)}
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  <Plus size={18} className="sm:mr-2" />
                  <span className="hidden sm:inline">Колода</span>
                </Button>
              </div>
            </div>

            <Card>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onClear={clearFilters}
              />
            </Card>

            {subfolders.length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Папки ({subfolders.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {subfolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onClick={handleFolderSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Колоды {showDecks ? `(${filteredDecks.length})` : ''}
              </h2>

              {showDecks ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {filteredDecks.map((deck) => (
                    <DeckCard key={deck.id} deck={deck} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-10 sm:py-12">
                  {searchQuery || sortBy !== 'recent' ? (
                    <>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <SearchIcon size={28} className="text-gray-400 sm:w-8 sm:h-8" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        Колоды не найдены
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-6">
                        Попробуйте изменить параметры поиска
                      </p>
                      <Button variant="secondary" onClick={clearFilters} size="sm">
                        Сбросить фильтры
                      </Button>
                    </>
                  ) : (
                    <>
                      <BookOpen size={40} className="mx-auto text-gray-400 mb-4 sm:w-12 sm:h-12" />
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        Нет колод
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-6">
                        Создайте свою первую колоду
                      </p>
                      <Button onClick={() => setShowCreateDeckModal(true)} size="sm">
                        Создать колоду
                      </Button>
                    </>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateFolderModal && (
        <CreateFolderModal
          parentId={selectedFolderId}
          onClose={() => setShowCreateFolderModal(false)}
          onSuccess={() => {
            setShowCreateFolderModal(false);
            fetchFoldersTree();
            if (selectedFolderId) fetchFolderContents(selectedFolderId);
          }}
        />
      )}

      {showCreateDeckModal && (
        <CreateDeckModal
          folderId={selectedFolderId}
          onClose={() => setShowCreateDeckModal(false)}
          onSuccess={() => {
            setShowCreateDeckModal(false);
            if (selectedFolderId) fetchFolderContents(selectedFolderId);
            else fetchAllDecks();
            fetchFoldersTree();
          }}
        />
      )}
    </Layout>
  );
}
