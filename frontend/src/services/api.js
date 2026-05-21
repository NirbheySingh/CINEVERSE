import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important for cookies (refresh tokens)
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user?.accessToken) {
        config.headers.Authorization = `Bearer ${user.accessToken}`;
      }
    } catch {
      // ignore invalid localStorage
    }
  }
  return config;
});

// Response Interceptor for handling global errors (like 401s)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If we have a refresh token logic, we'd handle 401 token expiry here.
    return Promise.reject(error);
  }
);

export default api;
