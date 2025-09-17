import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { spacing, fontSize, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { APPS_DATA, AppItem } from '../../utils/data';

export const AppsScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const handleAppPress = (app: AppItem) => {
    if (app.comingSoon) {
      return;
    }
    
    if (app.id === 'article-summarizer') {
      router.push('/(main)/apps/article-summarizer');
    }
  };

  const renderAppItem = (app: AppItem) => (
    <TouchableOpacity
      key={app.id}
      style={[
        styles.appItem,
        app.comingSoon && styles.appItemDisabled,
      ]}
      onPress={() => handleAppPress(app)}
      disabled={app.comingSoon}
    >
      <View style={styles.appIcon}>
        <Ionicons 
          name={app.icon as any} 
          size={32} 
          color={app.comingSoon ? colors.mutedForeground : colors.primary} 
        />
      </View>
      
      <View style={styles.appInfo}>
        <View style={styles.appHeader}>
          <Text style={[
            styles.appName,
            app.comingSoon && styles.appNameDisabled,
          ]}>
            {app.name}
          </Text>
          {app.comingSoon && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          )}
        </View>
        <Text style={[
          styles.appDescription,
          app.comingSoon && styles.appDescriptionDisabled,
        ]}>
          {app.description}
        </Text>
      </View>
      
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={colors.mutedForeground} 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Apps</Text>
          <Text style={styles.headerSubtitle}>
            Specialized AI tools for different tasks
          </Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.appsGrid}>
          {APPS_DATA.map(renderAppItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 1,
  },
  appItemDisabled: {
    opacity: 0.6,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  appInfo: {
    flex: 1,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  appName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  appNameDisabled: {
    color: colors.mutedForeground,
  },
  appDescription: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  appDescriptionDisabled: {
    color: colors.mutedForeground,
  },
  comingSoonBadge: {
    backgroundColor: colors.muted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  comingSoonText: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  headerContent: {
    flex: 1,
  },
  appsGrid: {
    flex: 1,
  },
});

