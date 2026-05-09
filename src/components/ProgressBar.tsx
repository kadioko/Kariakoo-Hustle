import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme';

interface Props {
  value: number;
  max: number;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<Props> = ({ value, max, color = colors.primary, height = 10 }) => {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  return (
    <View style={[styles.bg, { height, borderRadius: height / 2 }]}>
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bg: {
    width: '100%',
    backgroundColor: '#E7E1D1',
    overflow: 'hidden',
    borderRadius: radius.pill,
  },
});
