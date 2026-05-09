import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, spacing } from '@/theme';

type ToastKind = 'success' | 'error' | 'info' | 'warning' | 'achievement';

interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  emoji?: string;
}

interface ToastContextType {
  show: (item: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  achievement: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const BG: Record<ToastKind, string> = {
  success: colors.success,
  error: colors.danger,
  info: colors.info,
  warning: colors.warning,
  achievement: colors.accent,
};

const EMOJI: Record<ToastKind, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
  achievement: '🏆',
};

function ToastBubble({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(onDismiss);
    }, 2800);

    return () => clearTimeout(t);
  }, []);

  const bg = BG[item.kind];
  const emoji = item.emoji ?? EMOJI[item.kind];

  return (
    <Animated.View
      style={[
        styles.bubble,
        { backgroundColor: bg, transform: [{ translateY }], opacity },
      ]}
    >
      <Text style={styles.bubbleEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.bubbleTitle}>{item.title}</Text>
        {item.message ? (
          <Text style={styles.bubbleMsg}>{item.message}</Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={onDismiss}>
        <Text style={styles.dismiss}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();
  const counter = useRef(0);

  const show = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = String(++counter.current);
    setToasts((prev) => [...prev.slice(-2), { ...item, id }]);
  }, []);

  const success = useCallback(
    (title: string, message?: string) => show({ kind: 'success', title, message }),
    [show],
  );
  const error = useCallback(
    (title: string, message?: string) => show({ kind: 'error', title, message }),
    [show],
  );
  const achievement = useCallback(
    (title: string, message?: string) =>
      show({ kind: 'achievement', title, message, emoji: '🏆' }),
    [show],
  );
  const info = useCallback(
    (title: string, message?: string) => show({ kind: 'info', title, message }),
    [show],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show, success, error, achievement, info }}>
      {children}
      <View
        style={[styles.container, { top: insets.top + spacing.sm }]}
        pointerEvents="box-none"
      >
        {toasts.map((t) => (
          <ToastBubble key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    gap: spacing.sm,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.pop,
  },
  bubbleEmoji: { fontSize: 22 },
  bubbleTitle: { color: '#fff', fontSize: font.sm, fontWeight: '800' },
  bubbleMsg: { color: '#FFFFFFCC', fontSize: font.xs, marginTop: 2 },
  dismiss: { color: '#FFFFFFAA', fontSize: 16, paddingLeft: spacing.sm },
});
