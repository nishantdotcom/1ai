import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { spacing, borderRadius, fontSize, buttonHeights } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const inputStyle = [
    styles.input,
    fullWidth && styles.fullWidth,
    error && styles.inputError,
    style,
  ];

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={inputStyle}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  input: {
    height: buttonHeights.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.base,
    color: colors.foreground,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.destructive,
    marginTop: spacing.xs,
  },
});

