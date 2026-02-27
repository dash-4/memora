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

const attachResponseInterceptor = (client) => {
  client.interceptors.response.use(
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
          return client(originalRequest);
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
};

attachResponseInterceptor(api);
attachResponseInterceptor(apiFormData);

export const cardsAPI = {
  getCards: (params = {}) => api.get("/cards/", { params }),
  getCard: (id) => api.get(`/cards/${id}/`),
  createCard: (data) => apiFormData.post("/cards/", data),
  updateCard: (id, data) => api.patch(`/cards/${id}/`, data),
  deleteCard: (id) => api.delete(`/cards/${id}/`),
  getPopularTags: () => api.get("/cards/popular_tags/"),
};

export const petAPI = {
  get: () => api.get("/pet/"),
  update: (data) => api.patch("/pet/update_pet/", data).then((res) => res.data),
  addXP: (amount) => api.post("/pet/xp/", { amount }),
};

export default api;
