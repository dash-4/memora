import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, Dumbbell, Info, Clock, Sparkles, Link2, ClipboardList, RefreshCw } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [studyReverse, setStudyReverse] = useState(false);

  const fetchDeckDetails = useCallback(async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      const [deckRes, cardsRes] = await Promise.all([
        api.get(`/decks/${id}/`),
        api.get(`/decks/${id}/cards/`, { params }),
      ]);

      setDeck(deckRes.data);

      let fetchedCards = cardsRes.data.cards || cardsRes.data;
      setAllCards(fetchedCards);

      if (filters.search) {
        fetchedCards = fetchedCards.filter(
          (card) =>
            card.front?.toLowerCase().includes(filters.search.toLowerCase()) ||
            card.back?.toLowerCase().includes(filters.search.toLowerCase()) ||
            card.tags?.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()))
        );
      }

      setCards(fetchedCards);
    } catch (err) {
      toast.error('Не удалось загрузить колоду');
    } finally {
      setLoading(false);
    }
  }, [id, filters]);

  useEffect(() => {
    fetchDeckDetails();
  }, [fetchDeckDetails]);

  useEffect(() => {
    // теги и популярные теги больше не используются
  }, []);

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



  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DeckHeader deck={deck} onDelete={handleDeleteDeck} />

        <DeckStats total={statsCards.length} dueToday={cardsForLearning} newCount={newCardsCount} />

        <div className="bg-white border border-gray-200/70 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <RefreshCw size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base">Реверс (ответ → вопрос)</p>
               
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={studyReverse}
                onChange={(e) => setStudyReverse(e.target.checked)}
                className="sr-only peer"
              />
              <div className="
                w-14 h-7 bg-gray-200 rounded-full peer-focus:outline-none 
                peer-focus:ring-4 peer-focus:ring-blue-300/50
                peer peer-checked:after:translate-x-7 peer-checked:after:border-white
                after:content-[''] after:absolute after:top-0.5 after:left-0.5 
                after:bg-white after:border after:border-gray-300 after:rounded-full 
                after:h-6 after:w-6 after:transition-all duration-300
                peer-checked:bg-blue-600
              "></div>
            </label>
          </div>
        </div>

        {statsCards.length === 0 && (
          <div className="alert-info p-4 sm:p-5 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold mb-1">Как начать обучение?</h4>
                <p className="text-sm opacity-90">
                  Добавьте хотя бы одну карточку в колоду, и кнопка "Начать обучение" станет активной.
                  Рекомендуем начать с 5-10 карточек.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[
            {
              title: 'Режим обучения',
              icon: Calendar,
              color: 'blue',
              count: cardsForLearning,
              extraCount: newCardsCount,
              badgeActive: cardsForLearning > 0 ? 'Влияет на прогресс' : 'Добавьте карточки',
              badgeColorActive: 'green',
              desc: 'Повторяйте карточки по расписанию и оценивайте, насколько легко вспомнили. Алгоритм запомнит и покажет сложные карточки чаще.',
              buttonText: 'Начать обучение',
              buttonIcon: Sparkles,
              path: 'learning',
              condition: cardsForLearning > 0,
              reverse: true,
            },
            {
              title: 'Режим тренировки',
              icon: Dumbbell,
              color: 'purple',
              count: statsCards.length,
              badgeActive: 'Свободный режим',
              badgeColorActive: 'purple',
              desc: 'Просто повторяйте карточки без оценок. Отлично для быстрого просмотра перед экзаменом или когда хотите освежить память.',
              buttonText: 'Начать тренировку',
              buttonIcon: Dumbbell,
              path: 'practice',
              condition: statsCards.length > 0,
              reverse: true,
            },
            {
              title: 'Подбор пар',
              icon: Link2,
              color: 'amber',
              count: statsCards.length,
              badgeActive: 'Игровой режим',
              badgeColorActive: 'amber',
              desc: 'Сопоставьте вопросы и ответы. Подходит для запоминания пар (слово — перевод, термин — определение).',
              buttonText: 'Начать подбор',
              buttonIcon: Link2,
              path: 'matching',
              condition: statsCards.length >= 2,
              reverse: true,
            },
            {
              title: 'Тест',
              icon: ClipboardList,
              color: 'emerald',
              count: statsCards.length,
              badgeActive: 'Тест / экзамен',
              badgeColorActive: 'emerald',
              desc: 'Выберите правильный ответ из вариантов. Удобно для самопроверки перед экзаменом или зачётом.',
              buttonText: 'Начать тест',
              buttonIcon: ClipboardList,
              path: 'test',
              condition: statsCards.length > 0,
              reverse: true,
            },
          ].map((mode) => {
            const active = mode.condition;
            const color = mode.color;

            return (
              <div
                key={mode.title}
                className={`
                  flex flex-col h-full
                  bg-white rounded-2xl border border-gray-200/80
                  overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group
                  ${active ? `hover:border-${color}-300/60` : 'hover:border-gray-300'}
                `}
              >
                <div className="p-6 lg:p-7 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300
                      ${active ? `bg-${color}-50 group-hover:bg-${color}-100` : 'bg-gray-50'}
                      group-hover:scale-105
                    `}>
                      <mode.icon size={26} className={active ? `text-${color}-600` : 'text-gray-400'} />
                    </div>

                    <span className={`
                      px-4 py-1.5 rounded-full text-xs font-medium tracking-tight
                      ${active
                        ? `bg-${mode.badgeColorActive || color}-50 text-${mode.badgeColorActive || color}-700`
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {active ? mode.badgeActive : 'Добавьте карточки'}
                    </span>
                  </div>

                  <h3 className={`
                    text-xl font-bold mb-3 transition-colors duration-200
                    ${active ? `group-hover:text-${color}-700` : 'text-gray-900'}
                  `}>
                    {mode.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow">
                    {mode.desc}
                  </p>

                  

                  <div className="mt-auto">
                    {active ? (
                      <Button
                        className={`
                          w-full py-3.5 rounded-xl font-medium text-base
                          border-2 transition-all duration-300
                          border-${color}-500/70 text-${color}-700
                          hover:bg-${color}-50/70 hover:border-${color}-500 hover:shadow-md
                        `}
                        onClick={() => navigate(`/study?deck=${id}&mode=${mode.path}${mode.reverse && studyReverse ? '&reverse=1' : ''}`)}
                      >
                        <mode.buttonIcon size={18} className="mr-2.5" />
                        {mode.buttonText}
                      </Button>
                    ) : (
                      <div className="text-center py-4 bg-gray-50/80 border border-gray-200/70 rounded-xl text-sm text-gray-600">
                        Добавьте карточки
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <CardsList
          cards={cards}
          statsCards={statsCards}
          filters={filters}
          onFilterChange={handleFilterChange}
          onCreateCard={handleCreateCard}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onResetFilters={() => setFilters({ search: '', status: '' })}
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