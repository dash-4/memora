import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Dumbbell, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';

const PracticeMode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get('deck');

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardKey, setCardKey] = useState(0);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionResponse = await api.post('/study/start_session/', {
          deck_id: deckId,
          mode: 'practice'
        });
        setSessionId(sessionResponse.data.session_id);

        const cardsResponse = await api.get('/study/all_cards/', {
          params: { deck_id: deckId, limit: 20 }
        });
        
        if (cardsResponse.data.cards.length === 0) {
          toast.error('В колоде нет карточек');
          navigate('/decks');
          return;
        }

        setCards(cardsResponse.data.cards);
        setLoading(false);
      } catch (error) {
        console.error('Error starting session:', error);
        toast.error('Ошибка загрузки карточек');
        navigate('/decks');
      }
    };

    loadSession();
  }, [deckId, navigate]);

  const handleCardClick = () => {
    setShowAnswer(!showAnswer);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setShowAnswer(false);
      setCardKey(prev => prev + 1);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 50);
    } else {
      endSession();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setShowAnswer(false);
      setCardKey(prev => prev + 1);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
      }, 50);
    }
  };

  const endSession = async () => {
    try {
      if (sessionId) {
        await api.post('/study/end_session/', { session_id: sessionId });
      }
      toast.success('Тренировка завершена! 💪');
      navigate('/decks');
    } catch (error) {
      console.error('Error ending session:', error);
      navigate('/decks');
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm('Завершить тренировку?')) {
      return;
    }
    endSession();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка карточек...</div>
        </div>
      </Layout>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={handleEndSession}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft size={20} />
            <span className="font-medium text-sm sm:text-base">Назад</span>
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <Dumbbell size={16} className="sm:w-4.5 sm:h-4.5" />
              <span className="font-medium text-xs sm:text-sm">Тренировка</span>
            </span>
            <div className="text-base sm:text-lg font-semibold text-gray-700">
              {currentIndex + 1} <span className="text-gray-400">/</span> {cards.length}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="w-full h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">
            Прогресс: {Math.round(progress)}%
          </p>
        </div>

        <div className="perspective-900">
          <div 
            key={cardKey}
            onClick={handleCardClick}
            className={`flip-card h-87.5 sm:h-100 lg:h-112.5 cursor-pointer ${showAnswer ? 'flipped' : ''}`}
          >
            <div className="flip-card-front absolute inset-0 bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-12 flex flex-col justify-center items-center border-2 border-gray-200 hover:border-purple-300 transition-colors">
              <div className="text-center w-full max-w-2xl space-y-6 sm:space-y-8 overflow-y-auto max-h-full px-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 sm:mb-3">
                    Вопрос
                  </p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-relaxed wrap-break-word">
                    {currentCard.front}
                  </h2>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
                  💡 Нажмите на карточку, чтобы увидеть ответ
                </p>
              </div>
            </div>

            <div className="flip-card-back absolute inset-0 bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-12 flex flex-col justify-center items-center border-2 border-purple-300">
              <div className="text-center w-full max-w-2xl space-y-4 sm:space-y-6 overflow-y-auto max-h-full px-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 sm:mb-3">
                    Ответ
                  </p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-700 leading-relaxed wrap-break-word">
                    {currentCard.back}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
                  💡 Нажмите снова, чтобы вернуться к вопросу
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="secondary"
            className="flex-1 py-4 sm:py-6 text-sm sm:text-lg font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center">
              <ChevronLeft size={20} className="sm:mr-2" />
              <span className="hidden sm:inline">Предыдущая</span>
            </span>
          </Button>

          <Button
            onClick={handleNext}
            className="flex-1 py-4 sm:py-6 text-sm sm:text-lg font-semibold bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg"
          >
            <span className="flex items-center justify-center">
              {currentIndex < cards.length - 1 ? (
                <>
                  <span className="hidden sm:inline">Следующая</span>
                  <ChevronRight size={20} className="sm:ml-2" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Завершить</span>
                  <ChevronRight size={20} className="sm:ml-2" />
                </>
              )}
            </span>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PracticeMode;
