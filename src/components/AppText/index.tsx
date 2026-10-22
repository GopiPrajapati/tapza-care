import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme, type ThemeColors } from '../../commonutils/theme';
import type { TypographyVariant } from '../../commonutils/typography';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  /** Theme colour name. Defaults to textPrimary. */
  color?: keyof ThemeColors;
  align?: TextStyle['textAlign'];
  strikethrough?: boolean;
}

/**
 * All text in the app. OS font scaling stays on; pass maxFontSizeMultiplier only where a layout would break.
 */
function AppText({
  variant = 'body',
  color = 'textPrimary',
  align,
  strikethrough,
  style,
  ...rest
}: AppTextProps) {
  const { typography, colors } = useTheme();
  return (
    <Text
      allowFontScaling
      {...rest}
      style={[
        typography[variant],
        { color: colors[color], textAlign: align },
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
