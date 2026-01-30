import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar, Dumbbell, Edit2 } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/cards/Card';
import Button from '../../components/ui/Button';
import Layout from '../../components/layout/Layout';
import CardModal from '../../components/cards/CardModal';
import { CardFilters } from '../../components/cards/CardFilters';
import toast from 'react-hot-toast';

const DeckDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [allCards, setAllCards] = useState([]); // Все карточки без фильтров
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Состояние фильтров
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    tag: '',
  });

  const fetchDeckDetails = useCallback(async () => {
    try {
      const [deckResponse, cardsResponse] = await Promise.all([
        api.get(`/decks/${id}/`),
        api.get(`/decks/${id}/cards/`, {
          params: {
            status: filters.status || undefined,
            tag: filters.tag || undefined,
          }
        })
      ]);
      
      setDeck(deckResponse.data);
      
      let fetchedCards = cardsResponse.data.cards || cardsResponse.data;
      
      // Применяем поиск на фронте
      if (filters.search) {
        fetchedCards = fetchedCards.filter(card =>
          card.front.toLowerCase().includes(filters.search.toLowerCase()) ||
          card.back.toLowerCase().includes(filters.search.toLowerCase()) ||
          (card.tags && card.tags.some(tag => 
            tag.toLowerCase().includes(filters.search.toLowerCase())
          ))
        );
      }
      
      setCards(fetchedCards);
      
      // Сохраняем все карточки для статистики
      if (!filters.search && !filters.status && !filters.tag) {
        setAllCards(fetchedCards);
      }
    } catch (error) {
      console.error('Error fetching deck:', error);
      toast.error('Ошибка загрузки колоды');
    } finally {
      setLoading(false);
    }
  }, [id, filters]);

  const fetchPopularTags = useCallback(async () => {
    try {
      const response = await api.get('/cards/popular_tags/');
      setPopularTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  useEffect(() => {
    fetchDeckDetails();
  }, [fetchDeckDetails]);

  useEffect(() => {
    fetchPopularTags();
  }, [fetchPopularTags]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleDeleteDeck = useCallback(async () => {
    if (!window.confirm('Удалить колоду? Это действие нельзя отменить.')) {
      return;
    }

    try {
      await api.delete(`/decks/${id}/`);
      toast.success('Колода удалена');
      navigate('/decks');
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Ошибка удаления колоды');
    }
  }, [id, navigate]);

  const handleDeleteCard = useCallback(async (cardId) => {
    if (!window.confirm('Удалить карточку?')) {
      return;
    }

    try {
      await api.delete(`/cards/${cardId}/`);
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
      setAllCards(prevCards => prevCards.filter(card => card.id !== cardId));
      toast.success('Карточка удалена');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Ошибка удаления карточки');
    }
  }, []);

  const handleCreateCard = useCallback(() => {
    setEditingCard(null);
    setShowCardModal(true);
  }, []);

  const handleEditCard = useCallback((card) => {
    setEditingCard(card);
    setShowCardModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowCardModal(false);
    setEditingCard(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    handleModalClose();
    fetchDeckDetails();
  }, [handleModalClose, fetchDeckDetails]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Используем allCards для статистики, cards для отображения
  const statsCards = allCards.length > 0 ? allCards : cards;
  const newCardsCount = statsCards.filter(c => c.repetitions === 0).length;
  const cardsForLearning = deck?.cards_due_today || newCardsCount;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <button
              onClick={() => navigate('/decks')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{deck?.name}</h1>
              {deck?.description && (
                <p className="text-gray-600 mt-1 text-sm sm:text-base">{deck.description}</p>
              )}
            </div>
          </div>
          
          <Button variant="danger" onClick={handleDeleteDeck} className="w-full sm:w-auto">
            <Trash2 size={20} />
            <span className="ml-2 sm:hidden">Удалить</span>
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">Всего карточек</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{statsCards.length}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">На повторение</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{cardsForLearning}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Новые карточки</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{newCardsCount}</p>
          </Card>
        </div>

        {/* Режимы обучения */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-blue-600" />
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Влияет на прогресс
              </span>
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Режим обучения</h3>
            <p className="text-gray-600 text-sm mb-4">
              Повторяйте карточки по расписанию и оценивайте, насколько легко вспомнили. 
              Алгоритм запомнит и покажет сложные карточки чаще.
            </p>
            
            <div className="flex items-center justify-between text-sm mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-600">На сегодня:</p>
                <p className="text-2xl font-bold text-blue-600">
                  {cardsForLearning} <span className="text-sm font-normal text-gray-500">карточек</span>
                </p>
              </div>
            </div>

            {cardsForLearning > 0 ? (
              <Link to={`/study?deck=${id}&mode=learning`}>
                <Button className="w-full">
                  <Calendar size={18} className="mr-2" />
                  Начать обучение
                </Button>
              </Link>
            ) : (
              <div className="text-center py-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                🎉 Нет карточек на сегодня!
              </div>
            )}
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Dumbbell size={24} className="text-purple-600" />
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Свободный режим
              </span>
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Режим тренировки</h3>
            <p className="text-gray-600 text-sm mb-4">
              Просто повторяйте карточки без оценок. Отлично для быстрого просмотра 
              перед экзаменом или когда хотите освежить память.
            </p>
            
            <div className="flex items-center justify-between text-sm mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-600">Доступно:</p>
                <p className="text-2xl font-bold text-purple-600">
                  {statsCards.length} <span className="text-sm font-normal text-gray-500">карточек</span>
                </p>
              </div>
            </div>

            {statsCards.length > 0 ? (
              <Link to={`/study?deck=${id}&mode=practice`}>
                <Button variant="secondary" className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50">
                  <Dumbbell size={18} className="mr-2" />
                  Начать тренировку
                </Button>
              </Link>
            ) : (
              <div className="text-center py-3 bg-gray-50 text-gray-600 rounded-lg text-sm">
                Добавьте карточки для тренировки
              </div>
            )}
          </Card>
        </div>

        {/* ФИЛЬТРЫ */}
        <CardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          popularTags={popularTags}
        />

        {/* Список карточек */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Карточки</h2>
              {cards.length !== statsCards.length && (
                <p className="text-sm text-gray-500 mt-1">
                  Показано {cards.length} из {statsCards.length} карточек
                </p>
              )}
            </div>
            <Button onClick={handleCreateCard} className="w-full sm:w-auto">
              <Plus size={20} className="mr-2" />
              Добавить карточку
            </Button>
          </div>

          {cards.length > 0 ? (
            <div className="space-y-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 w-full">
                      <p className="font-medium text-gray-900 mb-2 break-words">{card.front}</p>
                      <p className="text-gray-600 text-sm break-words">{card.back}</p>
                      
                      {/* Теги */}
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {card.tags.map(tag => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            card.repetitions === 0 ? 'bg-blue-500' :
                            card.repetitions < 3 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></span>
                          Повторений: {card.repetitions}
                        </span>
                        {card.next_review && (
                          <span className="flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {new Date(card.next_review).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                        {/* Статус */}
                        <span className={`px-2 py-0.5 rounded ${
                          card.repetitions === 0 ? 'bg-blue-100 text-blue-700' :
                          card.repetitions < 3 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {card.repetitions === 0 ? '🆕 Новая' :
                           card.repetitions < 3 ? '📚 Изучается' :
                           '✅ Выучена'}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="flex-1 sm:flex-none p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="flex-1 sm:flex-none p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {filters.search || filters.status || filters.tag ? (
                // Если применены фильтры, но карточек нет
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">Карточки не найдены</p>
                  <Button 
                    variant="secondary"
                    onClick={() => setFilters({ search: '', status: '', tag: '' })}
                    className="w-full sm:w-auto"
                  >
                    Сбросить фильтры
                  </Button>
                </>
              ) : (
                // Если фильтры не применены и карточек вообще нет
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">В колоде пока нет карточек</p>
                  <Button onClick={handleCreateCard} className="w-full sm:w-auto">
                    Добавить первую карточку
                  </Button>
                </>
              )}
            </div>
          )}
        </Card>
      </div>

      {showCardModal && (
        <CardModal
          deckId={id}
          card={editingCard}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </Layout>
  );
};

export default DeckDetail;
