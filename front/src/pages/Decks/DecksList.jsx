import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Calendar, Search, Folder, FolderOpen, ChevronRight, ChevronDown, Home } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/cards/Card';
import Button from '../../components/ui/Button';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';

const DecksList = () => {
  const [decks, setDecks] = useState([]);
  const [filteredDecks, setFilteredDecks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [subfolders, setSubfolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

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
  }, [decks, searchQuery, sortBy]);

  const fetchFoldersTree = async () => {
    try {
      const response = await api.get('/folders/tree/');
      setFolders(response.data);
    } catch (error) {
      console.error('Ошибка загрузки дерева папок:', error);
    }
  };

  const fetchAllDecks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/decks/');
      const decksList = response.data.results || response.data;
      setDecks(decksList);
      setCurrentFolder(null);
      setSubfolders([]);
    } catch (error) {
      console.error('Ошибка загрузки колод:', error);
      toast.error('Ошибка загрузки колод');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderContents = async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/folders/${id}/contents/`);
      setCurrentFolder(response.data.folder);
      setSubfolders(response.data.subfolders || []);
      setDecks(response.data.decks || []);
    } catch (error) {
      console.error('Ошибка загрузки содержимого папки:', error);
      toast.error('Ошибка загрузки папки');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...decks];

    if (searchQuery) {
      result = result.filter(deck =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredDecks(result);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('recent');
  };

  const toggleFolderExpand = (id) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderFolderTree = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasSubfolders = folder.subfolders && folder.subfolders.length > 0;

    return (
      <div key={folder.id}>
        <div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
            transition-all hover:bg-gray-100
            ${isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
          `}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => setSelectedFolderId(folder.id)}
        >
          {hasSubfolders ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolderExpand(folder.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <span className="text-lg">{folder.icon || '📁'}</span>

          {isExpanded ? (
            <FolderOpen className="w-4 h-4" style={{ color: folder.color }} />
          ) : (
            <Folder className="w-4 h-4" style={{ color: folder.color }} />
          )}

          <span className="flex-1 font-medium text-sm truncate">{folder.name}</span>

          {folder.decks_count > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {folder.decks_count}
            </span>
          )}
        </div>

        {isExpanded && hasSubfolders && (
          <div>
            {folder.subfolders.map(subfolder => renderFolderTree(subfolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderBreadcrumbs = () => {
    if (!currentFolder?.breadcrumbs || currentFolder.breadcrumbs.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedFolderId(null)}
          className="hover:text-blue-600 transition flex items-center gap-1"
        >
          <Home className="w-4 h-4" />
        </button>

        {currentFolder.breadcrumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => setSelectedFolderId(crumb.id)}
              className={`
                hover:text-blue-600 transition
                ${index === currentFolder.breadcrumbs.length - 1 ? 'font-medium text-gray-900' : ''}
              `}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>
    );
  };

  const FolderSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex-shrink-0 hidden lg:block">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Папки</h2>
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Создать папку"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <button
          onClick={() => setSelectedFolderId(null)}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-lg
            transition-all text-sm font-medium
            ${selectedFolderId === null 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          <Folder className="w-4 h-4" />
          Все колоды
        </button>
      </div>

      <div className="p-2">
        {folders && folders.length > 0 ? (
          folders.map(folder => renderFolderTree(folder))
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            Нет папок
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen">
          <FolderSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden">
        <FolderSidebar />

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            {renderBreadcrumbs()}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {currentFolder ? currentFolder.name : 'Все колоды'}
                </h1>
                {currentFolder?.description && (
                  <p className="text-gray-600 mt-1">{currentFolder.description}</p>
                )}
                <p className="text-gray-600 mt-2">
                  {filteredDecks.length} {filteredDecks.length !== decks.length && `из ${decks.length}`} колод
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => setShowCreateFolderModal(true)} 
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                >
                  <Plus size={20} className="mr-2" />
                  Папка
                </Button>
                <Button 
                  onClick={() => setShowCreateDeckModal(true)}
                  className="flex-1 sm:flex-none"
                >
                  <Plus size={20} className="mr-2" />
                  Колода
                </Button>
              </div>
            </div>

            <Card>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Поиск колод..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="recent">Недавние</option>
                    <option value="name">По алфавиту</option>
                    <option value="cards">Больше карточек</option>
                    <option value="due">На повторение</option>
                  </select>
                </div>

                {(searchQuery || sortBy !== 'recent') && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-500">Активные фильтры:</span>
                    
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm">
                        Поиск: "{searchQuery}"
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="hover:bg-blue-100 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    
                    {sortBy !== 'recent' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-sm">
                        Сортировка: {
                          sortBy === 'name' ? 'По алфавиту' :
                          sortBy === 'cards' ? 'По карточкам' :
                          'По повторениям'
                        }
                        <button 
                          onClick={() => setSortBy('recent')}
                          className="hover:bg-purple-100 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Сбросить всё
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {subfolders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Папки ({subfolders.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {subfolders.map(subfolder => (
                    <div
                      key={subfolder.id}
                      onClick={() => setSelectedFolderId(subfolder.id)}
                      className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{subfolder.icon || '📁'}</span>
                        <Folder className="w-6 h-6" style={{ color: subfolder.color || '#6366f1' }} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                        {subfolder.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {subfolder.decks_count || 0} {subfolder.decks_count === 1 ? 'колода' : 'колод'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredDecks.length > 0 ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Колоды ({filteredDecks.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredDecks.map((deck) => (
                    <Link key={deck.id} to={`/decks/${deck.id}`}>
                      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: deck.color + '20' }}
                          >
                            <BookOpen size={24} style={{ color: deck.color }} />
                          </div>
                        </div>

                        <div className="flex-1 mb-4">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">
                            {deck.name}
                          </h3>
                          
                          <div className="min-h-[40px]">
                            {deck.description && (
                              <p className="text-gray-600 text-sm line-clamp-2 break-words">
                                {deck.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-500 pt-4 border-t mt-auto">
                          <div className="flex items-center">
                            <BookOpen size={16} className="mr-1 shrink-0" />
                            <span>{deck.total_cards || 0} карточек</span>
                          </div>
                          {deck.cards_due_today > 0 && (
                            <div className="flex items-center text-blue-600 font-medium">
                              <Calendar size={16} className="mr-1 shrink-0" />
                              <span>{deck.cards_due_today} на сегодня</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="text-center py-12">
                {searchQuery || sortBy !== 'recent' ? (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Колоды не найдены</h3>
                    <p className="text-gray-600 mb-6">
                      Попробуйте изменить параметры поиска
                    </p>
                    <Button variant="secondary" onClick={clearFilters}>
                      Сбросить фильтры
                    </Button>
                  </>
                ) : (
                  <>
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Нет колод</h3>
                    <p className="text-gray-600 mb-6">
                      Создайте свою первую колоду
                    </p>
                    <Button onClick={() => setShowCreateDeckModal(true)}>
                      Создать колоду
                    </Button>
                  </>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {showCreateDeckModal && (
        <CreateDeckModal
          folderId={selectedFolderId}
          onClose={() => setShowCreateDeckModal(false)}
          onSuccess={() => {
            setShowCreateDeckModal(false);
            if (selectedFolderId) {
              fetchFolderContents(selectedFolderId);
            } else {
              fetchAllDecks();
            }
            fetchFoldersTree();
          }}
        />
      )}

      {showCreateFolderModal && (
        <CreateFolderModal
          parentId={selectedFolderId}
          onClose={() => setShowCreateFolderModal(false)}
          onSuccess={() => {
            setShowCreateFolderModal(false);
            fetchFoldersTree();
            if (selectedFolderId) {
              fetchFolderContents(selectedFolderId);
            }
          }}
        />
      )}
    </Layout>
  );
};

const CreateDeckModal = ({ folderId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    folder: folderId,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Введите название колоды');
      return;
    }

    setLoading(true);

    try {
      await api.post('/decks/', formData);
      toast.success('Колода создана! 🎉');
      onSuccess();
    } catch (error) {
      console.error('Ошибка создания колоды:', error);
      toast.error('Ошибка создания колоды');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Создать колоду</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Название колоды"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="3"
              placeholder="Краткое описание колоды"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Цвет темы</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-16 rounded-lg cursor-pointer border border-gray-300"
              />
              <span className="text-sm text-gray-600">{formData.color.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose} 
              className="flex-1 order-2 sm:order-1"
              disabled={loading}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim()} 
              className="flex-1 order-1 sm:order-2"
            >
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateFolderModal = ({ parentId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: '📁',
    parent: parentId,
  });
  const [loading, setLoading] = useState(false);

  const iconOptions = ['📁', '📂', '🗂️', '📚', '📖', '📝', '🎯', '⭐', '🔥', '💼', '🎨', '🔬'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Введите название папки');
      return;
    }

    setLoading(true);

    try {
      await api.post('/folders/', formData);
      toast.success('Папка создана! 📁');
      onSuccess();
    } catch (error) {
      console.error('Ошибка создания папки:', error);
      toast.error('Ошибка создания папки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Создать папку</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Название папки"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="2"
              placeholder="Краткое описание"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Иконка</label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`
                    text-2xl p-2 rounded-lg border-2 transition-all
                    ${formData.icon === icon 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Цвет</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-16 rounded-lg cursor-pointer border border-gray-300"
              />
              <span className="text-sm text-gray-600">{formData.color.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose} 
              className="flex-1 order-2 sm:order-1"
              disabled={loading}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim()} 
              className="flex-1 order-1 sm:order-2"
            >
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DecksList;
