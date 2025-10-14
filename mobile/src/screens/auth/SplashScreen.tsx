import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../constants/colors';

const SplashScreen = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>📦</Text>
          <Text style={styles.title}>CANARY</Text>
          <Text style={styles.subtitle}>Ekipman Kiralama</Text>
        </View>
        
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: colors.primaryLight,
    letterSpacing: 1,
  },
  loader: {
    marginTop: 40,
  },
  version: {
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    color: colors.primaryLight,
  },
});

export default SplashScreen;
