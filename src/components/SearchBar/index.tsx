import React from 'react';
import { TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';

import {
  SurfaceTone,
  useTheme,
  useThemedStyles,
  type Theme,
} from '../../commonutils/theme';
import { MAX_FONT_SCALE_DENSE } from '../../commonutils/typography';
import AppText from '../AppText';
import PressableScale from '../PressableScale';

interface SearchBarBaseProps {
  placeholder: string;
  /** Right-side pill, like Zepto's "Meat Market" shortcut. */
  rightSlot?: React.ReactNode;
}

/**
 * Either an editable search field (value + onChangeText) or, on Home, a button that opens search (onPress).
 */
export type SearchBarProps = SearchBarBaseProps &
  (
    | {
        value: string;
        onChangeText: (text: string) => void;
        onPress?: undefined;
      }
    | { onPress: () => void; value?: undefined; onChangeText?: undefined }
  );

function SearchBar({
  placeholder,
  rightSlot,
  value,
  onChangeText,
  onPress,
}: SearchBarProps) {
  const { colors, sizes } = useTheme();
  const styles = useThemedStyles(createStyles);

  const field = onPress ? (
    <PressableScale
      accessibilityRole="search"
      accessibilityLabel={placeholder}
      onPress={onPress}
      scaleTo={0.99}
      style={styles.field}
    >
      <Search size={sizes.iconMd} color={colors.textSecondary} />
      <AppText color="textSecondary" numberOfLines={1} style={styles.flex}>
        {placeholder}
      </AppText>
    </PressableScale>
  ) : (
    <View style={styles.field}>
      <Search size={sizes.iconMd} color={colors.textSecondary} />
      <TextInput
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primaryText}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        maxFontSizeMultiplier={MAX_FONT_SCALE_DENSE}
        style={[styles.input, styles.flex]}
      />
      {value ? (
        <PressableScale
          accessibilityLabel="Clear search"
          onPress={() => onChangeText?.('')}
          hitSlop={sizes.minTouch / 4}
          style={styles.clear}
        >
          <X size={sizes.iconSm} color={colors.textSecondary} />
        </PressableScale>
      ) : null}
    </View>
  );

  return (
    <SurfaceTone>
      <View style={styles.container}>
        {field}
        {rightSlot ? (
          <>
            <View style={styles.divider} />
            {rightSlot}
          </>
        ) : null}
      </View>
    </SurfaceTone>
  );
}

const createStyles = ({
  colors,
  spacing,
  radii,
  sizes,
  typography,
  elevation,
}: Theme) => ({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    minHeight: sizes.controlLarge,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.md,
    borderRadius: radii.lg,
    borderWidth: sizes.border,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...elevation.card,
  },
  field: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    minHeight: sizes.minTouch,
  },
  flex: { flex: 1 },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  clear: {
    width: sizes.iconXl,
    height: sizes.iconXl,
    borderRadius: radii.pill,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.muted,
  },
  divider: {
    width: sizes.border,
    alignSelf: 'stretch' as const,
    backgroundColor: colors.border,
  },
});

export default SearchBar;
