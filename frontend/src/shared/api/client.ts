import axios from 'axios';

const API_BASE_URL = 'http://localhost:8888/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state?.userId) {
        config.headers['X-User-ID'] = state.userId;
      }
    }
  } catch (error) {
    console.error('Failed to add auth header:', error);
  }
  return config;
});
