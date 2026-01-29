import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  TrendingUp,
  Award,
  Target,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Layout from "../components/layout/Layout";
import toast from "react-hot-toast";

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [decksStats, setDecksStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = useCallback(async () => {
    try {
      const [statsResponse, decksResponse] = await Promise.all([
        api.get("/statistics/dashboard/"),
        api.get("/statistics/decks_progress/"),
      ]);

      console.log("📊 Dashboard Stats:", statsResponse.data);
      console.log("📊 Decks Progress:", decksResponse.data);

      setStats(statsResponse.data);
      setDecksStats(decksResponse.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Ошибка загрузки статистики");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const getMasteryLevel = useCallback((deck) => {
    const p = deck.mastery_percent;

    if (p >= 80) return { label: "Отлично", color: "green" };
    if (p >= 60) return { label: "Хорошо", color: "blue" };
    if (p >= 40) return { label: "Средне", color: "yellow" };
    if (p >= 20) return { label: "Слабо", color: "orange" };

    if (p < 20 && deck.learning_cards > 0) {
      return { label: "В процессе", color: "orange" };
    }

    return { label: "Начало", color: "red" };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Статистика обучения
          </h1>
          <p className="text-gray-600 mt-2">Ваш прогресс и достижения</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Всего изучено</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.cards_learned || 0}
                </p>
                <p className="text-gray-500 text-xs mt-1">карточек</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Текущий streak</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {stats?.progress?.current_streak || 0}
                </p>
                <p className="text-gray-500 text-xs mt-1">дней подряд</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                <Target className="text-orange-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Лучший streak</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats?.progress?.longest_streak || 0}
                </p>
                <p className="text-gray-500 text-xs mt-1">дней</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Award className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Уровень</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {stats?.progress?.level || 1}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {stats?.progress?.points || 0} очков
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Activity */}
        <Card>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            Активность за неделю
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle className="text-blue-600" size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-600 text-sm">Изучено карточек</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.study?.cards_studied_this_week || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="text-green-600" size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-600 text-sm">Сессий обучения</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.study?.sessions_this_week || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-600 text-sm">Среднее в день</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.study?.sessions_this_week > 0
                      ? Math.round(
                          (stats?.study?.cards_studied_this_week || 0) /
                            (stats?.study?.sessions_this_week || 1)
                        )
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Deck Progress */}
        <Card>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Прогресс по колодам
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Карточки с 10+ дневным интервалом или 3+ повторениями считаются освоенными
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
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: deck.color + "30" }}
                        >
                          <BookOpen size={20} style={{ color: deck.color }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 break-words">
                            {deck.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {deck.mastered_cards} из {deck.total_cards} освоено
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                          {masteryLevel.label}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {deck.mastery_percent}%
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
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
                        <div className="flex items-center text-green-600">
                          <CheckCircle size={16} className="mr-1 shrink-0" />
                          <span>{deck.mastered_cards} освоено</span>
                        </div>
                        <div className="flex items-center text-blue-600">
                          <Clock size={16} className="mr-1 shrink-0" />
                          <span>{deck.learning_cards || 0} изучается</span>
                        </div>
                        <div className="flex items-center text-orange-600">
                          <Calendar size={16} className="mr-1 shrink-0" />
                          <span>{deck.cards_due_today} на сегодня</span>
                        </div>
                        {deck.new_cards > 0 && (
                          <div className="flex items-center text-gray-500">
                            <XCircle size={16} className="mr-1 shrink-0" />
                            <span>{deck.new_cards} новых</span>
                          </div>
                        )}
                      </div>

                      <Link to={`/decks/${deck.id}`} className="w-full sm:w-auto">
                        <Button
                          variant="secondary"
                          className="w-full sm:w-auto text-sm px-4 py-2 whitespace-nowrap"
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
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
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
        </Card>
      </div>
    </Layout>
  );
};

export default Statistics;
