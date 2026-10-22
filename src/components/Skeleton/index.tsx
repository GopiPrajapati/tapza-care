import React, { useEffect } from 'react';
import {
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import { useTranslation } from 'react-i18next';

const DIM_OPACITY = 0.45;

/** Shared pulse so a whole skeleton screen breathes in sync (one animation, not one per box). */
const PulseContext = React.createContext<ReturnType<
  typeof useSharedValue<number>
> | null>(null);

function usePulse() {
  const { motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    opacity.value = withRepeat(
      withTiming(DIM_OPACITY, { duration: motion.shimmer }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion, motion.shimmer]);

  return opacity;
}

/** Wrap a skeleton layout so every block pulses together. Hidden from screen readers. */
export function SkeletonGroup({
  children,
  accessibilityLabel,
  style,
}: {
  children: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = usePulse();
  const { t } = useTranslation();
  return (
    <PulseContext.Provider value={opacity}>
      <View
        style={style}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel ?? t('loading')}
      >
        {children}
      </View>
    </PulseContext.Provider>
  );
}

interface BlockProps {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

function SkeletonBlockInner({
  width = '100%',
  height,
  radius,
  style,
}: BlockProps) {
  const { radii } = useTheme();
  const styles = useThemedStyles(createStyles);
  const opacity = React.useContext(PulseContext)!;
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.block,
        { width, height, borderRadius: radius ?? radii.sm },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** A block joins the surrounding SkeletonGroup's pulse, or makes its own group when used alone. */
function SkeletonBlock(props: BlockProps) {
  const inGroup = React.useContext(PulseContext) !== null;
  return inGroup ? (
    <SkeletonBlockInner {...props} />
  ) : (
    <SkeletonGroup>
      <SkeletonBlockInner {...props} />
    </SkeletonGroup>
  );
}

export const SkeletonBox = SkeletonBlock;

export function SkeletonCircle({
  size,
  style,
}: {
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SkeletonBlock width={size} height={size} radius={size / 2} style={style} />
  );
}

/** Text placeholder: `lines` bars, the last one shorter, sized like body text. */
export function SkeletonText({
  lines = 1,
  lastLineWidth = '60%',
}: {
  lines?: number;
  lastLineWidth?: DimensionValue;
}) {
  const { typography, spacing } = useTheme();
  const barHeight = typography.body.fontSize;
  return (
    <View style={{ gap: spacing.sm }}>
      {Array.from({ length: lines }, (_, index) => (
        <SkeletonBlock
          key={index}
          height={barHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
        />
      ))}
    </View>
  );
}

const createStyles = ({ colors }: Theme) => ({
  block: { backgroundColor: colors.skeleton },
});
