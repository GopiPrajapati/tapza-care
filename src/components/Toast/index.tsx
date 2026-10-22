import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';
import PressableScale from '../PressableScale';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** e.g. "Undo" */
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface ToastApi {
  show: (options: ToastOptions) => void;
  hide: () => void;
}

const DEFAULT_DURATION_MS = 3500;
const TONE_ICONS = { info: Info, success: CircleCheck, error: CircleAlert };

const ToastContext = createContext<ToastApi | null>(null);

/** Show a short message (optionally with one action) above the tab bar. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return api;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const hide = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setToast(null);
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      nextId.current += 1;
      setToast({ ...options, id: nextId.current });
      AccessibilityInfo.announceForAccessibility(options.message);
      timer.current = setTimeout(
        hide,
        options.durationMs ?? DEFAULT_DURATION_MS,
      );
    },
    [hide],
  );

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const api = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        <ToastView key={toast.id} toast={toast} onDismiss={hide} />
      ) : null}
    </ToastContext.Provider>
  );
}

function ToastView({
  toast,
  onDismiss,
}: {
  toast: ToastOptions;
  onDismiss: () => void;
}) {
  const { colors, sizes, spacing } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const ToneIcon = TONE_ICONS[toast.tone ?? 'info'];

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        { bottom: insets.bottom + sizes.tabBarClearance + spacing.sm },
      ]}
    >
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        style={styles.toast}
      >
        <ToneIcon size={sizes.iconMd} color={colors.onInverse} />
        <AppText color="onInverse" style={styles.message}>
          {toast.message}
        </AppText>
        {toast.actionLabel && toast.onAction ? (
          <PressableScale
            accessibilityLabel={toast.actionLabel}
            onPress={() => {
              toast.onAction?.();
              onDismiss();
            }}
            style={styles.action}
          >
            <AppText
              variant="bodyStrong"
              color="onInverse"
              style={styles.actionText}
            >
              {toast.actionLabel}
            </AppText>
          </PressableScale>
        ) : null}
      </Animated.View>
    </View>
  );
}

const createStyles = ({ colors, spacing, radii, sizes, elevation }: Theme) => ({
  overlay: {
    position: 'absolute' as const,
    left: spacing.lg,
    right: spacing.lg,
  },
  toast: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    minHeight: sizes.controlLarge,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: colors.inverseSurface,
    ...elevation.raised,
  },
  message: { flex: 1, paddingVertical: spacing.md },
  action: {
    minHeight: sizes.minTouch,
    paddingHorizontal: spacing.md,
    justifyContent: 'center' as const,
  },
  actionText: { textDecorationLine: 'underline' as const },
});
