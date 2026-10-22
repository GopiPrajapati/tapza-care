import React from 'react';
import { ScrollView, View } from 'react-native';

import { useThemedStyles, type Theme } from '../../../commonutils/theme';
import Chip from '../../../components/Chip';
import SectionHeader from '../../../components/SectionHeader';
import { useSectionAction } from '../../../hooks/useSectionAction';
import type { CategoryChipsSection } from '../../../networking/types/configSchema';

/** Horizontal shortcut chips (Consult, Lab tests, Pharmacy…). */
function CategoryChips({ section }: { section: CategoryChipsSection }) {
  const styles = useThemedStyles(createStyles);
  const onAction = useSectionAction();

  return (
    <View style={styles.wrapper}>
      {section.title ? <SectionHeader title={section.title} /> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {section.items.map(item => (
          <Chip
            key={item.id}
            label={item.label}
            icon={item.icon}
            onPress={() => onAction(item.action)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = ({ spacing }: Theme) => ({
  wrapper: { gap: spacing.md },
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg },
});

export default CategoryChips;
