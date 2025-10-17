import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const PUSH_TOKEN_KEY = '@push_token';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Initialize notification service
   * - Request permissions
   * - Get push token
   * - Register token with backend
   * - Setup notification listeners
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if physical device
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return false;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions denied');
        return false;
      }

      // Get push token
      const token = await this.getPushToken();
      if (!token) {
        console.log('Failed to get push token');
        return false;
      }

      this.expoPushToken = token;

      // Save token locally
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

      // Register token with backend
      await this.registerTokenWithBackend(token);

      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Get Expo push token
   */
  async getPushToken(): Promise<string | null> {
    try {
      // Try to get cached token first
      const cachedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (cachedToken) {
        return cachedToken;
      }

      // Get new token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Register push token with backend
   */
  async registerTokenWithBackend(token: string): Promise<boolean> {
    try {
      const response = await api.post('/push/register-token', {
        token: token,
      });

      return response.status === 200;
    } catch (error) {
      console.error('Error registering token with backend:', error);
      return false;
    }
  }

  /**
   * Unregister push token from backend
   */
  async unregisterToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (!token) return true;

      await api.delete('/push/token');

      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      this.expoPushToken = null;

      return true;
    } catch (error) {
      console.error('Error unregistering token:', error);
      return false;
    }
  }

  /**
   * Toggle push notifications on/off
   */
  async toggleNotifications(enabled: boolean): Promise<boolean> {
    try {
      const response = await api.put('/push/toggle', { enabled });
      return response.status === 200;
    } catch (error) {
      console.error('Error toggling notifications:', error);
      return false;
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      const response = await api.post('/push/test');
      return response.status === 200;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: trigger || null, // null means immediate
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Get current push token
   */
  getCurrentToken(): string | null {
    return this.expoPushToken;
  }
}

export default new NotificationService();
