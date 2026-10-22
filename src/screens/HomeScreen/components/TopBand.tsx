import React from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useThemedStyles, type Theme } from '../../../commonutils/theme';
import type { Section } from '../../../networking/types/configSchema';
import { renderSection } from '../sections/registry';
import SectionBackground from '../sections/SectionBackground';
import { useHomeScroll } from './HomeScrollContext';

const PARALLAX_RATE = 0.35;
const OVERSCROLL_SCALE_DISTANCE = 900;

export interface TopBandProps {
  section: Section;
  /** Height of the floating header, which sits over the top of this band. */
  headerHeight: number;
}

/**
 * Zepto's top band: the first config section painted on its background with rounded bottom corners. The floating
 * header covers its top part, and the section content moves slower than the scroll (parallax).
 */
function TopBand({ section, headerHeight }: TopBandProps) {
  const styles = useThemedStyles(createStyles);
  const { scrollY, reduceMotion } = useHomeScroll();

  const parallaxStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return {};
    }
    const y = scrollY.value;
    return {
      opacity: interpolate(y, [0, 260], [1, 0.35], Extrapolation.CLAMP),
      transform: [
        { translateY: y > 0 ? y * PARALLAX_RATE : 0 },
        { scale: y < 0 ? 1 - y / OVERSCROLL_SCALE_DISTANCE : 1 },
      ],
    };
  }, [reduceMotion]);

  return (
    <SectionBackground
      background={section.background}
      style={[styles.band, { paddingTop: headerHeight + styles.band.gap }]}
    >
      <Animated.View style={parallaxStyle}>
        {renderSection(section)}
      </Animated.View>
    </SectionBackground>
  );
}

const createStyles = ({ spacing, radii }: Theme) => ({
  band: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    overflow: 'hidden' as const,
  },
});

export default TopBand;
