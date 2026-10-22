import React from 'react';
import { useWindowDimensions, View } from 'react-native';

import {
  useThemedStyles,
  useTheme,
  type Theme,
} from '../../../commonutils/theme';
import AppText from '../../../components/AppText';
import Card from '../../../components/Card';
import Icon from '../../../components/Icon';
import { useSectionAction } from '../../../hooks/useSectionAction';
import type { QuickActionsSection } from '../../../networking/types/configSchema';

/** Large tiles for the main jobs (Book, Prescriptions, Reminders, Family). 4 items → 2×2, otherwise 3 per row. */
function QuickActions({ section }: { section: QuickActionsSection }) {
  const styles = useThemedStyles(createStyles);
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const onAction = useSectionAction();
  const columns = section.items.length % 3 === 0 ? 3 : 2;
  const tileWidth =
    (width - spacing.lg * 2 - spacing.md * (columns - 1)) / columns;

  return (
    <View style={styles.grid}>
      {section.items.map(item => (
        <Card
          key={item.id}
          onPress={() => onAction(item.action)}
          accessibilityLabel={item.label}
          style={[
            styles.tile,
            { width: tileWidth },
            columns === 3 && styles.tileStacked,
          ]}
        >
          <View style={styles.iconWrap}>
            <Icon name={item.icon} color="primaryText" />
          </View>
          <AppText variant="bodyStrong" numberOfLines={2} style={styles.label}>
            {item.label}
          </AppText>
        </Card>
      ))}
    </View>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tile: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    minHeight: sizes.controlLarge + spacing.lg,
    padding: spacing.md,
  },
  tileStacked: {
    flexDirection: 'column' as const,
    alignItems: 'flex-start' as const,
  },
  iconWrap: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radii.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.muted,
  },
  label: { flex: 1 },
});

export default QuickActions;
