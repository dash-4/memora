// src/components/study/PracticeSession.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import FlashCard from './FlashCard';
import ProgressBar from './ProgressBar';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function PracticeSession({ deckId }) {
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const startTime = useRef(Date.now());

  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get('/study/all_cards/', {
          params: { deck_id: Number(deckId), limit: 100 },
        });

        const loaded = res.data.cards || [];

        if (loaded.length === 0) {
          toast('В колоде нет карточек', { icon: 'ℹ️' });
          navigate(`/decks/${deckId}`);
          return;
        }

        setCards(loaded);
      } catch (err) {
        console.error('Ошибка загрузки карточек:', err);
        setError('Не удалось загрузить карточки');
        toast.error('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [deckId, navigate]);

  const handleFlip = (flipped) => {
    setIsFlipped(flipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Просто завершаем тренировку без результатов
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      console.log(`Тренировка завершена. Просмотрено: ${currentIndex + 1} карточек за ${timeSpent} сек`);

      toast.success('Тренировка завершена!', {
        icon: '🏁',
        duration: 3000,
      });

      navigate(`/decks/${deckId}`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4" />
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
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Вернуться к колоде
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex] || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-10">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/decks/${deckId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Назад к колоде</span>
        </button>

        <ProgressBar
          current={currentIndex + 1}
          total={cards.length}
          label="Просмотрено"
        />
      </div>

      {/* Карточка */}
      <FlashCard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      {/* Навигация по карточкам */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`
            flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-colors
            ${currentIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
          `}
        >
          Предыдущая
        </button>

        <button
          onClick={handleNext}
          className={`
            flex-1 sm:flex-none px-8 py-3 rounded-lg font-medium text-white transition-colors
            ${currentIndex < cards.length - 1
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-green-600 hover:bg-green-700'}
          `}
        >
          {currentIndex < cards.length - 1 ? 'Следующая' : 'Завершить'}
        </button>
      </div>
    </div>
  );
}