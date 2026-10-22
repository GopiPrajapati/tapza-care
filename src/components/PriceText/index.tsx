import React from 'react';
import { View } from 'react-native';

import { formatInr } from '../../commonutils/helpers';
import { useThemedStyles, type Theme } from '../../commonutils/theme';
import type { TypographyVariant } from '../../commonutils/typography';
import AppText from '../AppText';

export interface PriceTextProps {
  amount: number;
  /** Original price, shown struck through when higher than amount. */
  mrp?: number;
  variant?: TypographyVariant;
}

/** ₹ amount with Indian digit grouping, optionally with a struck-through MRP. */
function PriceText({ amount, mrp, variant = 'bodyStrong' }: PriceTextProps) {
  const styles = useThemedStyles(createStyles);
  const showMrp = mrp !== undefined && mrp > amount;
  const label = showMrp
    ? `${formatInr(amount)}, was ${formatInr(mrp)}`
    : formatInr(amount);

  return (
    <View style={styles.row} accessible accessibilityLabel={label}>
      <AppText variant={variant}>{formatInr(amount)}</AppText>
      {showMrp ? (
        <AppText variant="caption" color="textSecondary" strikethrough>
          {formatInr(mrp)}
        </AppText>
      ) : null}
    </View>
  );
}

const createStyles = ({ spacing }: Theme) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: spacing.xs,
  },
});

export default PriceText;
