import React from 'react';

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
  /** Config icon name. */
  icon?: string;
}

/** Pill-shaped filter or category chip. Selected chips use the brand colour. */
function Chip({ label, onPress, selected = false, icon }: ChipProps) {
  const styles = useThemedStyles(createStyles);
  const foreground = selected ? 'onPrimary' : 'textPrimary';

  return (
    <SurfaceTone>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        onPress={onPress}
        style={[styles.chip, selected && styles.selected]}
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
});

export default Chip;
