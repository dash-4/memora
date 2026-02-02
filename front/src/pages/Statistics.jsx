import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  TrendingUp,
  Award,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
} from "lucide-react";
import api from "@/services/api";
import Card from "@/components/cards/Card";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import toast from "react-hot-toast";

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [decksStats, setDecksStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [statsResponse, decksResponse] = await Promise.all([
        api.get("/statistics/dashboard/"),
        api.get("/statistics/decks_progress/"),
      ]);

      setStats(statsResponse.data);
      setDecksStats(decksResponse.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Ошибка загрузки статистики");
    } finally {
      setLoading(false);
    }
  };

  const getMasteryLevel = (deck) => {
    const p = deck.mastery_percent;

    if (p >= 80) return { label: "Отлично", color: "green" };
    if (p >= 60) return { label: "Хорошо", color: "blue" };
    if (p >= 40) return { label: "Средне", color: "yellow" };
    if (p >= 20) return { label: "Слабо", color: "orange" };

    if (p < 20 && deck.learning_cards > 0) {
      return { label: "В процессе", color: "orange" };
    }

    return { label: "Начало", color: "red" };
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

  const avgCardsPerDay = stats?.study?.sessions_this_week > 0
    ? Math.round((stats?.study?.cards_studied_this_week || 0) / 7)
    : 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Статистика
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-0.5">
              Ваш прогресс и достижения
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-gray-600">Всего изучено</p>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="text-blue-600" size={20} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats?.cards_learned || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">карточек</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-gray-600">Текущий streak</p>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <Zap className="text-orange-600" size={20} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                  {stats?.progress?.current_streak || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">дней подряд</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-gray-600">Лучший streak</p>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Award className="text-green-600" size={20} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {stats?.progress?.longest_streak || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">дней</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-gray-600">Уровень</p>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {stats?.progress?.level || 1}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.progress?.points || 0} очков
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
              Активность за неделю
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      Изучено карточек
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stats?.study?.cards_studied_this_week || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-100 hover:border-green-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="text-white" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      Сессий обучения
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stats?.study?.sessions_this_week || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100 hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                    <Target className="text-white" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      В среднем в день
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {avgCardsPerDay}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Прогресс по колодам
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Освоенные: интервал 10+ дней или 3+ повторения
              </p>
            </div>

            {decksStats.length > 0 ? (
              <div className="space-y-4">
                {decksStats.map((deck) => {
                  const masteryLevel = getMasteryLevel(deck);

                  return (
                    <div
                      key={deck.id}
                      className="p-4 sm:p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: deck.color || "#6366f1" }}
                          >
                            <BookOpen size={20} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">
                              {deck.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {deck.mastered_cards} из {deck.total_cards} освоено
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              masteryLevel.color === "green"
                                ? "bg-green-100 text-green-700"
                                : masteryLevel.color === "blue"
                                  ? "bg-blue-100 text-blue-700"
                                  : masteryLevel.color === "yellow"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : masteryLevel.color === "orange"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-red-100 text-red-700"
                            }`}
                          >
                            {masteryLevel.label} · {deck.mastery_percent}%
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              masteryLevel.color === "green"
                                ? "bg-green-500"
                                : masteryLevel.color === "blue"
                                  ? "bg-blue-500"
                                  : masteryLevel.color === "yellow"
                                    ? "bg-yellow-500"
                                    : masteryLevel.color === "orange"
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                            }`}
                            style={{ width: `${deck.mastery_percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center flex-wrap gap-3 text-xs sm:text-sm">
                          <div className="flex items-center text-green-600 font-medium">
                            <CheckCircle size={16} className="mr-1 shrink-0" />
                            <span>{deck.mastered_cards}</span>
                          </div>
                          <div className="flex items-center text-blue-600 font-medium">
                            <Clock size={16} className="mr-1 shrink-0" />
                            <span>{deck.learning_cards || 0}</span>
                          </div>
                          <div className="flex items-center text-orange-600 font-medium">
                            <Calendar size={16} className="mr-1 shrink-0" />
                            <span>{deck.cards_due_today}</span>
                          </div>
                          {deck.new_cards > 0 && (
                            <div className="flex items-center text-gray-500 font-medium">
                              <Zap size={16} className="mr-1 shrink-0" />
                              <span>{deck.new_cards}</span>
                            </div>
                          )}
                        </div>

                        <Link to={`/decks/${deck.id}`} className="w-full sm:w-auto">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            Открыть
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Нет колод
                </h3>
                <p className="text-gray-600 mb-6">
                  Создайте колоду, чтобы начать обучение
                </p>
                <Link to="/decks">
                  <Button>Создать колоду</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
