import api from './api';

export interface GoogleAuthStatus {
  connected: boolean;
  calendarId?: string;
  tokenExpiry?: string;
  needsReconnect?: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  htmlLink?: string;
  colorId?: string;
}

/**
 * Google Calendar API Service
 */
const calendarApi = {
  /**
   * Get Google OAuth authorization URL
   */
  getAuthUrl: async (): Promise<{ authUrl: string; state: string }> => {
    const response = await api.get('/auth/google');
    return response.data;
  },

  /**
   * Check Google Calendar connection status
   */
  getStatus: async (): Promise<GoogleAuthStatus> => {
    const response = await api.get('/auth/google/status');
    return response.data;
  },

  /**
   * Disconnect Google Calendar
   */
  disconnect: async (): Promise<void> => {
    await api.post('/auth/google/disconnect');
  },

  /**
   * Get calendar events (from backend cache or Google)
   * This would require an additional backend endpoint
   */
  getEvents: async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
    const response = await api.get('/calendar/events', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data;
  },
};

export default calendarApi;
