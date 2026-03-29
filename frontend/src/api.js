import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Адрес твоего сервера
});

// Автоматически добавляем токен в каждый запрос, если он есть в памяти
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;