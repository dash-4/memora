import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

const LIMIT = 10;

export default function MatchingSession({ deckId }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reverse = searchParams.get('reverse') === '1';

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get('/study/matching_cards/', {
          params: { deck_id: Number(deckId), limit: LIMIT, reverse },
        });
        const list = data.cards || [];
        if (list.length < 2) {
          toast('Нужно минимум 2 карточки для подбора', { icon: 'ℹ️' });
          navigate(`/decks/${deckId}`);
          return;
        }
        setCards(list);
      } catch (err) {
        setError(err.response?.data?.error || 'Не удалось загрузить карточки');
        toast.error('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [deckId, reverse, navigate]);

  const questions = cards.map((c) => ({ id: c.id, text: c.question, answerId: c.id }));
  const answers = [...cards].sort(() => Math.random() - 0.5).map((c) => ({ id: c.id, text: c.answer }));

  const handleSelectQuestion = (id) => {
    if (matchedPairs.has(id)) return;
    setSelectedAnswerId(null);
    setSelectedQuestionId((prev) => (prev === id ? null : id));
  };

  const handleSelectAnswer = (id) => {
    if (matchedPairs.has(id)) return;
    if (!selectedQuestionId) return;
    const card = cards.find((c) => c.id === selectedQuestionId);
    if (card.id === id) {
      setMatchedPairs((prev) => new Set([...prev, id]));
      setSelectedQuestionId(null);
      setSelectedAnswerId(null);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setSelectedAnswerId(id);
      setTimeout(() => {
        setSelectedQuestionId(null);
        setSelectedAnswerId(null);
      }, 400);
    }
  };

  const allMatched = cards.length > 0 && matchedPairs.size === cards.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4" />
        <p className="text-gray-600">Загрузка...</p>
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
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
        >
          Вернуться к колоде
        </button>
      </div>
    );
  }

  if (allMatched) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Все пары подобраны!</h2>
        <p className="text-gray-600 mb-8">
          Найдено пар: <strong>{matchedPairs.size}</strong> из {cards.length}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(`/decks/${deckId}`)}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
          >
            К колоде
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition"
          >
            Начать заново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/decks/${deckId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Назад к колоде</span>
        </button>
        <p className="text-sm font-medium text-gray-600">
          Подобрано: <span className="text-amber-600 font-bold">{matchedPairs.size}</span> / {cards.length}
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${shake ? 'animate-shake' : ''}`}>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Вопросы</h3>
          {questions.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => handleSelectQuestion(q.id)}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all
                ${matchedPairs.has(q.id) ? 'bg-green-50 border-green-300 text-green-800' : ''}
                ${selectedQuestionId === q.id ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-300 bg-white'}
              `}
            >
              <span className="line-clamp-2 font-medium">{q.text}</span>
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Ответы</h3>
          {answers.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => handleSelectAnswer(a.id)}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all
                ${matchedPairs.has(a.id) ? 'bg-green-50 border-green-300 text-green-800' : ''}
                ${selectedAnswerId === a.id && !matchedPairs.has(a.id) ? 'border-red-400 bg-red-50' : ''}
                ${!matchedPairs.has(a.id) && selectedAnswerId !== a.id ? 'border-gray-200 hover:border-gray-300 bg-white' : ''}
              `}
            >
              <span className="line-clamp-2 font-medium">{a.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
