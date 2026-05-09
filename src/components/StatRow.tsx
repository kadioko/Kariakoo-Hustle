import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, font, spacing } from '@/theme';

interface Props {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
  negative?: boolean;
  style?: ViewStyle;
}

export const StatRow: React.FC<Props> = ({ label, value, highlight, positive, negative, style }) => {
  let valueColor = colors.text;
  if (positive) valueColor = colors.success;
  else if (negative) valueColor = colors.danger;
  else if (highlight) valueColor = colors.primary;

  return (
    <View style={[styles.row, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  label: { flex: 1, color: colors.textMuted, fontSize: font.sm, lineHeight: 20 },
  value: { flexShrink: 1, fontSize: font.md, fontWeight: '700', textAlign: 'right' },
});
