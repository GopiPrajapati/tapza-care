import React from 'react';
import { View } from 'react-native';

import {
  useTheme,
  useThemedStyles,
  useTone,
  type Theme,
} from '../../../commonutils/theme';
import AppText from '../../../components/AppText';
import { getIcon } from '../../../components/Icon';
import PressableScale from '../../../components/PressableScale';
import { useSectionAction } from '../../../hooks/useSectionAction';
import type {
  OfferItem,
  OfferStripSection,
} from '../../../networking/types/configSchema';

/** Thin coloured band with one or more short messages. */
function OfferStrip({ section }: { section: OfferStripSection }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.list}>
      {section.items.map(item => (
        <OfferRow key={item.id} item={item} />
      ))}
    </View>
  );
}

function OfferRow({ item }: { item: OfferItem }) {
  const styles = useThemedStyles(createStyles);
  const { sizes, colors } = useTheme();
  const tone = useTone();
  const onAction = useSectionAction();
  const IconComponent = getIcon(item.icon ?? 'sparkles');
  const content = (
    <>
      <IconComponent
        size={sizes.iconMd}
        color={tone?.foreground ?? colors.textPrimary}
      />
      <AppText variant="bodyStrong" style={styles.message}>
        {item.message}
      </AppText>
    </>
  );

  if (item.action && item.action.type !== 'none') {
    return (
      <PressableScale
        accessibilityLabel={item.message}
        onPress={() => onAction(item.action)}
        style={styles.row}
      >
        {content}
      </PressableScale>
    );
  }
  return (
    <View style={styles.row} accessible accessibilityLabel={item.message}>
      {content}
    </View>
  );
}

const createStyles = ({ spacing, sizes }: Theme) => ({
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    minHeight: sizes.minTouch,
  },
  message: { flex: 1 },
});

export default OfferStrip;
