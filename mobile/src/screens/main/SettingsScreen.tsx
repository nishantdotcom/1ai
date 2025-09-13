import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

import { authAPI } from "../../services/api";
import { secureStorage } from "../../utils/storage";
import { User } from "../../types/api";
import { spacing, fontSize, borderRadius } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
  destructive?: boolean;
}

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const { theme, colors, toggleTheme } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.user);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await secureStorage.removeItem("auth_token");
            router.replace("/(auth)/signin");

            Toast.show({
              type: "success",
              text1: "Signed Out",
              text2: "You have been successfully signed out",
            });
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to sign out",
            });
          }
        },
      },
    ]);
  };

  const handleLinkPress = (url: string, title: string) => {
    router.push({
      pathname: "/(main)/webview",
      params: { url, title },
    });
  };

  const settings: SettingItem[] = [
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: "shield-checkmark",
      action: () => handleLinkPress("https://1ai.co/privacy", "Privacy Policy"),
    },
    {
      id: "terms",
      title: "Terms of Service",
      icon: "document-text",
      action: () => handleLinkPress("https://1ai.co/terms", "Terms of Service"),
    },
    {
      id: "refund",
      title: "Refund Policy",
      icon: "card",
      action: () => handleLinkPress("https://1ai.co/refund", "Refund Policy"),
    },
    {
      id: "about",
      title: "About 1ai",
      subtitle: "Version 1.0.0 - Multi-Model AI Chat Platform",
      icon: "information-circle",
      action: () => {
        Toast.show({
          type: "info",
          text1: "1ai",
          text2: "Version 1.0.0 - Multi-Model AI Chat Platform",
        });
      },
    },
    {
      id: "signout",
      title: "Sign Out",
      icon: "log-out",
      action: handleSignOut,
      destructive: true,
    },
  ];

  const renderThemeToggle = () => (
    <View style={[styles.settingItem, styles.settingItemLast]}>
      <View style={styles.settingIcon}>
        <Ionicons
          name={theme === "dark" ? "moon" : "sunny"}
          size={24}
          color={colors.primary}
        />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </Text>
        <Text style={styles.settingSubtitle}>
          Switch between light and dark themes
        </Text>
      </View>

      <Switch
        value={theme === "dark"}
        onValueChange={toggleTheme}
        trackColor={{ false: colors.muted, true: colors.primary }}
        thumbColor={colors.background}
        ios_backgroundColor={colors.muted}
      />
    </View>
  );

  const renderSettingItem = (
    item: SettingItem,
    index: number,
    array: SettingItem[]
  ) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.settingItem,
        index === array.length - 1 && styles.settingItemLast,
      ]}
      onPress={item.action}
    >
      <View style={styles.settingIcon}>
        <Ionicons
          name={item.icon as any}
          size={24}
          color={item.destructive ? colors.destructive : colors.primary}
        />
      </View>

      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            item.destructive && styles.destructiveText,
          ]}
        >
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
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
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {user && (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.credits}</Text>
                  <Text style={styles.statLabel}>Credits</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      user.isPremium ? styles.premiumText : styles.freeText,
                    ]}
                  >
                    {user.isPremium ? "Premium" : "Free"}
                  </Text>
                  <Text style={styles.statLabel}>Plan</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingsGroup}>{renderThemeToggle()}</View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.settingsGroup}>
            {settings.map((item, index, array) =>
              renderSettingItem(item, index, array)
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: spacing.md,
    },
    headerTitle: {
      fontSize: fontSize.xl,
      fontWeight: "bold",
      color: colors.foreground,
    },
    content: {
      flex: 1,
    },
    userCard: {
      margin: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    userInfo: {
      alignItems: "center",
    },
    userEmail: {
      fontSize: fontSize.lg,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: spacing.md,
    },
    userStats: {
      flexDirection: "row",
      alignItems: "center",
    },
    statItem: {
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },
    statValue: {
      fontSize: fontSize.xl,
      fontWeight: "bold",
      color: colors.foreground,
    },
    statLabel: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
      marginTop: spacing.xs,
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
    },
    premiumText: {
      color: colors.primary,
    },
    freeText: {
      color: colors.mutedForeground,
    },
    settingsSection: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSize.sm,
      fontWeight: "600",
      color: colors.mutedForeground,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    settingsGroup: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 56,
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    settingIcon: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: fontSize.base,
      fontWeight: "500",
      color: colors.foreground,
      lineHeight: 20,
    },
    settingSubtitle: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
      marginTop: 1,
      lineHeight: 16,
    },
    destructiveText: {
      color: colors.destructive,
    },
  });
