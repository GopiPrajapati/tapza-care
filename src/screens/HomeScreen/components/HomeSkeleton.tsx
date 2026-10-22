import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useTheme,
  useThemedStyles,
  type Theme,
} from '../../../commonutils/theme';
import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonGroup,
  SkeletonText,
} from '../../../components/Skeleton';

/** Loading layout shaped like the real Home: band with header and hero, tiles, chips, a grid and a carousel. */
function HomeSkeleton() {
  const styles = useThemedStyles(createStyles);
  const { sizes, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <SkeletonGroup accessibilityLabel="Loading home" style={styles.root}>
      <View style={[styles.band, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <SkeletonText lines={2} lastLineWidth="70%" />
          </View>
          <SkeletonCircle size={sizes.minTouch} />
        </View>
        <SkeletonBox height={sizes.controlLarge} radius={radii.lg} />
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <SkeletonText lines={3} />
          </View>
          <SkeletonCircle size={sizes.heroArt} />
        </View>
      </View>
      <View style={styles.grid}>
        {[0, 1, 2, 3].map(index => (
          <SkeletonBox
            key={index}
            width="48%"
            height={sizes.controlLarge + spacing.lg}
            radius={radii.xl}
          />
        ))}
      </View>
      <View style={styles.row}>
        {[0, 1, 2].map(index => (
          <SkeletonBox
            key={index}
            width={sizes.carouselCard / 2}
            height={sizes.minTouch}
            radius={radii.pill}
          />
        ))}
      </View>
      <View style={styles.row}>
        {[0, 1].map(index => (
          <SkeletonBox
            key={index}
            width={sizes.carouselCard}
            height={sizes.illustration}
            radius={radii.xl}
          />
        ))}
      </View>
    </SkeletonGroup>
  );
}

const createStyles = ({ colors, spacing, radii }: Theme) => ({
  root: { flex: 1, gap: spacing.xl, backgroundColor: colors.background },
  band: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    backgroundColor: colors.muted,
  },
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.lg,
  },
  flex: { flex: 1 },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    rowGap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden' as const,
  },
});

export default HomeSkeleton;
