import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/config';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken }
          );
          
          const { token } = response.data;
          
          // Save new token
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          
          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
        
        // Navigate to login (handled by auth store)
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API response handler
export const handleApiResponse = <T>(response: any): T => {
  if (response.data?.success) {
    return response.data.data as T;
  }
  throw new Error(response.data?.message || 'API request failed');
};

// API error handler
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      return error.response.data?.message || error.response.data?.error || 'Bir hata oluştu';
    } else if (error.request) {
      // Request made but no response
      return 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
    }
  }
  return error.message || 'Bilinmeyen bir hata oluştu';
};

export default api;
