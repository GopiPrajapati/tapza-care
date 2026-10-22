import React, { memo } from 'react';
import { Image, useWindowDimensions, View } from 'react-native';
import { Stethoscope } from 'lucide-react-native';

import { getImage } from '../../../assets/images';
import { formatInr } from '../../../commonutils/helpers';
import {
  useTheme,
  useThemedStyles,
  type Theme,
} from '../../../commonutils/theme';
import AppText from '../../../components/AppText';
import Badge from '../../../components/Badge';
import Card from '../../../components/Card';
import PriceText from '../../../components/PriceText';
import SectionHeader from '../../../components/SectionHeader';
import { Routes } from '../../../container/Routes';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import type {
  ServiceGridSection,
  ServiceItem,
} from '../../../networking/types/configSchema';
import { useTranslateContent } from '../../../i18n/useTranslateContent';

/** 2- or 3-column grid of clinic services; a tap opens booking with that service's doctor. */
function ServiceGrid({ section }: { section: ServiceGridSection }) {
  const translate = useTranslateContent();
  const styles = useThemedStyles(createStyles);
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const navigation = useAppNavigation();
  const cardWidth =
    (width - spacing.lg * 2 - spacing.md * (section.columns - 1)) /
    section.columns;

  return (
    <View style={styles.wrapper}>
      {section.title ? (
        <SectionHeader title={translate(section.title)} />
      ) : null}
      <View style={styles.grid}>
        {section.items.map(item => (
          <ServiceCard
            key={item.id}
            item={item}
            width={cardWidth}
            onPress={() =>
              navigation.navigate(Routes.DoctorDetails, {
                doctorId: item.doctorId,
                serviceId: item.id,
              })
            }
          />
        ))}
      </View>
    </View>
  );
}

const ServiceCard = memo(function ServiceCardView({
  item,
  width,
  onPress,
}: {
  item: ServiceItem;
  width: number;
  onPress: () => void;
}) {
  const translate = useTranslateContent();
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  const image = getImage(item.imageKey);

  return (
    <Card
      flush
      onPress={onPress}
      accessibilityLabel={`${translate(item.name)}, ${formatInr(
        item.priceInr,
      )}${item.badge ? `, ${translate(item.badge)}` : ''}`}
      style={{ width }}
    >
      <View style={[styles.media, { height: width * 0.62 }]}>
        {image ? (
          <Image source={image} style={styles.image} />
        ) : (
          <Stethoscope size={sizes.iconXl} color={colors.primaryText} />
        )}
        {item.badge ? (
          <View style={styles.badge}>
            <Badge label={translate(item.badge)} />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <AppText variant="label" numberOfLines={2}>
          {translate(item.name)}
        </AppText>
        <PriceText amount={item.priceInr} />
      </View>
    </Card>
  );
});

const createStyles = ({ colors, spacing, radii }: Theme) => ({
  wrapper: { gap: spacing.md },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  media: {
    alignItems: 'center' as const,
    // Icon sits low so a badge in the top-left corner never covers it.
    justifyContent: 'flex-end' as const,
    paddingBottom: spacing.md,
    backgroundColor: colors.muted,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden' as const,
  },
  image: { width: '100%' as const, height: '100%' as const },
  badge: { position: 'absolute' as const, top: spacing.sm, left: spacing.sm },
  body: { padding: spacing.md, gap: spacing.xs },
});

export default ServiceGrid;
