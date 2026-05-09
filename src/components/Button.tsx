import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { colors, radius, font, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'accent' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  style,
  textStyle,
  icon,
}) => {
  const containerStyles = [
    styles.base,
    sizeStyles[size],
    variantStyles[variant],
    fullWidth && { alignSelf: 'stretch' as const },
    disabled && styles.disabled,
    style as any,
  ];
  const colorByVariant: Record<Variant, string> = {
    primary: '#fff',
    secondary: colors.text,
    outline: colors.primary,
    danger: '#fff',
    accent: '#1F2421',
    ghost: colors.primary,
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        ...containerStyles,
        pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colorByVariant[variant]} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              textSizeStyles[size],
              { color: colorByVariant[variant], marginLeft: icon ? spacing.sm : 0 },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabled: { opacity: 0.4 },
  text: { fontWeight: '700' },
});

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingVertical: 8, paddingHorizontal: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 18 },
  lg: { paddingVertical: 16, paddingHorizontal: 22 },
};

const textSizeStyles: Record<Size, TextStyle> = {
  sm: { fontSize: font.sm },
  md: { fontSize: font.md },
  lg: { fontSize: font.lg },
};

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: '#EFEAD9' },
  outline: { backgroundColor: 'transparent', borderColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  accent: { backgroundColor: colors.accent },
  ghost: { backgroundColor: 'transparent' },
};
