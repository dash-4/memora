import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Check, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

const LIMIT = 20;

export default function TestSession({ deckId }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reverse = searchParams.get('reverse') === '1';

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [sessionRes, testRes] = await Promise.all([
          api.post('/study/start_session/', {
            deck_id: Number(deckId),
            mode: 'test',
            reverse,
          }),
          api.get('/study/test_cards/', {
            params: { deck_id: Number(deckId), limit: LIMIT, reverse },
          }),
        ]);
        setSessionId(sessionRes.data.session_id);
        const list = testRes.data.cards || [];
        if (list.length === 0) {
          toast('Нет карточек для теста', { icon: 'ℹ️' });
          navigate(`/decks/${deckId}`);
          return;
        }
        setCards(list);
      } catch (err) {
        setError(err.response?.data?.error || 'Не удалось загрузить тест');
        toast.error('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [deckId, reverse, navigate]);

  const current = cards[currentIndex];
  const isLast = currentIndex >= cards.length - 1;
  const answered = selectedOption !== null;

  const handleSelectOption = (option) => {
    if (answered) return;
    setSelectedOption(option);
    if (option === current?.correct_answer) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = async () => {
    if (!answered) return;
    if (isLast) {
      setShowResults(true);
      try {
        if (sessionId) await api.post('/study/end_session/', { session_id: sessionId });
      } catch (e) {
      }
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
  };

  const total = cards.length;
  const progressCorrect = total ? correctCount : 0;
  const progressTotal = total ? currentIndex + (answered ? 1 : 0) : 0;
  const percent = progressTotal ? Math.round((progressCorrect / progressTotal) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4" />
        <p className="text-gray-600">Загрузка теста...</p>
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
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Вернуться к колоде
        </button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-gray-600 mb-6">Нет вопросов</p>
        <button
          onClick={() => navigate(`/decks/${deckId}`)}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          К колоде
        </button>
      </div>
    );
  }

  if (showResults) {
    const finalCorrect = correctCount;
    const finalTotal = cards.length;
    const finalPercent = finalTotal ? Math.round((finalCorrect / finalTotal) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Тест завершён</h2>
        <p className="text-gray-600 mb-2">
          Правильных ответов: <strong className="text-emerald-600">{finalCorrect}</strong> из {finalTotal}
        </p>
        <p className="text-xl font-semibold text-gray-800 mb-8">Точность: {finalPercent}%</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(`/decks/${deckId}`)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition"
          >
            К колоде
          </button>
          <button
            onClick={() => navigate(`/study?deck=${deckId}&mode=test${reverse ? '&reverse=1' : ''}`)}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
          >
            Пройти снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(`/decks/${deckId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Назад к колоде</span>
        </button>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
          <span>
            Правильно: <span className="text-emerald-600 font-bold">{progressCorrect}</span> / {progressTotal}
          </span>
          <span>Точность: {percent}%</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-10 mb-8">
        {current.image_url && (
          <img
            src={current.image_url}
            alt=""
            className="max-h-48 rounded-lg object-contain mx-auto mb-6"
          />
        )}
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Вопрос {currentIndex + 1} из {cards.length}</p>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 leading-tight">
          {current.question}
        </h2>
        <div className="space-y-3">
          {current.options?.map((opt) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === current.correct_answer;
            const showResult = answered && (isSelected || isCorrect);
            const correctStyle = showResult && isCorrect ? 'bg-green-50 border-green-400 text-green-800' : '';
            const wrongStyle = showResult && isSelected && !isCorrect ? 'bg-red-50 border-red-400 text-red-800' : '';
            const baseStyle = !showResult ? 'border-gray-200 hover:border-emerald-300 bg-white' : '';
            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => handleSelectOption(opt)}
                className={`
                  w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3
                  ${correctStyle} ${wrongStyle} ${baseStyle}
                  ${answered ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <span className="font-medium break-words flex-1">{opt}</span>
                {showResult && isCorrect && <Check className="w-6 h-6 text-green-600 shrink-0" />}
                {showResult && isSelected && !isCorrect && <X className="w-6 h-6 text-red-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {answered && (
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
          >
            {isLast ? 'Завершить тест' : 'Далее'}
          </button>
        </div>
      )}
    </div>
  );
}
