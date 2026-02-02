import api from './api';

export const authService = {
  async register(username, email, password, password_confirm) {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
      password_confirm,
    });
    
    return response.data;
  },

  async login(username, password) {
    const tokenResponse = await api.post('/token/', {
      username,
      password,
    });
    
    const { access, refresh } = tokenResponse.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    const userResponse = await api.get('/auth/user/me/');
    
    localStorage.setItem('user', JSON.stringify(userResponse.data));
    
    return {
      user: userResponse.data,
      tokens: { access, refresh },
    };
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/user/me/');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout();
      throw error;
    }
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};
