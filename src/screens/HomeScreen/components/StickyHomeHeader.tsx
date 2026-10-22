import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { scheduleOnRN } from 'react-native-worklets';
import { CalendarPlus } from 'lucide-react-native';

import {
  isLightColor,
  ToneProvider,
  useTheme,
  useThemedStyles,
  withAlpha,
  type Theme,
} from '../../../commonutils/theme';
import AppText from '../../../components/AppText';
import PressableScale from '../../../components/PressableScale';
import SearchBar from '../../../components/SearchBar';
import { Routes } from '../../../container/Routes';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import type { SectionBackground } from '../../../networking/types/layoutConfig';
import { useSectionPaint } from '../sections/SectionBackground';
import HomeHeader from './HomeHeader';
import { useHomeScroll } from './HomeScrollContext';
import { useTranslation } from 'react-i18next';

export interface StickyHomeHeaderProps {
  /** Background of the top band the header starts on. */
  background: SectionBackground;
  /** Expanded and pinned header heights, reported once measured, so the list can reserve the space. */
  onMeasured: (fullHeight: number, collapsedHeight: number) => void;
}

/**
 * Zepto-style header that floats above the home list:
 * - At rest it is transparent, so the top band's colour runs behind the status bar.
 * - Scrolling up slides and fades the ETA/address row away; the search bar rises and pins under the status bar.
 * - Its background follows the band colour while collapsing, then turns to the surface colour once pinned,
 *   including the strip behind the status bar.
 * Everything runs on the UI thread from the list's scroll offset.
 */
function StickyHomeHeader({ background, onMeasured }: StickyHomeHeaderProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { scrollY, collapseDistance } = useHomeScroll();
  const { stops, tone } = useSectionPaint(background);
  const [fullHeight, setFullHeight] = useState(0);
  const [pinned, setPinned] = useState(false);

  // Plain strings computed on the JS thread; worklets can only use captured values, not JS helpers.
  const bandColor = stops[0];
  const bandClear = withAlpha(bandColor, 0);
  const surface = theme.colors.surface;
  const border = theme.colors.border;
  const borderClear = withAlpha(border, 0);

  const [etaHeight, setEtaHeight] = useState(0);
  const onEtaLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      collapseDistance.value = height;
      setEtaHeight(height);
    },
    [collapseDistance],
  );
  const onContentLayout = useCallback((event: LayoutChangeEvent) => {
    setFullHeight(event.nativeEvent.layout.height);
  }, []);
  useEffect(() => {
    if (fullHeight > 0 && etaHeight > 0) {
      onMeasured(fullHeight, fullHeight - etaHeight);
    }
  }, [fullHeight, etaHeight, onMeasured]);

  // Status bar icons: band style while expanded, theme style once pinned on the surface colour.
  useAnimatedReaction(
    () =>
      scrollY.value >= collapseDistance.value * 0.85 &&
      collapseDistance.value > 0,
    (isPinned, wasPinned) => {
      if (isPinned !== wasPinned) {
        scheduleOnRN(setPinned, isPinned);
      }
    },
  );
  const bandBarStyle = isLightColor(tone.foreground)
    ? 'light-content'
    : 'dark-content';
  const barStyle = pinned ? theme.statusBarStyle : bandBarStyle;
  // A mounted <StatusBar> overrides the app-wide one; only while Home is the focused tab.
  const focused = useIsFocused();

  const containerStyle = useAnimatedStyle(() => {
    const distance = Math.max(collapseDistance.value, 1);
    const collapsed = interpolate(
      scrollY.value,
      [0, distance],
      [0, distance],
      Extrapolation.CLAMP,
    );
    return {
      height: fullHeight > 0 ? fullHeight - collapsed : undefined,
      backgroundColor: interpolateColor(
        scrollY.value,
        [0, distance * 0.15, distance * 0.8, distance],
        [bandClear, bandColor, bandColor, surface],
      ),
      borderBottomColor: interpolateColor(
        scrollY.value,
        [distance * 0.8, distance],
        [borderClear, border],
      ),
    };
  }, [fullHeight, bandClear, bandColor, surface, border, borderClear]);

  const contentStyle = useAnimatedStyle(() => {
    const distance = Math.max(collapseDistance.value, 1);
    return {
      transform: [
        {
          translateY: -interpolate(
            scrollY.value,
            [0, distance],
            [0, distance],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const etaStyle = useAnimatedStyle(() => {
    const distance = Math.max(collapseDistance.value, 1);
    return {
      opacity: interpolate(
        scrollY.value,
        [0, distance * 0.6],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [0, distance],
            [1, 0.94],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      pointerEvents="box-none"
    >
      {focused ? <StatusBar barStyle={barStyle} animated /> : null}
      <Animated.View
        style={[styles.content, { paddingTop: insets.top }, contentStyle]}
        onLayout={onContentLayout}
        pointerEvents="box-none"
      >
        <ToneProvider tone={tone}>
          <Animated.View style={[styles.eta, etaStyle]} onLayout={onEtaLayout}>
            <HomeHeader />
          </Animated.View>
        </ToneProvider>
        <View style={styles.search}>
          <SearchBar
            placeholder={t('searchPaediatrics')}
            onPress={() =>
              navigation.navigate(Routes.DoctorList, { focusSearch: true })
            }
            rightSlot={
              <BookPill
                onPress={() => navigation.navigate(Routes.DoctorList)}
              />
            }
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function BookPill({ onPress }: { onPress: () => void }) {
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  const { t } = useTranslation();
  return (
    <PressableScale
      accessibilityLabel={t('bookVisit')}
      onPress={onPress}
      style={styles.pill}
    >
      <CalendarPlus size={sizes.iconMd} color={colors.primaryText} />
      <AppText variant="label" color="primaryText">
        {t('book')}
      </AppText>
    </PressableScale>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden' as const,
    borderBottomWidth: sizes.hairline,
    zIndex: 10,
  },
  content: { paddingBottom: spacing.md },
  // The bottom padding is part of the collapsing block, so the search bar pins snugly under the status bar.
  eta: { paddingTop: spacing.sm, paddingBottom: spacing.lg },
  search: { paddingHorizontal: spacing.lg },
  pill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    minHeight: sizes.minTouch,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.muted,
  },
});

export default StickyHomeHeader;
