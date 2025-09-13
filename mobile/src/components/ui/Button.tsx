import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps 
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, buttonHeights } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.light.primaryForeground : colors.light.primary}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.light.primary,
  },
  secondary: {
    backgroundColor: colors.light.secondary,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  destructive: {
    backgroundColor: colors.light.destructive,
  },
  disabled: {
    opacity: 0.5,
  },
  sm: {
    height: buttonHeights.sm,
  },
  md: {
    height: buttonHeights.md,
  },
  lg: {
    height: buttonHeights.lg,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: colors.light.primaryForeground,
    fontSize: fontSize.base,
  },
  secondaryText: {
    color: colors.light.secondaryForeground,
    fontSize: fontSize.base,
  },
  destructiveText: {
    color: colors.light.destructiveForeground,
    fontSize: fontSize.base,
  },
  disabledText: {
    opacity: 0.7,
  },
  smText: {
    fontSize: fontSize.sm,
  },
  mdText: {
    fontSize: fontSize.base,
  },
  lgText: {
    fontSize: fontSize.lg,
  },
});