import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, font, radius, spacing } from '@/theme';

interface Props {
  label: string;
  color?: string;
  bg?: string;
  style?: ViewStyle;
}

export const Pill: React.FC<Props> = ({ label, color = colors.text, bg = '#EFEAD9', style }) => {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: font.xs, fontWeight: '700' },
});
