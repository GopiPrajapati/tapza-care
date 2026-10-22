import React from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { ArrowUp } from 'lucide-react-native';

import {
  useTheme,
  useThemedStyles,
  type Theme,
} from '../../../commonutils/theme';
import AppText from '../../../components/AppText';
import PressableScale from '../../../components/PressableScale';
import { useHomeScroll } from './HomeScrollContext';
import { useTranslation } from 'react-i18next';

/** Scroll distance over which the pill fades and slides in. */
const REVEAL_DISTANCE = 80;

export interface BackToTopProps {
  /** Pinned header height; the pill sits just below it. */
  top: number;
  /** Scroll offset after which the pill appears. */
  showAfter: number;
  /** True once past `showAfter`; only controls whether the pill takes touches. */
  active: boolean;
  onPress: () => void;
}

/**
 * Zepto's "Back to top" pill under the pinned search bar. Its fade and slide follow the scroll offset on the UI
 * thread, so it never waits for a React render.
 */
function BackToTop({ top, showAfter, active, onPress }: BackToTopProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { colors, sizes, spacing } = useTheme();
  const { scrollY } = useHomeScroll();

  const style = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [showAfter, showAfter + REVEAL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: progress,
      transform: [{ translateY: (progress - 1) * spacing.lg }],
    };
  }, [showAfter, spacing.lg]);

  return (
    <Animated.View
      style={[styles.wrapper, { top }, style]}
      pointerEvents={active ? 'box-none' : 'none'}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
    >
      <PressableScale
        accessibilityLabel={t('backToTop')}
        onPress={onPress}
        style={styles.pill}
      >
        <ArrowUp size={sizes.iconSm} color={colors.onInverse} />
        <AppText variant="label" color="onInverse">
          {t('backToTop')}
        </AppText>
      </PressableScale>
    </Animated.View>
  );
}

const createStyles = ({ colors, spacing, radii, sizes, elevation }: Theme) => ({
  wrapper: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    alignItems: 'center' as const,
    zIndex: 11,
    elevation: 11,
  },
  pill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    minHeight: sizes.minTouch,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.inverseSurface,
    ...elevation.raised,
  },
});

export default BackToTop;
