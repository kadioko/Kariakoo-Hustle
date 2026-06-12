import { Platform, Vibration } from 'react-native';
import { Settings } from '@/types';

export type BuzzKind = 'tap' | 'success' | 'error' | 'achievement';

const PATTERNS: Record<BuzzKind, number | number[]> = {
  tap: 15,
  success: [0, 30, 60, 30],
  error: [0, 60, 80, 60, 80, 60],
  achievement: [0, 40, 70, 40, 70, 80],
};

/** Vibrate respecting the user's settings. No-op on web. */
export function buzz(settings: Settings, kind: BuzzKind = 'tap'): void {
  if (!settings.vibration) return;
  if (Platform.OS === 'web') return;
  const pattern = PATTERNS[kind];
  if (typeof pattern === 'number') {
    Vibration.vibrate(pattern);
  } else {
    Vibration.vibrate(pattern, false);
  }
}
