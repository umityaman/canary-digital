import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import offlineManager from '../services/offlineManager';
import { colors } from '../constants/colors';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [slideAnim] = useState(new Animated.Value(-60));

  useEffect(() => {
    // Subscribe to network status changes
    const unsubscribe = offlineManager.addNetworkListener((online) => {
      setIsOnline(online);
      
      if (!online) {
        // Slide down
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Slide up
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });

    return unsubscribe;
  }, []);

  if (isOnline) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <WifiOff size={16} color={colors.textOnPrimary} />
      <Text style={styles.text}>İnternet bağlantısı yok</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    zIndex: 9999,
  },
  text: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
