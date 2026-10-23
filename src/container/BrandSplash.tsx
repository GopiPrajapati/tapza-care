import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react-native';

import { LAUNCH_COLORS } from '../commonutils/constants';
import {
  useTheme,
  useThemedStyles,
  withAlpha,
  type Theme,
} from '../commonutils/theme';
import AppText from '../components/AppText';
import { useConfig } from '../hooks/useConfig';
import { useTranslateContent } from '../i18n/useTranslateContent';
import { useConfigStore } from '../store/configStore';

const NORMAL_MARK = require('../../assets/branding/tapza-care-app-icon.png');
const DIWALI_MARK = require('../../assets/branding/tapza-care-app-icon-diwali.png');

const ENTER_MS = 520;
const HOLD_MS = 650;
const EXIT_MS = 360;
/** Halo rings around the badge, as multiples of the badge size, from inner to outer. */
const HALOS = [1.45, 1.95, 2.5];

/**
 * Config-aware splash drawn over the app right after launch: the round Tapza Care mark for the saved config
 * variant (brand mark on Normal/Custom, festive mark on Diwali), soft halo rings in the theme colour, the app name
 * and, during a festival, its greeting. It starts on the neutral native launch colour and blends into the theme,
 * then fades away to reveal Home (which has been loading underneath).
 */
function BrandSplash({ onDone }: { onDone: () => void }) {
  const styles = useThemedStyles(createStyles);
  const { colors, sizes, spacing } = useTheme();
  const { t } = useTranslation();
  const translate = useTranslateContent();
  const reduceMotion = useReducedMotion();
  const variant = useConfigStore(state => state.variant);
  const festival = useConfig().config.theme.festival;
  const mark = variant === 'diwali' ? DIWALI_MARK : NORMAL_MARK;

  const enter = useSharedValue(reduceMotion ? 1 : 0);
  const exit = useSharedValue(1);

  useEffect(() => {
    const finish = () => onDone();
    if (reduceMotion) {
      exit.value = withDelay(
        HOLD_MS,
        withTiming(0, { duration: EXIT_MS }, done => {
          if (done) scheduleOnRN(finish);
        }),
      );
      return;
    }
    enter.value = withTiming(1, {
      duration: ENTER_MS,
      easing: Easing.out(Easing.cubic),
    });
    exit.value = withDelay(
      ENTER_MS + HOLD_MS,
      withTiming(
        0,
        { duration: EXIT_MS, easing: Easing.in(Easing.quad) },
        done => {
          if (done) scheduleOnRN(finish);
        },
      ),
    );
  }, [enter, exit, onDone, reduceMotion]);

  // Plain values for the worklets (JS helpers cannot run on the UI thread).
  const launchBackground = LAUNCH_COLORS.background;
  const themeBackground = colors.background;

  const containerStyle = useAnimatedStyle(() => ({
    opacity: exit.value,
    backgroundColor: interpolateColor(
      enter.value,
      [0, 1],
      [launchBackground, themeBackground],
    ),
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0, 0.4, 1], [0, 1, 1]),
    transform: [
      { scale: interpolate(enter.value, [0, 1], [0.72, 1]) },
      { scale: interpolate(exit.value, [0, 1], [1.08, 1]) },
    ],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0.35, 1], [0, 1], 'clamp'),
    transform: [
      { translateY: interpolate(enter.value, [0, 1], [spacing.lg, 0]) },
    ],
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, containerStyle]}
      accessible
      accessibilityLabel={t('splashLabel')}
      pointerEvents="none"
    >
      <View style={styles.center}>
        {HALOS.map((scale, index) => (
          <Halo key={scale} scale={scale} index={index} enter={enter} />
        ))}
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Image source={mark} style={styles.mark} resizeMode="cover" />
        </Animated.View>
      </View>
      <Animated.View style={[styles.texts, textStyle]}>
        <AppText variant="display" align="center" maxFontSizeMultiplier={1.3}>
          Tapza Care
        </AppText>
        <AppText
          color="textSecondary"
          align="center"
          maxFontSizeMultiplier={1.3}
        >
          {t('splashTagline')}
        </AppText>
        {festival ? (
          <View style={styles.festival}>
            <Sparkles size={sizes.iconSm} color={colors.onAccent} />
            <AppText
              variant="label"
              color="onAccent"
              numberOfLines={2}
              maxFontSizeMultiplier={1.3}
              style={styles.festivalText}
            >
              {translate(festival.greeting)}
            </AppText>
          </View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

function Halo({
  scale,
  index,
  enter,
}: {
  scale: number;
  index: number;
  enter: ReturnType<typeof useSharedValue<number>>;
}) {
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  const size = sizes.splashBadge * scale;
  const fill = withAlpha(colors.primary, 0.14 - index * 0.04);
  const style = useAnimatedStyle(() => {
    // Rings arrive one after another, from the inside out.
    const start = 0.15 + index * 0.15;
    return {
      opacity: interpolate(enter.value, [start, start + 0.45], [0, 1], 'clamp'),
      transform: [
        { scale: interpolate(enter.value, [start, 1], [0.6, 1], 'clamp') },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.halo,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fill,
        },
        style,
      ]}
    />
  );
}

const createStyles = ({ colors, spacing, radii, sizes, elevation }: Theme) => ({
  container: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 100,
    elevation: 100,
  },
  center: {
    width: sizes.splashBadge * HALOS[HALOS.length - 1],
    height: sizes.splashBadge * HALOS[HALOS.length - 1],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  halo: { position: 'absolute' as const },
  badge: {
    width: sizes.splashBadge,
    height: sizes.splashBadge,
    borderRadius: sizes.splashBadge / 2,
    borderWidth: spacing.xs,
    borderColor: colors.surface,
    backgroundColor: colors.surface,
    overflow: 'hidden' as const,
    ...elevation.raised,
  },
  mark: { width: '100%' as const, height: '100%' as const },
  texts: {
    alignItems: 'center' as const,
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    marginTop: -spacing.xxl,
  },
  festival: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    maxWidth: '100%' as const,
  },
  festivalText: { flexShrink: 1 },
});

export default BrandSplash;
