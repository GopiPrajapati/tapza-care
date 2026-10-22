import React from 'react';
import { View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';
import PressableScale from '../PressableScale';
import { useTranslation } from 'react-i18next';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Shows Zepto's round back button. */
  onBackPress?: () => void;
  right?: React.ReactNode;
}

/** In-screen header for screens that hide the native header (e.g. ones with coloured bands). */
function Header({ title, subtitle, onBackPress, right }: HeaderProps) {
  const { colors, sizes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      {onBackPress ? (
        <PressableScale
          accessibilityLabel={t('back')}
          onPress={onBackPress}
          style={styles.back}
        >
          <ChevronLeft size={sizes.iconLg} color={colors.textPrimary} />
        </PressableScale>
      ) : null}
      <View style={styles.titles}>
        <AppText variant="heading" accessibilityRole="header" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const createStyles = ({ colors, spacing, radii, sizes, elevation }: Theme) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  back: {
    width: sizes.minTouch,
    height: sizes.minTouch,
    borderRadius: radii.pill,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.surface,
    borderWidth: sizes.border,
    borderColor: colors.border,
    ...elevation.card,
  },
  titles: { flex: 1 },
});

export default Header;
