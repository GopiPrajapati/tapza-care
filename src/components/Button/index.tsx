import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import {
  useTheme,
  useThemedStyles,
  type Theme,
  type ThemeColors,
} from '../../commonutils/theme';
import { MAX_FONT_SCALE_DENSE } from '../../commonutils/typography';
import AppText from '../AppText';
import PressableScale from '../PressableScale';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** "large" for the main action of a screen. */
  size?: 'regular' | 'large';
  disabled?: boolean;
  /** Shows a spinner and ignores presses. */
  loading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
  /** Defaults to the label. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_COLORS: Record<
  ButtonVariant,
  { background: keyof ThemeColors | null; foreground: keyof ThemeColors }
> = {
  primary: { background: 'primary', foreground: 'onPrimary' },
  secondary: { background: 'muted', foreground: 'primaryText' },
  ghost: { background: null, foreground: 'primaryText' },
  danger: { background: 'danger', foreground: 'onDanger' },
};

function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  disabled = false,
  loading = false,
  icon: Icon,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { colors, sizes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { background, foreground } = VARIANT_COLORS[variant];
  const inactive = disabled || loading;

  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={[
        styles.base,
        size === 'large' && styles.large,
        background && { backgroundColor: colors[background] },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={[styles.content, loading && styles.hidden]}>
        {Icon ? <Icon size={sizes.iconMd} color={colors[foreground]} /> : null}
        <AppText
          variant={size === 'large' ? 'bodyStrong' : 'label'}
          color={foreground}
          numberOfLines={1}
          maxFontSizeMultiplier={MAX_FONT_SCALE_DENSE}
        >
          {label}
        </AppText>
      </View>
      {loading ? (
        <ActivityIndicator
          color={colors[foreground]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </PressableScale>
  );
}

const createStyles = ({ spacing, radii, sizes }: Theme) => ({
  base: {
    minHeight: sizes.control,
    minWidth: sizes.minTouch,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  large: { minHeight: sizes.controlLarge },
  fullWidth: { alignSelf: 'stretch' as const },
  disabled: { opacity: 0.45 },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  hidden: { opacity: 0 },
});

export default Button;
