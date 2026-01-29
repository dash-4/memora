// src/pages/Study/LearningMode.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';

const LearningMode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get('deck');

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionResponse = await api.post('/study/start_session/', {
          deck_id: deckId,
          mode: 'learning'
        });
        setSessionId(sessionResponse.data.session_id);

        const params = deckId ? { deck_id: deckId, limit: 20 } : { limit: 20 };
        
        let cardsToStudy = [];
        
        try {
          const dueCardsResponse = await api.get('/study/due_cards/', { params });
          cardsToStudy = dueCardsResponse.data.cards || [];
        } catch (error) {
          console.warn('Error fetching due cards:', error);
        }

        if (cardsToStudy.length === 0 && deckId) {
          try {
            const allCardsResponse = await api.get('/study/all_cards/', { params });
            const allCards = allCardsResponse.data.cards || [];
            cardsToStudy = allCards.filter(card => !card.next_review || card.repetitions === 0);
          } catch (error) {
            console.warn('Error fetching all cards:', error);
          }
        }
        
        if (cardsToStudy.length === 0) {
          toast.success('Нет карточек на сегодня! 🎉');
          navigate('/decks');
          return;
        }

        setCards(cardsToStudy);
        setLoading(false);
      } catch (error) {
        console.error('Error starting session:', error);
        toast.error('Ошибка загрузки карточек');
        navigate('/decks');
      }
    };

    loadSession();
  }, [deckId, navigate]);

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const endSession = useCallback(async () => {
    try {
      if (sessionId) {
        await api.post('/study/end_session/', { session_id: sessionId });
      }
      toast.success('Обучение завершено! 🎉');
      navigate('/decks');
    } catch (error) {
      console.error('Error ending session:', error);
      navigate('/decks');
    }
  }, [sessionId, navigate]);

  const handleRating = useCallback(async (rating) => {
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      await api.post('/study/submit_review/', {
        card_id: cards[currentIndex].id,
        session_id: sessionId,
        rating: rating,
        time_taken: timeTaken,
      });

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
        startTimeRef.current = Date.now();
      } else {
        endSession();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Ошибка отправки ответа');
    }
  }, [cards, currentIndex, sessionId, endSession]);

  const handleEndSession = useCallback(async () => {
    if (!window.confirm('Завершить обучение?')) {
      return;
    }
    endSession();
  }, [endSession]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка карточек...</div>
        </div>
      </Layout>
    );
  }

  if (!cards || cards.length === 0 || !cards[currentIndex]) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-gray-500">Нет доступных карточек</div>
          <Button onClick={() => navigate('/decks')}>
            Вернуться к колодам
          </Button>
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
            <span className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="font-medium text-xs sm:text-sm">Обучение</span>
            </span>
            <div className="text-base sm:text-lg font-semibold text-gray-700">
              {currentIndex + 1} <span className="text-gray-400">/</span> {cards.length}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="w-full h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">
            Прогресс: {Math.round(progress)}%
          </p>
        </div>

        <div className="perspective-900">
          <div className={`flip-card h-[350px] sm:h-[400px] lg:h-[450px] ${showAnswer ? 'flipped' : ''}`}>
            <div className="flip-card-front absolute inset-0 bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-12 flex flex-col justify-center items-center border-2 border-gray-200">
              <div className="text-center w-full max-w-2xl space-y-6 sm:space-y-8 overflow-y-auto max-h-full px-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 sm:mb-3">
                    Вопрос
                  </p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-relaxed break-words">
                    {currentCard.front}
                  </h2>
                </div>
                
                <Button
                  onClick={handleShowAnswer}
                  className="px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                  Показать ответ
                </Button>
              </div>
            </div>

            <div className="flip-card-back absolute inset-0 bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-12 flex flex-col justify-center items-center border-2 border-gray-200">
              <div className="text-center w-full max-w-2xl space-y-6 sm:space-y-8 overflow-y-auto max-h-full px-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 sm:mb-3">
                    Вопрос
                  </p>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700 leading-relaxed break-words">
                    {currentCard.front}
                  </h2>
                </div>

                <div className="pt-6 sm:pt-8 border-t-2 border-gray-200">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 sm:mb-3">
                    Ответ
                  </p>
                  <p className="text-2xl sm:text-2xl lg:text-3xl font-semibold text-blue-700 leading-relaxed break-words">
                    {currentCard.back}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAnswer && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            <p className="text-center text-sm sm:text-base text-gray-600 font-medium">
              Насколько хорошо вы помните эту карточку?
            </p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <button
                onClick={() => handleRating(1)}
                className="group p-4 sm:p-6 bg-white border-2 border-red-200 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col items-center space-y-2"
              >
                <div className="text-2xl sm:text-3xl">😰</div>
                <div className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-red-700">Забыл</div>
                <div className="text-xs text-gray-500">&lt; 10 минут</div>
              </button>

              <button
                onClick={() => handleRating(2)}
                className="group p-4 sm:p-6 bg-white border-2 border-orange-200 hover:border-orange-500 hover:bg-orange-50 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col items-center space-y-2"
              >
                <div className="text-2xl sm:text-3xl">😕</div>
                <div className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-orange-700">Сложно</div>
                <div className="text-xs text-gray-500">1 день</div>
              </button>

              <button
                onClick={() => handleRating(3)}
                className="group p-4 sm:p-6 bg-white border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col items-center space-y-2"
              >
                <div className="text-2xl sm:text-3xl">😊</div>
                <div className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue-700">Хорошо</div>
                <div className="text-xs text-gray-500">3+ дней</div>
              </button>

              <button
                onClick={() => handleRating(4)}
                className="group p-4 sm:p-6 bg-white border-2 border-green-200 hover:border-green-500 hover:bg-green-50 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col items-center space-y-2"
              >
                <div className="text-2xl sm:text-3xl">😎</div>
                <div className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-green-700">Легко</div>
                <div className="text-xs text-gray-500">6+ дней</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LearningMode;
