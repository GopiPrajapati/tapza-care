import React from 'react';
import { View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';

import {
  useTheme,
  useThemedStyles,
  type Theme,
  type ThemeColors,
} from '../../commonutils/theme';
import AppText from '../AppText';
import PressableScale from '../PressableScale';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Short value on the right, e.g. "₹0" or "Hindi". */
  value?: string;
  valueColor?: keyof ThemeColors;
  onPress: () => void;
  /** Draws a divider under the row (not on the last row of a group). */
  divider?: boolean;
}

/** Settings-style row: icon, title, optional subtitle and value, chevron. Used on Profile. */
function ListRow({
  title,
  subtitle,
  icon: Icon,
  value,
  valueColor,
  onPress,
  divider,
}: ListRowProps) {
  const { colors, sizes } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <PressableScale
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}
      onPress={onPress}
      scaleTo={0.99}
      style={[styles.row, divider && styles.divider]}
    >
      {Icon ? (
        <View style={styles.iconWrap}>
          <Icon size={sizes.iconMd} color={colors.textPrimary} />
        </View>
      ) : null}
      <View style={styles.texts}>
        <AppText variant="bodyStrong">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="label" color={valueColor ?? 'textSecondary'}>
          {value}
        </AppText>
      ) : null}
      <ChevronRight size={sizes.iconMd} color={colors.textSecondary} />
    </PressableScale>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    minHeight: sizes.controlLarge,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: {
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radii.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.muted,
  },
  texts: { flex: 1, gap: spacing.xxs },
});

export default ListRow;
