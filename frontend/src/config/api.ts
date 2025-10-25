/**
 * API Configuration
 * Centralized API URL configuration for the entire application
 */

// Get base URL from environment variable (without /api suffix)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Add /api suffix to get full API base URL
export const API_BASE_URL = `${BASE_URL}/api`;

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_BASE_URL,
    mode: import.meta.env.MODE,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Helper function to build full API URL
 * @param path - API endpoint path (without /api prefix)
 * @returns Full API URL
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token');
}

/**
 * Get auth headers for fetch requests
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}
