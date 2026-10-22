import React, { memo } from 'react';

import { useThemedStyles, type Theme } from '../../../commonutils/theme';
import type { Section } from '../../../networking/types/configSchema';
import { COMPACT_SECTION_TYPES, renderSection } from './registry';
import SectionBackground from './SectionBackground';

/** One home section painted on its own config background (the "bands" of the home screen). */
function SectionBlock({ section }: { section: Section }) {
  const styles = useThemedStyles(createStyles);
  return (
    <SectionBackground
      background={section.background}
      style={
        COMPACT_SECTION_TYPES.has(section.type) ? styles.compact : styles.block
      }
    >
      {renderSection(section)}
    </SectionBackground>
  );
}

const createStyles = ({ spacing }: Theme) => ({
  block: { paddingVertical: spacing.xl },
  compact: { paddingVertical: spacing.md },
});

export default memo(SectionBlock);
