import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '@/theme';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export const Header: React.FC<Props> = ({ title, subtitle, right }) => {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
});
