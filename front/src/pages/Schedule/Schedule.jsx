import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Clock, PlayCircle, CheckCircle, Sparkles } from 'lucide-react';
import api from '@/services/api';
import Card from '@/components/cards/Card';
import Button from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

export default function Schedule() {
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
        api.get('/study/schedule/', { params: { days: 7 } }),
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
      setDecksWithDueCards(decksResponse.data.filter(deck => deck.cards_due_today > 0));
    } catch (error) {
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

    if (date.getTime() === today.getTime()) return 'Сегодня';
    if (date.getTime() === tomorrow.getTime()) return 'Завтра';
    
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-10">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-blue-600" size={20} sm:size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Расписание
              </h1>
              <p className="text-sm text-gray-600">
                Карточки на ближайшие дни
              </p>
            </div>
          </div>
        </div>

        {/* Готовы повторить? */}
        {decksWithDueCards.length > 0 && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/20 rounded-xl">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Sparkles className="text-white" size={20} sm:size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Готовы повторить?
                    </h2>
                    <p className="text-sm sm:text-base text-blue-700 font-medium mt-1">
                      {stats?.today || 0} карточек на сегодня
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={() => navigate('/study')}
                >
                  <PlayCircle size={16} className="mr-2" />
                  Начать сейчас
                </Button>
              </div>

              {/* Список колод */}
              <div className="mt-5 space-y-3">
                {decksWithDueCards.map(deck => (
                  <div
                    key={deck.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: deck.color || '#3b82f6' }}
                      >
                        <BookOpen size={18} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 truncate text-base">
                          {deck.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {deck.cards_due_today} карточек
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full sm:w-auto"
                      onClick={() => handleStartStudying(deck.id)}
                    >
                      Начать
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* План на неделю */}
        <Card className="rounded-xl border border-gray-200/70">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="text-blue-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  План на неделю
                </h2>
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {scheduleData.reduce((sum, day) => sum + day.count, 0)} всего
              </span>
            </div>

            <div className="space-y-3">
              {scheduleData.length > 0 ? (
                scheduleData.map(day => {
                  const isToday = getDateLabel(day.date) === 'Сегодня';
                  const dayDate = new Date(day.date);
                  
                  return (
                    <div
                      key={day.date}
                      className={`
                        rounded-lg border transition-all text-sm
                        ${isToday
                          ? 'border-blue-400 bg-blue-50/50'
                          : day.count > 0 
                            ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            : 'border-gray-100 bg-gray-50/50'
                        }
                      `}
                    >
                      <div className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-10 h-10 rounded-lg flex items-center justify-center font-medium
                              ${isToday 
                                ? 'bg-blue-500 text-white'
                                : day.count > 0 
                                  ? 'bg-gray-700 text-white' 
                                  : 'bg-gray-200 text-gray-600'
                              }
                            `}>
                              {dayDate.getDate()}
                            </div>
                            <div>
                              <p className={`font-medium ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                                {getDateLabel(day.date)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {dayDate.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>

                          <span className={`
                            px-3 py-1 rounded-full font-medium
                            ${day.count > 0 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-500'
                            }
                          `}>
                            {day.count}
                          </span>
                        </div>

                        {day.by_deck?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs">
                            {day.by_deck.map(item => (
                              <div
                                key={item.deck_id}
                                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color || '#3b82f6' }}
                                  />
                                  <span className="text-gray-800 truncate">
                                    {item.deck_name}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-700">
                                  {item.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 px-4">
                  <CheckCircle className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600 font-medium">
                    Нет запланированных повторений
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}