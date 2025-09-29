import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { spacing, fontSize, borderRadius } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: "chatbubbles",
    title: "20+ AI Models",
    description: "GPT, Claude, Gemini & more",
  },
  {
    icon: "flash",
    title: "Real-time Streaming",
    description: "Instant AI responses",
  },
  {
    icon: "apps",
    title: "Specialized Apps",
    description: "Article summarizer & tools",
  },
];

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleGetStarted = () => {
    router.push("/(main)/chat");
  };

  const handleSignIn = () => {
    router.push("/(auth)/signin");
  };

  const handleLinkPress = (url: string, title: string) => {
    router.push({
      pathname: "/(main)/webview",
      params: { url, title },
    });
  };

  const renderFeature = (feature: FeatureItem, index: number) => (
    <View key={index} style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={feature.icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Logo size={60} />
          <Text style={styles.title}>Welcome to 1ai</Text>
          <Text style={styles.subtitle}>
            Your gateway to advanced AI models
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {features.map(renderFeature)}
        </View>

        <View style={styles.ctaSection}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            fullWidth
            size="lg"
          />

          <TouchableOpacity onPress={handleSignIn} style={styles.signInButton}>
            <Text style={styles.signInText}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() =>
                handleLinkPress("https://1ai.co/terms", "Terms of Service")
              }
            >
              <Text style={styles.footerLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>•</Text>
            <TouchableOpacity
              onPress={() =>
                handleLinkPress("https://1ai.co/privacy", "Privacy Policy")
              }
            >
              <Text style={styles.footerLink}>Privacy</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>•</Text>
            <TouchableOpacity
              onPress={() =>
                handleLinkPress("https://1ai.co/refund", "Refund Policy")
              }
            >
              <Text style={styles.footerLink}>Refund</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.foreground,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 22,
  },
  featuresSection: {
    flex: 1,
    justifyContent: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  ctaSection: {
    paddingVertical: spacing.md,
  },
  signInButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  signInText: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingBottom: spacing.lg,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "500",
  },
  footerDivider: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginHorizontal: spacing.md,
  },
});
