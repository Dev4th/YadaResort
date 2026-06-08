import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.session?.access_token;
      if (token && token !== 'local-session') {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch { /* ignore */ }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Only redirect to admin login when already on an admin page
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
