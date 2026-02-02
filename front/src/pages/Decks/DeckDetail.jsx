import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, Dumbbell, Info, Clock, Sparkles } from 'lucide-react';
import api from '@/services/api';
import Layout from '@/components/layout/Layout';
import CardModal from '@/components/cards/CardModal';
import DeckHeader from '@/components/decks/DeckHeader';
import DeckStats from '@/components/decks/DeckStats';
import CardsList from './components/CardsList';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Card from '@/components/cards/Card';

export default function DeckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    tag: '',
  });

  const fetchDeckDetails = useCallback(async () => {
    try {
      const [deckRes, cardsRes] = await Promise.all([
        api.get(`/decks/${id}/`),
        api.get(`/decks/${id}/cards/`),
      ]);

      setDeck(deckRes.data);

      let fetchedCards = cardsRes.data.cards || cardsRes.data;

      if (filters.search) {
        fetchedCards = fetchedCards.filter(
          (card) =>
            card.front?.toLowerCase().includes(filters.search.toLowerCase()) ||
            card.back?.toLowerCase().includes(filters.search.toLowerCase()) ||
            card.tags?.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()))
        );
      }

      setCards(fetchedCards);

      if (!filters.search && !filters.status && !filters.tag) {
        setAllCards(fetchedCards);
      }
    } catch (err) {
      console.error('Ошибка загрузки колоды:', err);
      toast.error('Не удалось загрузить колоду');
    } finally {
      setLoading(false);
    }
  }, [id, filters]);

  const fetchPopularTags = useCallback(async () => {
    try {
      const { data } = await api.get('/cards/popular_tags/');
      setPopularTags(data);
    } catch (err) {
      console.error('Ошибка загрузки популярных тегов:', err);
    }
  }, []);

  useEffect(() => {
    fetchDeckDetails();
  }, [fetchDeckDetails]);

  useEffect(() => {
    fetchPopularTags();
  }, [fetchPopularTags]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleDeleteDeck = useCallback(async () => {
    if (!window.confirm('Удалить колоду? Это действие нельзя отменить.')) return;

    try {
      await api.delete(`/decks/${id}/`);
      toast.success('Колода удалена');
      navigate('/decks');
    } catch (err) {
      console.error('Ошибка удаления колоды:', err);
      toast.error('Не удалось удалить колоду');
    }
  }, [id, navigate]);

  const handleDeleteCard = useCallback(async (cardId) => {
    if (!window.confirm('Удалить карточку?')) return;

    try {
      await api.delete(`/cards/${cardId}/`);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      setAllCards((prev) => prev.filter((c) => c.id !== cardId));
      toast.success('Карточка удалена');
    } catch (err) {
      console.error('Ошибка удаления карточки:', err);
      toast.error('Не удалось удалить карточку');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!deck) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Колода не найдена</h2>
          <Button onClick={() => navigate('/decks')}>Вернуться к списку колод</Button>
        </div>
      </Layout>
    );
  }

  const statsCards = allCards.length > 0 ? allCards : cards;
  const cardsForLearning = statsCards.length;
  const newCardsCount = statsCards.filter((c) => !c.repetitions || c.repetitions === 0).length;

  const hasDueCards = statsCards.some(
    (c) => c.repetitions > 0 && (!c.next_review || new Date(c.next_review) <= new Date())
  );

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DeckHeader deck={deck} onDelete={handleDeleteDeck} />

        <DeckStats total={statsCards.length} dueToday={cardsForLearning} newCount={newCardsCount} />

        {/* Подсказка когда можно начать */}
        {statsCards.length === 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Как начать обучение?</h4>
                <p className="text-sm text-blue-700">
                  Добавьте хотя бы одну карточку в колоду, и кнопка "Начать обучение" станет активной. 
                  Рекомендуем начать с 5-10 карточек.
                </p>
              </div>
            </div>
          </div>
        )}

        {statsCards.length > 0 && newCardsCount === 0 && !hasDueCards && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="text-green-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-green-900 mb-1">
                  Отличная работа! 🎉
                </h4>
                <p className="text-sm text-green-700">
                  На сегодня карточек нет. Следующее повторение появится по расписанию. 
                  Можете потренироваться в свободном режиме или добавить новые карточки.
                </p>
              </div>
            </div>
          </div>
        )}

        {statsCards.length > 0 && (newCardsCount > 0 || hasDueCards) && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="text-blue-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Готовы к обучению!
                </h4>
                <p className="text-sm text-blue-700">
                  {newCardsCount > 0 && (
                    <span className="font-medium">{newCardsCount} новых карточек</span>
                  )}
                  {newCardsCount > 0 && hasDueCards && ' и '}
                  {hasDueCards && (
                    <span className="font-medium">карточки на повторение</span>
                  )}
                  {' '}готовы к изучению. Нажмите "Начать обучение" ниже.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Режим обучения */}
          <Card className={`border-2 transition-all duration-200 ${
            cardsForLearning > 0 
              ? 'border-blue-400 shadow-lg' 
              : 'border-gray-200 opacity-75'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                cardsForLearning > 0 ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                <Calendar size={24} className={cardsForLearning > 0 ? 'text-white' : 'text-gray-400'} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                cardsForLearning > 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {cardsForLearning > 0 ? 'Влияет на прогресс' : 'Добавьте карточки'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Режим обучения</h3>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Повторяйте карточки по расписанию и оценивайте, насколько легко вспомнили. Алгоритм
              запомнит и покажет сложные карточки чаще.
            </p>

            <div className={`p-3 rounded-lg mb-4 ${
              cardsForLearning > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">
                  <p className="text-sm font-medium">На сегодня:</p>
                  {newCardsCount > 0 && (
                    <p className="text-xs text-blue-600 mt-0.5">
                      {newCardsCount} {newCardsCount === 1 ? 'новая' : newCardsCount < 5 ? 'новых' : 'новых'}
                    </p>
                  )}
                </div>
                <p className={`text-2xl font-bold ${
                  cardsForLearning > 0 ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {cardsForLearning}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    {cardsForLearning === 1
                      ? 'карточка'
                      : cardsForLearning < 5
                        ? 'карточки'
                        : 'карточек'}
                  </span>
                </p>
              </div>
            </div>

            {cardsForLearning > 0 ? (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 shadow-md hover:shadow-lg transition-all"
                onClick={() => navigate(`/study?deck=${id}&mode=learning`)}
              >
                <Sparkles size={18} className="mr-2" />
                Начать обучение
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="text-center py-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm font-medium">
                  Сначала добавьте карточки
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleCreateCard}
                >
                  Добавить карточку
                </Button>
              </div>
            )}
          </Card>

          {/* Режим тренировки */}
          <Card className={`border-2 transition-all duration-200 ${
            statsCards.length > 0 
              ? 'border-purple-200 hover:border-purple-400 hover:shadow-lg' 
              : 'border-gray-200 opacity-75'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                statsCards.length > 0 ? 'bg-purple-100' : 'bg-gray-200'
              }`}>
                <Dumbbell size={24} className={statsCards.length > 0 ? 'text-purple-600' : 'text-gray-400'} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                statsCards.length > 0 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                Свободный режим
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Режим тренировки</h3>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Просто повторяйте карточки без оценок. Отлично для быстрого просмотра перед экзаменом
              или когда хотите освежить память.
            </p>

            <div className={`p-3 rounded-lg mb-4 ${
              statsCards.length > 0 ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-sm font-medium">Доступно:</p>
                <p className={`text-2xl font-bold ${
                  statsCards.length > 0 ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  {statsCards.length}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    {statsCards.length === 1
                      ? 'карточка'
                      : statsCards.length < 5
                        ? 'карточки'
                        : 'карточек'}
                  </span>
                </p>
              </div>
            </div>

            {statsCards.length > 0 ? (
              <Button
                variant="secondary"
                className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium py-3"
                onClick={() => navigate(`/study?deck=${id}&mode=practice`)}
              >
                <Dumbbell size={18} className="mr-2" />
                Начать тренировку
              </Button>
            ) : (
              <div className="text-center py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg text-sm">
                Добавьте карточки
              </div>
            )}
          </Card>
        </div>

        <CardsList
          cards={cards}
          statsCards={statsCards}
          filters={filters}
          popularTags={popularTags}
          onFilterChange={handleFilterChange}
          onCreateCard={handleCreateCard}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onResetFilters={() => setFilters({ search: '', status: '', tag: '' })}
        />
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
}
