import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, BookOpen, Clock, PlayCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/cards/Card';
import Button from '../../components/ui/Button';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';

const Schedule = () => {
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState([]);
  const [stats, setStats] = useState(null);
  const [decksWithDueCards, setDecksWithDueCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const [scheduleResponse, decksResponse] = await Promise.all([
        api.get('/study/schedule/', {
          params: { days: 7 }
        }),
        api.get('/statistics/decks_progress/')
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const schedule = (scheduleResponse.data.schedule || [])
        .filter(day => {
          const dayDate = new Date(day.date);
          dayDate.setHours(0, 0, 0, 0);
          return dayDate >= today;
        })
        .slice(0, 7);

      setScheduleData(schedule);
      setStats(scheduleResponse.data.stats);

      const decksWithCards = decksResponse.data.filter(
        deck => deck.cards_due_today > 0
      );
      setDecksWithDueCards(decksWithCards);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Ошибка загрузки расписания');
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudying = (deckId) => {
    navigate(`/study?deck=${deckId}&mode=learning`);
  };

  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return 'Сегодня';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">Загрузка расписания...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-blue-600" size={32} />
            Расписание повторений
          </h1>
          <p className="text-gray-600 mt-2">Планируйте свои занятия на неделю вперед</p>
        </div>

        {decksWithDueCards.length > 0 ? (
          <div className="relative">
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
            <Card className="border-2 border-blue-500 bg-blue-50 shadow-xl">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Clock className="text-white" size={24} />
                    </div>
                    Готовы повторить?
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-2 ml-12">
                    У вас <span className="font-bold text-blue-600">{stats?.today || 0}</span> {stats?.today === 1 ? 'карточка' : stats?.today < 5 ? 'карточки' : 'карточек'} на сегодня
                  </p>
                </div>

                <div className="space-y-3">
                  {decksWithDueCards.map((deck, index) => (
                    <div
                      key={deck.id}
                      className="group relative overflow-hidden bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                      style={{ 
                        animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                            style={{ backgroundColor: deck.color }}
                          >
                            <BookOpen size={24} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg">{deck.name}</h3>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1.5">
                              <span className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full">
                                <Clock size={14} className="text-orange-600" />
                                <span className="font-semibold text-orange-700">{deck.cards_due_today}</span> на сегодня
                              </span>
                             
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartStudying(deck.id)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
                        >
                          <PlayCircle size={18} />
                          Начать
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Отличная работа!
              </h3>
              <p className="text-gray-600">
                На сегодня нет карточек для повторения
              </p>
            </div>
          </Card>
        )}

        <Card className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-600" size={24} />
              План на 7 дней
            </h2>
            <span className="text-sm text-gray-500">
              {scheduleData.length} {scheduleData.length === 1 ? 'день' : scheduleData.length < 5 ? 'дня' : 'дней'}
            </span>
          </div>
          
          {scheduleData.length > 0 ? (
            <div className="space-y-2">
              {scheduleData.map((day) => {
                const isToday = getDateLabel(day.date) === 'Сегодня';
                
                return (
                  <div
                    key={day.date}
                    className={`p-3 rounded-lg border transition-all ${
                      isToday 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          day.count > 0 ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          <span className="text-white text-xs font-bold">
                            {new Date(day.date).getDate()}
                          </span>
                        </div>
                        <p className={`text-sm font-bold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                          {getDateLabel(day.date)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isToday && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                            Сегодня
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-sm ${
                          day.count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {day.count}
                        </span>
                      </div>
                    </div>

                    {day.by_deck && day.by_deck.length > 0 ? (
                      <div className="ml-10 space-y-1.5">
                        {day.by_deck.map(deck => (
                          <div 
                            key={deck.deck_id}
                            className={`flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors ${
                              isToday ? 'cursor-pointer' : ''
                            }`}
                            onClick={() => isToday && handleStartStudying(deck.deck_id)}
                            title={isToday ? 'Начать обучение' : ''}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div 
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: deck.color || '#6366f1' }}
                              />
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {deck.deck_name || 'Без названия'}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 bg-white text-gray-700 text-xs font-bold rounded border border-gray-200 ml-2">
                              {deck.count || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : day.count > 0 ? (
                      <p className="ml-10 text-xs text-gray-500 italic">
                        Загрузка данных о колодах...
                      </p>
                    ) : (
                      <p className="ml-10 text-xs text-gray-400 italic">
                        Нет карточек для повторения
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-base font-medium">Нет запланированных повторений</p>
              <p className="text-gray-400 text-sm mt-2">Добавьте карточки в колоды для начала обучения</p>
            </div>
          )}
        </Card>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Layout>
  );
};

export default Schedule;
