import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, TrendingUp, Clock, CheckCircle, PlayCircle, BarChart, Target } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/cards/Card';
import Button from '../../components/ui/Button';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [decksWithDueCards, setDecksWithDueCards] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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
            month: currentMonth.getMonth() + 1
          }
        }),
        api.get('/statistics/decks_progress/')
      ]);

      setStats(statsResponse.data);
      setScheduleData(scheduleResponse.data.schedule);
      setDecksWithDueCards(decksResponse.data.filter(deck => deck.cards_due_today > 0));
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayData = scheduleData.find(d => d.date === dateString);

      days.push({
        day: i,
        dateString,
        count: dayData?.count || 0,
        isToday: date.getTime() === today.getTime(),
        isPast: date < today
      });
    }

    return days;
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const getIntensityColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 5) return 'bg-green-200';
    if (count <= 10) return 'bg-green-400';
    if (count <= 15) return 'bg-green-600';
    return 'bg-green-700';
  };

  // ✅ ИСПРАВЛЕНО: правильный URL для навигации
  const handleStartStudying = (deckId) => {
    console.log('🚀 Начинаем обучение для колоды:', deckId);
    navigate(`/study?deck=${deckId}&mode=learning`); // ← ВОТ ЭТО ИСПРАВЛЕНИЕ!
  };

  const handleCalendarClick = () => {
    navigate('/schedule');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const days = getDaysInMonth();
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const statsCards = [
    {
      icon: Calendar,
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
      icon: Clock,
      label: 'Всего карточек',
      value: stats?.total_cards || 0,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Главная</h1>
          <p className="text-gray-600 mt-2">Добро пожаловать в Memora</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                  <stat.icon size={24} className={stat.textColor} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {decksWithDueCards.length > 0 && (
          <Card className="border-l-4 border-blue-500 bg-blue-50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="text-blue-600" size={24} />
                    Готовы повторить?
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    У вас {stats.cards_due_today} {stats.cards_due_today === 1 ? 'карточка' : stats.cards_due_today < 5 ? 'карточки' : 'карточек'} на сегодня
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {decksWithDueCards.map((deck) => (
                  <div
                    key={deck.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: deck.color + "30" }}
                      >
                        <BookOpen size={20} style={{ color: deck.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{deck.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {deck.cards_due_today} на сегодня
                          </span>
                          
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartStudying(deck.id)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={18} />
                      Начать обучение
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-2 hover:shadow-xl transition-all cursor-pointer" onClick={handleCalendarClick}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Расписание повторений</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeMonth(-1);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Предыдущий месяц"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 min-w-30 sm:min-w-37.5 text-center">
                  {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeMonth(1);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Следующий месяц"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 pb-1 sm:pb-2">
                  {day}
                </div>
              ))}

              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const intensityColor = getIntensityColor(day.count);
                const textColor = day.count > 10 ? 'text-white' : 'text-gray-700';

                return (
                  <div
                    key={day.dateString}
                    className={`aspect-square p-0.5 sm:p-1 rounded-md sm:rounded-lg transition-all text-center ${intensityColor} ${
                      day.isToday ? 'ring-2 ring-blue-600' : 'hover:ring-2 hover:ring-gray-300'
                    } ${day.count > 0 ? 'hover:scale-105' : ''}`}
                    title={`${day.count} карточек на ${day.day} ${currentMonth.toLocaleDateString('ru-RU', { month: 'long' })}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`text-[10px] sm:text-xs font-medium ${textColor}`}>{day.day}</span>
                      {day.count > 0 && (
                        <span className={`text-[8px] sm:text-[10px] font-bold ${textColor}`}>{day.count}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mt-4 sm:mt-6 pt-4 border-t">
              <span className="text-[10px] sm:text-xs text-gray-600">Меньше</span>
              <div className="flex space-x-1 sm:space-x-1.5">
                {['bg-gray-100', 'bg-green-200', 'bg-green-400', 'bg-green-600', 'bg-green-700'].map((color, i) => (
                  <div key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${color}`} />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-gray-600">Больше</span>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Link to="/decks">
              <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-gray-200 hover:border-blue-300">
                <div className="flex flex-col items-center text-center space-y-3 py-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Мои колоды</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Управляйте колодами</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/statistics">
              <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-gray-200 hover:border-green-300">
                <div className="flex flex-col items-center text-center space-y-3 py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <BarChart size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Статистика</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Прогресс обучения</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/schedule">
              <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-gray-200 hover:border-purple-300">
                <div className="flex flex-col items-center text-center space-y-3 py-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Расписание</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">План на неделю</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
