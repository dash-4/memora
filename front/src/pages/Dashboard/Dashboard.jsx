import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  PlayCircle, 
  BarChart, 
  Target,
  Zap,
  ChevronRight,
  Flame
} from 'lucide-react';
import api from '@/services/api';
import Card from '@/components/cards/Card';
import Button from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import Calendar from '@/components/schedule/Calendar';
import toast from 'react-hot-toast';


export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [decksWithDueCards, setDecksWithDueCards] = useState([]);
  const [currentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [currentMonth]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, scheduleResponse, decksResponse] = await Promise.all([
        api.get('/study/stats/'),
        api.get('/study/schedule/', {
          params: {
            year: currentMonth.getFullYear(),
            month: currentMonth.getMonth() + 1,
            days: 31
          }
        }),
        api.get('/statistics/decks_progress/')
      ]);

      setStats(statsResponse.data);
      setScheduleData(scheduleResponse.data.schedule || []);
      setDecksWithDueCards(decksResponse.data.filter(deck => deck.cards_due_today > 0));
    } catch (error) {
      console.error('Ошибка загрузки дашборда:', error);
      toast.error('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudying = (deckId) => {
    navigate(`/study?deck=${deckId}&mode=learning`);
  };

  const handleCalendarClick = () => {
    navigate('/schedule');
  };

  const getUpcomingDays = () => {
    const today = new Date();
    return scheduleData
      .filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= today && day.count > 0;
      })
      .slice(0, 3);
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

  const statsCards = [
    {
      icon: Target,
      label: 'На сегодня',
      value: stats?.cards_due_today || 0,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      icon: BookOpen,
      label: 'Всего колод',
      value: stats?.total_decks || 0,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      label: 'Изучено',
      value: stats?.cards_learned || 0,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      icon: Zap,
      label: 'Всего карточек',
      value: stats?.total_cards || 0,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    }
  ];

  const upcomingDays = getUpcomingDays();

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Главная</h1>
          <p className="text-gray-600 mt-2">Добро пожаловать в Memora</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="hover:shadow-lg transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                  <stat.icon size={20} className={`${stat.textColor} sm:w-6 sm:h-6`} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {decksWithDueCards.length > 0 ? (
              <Card className="border-l-4 border-blue-500 bg-blue-50/60 shadow-md">
                <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Clock className="text-white" size={20} />
                    </div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      Готовы повторить сегодня?
                    </h2>
                  </div>

                  <p className="text-sm sm:text-base text-gray-700">
                    На сегодня <span className="font-bold text-blue-700">{stats?.cards_due_today || 0}</span> карточек
                  </p>

                  <div className="space-y-3">
                    {decksWithDueCards.map((deck) => (
                      <div
                        key={deck.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: deck.color + '30' || '#6366f130' }}
                          >
                            <BookOpen size={18} style={{ color: deck.color || '#6366f1' }} className="sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base lg:text-lg">
                              {deck.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                              {deck.cards_due_today} карточек
                            </p>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleStartStudying(deck.id)}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                          size="sm"
                        >
                          <PlayCircle size={16} className="mr-2 sm:w-4 sm:h-4" />
                          Начать
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50/80">
                <div className="text-center py-8 sm:py-10 px-4 sm:px-6">
                  <Target className="w-12 h-12 sm:w-14 sm:h-14 mx-auto text-gray-400 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    Всё спокойно
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                    На сегодня нет карточек для повторения. Отличная работа!
                  </p>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Link to="/decks">
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-gray-200 hover:border-blue-300">
                  <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 py-4 sm:py-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <BookOpen size={20} className="text-blue-600 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Мои колоды</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Управляйте колодами</p>
                  </div>
                </Card>
              </Link>

              <Link to="/statistics">
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-gray-200 hover:border-green-300">
                  <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 py-4 sm:py-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <BarChart size={20} className="text-green-600 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Статистика</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Ваш прогресс</p>
                  </div>
                </Card>
              </Link>

              <Link to="/schedule">
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-gray-200 hover:border-purple-300">
                  <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 py-4 sm:py-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CalendarIcon size={20} className="text-purple-600 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Расписание</h3>
                    <p className="text-xs sm:text-sm text-gray-600">План повторений</p>
                  </div>
                </Card>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <Card className="shadow-md">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-10 ">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="text-blue-600" size={20} />
                    Расписание
                  </h2>
                  <button
                    onClick={handleCalendarClick}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    Открыть
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="scale-90 sm:scale-95 origin-top -mx-2 sm:-mx-1">
                  <Calendar
                    data={scheduleData}
                    onDayClick={handleCalendarClick}
                  />
                </div>
              </div>
            </Card>

            {upcomingDays.length > 0 && (
              <Card className="shadow-md">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-6">
                    <Flame className="text-orange-500" size={20} />
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Ближайшие дни
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {upcomingDays.map((day) => {
                      const dayDate = new Date(day.date);
                      const isToday = dayDate.toDateString() === new Date().toDateString();
                      const isTomorrow = dayDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                      
                      let label = dayDate.toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'short' 
                      });
                      
                      if (isToday) label = 'Сегодня';
                      if (isTomorrow) label = 'Завтра';

                      return (
                        <div
                          key={day.date}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {label}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {day.count} {day.count === 1 ? 'карточка' : day.count < 5 ? 'карточки' : 'карточек'}
                            </p>
                          </div>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isToday ? 'bg-blue-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-700'
                          }`}>
                            {day.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleCalendarClick}
                    className="w-full mt-10 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 py-2"
                  >
                    Смотреть всё расписание
                    <ChevronRight size={16} />
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
