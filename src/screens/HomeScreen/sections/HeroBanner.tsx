import React from 'react';
import { Image, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';

import { getImage } from '../../../assets/images';
import { PATIENT } from '../../../commonutils/constants';
import { greetingFor } from '../../../commonutils/helpers';
import {
  useTheme,
  useThemedStyles,
  useTone,
  type Theme,
} from '../../../commonutils/theme';
import AppText from '../../../components/AppText';
import Button from '../../../components/Button';
import { useConfig } from '../../../hooks/useConfig';
import { useSectionAction } from '../../../hooks/useSectionAction';
import type { HeroBannerSection } from '../../../networking/types/configSchema';
import HeroArt from './HeroArt';

/** Greeting, festival wish, headline and one call to action, with an image or drawn illustration. */
function HeroBanner({ section }: { section: HeroBannerSection }) {
  const styles = useThemedStyles(createStyles);
  const { sizes } = useTheme();
  const tone = useTone();
  const onAction = useSectionAction();
  const festival = useConfig().config.theme.festival;
  const item = section.items[0];
  const image = getImage(item.imageKey);

  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <AppText variant="label" color="textSecondary">
          {greetingFor(Date.now())}, {PATIENT.firstName}
        </AppText>
        {festival ? (
          <View style={styles.festival}>
            <Sparkles size={sizes.iconSm} color={tone?.accent} />
            <AppText variant="label" style={styles.flex}>
              {festival.greeting}
            </AppText>
          </View>
        ) : null}
        <AppText variant="title" accessibilityRole="header">
          {item.title}
        </AppText>
        {item.subtitle ? (
          <AppText color="textSecondary">{item.subtitle}</AppText>
        ) : null}
        {item.ctaLabel ? (
          <Button
            label={item.ctaLabel}
            variant="secondary"
            onPress={() => onAction(item.action)}
            style={styles.cta}
          />
        ) : null}
      </View>
      {image ? (
        <Image
          source={image}
          style={styles.image}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <HeroArt festive={Boolean(festival)} />
      )}
    </View>
  );
}

const createStyles = ({ spacing, sizes, radii }: Theme) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  texts: { flex: 1, gap: spacing.xs },
  festival: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  flex: { flex: 1 },
  cta: { alignSelf: 'flex-start' as const, marginTop: spacing.sm },
  image: {
    width: sizes.heroArt,
    height: sizes.heroArt,
    borderRadius: radii.lg,
  },
});

export default HeroBanner;
