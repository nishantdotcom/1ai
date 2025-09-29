import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { secureStorage } from '../src/utils/storage';
import { authAPI } from '../src/services/api';
import { Logo } from '../src/components/ui/Logo';
import { colors, spacing } from '../src/constants/theme';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is authenticated and redirect accordingly
  const checkAuthStatus = async () => {
    try {
      const token = await secureStorage.getItem('auth_token');
      
      if (token) {
        // Verify token is still valid
        try {
          await authAPI.getMe();
          router.replace('/(main)/chat');
        } catch (error) {
          // Token is invalid, remove it and redirect to home
          await secureStorage.removeItem('auth_token');
          router.replace('/home');
        }
      } else {
        router.replace('/home');
      }
    } catch (error) {
      router.replace('/home');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Logo size={100} />
          <ActivityIndicator 
            size="large" 
            color={colors.light.primary}
            style={styles.loader}
          />
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: spacing.xl,
  },
});