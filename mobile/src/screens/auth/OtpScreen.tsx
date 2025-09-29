import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { Button } from "../../components/ui/Button";
import { authAPI } from "../../services/api";
import { secureStorage } from "../../utils/storage";
import { spacing, fontSize, borderRadius } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";

export const OtpScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter the complete 6-digit code",
      });
      return;
    }

    if (!email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email is missing. Please go back and try again.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.signIn({ email, otp: otpString });

      if (response.token) {
        await secureStorage.setItem("auth_token", response.token);

        Toast.show({
          type: "success",
          text1: "Welcome!",
          text2: "Successfully signed in",
        });

        router.replace("/(main)/chat");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error.response?.data?.message || "Invalid or expired OTP",
      });

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setResendLoading(true);

    try {
      const response = await authAPI.initiateSignIn({ email });

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "OTP Resent",
          text2: "Check your email for the new verification code",
        });

        setCountdown(30);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to resend OTP",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{"\n"}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          <Button
            title="Verify Code"
            onPress={handleVerifyOtp}
            loading={loading}
            fullWidth
            size="lg"
          />

          <View style={styles.resendContainer}>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>
                Resend code in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendLoading}
                style={styles.resendButton}
              >
                <Text style={styles.resendText}>
                  {resendLoading ? "Sending..." : "Resend Code"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.foreground,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 22,
  },
  email: {
    color: colors.primary,
    fontWeight: "600",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    textAlign: "center",
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.foreground,
    backgroundColor: colors.background,
  },
  otpInputFilled: {
    borderColor: colors.primary,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  countdownText: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
  },
  resendButton: {
    padding: spacing.sm,
  },
  resendText: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: "600",
  },
});