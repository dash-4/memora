import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Flame,
} from "lucide-react";
import api from "@/services/api";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import Calendar from "@/components/schedule/Calendar";
import StudyPet from "@/components/pet/StudyPet";
import toast from "react-hot-toast";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [decksWithDueCards, setDecksWithDueCards] = useState([]);
  const [currentMonth] = useState(new Date());

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsResponse, scheduleResponse, decksResponse] =
        await Promise.all([
          api.get("/study/stats/"),
          api.get("/study/schedule/", {
            params: {
              year: currentMonth.getFullYear(),
              month: currentMonth.getMonth() + 1,
            },
          }),
          api.get("/statistics/decks_progress/"),
        ]);

      setStats(statsResponse.data);
      setScheduleData(scheduleResponse.data.schedule || []);
      setDecksWithDueCards(
        decksResponse.data.filter((deck) => deck.cards_due_today > 0),
      );
    } catch (err) {
      toast.error("Не удалось загрузить данные дашборда");
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStartStudying = useCallback(
    (deckId) => {
      navigate(`/study?deck=${deckId}&mode=learning`);
    },
    [navigate],
  );

  const getUpcomingDays = () => {
    const today = new Date();
    return scheduleData
      .filter((day) => {
        const dayDate = new Date(day.date);
        return dayDate >= today && day.count > 0;
      })
      .slice(0, 3);
  };

  const statsCards = [
    {
      icon: Target,
      label: "На сегодня",
      value: stats?.cards_due_today || 0,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      icon: BookOpen,
      label: "Колоды",
      value: stats?.total_decks || 0,
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      icon: TrendingUp,
      label: "Изучено",
      value: stats?.cards_learned || 0,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      icon: Zap,
      label: "Карточки",
      value: stats?.total_cards || 0,
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  const upcomingDays = getUpcomingDays();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-2 py-2 space-y-10">
        <div>
          <h1 className="heading-page">Главная</h1>
        </div>
        <div className="w-full">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center">
              <div className="w-full lg:w-2/5">
                <StudyPet />
              </div>

              <div className="w-full lg:w-3/5">
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-5 lg:gap-6">
                  {statsCards.map((stat) => (
                    <div
                      key={stat.label}
                      className="
              bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100
              hover:border-indigo-200 hover:shadow-md transition-all duration-300
            "
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                        >
                          <stat.icon size={24} className={stat.textColor} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {decksWithDueCards.length > 0 ? (
              <Card className="border-l-4 border-blue-500 bg-blue-50/60 shadow-md">
                <div className="p-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Clock className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg ">
                        На сегодня{" "}
                        <span className="font-bold text-blue-700">
                          {stats?.cards_due_today || 0}
                        </span>{" "}
                        карточек
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {decksWithDueCards.map((deck) => (
                      <div
                        key={deck.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: (deck.color || "#3B82F6") + "20",
                            }}
                          >
                            <BookOpen
                              size={18}
                              style={{ color: deck.color || "#3B82F6" }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                              {deck.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {deck.cards_due_today} на сегодня
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleStartStudying(deck.id)}
                        >
                          <PlayCircle size={16} className="mr-1" />
                          Начать
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50/80">
                <div className="text-center py-10 px-6">
                  <Target className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Всё спокойно
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    На сегодня нет карточек для повторения. Отличная работа!
                  </p>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 ">
              <Link to="/decks">
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <BookOpen size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Мои колоды
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-3">
                    Колоды и карточки
                  </p>
                </Card>
              </Link>

              <Link to="/statistics">
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <BarChart size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Статистика
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-3">
                    Глубокий анализ прогресса
                  </p>
                </Card>
              </Link>

              <Link to="/schedule">
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <CalendarIcon size={20} className="text-purple-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Расписание
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-3">
                    План повторений по дням
                  </p>
                </Card>
              </Link>
            </div>
          </div>

          <div className="space-y-6 ">
            <Card className="shadow-md">
              <div className="p-1 sm:p-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base sm:text-2xs font-bold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="text-blue-600" size={20} />
                    Календарь обучения
                  </h2>
                </div>
                <Calendar
                  data={scheduleData}
                  onDayClick={() => navigate("/schedule")}
                />
              </div>
            </Card>

            {upcomingDays.length > 0 && (
              <Card className="shadow-md">
                <div className="p-1 sm:p-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="text-orange-500" size={20} />
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Ближайшие дни
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {upcomingDays.map((day) => {
                      const dayDate = new Date(day.date);
                      const isToday =
                        dayDate.toDateString() === new Date().toDateString();
                      const isTomorrow =
                        dayDate.toDateString() ===
                        new Date(Date.now() + 86400000).toDateString();

                      let label = dayDate.toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                      });

                      if (isToday) label = "Сегодня";
                      if (isTomorrow) label = "Завтра";

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
                              {day.count}{" "}
                              {day.count === 1
                                ? "карточка"
                                : day.count < 5
                                  ? "карточки"
                                  : "карточек"}
                            </p>
                          </div>
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isToday
                                ? "bg-blue-500 text-white"
                                : "bg-white border-2 border-gray-200 text-gray-700"
                            }`}
                          >
                            {day.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
