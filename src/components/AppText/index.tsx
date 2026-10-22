import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme, useTone, type ThemeColors } from '../../commonutils/theme';
import type { TypographyVariant } from '../../commonutils/typography';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  /**
   * Theme colour name. Defaults to textPrimary. On a coloured section band, the default and textSecondary switch
   * to the band's readable tone automatically.
   */
  color?: keyof ThemeColors;
  align?: TextStyle['textAlign'];
  strikethrough?: boolean;
}

/**
 * All text in the app. OS font scaling stays on; pass maxFontSizeMultiplier only where a layout would break.
 */
function AppText({
  variant = 'body',
  color,
  align,
  strikethrough,
  style,
  ...rest
}: AppTextProps) {
  const { typography, colors } = useTheme();
  const tone = useTone();
  const resolvedColor =
    tone && (color === undefined || color === 'textPrimary')
      ? tone.foreground
      : tone && color === 'textSecondary'
      ? tone.muted
      : colors[color ?? 'textPrimary'];
  return (
    <Text
      allowFontScaling
      {...rest}
      style={[
        typography[variant],
        { color: resolvedColor, textAlign: align },
        strikethrough && styles.strikethrough,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  strikethrough: { textDecorationLine: 'line-through' },
});

export default AppText;
