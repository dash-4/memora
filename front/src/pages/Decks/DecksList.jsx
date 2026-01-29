import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Calendar } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';

const DecksList = () => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await api.get('/decks/');
      setDecks(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('Ошибка загрузки колод');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Колоды</h1>
            <p className="text-gray-600 mt-2">Управляйте своими колодами карточек</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <Plus size={20} className="mr-2" />
            Создать колоду
          </Button>
        </div>

        {decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {decks.map((deck) => (
              <Link key={deck.id} to={`/decks/${deck.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
                  {/* Верхняя часть - иконка */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: deck.color + '20' }}
                    >
                      <BookOpen size={24} style={{ color: deck.color }} />
                    </div>
                  </div>

                  {/* Средняя часть - название и описание (фиксированная высота) */}
                  <div className="flex-1 mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 wrap-break-word">
                      {deck.name}
                    </h3>
                    
                    {/* Контейнер для описания с фиксированной высотой */}
                    <div className="h-10">
                      {deck.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 wrap-break-word">
                          {deck.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Нижняя часть - статистика (всегда внизу) */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-500 pt-4 border-t mt-auto">
                    <div className="flex items-center">
                      <BookOpen size={16} className="mr-1 shrink-0" />
                      <span>{deck.total_cards} карточек</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1 shrink-0" />
                      <span>{deck.cards_due_today} на сегодня</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Нет колод</h3>
            <p className="text-gray-600 mb-6">
              Создайте свою первую колоду, чтобы начать обучение
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
              Создать колоду
            </Button>
          </Card>
        )}
      </div>

      {showCreateModal && (
        <CreateDeckModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDecks();
          }}
        />
      )}
    </Layout>
  );
};

const CreateDeckModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/decks/', formData);
      toast.success('Колода создана!');
      onSuccess();
    } catch (error) {
      console.error('Error creating deck:', error);
      toast.error('Ошибка создания колоды');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Создать колоду</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Название колоды"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="3"
              placeholder="Описание (необязательно)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цвет</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="h-10 w-full rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DecksList;
