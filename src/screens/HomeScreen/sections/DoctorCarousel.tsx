import React, { memo, useMemo } from 'react';
import { FlatList, View } from 'react-native';

import { formatInr } from '../../../commonutils/helpers';
import {
  useTheme,
  useThemedStyles,
  type Theme,
} from '../../../commonutils/theme';
import AppText from '../../../components/AppText';
import Avatar from '../../../components/Avatar';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import NextSlotBadge from '../../../components/NextSlotBadge';
import PriceText from '../../../components/PriceText';
import SectionHeader from '../../../components/SectionHeader';
import {
  SkeletonCircle,
  SkeletonGroup,
  SkeletonText,
} from '../../../components/Skeleton';
import { Routes } from '../../../container/Routes';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { useDoctors } from '../../../hooks/useDoctors';
import type { DoctorCarouselSection } from '../../../networking/types/configSchema';
import type { Doctor } from '../../../networking/types/models';

const PLACEHOLDER_COUNT = 3;

/** Horizontal doctor cards with each doctor's next free slot. */
function DoctorCarousel({ section }: { section: DoctorCarouselSection }) {
  const styles = useThemedStyles(createStyles);
  const navigation = useAppNavigation();
  const { data, isPending, isError, refetch, isRefetching } = useDoctors();

  // Keep config order; skip ids the doctors list does not have.
  const doctors = useMemo(() => {
    const byId = new Map(data?.map(doctor => [doctor.id, doctor]));
    return section.items.flatMap(({ doctorId }) => byId.get(doctorId) ?? []);
  }, [data, section.items]);

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        title={section.title ?? 'Doctors'}
        onSeeAll={() => navigation.navigate(Routes.DoctorList)}
      />
      {isPending ? (
        <DoctorCardsSkeleton />
      ) : isError ? (
        <View style={styles.inlineError}>
          <AppText color="textSecondary" style={styles.flex}>
            Could not load doctors.
          </AppText>
          <Button
            label="Retry"
            variant="ghost"
            onPress={() => refetch()}
            loading={isRefetching}
          />
        </View>
      ) : (
        <FlatList
          horizontal
          data={doctors}
          keyExtractor={doctor => doctor.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          renderItem={({ item }) => (
            <DoctorCard
              doctor={item}
              onPress={() =>
                navigation.navigate(Routes.DoctorDetails, { doctorId: item.id })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const DoctorCard = memo(function DoctorCardView({
  doctor,
  onPress,
}: {
  doctor: Doctor;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${doctor.name}, ${doctor.specialty}, fee ${formatInr(
        doctor.feeInr,
      )}`}
      style={styles.card}
    >
      <View style={styles.cardTop}>
        <Avatar name={doctor.name} image={doctor.photoUrl} />
        <View style={styles.flex}>
          <AppText variant="bodyStrong" numberOfLines={2}>
            {doctor.name}
          </AppText>
          <AppText variant="caption" color="primaryText">
            {doctor.specialty}
          </AppText>
        </View>
      </View>
      <AppText variant="caption" color="textSecondary" numberOfLines={1}>
        {doctor.languages.join(' · ')}
      </AppText>
      <View style={styles.cardBottom}>
        <PriceText amount={doctor.feeInr} />
        <NextSlotBadge doctorId={doctor.id} />
      </View>
    </Card>
  );
});

function DoctorCardsSkeleton() {
  const styles = useThemedStyles(createStyles);
  const { sizes } = useTheme();
  return (
    <SkeletonGroup accessibilityLabel="Loading doctors" style={styles.row}>
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <View key={index} style={[styles.card, styles.skeletonCard]}>
          <View style={styles.cardTop}>
            <SkeletonCircle size={sizes.avatarMd} />
            <View style={styles.flex}>
              <SkeletonText lines={2} />
            </View>
          </View>
          <SkeletonText lines={1} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  wrapper: { gap: spacing.md },
  row: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  card: { width: sizes.carouselCard, gap: spacing.sm },
  skeletonCard: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  cardTop: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  cardBottom: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  flex: { flex: 1 },
  inlineError: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
  },
});

export default DoctorCarousel;
