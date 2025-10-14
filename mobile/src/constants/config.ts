import Constants from 'expo-constants';

// API Configuration
export const API_BASE_URL = 
  Constants.expoConfig?.extra?.apiUrl || 
  process.env.EXPO_PUBLIC_API_URL || 
  'http://localhost:4000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh',
  
  // Equipment
  EQUIPMENT: '/api/equipment',
  EQUIPMENT_BY_ID: (id: number) => `/api/equipment/${id}`,
  EQUIPMENT_QR: (code: string) => `/api/equipment/qr/${code}`,
  
  // Reservations
  RESERVATIONS: '/api/reservations',
  RESERVATION_BY_ID: (id: number) => `/api/reservations/${id}`,
  RESERVATION_TIMELINE: '/api/reservations/timeline',
  
  // Orders
  ORDERS: '/api/orders',
  ORDER_BY_ID: (id: number) => `/api/orders/${id}`,
  
  // Reports
  REPORTS_DASHBOARD: '/api/reports/dashboard',
  REPORTS_REVENUE: '/api/reports/revenue',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_MARK_READ: (id: number) => `/api/notifications/${id}/read`,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'CANARY Mobile',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'tr',
  CURRENCY: 'TRY',
  DATE_FORMAT: 'dd.MM.yyyy',
  DATETIME_FORMAT: 'dd.MM.yyyy HH:mm',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@canary:auth_token',
  REFRESH_TOKEN: '@canary:refresh_token',
  USER_DATA: '@canary:user_data',
  PUSH_TOKEN: '@canary:push_token',
  THEME: '@canary:theme',
  LANGUAGE: '@canary:language',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// QR Scanner
export const QR_SCANNER = {
  SCAN_COOLDOWN_MS: 1000, // 1 second
  AUTO_CLOSE_DELAY_MS: 2000, // 2 seconds after scan
};

// Notifications
export const NOTIFICATIONS = {
  CHECK_INTERVAL_MS: 30000, // 30 seconds
  MAX_BADGE_COUNT: 99,
};

// Cache
export const CACHE = {
  EQUIPMENT_TTL_MS: 5 * 60 * 1000, // 5 minutes
  RESERVATION_TTL_MS: 2 * 60 * 1000, // 2 minutes
};
