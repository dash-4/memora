import api from './api';

export const authService = {
  async register(username, email, password) {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
      password_confirm: password,
    });
    
    const { tokens } = response.data;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    
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
    
    const userResponse = await api.get('/auth/user/me/');
    
    return {
      user: userResponse.data,
      tokens: { access, refresh },
    };
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async getCurrentUser() {
    const response = await api.get('/auth/user/me/');
    return response.data;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};
