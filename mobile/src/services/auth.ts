import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { handleApiResponse, handleApiError } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/config';
import { AuthResponse, LoginCredentials, User } from '../types';

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
    const data = handleApiResponse<AuthResponse>(response);
    
    // Save tokens and user data
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, data.token],
      [STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(data.user)],
    ]);
    
    return data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    // Clear local storage
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.PUSH_TOKEN,
    ]);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      return JSON.parse(userData) as User;
    }
    return null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  } catch (error) {
    return false;
  }
};

// Refresh token
export const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      return null;
    }
    
    const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
    const { token } = handleApiResponse<{ token: string }>(response);
    
    // Save new token
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    
    return token;
  } catch (error) {
    console.error('Refresh token error:', error);
    await logout();
    return null;
  }
};

// Update user profile
export const updateProfile = async (updates: Partial<User>): Promise<User> => {
  try {
    const response = await api.put('/api/auth/profile', updates);
    const user = handleApiResponse<User>(response);
    
    // Update local storage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    
    return user;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Change password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
