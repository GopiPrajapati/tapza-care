import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';
import Button from '../Button';
import PriceText from '../PriceText';

export interface StickyActionBarProps {
  /** Small label above the amount, e.g. "Consultation". */
  label: string;
  amountInr?: number;
  /** Extra line, e.g. "Thu 23 Oct, 4:30 PM". */
  caption?: string;
  buttonLabel: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/** Bottom bar with a summary on the left and the main action on the right, like Zepto's "To Pay | Pay Now". */
function StickyActionBar({
  label,
  amountInr,
  caption,
  buttonLabel,
  onPress,
  disabled,
  loading,
}: StickyActionBarProps) {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, styles.bar.paddingTop) },
      ]}
    >
      <View style={styles.summary}>
        <AppText variant="caption" color="textSecondary">
          {label}
        </AppText>
        {amountInr !== undefined ? (
          <PriceText amount={amountInr} variant="title" />
        ) : null}
        {caption ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {caption}
          </AppText>
        ) : null}
      </View>
      <Button
        label={buttonLabel}
        onPress={onPress}
        size="large"
        disabled={disabled}
        loading={loading}
        style={styles.button}
      />
    </View>
  );
}

const createStyles = ({ colors, spacing, sizes }: Theme) => ({
  bar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: sizes.hairline,
    borderTopColor: colors.border,
  },
  summary: { flex: 1 },
  button: { flex: 1.2 },
});

export default StickyActionBar;
