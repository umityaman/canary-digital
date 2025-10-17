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
          handleNotificationNavigation(response.notification.request.content.data);
        }
      );
    }
  };

  /**
   * Handle navigation based on notification data
   */
  const handleNotificationNavigation = (data: any) => {
    if (!data) return;

    switch (data.type) {
      case 'RESERVATION_REMINDER':
      case 'RESERVATION_CONFIRMED':
      case 'RESERVATION_CANCELLED':
        // Navigate to reservation detail
        if (data.reservationId) {
          // navigationRef.navigate('ReservationDetail', { id: data.reservationId });
          console.log('Navigate to ReservationDetail:', data.reservationId);
        }
        break;

      case 'EQUIPMENT_RETURN':
      case 'MAINTENANCE_ALERT':
        // Navigate to equipment detail
        if (data.equipmentId) {
          // navigationRef.navigate('EquipmentDetail', { id: data.equipmentId });
          console.log('Navigate to EquipmentDetail:', data.equipmentId);
        }
        break;

      case 'PAYMENT_REMINDER':
        // Navigate to orders
        if (data.orderId) {
          // navigationRef.navigate('OrderDetail', { id: data.orderId });
          console.log('Navigate to OrderDetail:', data.orderId);
        }
        break;

      case 'NEW_MESSAGE':
        // Navigate to messaging
        // navigationRef.navigate('Messaging');
        console.log('Navigate to Messaging');
        break;

      case 'TEST':
        // Test notification, do nothing
        console.log('Test notification received');
        break;

      default:
        // Unknown type, navigate to notifications screen
        // navigationRef.navigate('Notifications');
        console.log('Navigate to Notifications');
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
