import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  useWindowDimensions,
  View,
  type FlatListProps,
  type ListRenderItem,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import ErrorState from '../../components/ErrorState';
import ScreenContainer from '../../components/ScreenContainer';
import StaleConfigBanner from '../../components/StaleConfigBanner';
import { useConfig } from '../../hooks/useConfig';
import type { Section } from '../../networking/types/configSchema';
import BackToTop from './components/BackToTop';
import EntryAnimated from './components/EntryAnimated';
import HomeSkeleton from './components/HomeSkeleton';
import {
  HomeScrollContext,
  type HomeScroll,
} from './components/HomeScrollContext';
import NextDoseBar from './components/NextDoseBar';
import StickyHomeHeader from './components/StickyHomeHeader';
import TopBand from './components/TopBand';
import SectionBlock from './sections/SectionBlock';
import { useSectionPaint } from './sections/SectionBackground';
import { useTranslation } from 'react-i18next';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Section>);

/**
 * Back to top shows after this many screen heights. The prompt suggested 1.5, but home is only about two screens
 * tall, so the pill could never appear; 0.6 is roughly when the top band has scrolled away.
 */
const BACK_TO_TOP_SCREENS = 0.6;
/** Ignore tiny scroll jitters when deciding direction for the floating bar. */
const DIRECTION_THRESHOLD = 6;
const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 12,
  minimumViewTime: 60,
};

const keyExtractor = (section: Section) => section.id;

type ViewableItemsChanged = NonNullable<
  FlatListProps<Section>['onViewableItemsChanged']
>;

/**
 * Config-driven home. The first section is the top band under a floating, collapsing header; every other section
 * is its own coloured band that fades in once when first seen. Scroll effects run on the UI thread.
 */
function HomeScreen() {
  const { t } = useTranslation();
  const { config, isLoading, isStale, source, refetch, isRefetching } =
    useConfig();

  if (isLoading) {
    return <HomeSkeleton />;
  }
  if (config.sections.length === 0) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <ErrorState
          title={t('homeUnavailable')}
          message={t('homeError')}
          onRetry={refetch}
          retrying={isRefetching}
        />
      </ScreenContainer>
    );
  }

  // A new config (variant switch) remounts the content with a fade instead of a hard swap.
  const configKey = `${config.version}:${config.theme.primary}:${config.sections
    .map(s => s.id)
    .join(',')}`;
  return (
    <HomeContent
      key={configKey}
      sections={config.sections}
      stale={isStale ? { source, refetch, isRefetching } : null}
    />
  );
}

interface HomeContentProps {
  sections: Section[];
  stale: { source: string; refetch: () => void; isRefetching: boolean } | null;
}

function HomeContent({ sections, stale }: HomeContentProps) {
  const styles = useThemedStyles(createStyles);
  const { spacing, sizes } = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const listRef = useRef<FlatList<Section>>(null);
  const [first, ...rest] = sections;

  const scrollY = useSharedValue(0);
  const collapseDistance = useSharedValue(0);
  const lastY = useSharedValue(0);
  const barVisible = useSharedValue(1);
  const seen = useSharedValue<Record<string, true>>({});
  const [headerSize, setHeaderSize] = useState({ full: 0, collapsed: 0 });
  const headerHeight = headerSize.full;
  const onHeaderMeasured = useCallback(
    (full: number, collapsed: number) => setHeaderSize({ full, collapsed }),
    [],
  );
  const [showBackToTop, setShowBackToTop] = useState(false);

  const scroll = useMemo<HomeScroll>(
    () => ({ scrollY, collapseDistance, reduceMotion }),
    [scrollY, collapseDistance, reduceMotion],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      const y = event.contentOffset.y;
      const dy = y - lastY.value;
      if (dy > DIRECTION_THRESHOLD && y > collapseDistance.value) {
        barVisible.value = withTiming(0, { duration: 220 });
      } else if (dy < -DIRECTION_THRESHOLD || y <= 0) {
        barVisible.value = withTiming(1, { duration: 220 });
      }
      if (Math.abs(dy) > DIRECTION_THRESHOLD || y <= 0) {
        lastY.value = y;
      }
      scrollY.value = y;
    },
  });

  // Toggle the pill only when crossing the threshold (one JS update, not one per frame).
  const backToTopAfter = screenHeight * BACK_TO_TOP_SCREENS;
  useAnimatedReaction(
    () => scrollY.value > backToTopAfter,
    (isPast, wasPast) => {
      if (isPast !== wasPast) {
        scheduleOnRN(setShowBackToTop, isPast);
      }
    },
  );

  const onViewableItemsChanged = useRef<ViewableItemsChanged>(
    ({ viewableItems }) => {
      const fresh = viewableItems.filter(
        token => token.isViewable && !seen.value[token.key],
      );
      if (fresh.length > 0) {
        const next = { ...seen.value };
        fresh.forEach(token => {
          next[token.key] = true;
        });
        seen.value = next;
      }
    },
  ).current;

  const renderItem = useCallback<ListRenderItem<Section>>(
    ({ item }) => <AnimatedSection section={item} seen={seen} />,
    [seen],
  );

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: !reduceMotion });
  }, [reduceMotion]);

  const header = useMemo(
    () => (
      <>
        <TopBand section={first} headerHeight={headerHeight} />
        {stale ? (
          <View style={styles.banner}>
            <StaleConfigBanner
              source={stale.source === 'cache' ? 'saved' : 'default'}
              onRetry={stale.refetch}
              retrying={stale.isRefetching}
            />
          </View>
        ) : null}
      </>
    ),
    [first, headerHeight, stale, styles.banner],
  );

  const barStyle = useAnimatedStyle(() => ({
    opacity: barVisible.value,
    transform: [
      {
        translateY: (1 - barVisible.value) * (sizes.controlLarge + spacing.xl),
      },
    ],
  }));

  return (
    <HomeScrollContext.Provider value={scroll}>
      <Animated.View
        style={styles.root}
        entering={reduceMotion ? undefined : FadeIn.duration(320)}
      >
        <OverscrollFill background={first.background} scrollY={scrollY} />
        <StickyHomeHeader
          background={first.background}
          onMeasured={onHeaderMeasured}
        />
        <AnimatedFlatList
          ref={listRef}
          data={rest}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={header}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          // The top band draws behind the status bar itself.
          contentInsetAdjustmentBehavior="never"
          initialNumToRender={4}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
        />
        <BackToTop
          top={headerSize.collapsed + spacing.sm}
          showAfter={backToTopAfter}
          active={showBackToTop}
          onPress={scrollToTop}
        />
        <Animated.View
          style={[styles.floating, barStyle]}
          pointerEvents="box-none"
        >
          <NextDoseBar />
        </Animated.View>
      </Animated.View>
    </HomeScrollContext.Provider>
  );
}

const AnimatedSection = React.memo(function AnimatedSectionView({
  section,
  seen,
}: {
  section: Section;
  seen: SharedValue<Record<string, true>>;
}) {
  return (
    <EntryAnimated id={section.id} seen={seen}>
      <SectionBlock section={section} />
    </EntryAnimated>
  );
});

/**
 * Fills the gap above the list when the user pulls down past the top (iOS bounce) with the band colour, so the
 * band appears to stretch instead of revealing the screen background.
 */
function OverscrollFill({
  background,
  scrollY,
}: {
  background: Section['background'];
  scrollY: SharedValue<number>;
}) {
  const styles = useThemedStyles(createStyles);
  const { stops } = useSectionPaint(background);
  const style = useAnimatedStyle(() => ({
    height: Math.max(0, -scrollY.value) + 2,
  }));
  return (
    <Animated.View
      style={[styles.overscroll, { backgroundColor: stops[0] }, style]}
    />
  );
}

const createStyles = ({ colors, spacing, sizes }: Theme) => ({
  root: { flex: 1, backgroundColor: colors.background },
  // Room for the floating dose bar so the last section is never hidden under it.
  content: { paddingBottom: sizes.tabBarClearance + spacing.xxl },
  banner: { marginTop: spacing.md },
  overscroll: { position: 'absolute' as const, top: 0, left: 0, right: 0 },
  floating: {
    position: 'absolute' as const,
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
  },
});

export default HomeScreen;
