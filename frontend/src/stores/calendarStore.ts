import { create } from 'zustand';
import calendarApi, { CalendarEvent } from '../services/calendarApi';

interface CalendarStore {
  // State
  googleConnected: boolean;
  calendarId?: string;
  tokenExpiry?: string;
  needsReconnect: boolean;
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;

  // Actions
  checkGoogleStatus: () => Promise<void>;
  connectGoogle: () => Promise<void>;
  disconnectGoogle: () => Promise<void>;
  loadEvents: (startDate: Date, endDate: Date) => Promise<void>;
  reset: () => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial state
  googleConnected: false,
  calendarId: undefined,
  tokenExpiry: undefined,
  needsReconnect: false,
  events: [],
  loading: false,
  error: null,

  // Check Google Calendar connection status
  checkGoogleStatus: async () => {
    set({ loading: true, error: null });
    try {
      const status = await calendarApi.getStatus();
      set({
        googleConnected: status.connected,
        calendarId: status.calendarId,
        tokenExpiry: status.tokenExpiry,
        needsReconnect: status.needsReconnect || false,
        loading: false,
      });
    } catch (error: any) {
      console.error('Failed to check Google status:', error);
      set({
        error: error.response?.data?.error || 'Failed to check Google Calendar status',
        loading: false,
      });
    }
  },

  // Connect to Google Calendar
  connectGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const { authUrl } = await calendarApi.getAuthUrl();
      
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        authUrl,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Poll for popup close
      const pollTimer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(pollTimer);
          // Re-check status after popup closes
          setTimeout(() => {
            get().checkGoogleStatus();
          }, 1000);
        }
      }, 500);

      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to connect Google Calendar:', error);
      set({
        error: error.response?.data?.error || 'Failed to connect Google Calendar',
        loading: false,
      });
    }
  },

  // Disconnect Google Calendar
  disconnectGoogle: async () => {
    set({ loading: true, error: null });
    try {
      await calendarApi.disconnect();
      set({
        googleConnected: false,
        calendarId: undefined,
        tokenExpiry: undefined,
        needsReconnect: false,
        events: [],
        loading: false,
      });
    } catch (error: any) {
      console.error('Failed to disconnect Google Calendar:', error);
      set({
        error: error.response?.data?.error || 'Failed to disconnect Google Calendar',
        loading: false,
      });
    }
  },

  // Load calendar events
  loadEvents: async (startDate: Date, endDate: Date) => {
    set({ loading: true, error: null });
    try {
      const events = await calendarApi.getEvents(startDate, endDate);
      set({ events, loading: false });
    } catch (error: any) {
      console.error('Failed to load events:', error);
      set({
        error: error.response?.data?.error || 'Failed to load calendar events',
        loading: false,
      });
    }
  },

  // Reset store
  reset: () => {
    set({
      googleConnected: false,
      calendarId: undefined,
      tokenExpiry: undefined,
      needsReconnect: false,
      events: [],
      loading: false,
      error: null,
    });
  },
}));
