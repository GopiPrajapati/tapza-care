import React from 'react';
import { View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Svg, { Line } from 'react-native-svg';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';
import PressableScale from '../PressableScale';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Shows a "See all" link. */
  onSeeAll?: () => void;
  seeAllLabel?: string;
}

/** Bold title followed by a dashed rule, as in Zepto's "Explore" and "Featured" headers. */
function SectionHeader({
  title,
  subtitle,
  onSeeAll,
  seeAllLabel = 'See all',
}: SectionHeaderProps) {
  const { colors, sizes, spacing } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {/* SVG dash: single-side dashed borders render solid on iOS. */}
        <Svg style={styles.rule} height={sizes.border}>
          <Line
            x1="0"
            y1="0.5"
            x2="100%"
            y2="0.5"
            stroke={colors.border}
            strokeWidth={sizes.border}
            strokeDasharray={`${spacing.xs} ${spacing.xs}`}
          />
        </Svg>
        {onSeeAll ? (
          <PressableScale
            accessibilityRole="link"
            accessibilityLabel={`${seeAllLabel}: ${title}`}
            onPress={onSeeAll}
            style={styles.seeAll}
          >
            <AppText variant="label" color="primaryText">
              {seeAllLabel}
            </AppText>
            <ChevronRight size={sizes.iconSm} color={colors.primaryText} />
          </PressableScale>
        ) : null}
      </View>
      {subtitle ? (
        <AppText variant="body" color="textSecondary">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const createStyles = ({ spacing, sizes }: Theme) => ({
  wrapper: { gap: spacing.xs, paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  rule: { flex: 1 },
  seeAll: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xxs,
    minHeight: sizes.minTouch,
  },
});

export default SectionHeader;
