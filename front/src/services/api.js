import axios from "axios";

const API_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const apiFormData = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiFormData.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

apiFormData.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ========================================
// 🆕 ДОПОЛНЕНИЯ: API методы
// ========================================

// 🃏 КАРТОЧКИ
export const cardsAPI = {
  // Получить карточки с фильтрами
  getCards: (params = {}) => api.get("/cards/", { params }),

  // Получить одну карточку
  getCard: (id) => api.get(`/cards/${id}/`),

  // Создать карточку с тегами
  createCard: (data) => apiFormData.post("/cards/", data),

  // Обновить карточку
  updateCard: (id, data) => api.patch(`/cards/${id}/`, data),

  // Удалить карточку
  deleteCard: (id) => api.delete(`/cards/${id}/`),

  // Популярные теги пользователя
  getPopularTags: () => api.get("/cards/popular_tags/"),
};

// 📚 КОЛОДЫ
export const decksAPI = {
  // Получить все колоды с фильтрами
  getDecks: (params = {}) => api.get("/decks/", { params }),

  // Получить одну колоду
  getDeck: (id) => api.get(`/decks/${id}/`),

  // Создать колоду
  createDeck: (data) => api.post("/decks/", data),

  // Обновить колоду
  updateDeck: (id, data) => api.patch(`/decks/${id}/`, data),

  // Удалить колоду
  deleteDeck: (id) => api.delete(`/decks/${id}/`),

  // Получить карточки конкретной колоды с фильтрами
  getDeckCards: (id, params = {}) => api.get(`/decks/${id}/cards/`, { params }),
};

// 📖 ОБУЧЕНИЕ
export const studyAPI = {
  // Получить карточки на повторение
  getDueCards: (params = {}) => api.get("/study/due_cards/", { params }),

  // Получить все карточки для практики
  getAllCards: (deckId, limit = 20) =>
    api.get("/study/all_cards/", { params: { deck_id: deckId, limit } }),

  // Карточки для режима «Подбор»
  getMatchingCards: (deckId, limit = 10, reverse = false) =>
    api.get("/study/matching_cards/", {
      params: { deck_id: deckId, limit, reverse },
    }),

  // Карточки для режима «Тест» (с вариантами ответов)
  getTestCards: (deckId, limit = 20, reverse = false) =>
    api.get("/study/test_cards/", {
      params: { deck_id: deckId, limit, reverse },
    }),

  // Начать сессию обучения
  startSession: (data) => api.post("/study/start_session/", data),

  // Отправить оценку карточки
  submitReview: (data) => api.post("/study/submit_review/", data),

  // Завершить сессию
  endSession: (sessionId) =>
    api.post("/study/end_session/", { session_id: sessionId }),

  // Получить расписание повторений
  getSchedule: (params = {}) => api.get("/study/schedule/", { params }),

  // Получить базовую статистику
  getStats: () => api.get("/study/stats/"),
};

export const petAPI = {
  get: () => api.get("/pet/"),
  update: (data) => api.patch("/pet/update_pet/", data).then((res) => res.data),
  addXP: (amount) => api.post("/pet/xp/", { amount }),
};

// 📊 СТАТИСТИКА
export const statisticsAPI = {
  // Дашборд с общей статистикой
  getDashboard: () => api.get("/statistics/dashboard/"),

  // Прогресс по всем колодам
  getDecksProgress: () => api.get("/statistics/decks_progress/"),

  // Детальная статистика обучения (за N дней)
  getLearningStats: (days = 30) =>
    api.get("/statistics/learning_stats/", { params: { days } }),

  // Статистика по тегам
  getTagsStats: () => api.get("/statistics/tags_stats/"),
};

// 👤 ПОЛЬЗОВАТЕЛЬ (если нужно)
export const userAPI = {
  // Получить текущего пользователя
  getCurrentUser: () => api.get("/accounts/me/"),

  // Обновить профиль
  updateProfile: (data) => api.patch("/accounts/me/", data),
};

export default api;
