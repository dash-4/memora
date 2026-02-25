import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import FlashCard from './FlashCard';
import RatingButtons from './RatingButtons';
import ProgressBar from './ProgressBar';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function LearningSession({ deckId }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reverse = searchParams.get('reverse') === '1';

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTime = useRef(Date.now());
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const loadSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const sessionRes = await api.post('/study/start_session/', {
          deck_id: Number(deckId),
          mode: 'learning',
          reverse,
        });

        const newSessionId = sessionRes.data.session_id;
        setSessionId(newSessionId);

        let loadedCards = [];

        try {
          const dueCardsRes = await api.get('/study/due_cards/', {
            params: {
              deck_id: Number(deckId),
              limit: 50,
            },
          });
          loadedCards = dueCardsRes.data.cards || [];
        } catch (_e) {}

        if (loadedCards.length === 0) {
          const allCardsRes = await api.get(`/decks/${deckId}/cards/`);
          const allCards = allCardsRes.data.cards || allCardsRes.data || [];

          loadedCards = allCards.filter((card) => {
            const isNew = !card.repetitions || card.repetitions === 0;
            const isDue =
              card.next_review && new Date(card.next_review) <= new Date();
            return isNew || isDue;
          });
        }

        if (loadedCards.length === 0) {
          toast('Нет карточек для повторения', { icon: 'ℹ️' });
          navigate(`/decks/${deckId}`);
          return;
        }

        const shuffled = [...loadedCards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        startTime.current = Date.now();
      } catch (err) {
        setError(err.response?.data?.error || 'Не удалось загрузить карточки');
        toast.error('Ошибка загрузки сессии');
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    return () => {
      hasInitialized.current = false;
    };
  }, [deckId, navigate]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    async (rating) => {
      if (isSubmitting) {
        return;
      }

      if (!sessionId) {
        toast.error('Сессия не инициализирована');
        return;
      }

      const currentCard = cards[currentIndex];
      if (!currentCard?.id) {
        toast.error('Карточка не найдена');
        return;
      }

      setIsSubmitting(true);

      const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

      const payload = {
        card_id: currentCard.id,
        session_id: sessionId,
        rating,
        time_taken: timeTaken,
      };

      try {
        await api.post('/study/submit_review/', payload);

        if (currentIndex < cards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
          startTime.current = Date.now();
        } else {
          toast.success('Обучение завершено!', {
            icon: '🏆',
            duration: 3000,
          });

          try {
            await api.post('/study/end_session/', { session_id: sessionId });
          } catch (_endErr) {}

          navigate(`/decks/${deckId}`);
        }
      } catch (err) {
        toast.error(
          err.response?.data?.error || 'Не удалось сохранить оценку'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [cards, currentIndex, sessionId, deckId, navigate, isSubmitting]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (!isFlipped || isSubmitting) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) {
        e.preventDefault();
        handleRate(n);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFlipped, isSubmitting, handleRate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">Загрузка карточек...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ошибка</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate(`/decks/${deckId}`)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Вернуться к колоде
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <p className="text-gray-600 mb-6">Нет карточек для отображения</p>
        <button
          onClick={() => navigate(`/decks/${deckId}`)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Вернуться к колоде
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/decks/${deckId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Назад к колоде</span>
        </button>

        <ProgressBar current={currentIndex + 1} total={cards.length} />
      </div>

      <FlashCard card={currentCard} isFlipped={isFlipped} onFlip={handleFlip} reverse={reverse} />

      {isFlipped && <RatingButtons onRate={handleRate} disabled={isSubmitting} />}
    </div>
  );
}
