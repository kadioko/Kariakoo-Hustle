import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '@/theme';

interface Props extends Omit<ViewProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  alt?: boolean;
  padded?: boolean;
}

export const Card: React.FC<Props> = ({ children, style, alt, padded = true, ...rest }) => {
  return (
    <View
      {...rest}
      style={[
        styles.card,
        alt && { backgroundColor: colors.cardAlt },
        padded && { padding: spacing.lg },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
});
