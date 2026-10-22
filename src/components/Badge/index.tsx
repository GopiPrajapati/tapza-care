import React from 'react';
import { View } from 'react-native';

import {
  useTheme,
  useThemedStyles,
  type Theme,
  type ThemeColors,
} from '../../commonutils/theme';
import { MAX_FONT_SCALE_DENSE } from '../../commonutils/typography';
import AppText from '../AppText';

export type BadgeTone =
  | 'accent'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

const TONES: Record<
  BadgeTone,
  { background: keyof ThemeColors; foreground: keyof ThemeColors }
> = {
  accent: { background: 'accent', foreground: 'onAccent' },
  primary: { background: 'primary', foreground: 'onPrimary' },
  success: { background: 'successSurface', foreground: 'success' },
  warning: { background: 'warningSurface', foreground: 'warning' },
  danger: { background: 'dangerSurface', foreground: 'danger' },
  neutral: { background: 'muted', foreground: 'textSecondary' },
};

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

/** Small label, e.g. "Most booked", "Pending", "Diwali special". */
function Badge({ label, tone = 'accent' }: BadgeProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { background, foreground } = TONES[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors[background] }]}>
      <AppText
        variant="caption"
        color={foreground}
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_FONT_SCALE_DENSE}
        style={styles.text}
      >
        {label}
      </AppText>
    </View>
  );
}

const createStyles = ({ spacing, radii }: Theme) => ({
  badge: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
  },
  text: { fontWeight: '700' as const },
});

export default Badge;
