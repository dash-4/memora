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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Sparkles className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Расписание
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-0.5">
              Карточки на ближайшие 7 дней
            </p>
          </div>
        </div>

        {decksWithDueCards.length > 0 && (
          <Card className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-50/30">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Clock className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Готовы повторить?
                    </h2>
                    <p className="text-sm text-gray-600">
                      <span className="font-bold text-blue-700">{stats?.today || 0}</span> на сегодня
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {decksWithDueCards.map(deck => (
                  <div
                    key={deck.id}
                    className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: deck.color || '#6366f1' }}
                      >
                        <BookOpen size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                          {deck.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {deck.cards_due_today} {deck.cards_due_today === 1 ? 'карточка' : deck.cards_due_today < 5 ? 'карточки' : 'карточек'}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleStartStudying(deck.id)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-sm"
                    >
                      <PlayCircle size={16} className="sm:mr-2" />
                      <span className="hidden sm:inline">Начать</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <Card>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-600" size={22} />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  План на неделю
                </h2>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">
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
                      className={`rounded-xl border-2 transition-all ${
                        isToday
                          ? 'border-blue-400 bg-blue-50/50 shadow-sm'
                          : day.count > 0 
                            ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            : 'border-gray-100 bg-gray-50/50'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                              isToday 
                                ? 'bg-blue-500 text-white'
                                : day.count > 0 
                                  ? 'bg-gray-700 text-white' 
                                  : 'bg-gray-300 text-gray-600'
                            }`}>
                              {dayDate.getDate()}
                            </div>
                            <div>
                              <p className={`font-bold text-sm sm:text-base ${
                                isToday ? 'text-blue-700' : 'text-gray-900'
                              }`}>
                                {getDateLabel(day.date)}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {dayDate.toLocaleDateString('ru-RU', { 
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                            day.count > 0 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {day.count}
                          </div>
                        </div>

                        {day.by_deck?.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-gray-100">
                            {day.by_deck.map(item => (
                              <div
                                key={item.deck_id}
                                className="flex items-center justify-between py-2 px-3 bg-gray-50/80 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color || '#6366f1' }}
                                  />
                                  <span className="text-sm text-gray-900 truncate font-medium">
                                    {item.deck_name}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
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
                <div className="text-center py-12 px-4">
                  <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">
                    Нет запланированных повторений
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Добавьте карточки в колоды
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
