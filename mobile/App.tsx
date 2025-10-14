import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { OfflineIndicator } from './src/components/OfflineIndicator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useAuthStore } from './src/stores/authStore';
import { useNotificationStore } from './src/stores/notificationStore';
import notificationService from './src/services/notificationService';
import offlineManager from './src/services/offlineManager';

export default function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Check authentication status on app start
    checkAuth();
    
    // Initialize offline manager
    offlineManager.initialize();
  }, []);

  useEffect(() => {
    // Initialize notification service after authentication
    if (isAuthenticated) {
      initializeNotifications();
    }

    return () => {
      // Cleanup listeners
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);

  const initializeNotifications = async () => {
    // Initialize notification service
    const initialized = await notificationService.initialize();
    
    if (initialized) {
      // Listen for notifications while app is in foreground
      notificationListener.current = notificationService.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification received:', notification);
          
          // Add to store
          const notificationData = {
            id: Date.now(), // Temporary ID, will be replaced by backend
            userId: 0, // Will be set by backend
            title: notification.request.content.title || '',
            message: notification.request.content.body || '',
            type: (notification.request.content.data?.type || 'INFO') as any,
            data: notification.request.content.data,
            read: false,
            createdAt: new Date().toISOString(),
          };
          
          addNotification(notificationData);
        }
      );

      // Listen for user interactions with notifications
      responseListener.current = notificationService.addNotificationResponseListener(
        (response) => {
          console.log('Notification tapped:', response);
          
          // Handle navigation based on notification data
          const data = response.notification.request.content.data;
          
          // TODO: Navigate to appropriate screen based on data
          // For example:
          // if (data?.type === 'reservation') {
          //   navigate to reservation detail
          // } else if (data?.type === 'equipment') {
          //   navigate to equipment detail
          // }
        }
      );
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <View style={styles.container}>
          <OfflineIndicator />
          <AppNavigator />
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
