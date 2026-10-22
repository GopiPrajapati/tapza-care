import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { LucideIcon } from 'lucide-react-native';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';
import PressableScale from '../PressableScale';

export interface FloatingBarProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Tapping the bar. */
  onPress: () => void;
  /** Optional pill on the right, e.g. "Mark taken". */
  actionLabel?: string;
  onAction?: () => void;
  /** Animates the bar in and out (e.g. hide while scrolling down). */
  visible?: boolean;
}

/**
 * Dark bar that floats above the tab bar, like Zepto's "Unlock free delivery". The parent positions it.
 */
function FloatingBar({
  title,
  subtitle,
  icon: Icon,
  onPress,
  actionLabel,
  onAction,
  visible = true,
}: FloatingBarProps) {
  const { colors, sizes, motion, spacing } = useTheme();
  const styles = useThemedStyles(createStyles);
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? visible
        ? 1
        : 0
      : withTiming(visible ? 1 : 0, { duration: motion.normal });
  }, [visible, reduceMotion, progress, motion.normal]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * spacing.xxxl }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <PressableScale
        accessibilityLabel={[title, subtitle].filter(Boolean).join(', ')}
        onPress={onPress}
        scaleTo={0.98}
        style={styles.bar}
      >
        {Icon ? (
          <View style={styles.iconWrap}>
            <Icon size={sizes.iconMd} color={colors.onInverse} />
          </View>
        ) : null}
        <View style={styles.texts}>
          <AppText variant="bodyStrong" color="onInverse" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color="onInverse" numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <PressableScale
            accessibilityLabel={actionLabel}
            onPress={onAction}
            style={styles.action}
          >
            <AppText variant="label" color="onPrimary">
              {actionLabel}
            </AppText>
          </PressableScale>
        ) : null}
      </PressableScale>
    </Animated.View>
  );
}

const createStyles = ({ colors, spacing, radii, sizes, elevation }: Theme) => ({
  bar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    minHeight: sizes.controlLarge + spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.inverseSurface,
    ...elevation.raised,
  },
  iconWrap: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radii.pill,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: sizes.border,
    borderColor: colors.onInverse,
  },
  texts: { flex: 1 },
  action: {
    minHeight: sizes.minTouch,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    justifyContent: 'center' as const,
    backgroundColor: colors.primary,
  },
});

export default FloatingBar;
