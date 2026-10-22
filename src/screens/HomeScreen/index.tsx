import React, { useCallback } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';

import { useThemedStyles, type Theme } from '../../commonutils/theme';
import ErrorState from '../../components/ErrorState';
import ScreenContainer from '../../components/ScreenContainer';
import StaleConfigBanner from '../../components/StaleConfigBanner';
import { useConfig } from '../../hooks/useConfig';
import type { Section } from '../../networking/types/configSchema';
import HomeSkeleton from './components/HomeSkeleton';
import NextDoseBar from './components/NextDoseBar';
import TopBand from './components/TopBand';
import SectionBlock from './sections/SectionBlock';

const keyExtractor = (section: Section) => section.id;
const renderItem: ListRenderItem<Section> = ({ item }) => (
  <SectionBlock section={item} />
);

/**
 * Config-driven home: the first section shares the top band with the header and search; every other section
 * is its own coloured band, in config order. Unknown or invalid sections never reach this list.
 */
function HomeScreen() {
  const styles = useThemedStyles(createStyles);
  const { config, isLoading, isStale, source, refetch, isRefetching } =
    useConfig();
  const [first, ...rest] = config.sections;

  const header = useCallback(
    () => (
      <>
        {first ? <TopBand section={first} /> : null}
        {isStale ? (
          <View style={styles.banner}>
            <StaleConfigBanner
              source={source === 'cache' ? 'saved' : 'default'}
              onRetry={refetch}
              retrying={isRefetching}
            />
          </View>
        ) : null}
      </>
    ),
    [first, isStale, source, refetch, isRefetching, styles.banner],
  );

  if (isLoading) {
    return <HomeSkeleton />;
  }
  if (!first) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <ErrorState
          title="Home is unavailable"
          message="We could not load the home screen. Please try again."
          onRetry={refetch}
          retrying={isRefetching}
        />
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={rest}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={header}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        // The top band draws behind the status bar itself.
        contentInsetAdjustmentBehavior="never"
        initialNumToRender={4}
        windowSize={7}
      />
      <View style={styles.floating} pointerEvents="box-none">
        <NextDoseBar />
      </View>
    </View>
  );
}

const createStyles = ({ colors, spacing, sizes }: Theme) => ({
  root: { flex: 1, backgroundColor: colors.background },
  // Room for the floating dose bar so the last section is never hidden under it.
  content: { paddingBottom: sizes.tabBarClearance + spacing.xxl },
  banner: { marginTop: spacing.md },
  floating: {
    position: 'absolute' as const,
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
  },
});

export default HomeScreen;
