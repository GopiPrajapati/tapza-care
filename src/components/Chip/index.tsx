import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  SurfaceTone,
  useThemedStyles,
  type Theme,
} from '../../commonutils/theme';
import { MAX_FONT_SCALE_DENSE } from '../../commonutils/typography';
import AppText from '../AppText';
import Icon from '../Icon';
import PressableScale from '../PressableScale';

export interface ChipProps {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Config icon name. */
  icon?: string;
}

/** Pill-shaped filter or category chip. Selected chips use the brand colour. */
function Chip({
  label,
  onPress,
  selected = false,
  disabled = false,
  style,
  icon,
}: ChipProps) {
  const styles = useThemedStyles(createStyles);
  const foreground = disabled
    ? 'textSecondary'
    : selected
    ? 'onPrimary'
    : 'textPrimary';

  return (
    <SurfaceTone>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.chip,
          selected && styles.selected,
          disabled && styles.disabled,
          style,
        ]}
      >
        {icon ? (
          <Icon name={icon} color={selected ? 'onPrimary' : 'primaryText'} />
        ) : null}
        <AppText
          variant="label"
          color={foreground}
          maxFontSizeMultiplier={MAX_FONT_SCALE_DENSE}
        >
          {label}
        </AppText>
      </PressableScale>
    </SurfaceTone>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    minHeight: sizes.minTouch,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: sizes.border,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  disabled: { backgroundColor: colors.muted, opacity: 0.7 },
});

export default Chip;
