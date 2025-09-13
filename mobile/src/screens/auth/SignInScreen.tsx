import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

import { Logo } from "../../components/ui/Logo";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { authAPI } from "../../services/api";
import { spacing, fontSize } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";

export const SignInScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.initiateSignIn({
        email: email.toLowerCase().trim(),
      });

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "OTP Sent",
          text2: "Check your email for the verification code",
        });

        router.push({
          pathname: "/(auth)/otp",
          params: { email: email.toLowerCase().trim() },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.message || "Failed to send OTP",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Network error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Logo size={80} />
            <Text style={styles.title}>Welcome to 1ai</Text>
            <Text style={styles.subtitle}>
              Access 20+ AI models through one unified interface
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
              fullWidth
            />

            <Button
              title="Send Verification Code"
              onPress={handleSignIn}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: "bold",
    color: colors.foreground,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
  },
});