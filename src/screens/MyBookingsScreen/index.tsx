import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { formatClinicDay, formatClinicTime } from '../../commonutils/helpers';
import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../../components/AppText';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PriceText from '../../components/PriceText';
import ScreenContainer from '../../components/ScreenContainer';
import { SkeletonBox, SkeletonGroup } from '../../components/Skeleton';
import { Routes, type TabScreenProps } from '../../container/Routes';
import { useMyBookings } from '../../hooks/useBookings';
import { useDoctors } from '../../hooks/useDoctors';
import type { Booking, Doctor } from '../../networking/types/models';
import { useTranslation } from 'react-i18next';

type BookingFilter = 'upcoming' | 'past';

function MyBookingsScreen({
  navigation,
}: TabScreenProps<typeof Routes.Bookings>) {
  const [filter, setFilter] = useState<BookingFilter>('upcoming');
  const { t } = useTranslation();
  const bookingsQuery = useMyBookings();
  const doctorsQuery = useDoctors();
  const styles = useThemedStyles(createStyles);
  const doctors = doctorsQuery.data ?? [];

  const filteredBookings = useMemo(() => {
    const now = Date.now();
    return (bookingsQuery.data ?? [])
      .filter(booking =>
        filter === 'upcoming'
          ? Date.parse(booking.startsAt) >= now
          : Date.parse(booking.startsAt) < now,
      )
      .sort((a, b) =>
        filter === 'upcoming'
          ? Date.parse(a.startsAt) - Date.parse(b.startsAt)
          : Date.parse(b.startsAt) - Date.parse(a.startsAt),
      );
  }, [bookingsQuery.data, filter]);

  if (bookingsQuery.isPending) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <BookingsSkeleton />
      </ScreenContainer>
    );
  }

  if (bookingsQuery.isError) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <ErrorState
          title={t('bookingsError')}
          onRetry={() => bookingsQuery.refetch()}
          retrying={bookingsQuery.isFetching}
        />
      </ScreenContainer>
    );
  }

  const allBookings = bookingsQuery.data ?? [];
  const trulyEmpty = allBookings.length === 0;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <AppText variant="heading" accessibilityRole="header">
            {t('myBookings')}
          </AppText>
          <AppText color="textSecondary">{t('myClinicVisits')}</AppText>
        </View>
        <View style={styles.filters}>
          <Chip
            label={t('upcoming')}
            selected={filter === 'upcoming'}
            onPress={() => setFilter('upcoming')}
          />
          <Chip
            label={t('past')}
            selected={filter === 'past'}
            onPress={() => setFilter('past')}
          />
        </View>
        {filteredBookings.length === 0 ? (
          <EmptyState
            title={
              trulyEmpty
                ? t('noBookings')
                : t('noFilterBookings', { filter: t(filter) })
            }
            message={trulyEmpty ? t('bookDoctorPrompt') : t('otherBookingsTab')}
            illustration="bookings"
            actionLabel={t('bookADoctor')}
            onAction={() => navigation.navigate(Routes.DoctorList)}
          />
        ) : (
          <FlatList
            data={filteredBookings}
            keyExtractor={booking => booking.id}
            renderItem={({ item }) => (
              <BookingCard
                booking={item}
                doctor={doctors.find(
                  candidate => candidate.id === item.doctorId,
                )}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshing={bookingsQuery.isRefetching}
            onRefresh={bookingsQuery.refetch}
          />
        )}
        {doctorsQuery.isError ? (
          <AppText
            variant="caption"
            color="textSecondary"
            style={styles.doctorDataNote}
          >
            {t('doctorDataUnavailable')}
          </AppText>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

function BookingCard({
  booking,
  doctor,
}: {
  booking: Booking;
  doctor?: Doctor;
}) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const confirmed = booking.status === 'confirmed';
  const clinicParts = (doctor?.clinicName ?? 'Tapza Clinic').split(',');
  const date = formatClinicDay(booking.startsAt.slice(0, 10), Date.now());

  return (
    <Card style={styles.bookingCard}>
      <View
        style={styles.cardTop}
        accessible
        accessibilityLabel={t('bookingCardAccessibility', {
          doctor: doctor?.name ?? t('doctorAppointment'),
          date,
          time: formatClinicTime(booking.startsAt),
          status: confirmed ? t('confirmed') : t('pending'),
        })}
      >
        {doctor ? (
          <Avatar name={doctor.name} image={doctor.photoUrl} size="md" />
        ) : null}
        <View style={styles.doctorInfo}>
          <AppText variant="bodyStrong">
            {doctor?.name ?? t('doctorAppointment')}
          </AppText>
          {doctor ? (
            <AppText variant="caption" color="textSecondary">
              {doctor.specialty}
            </AppText>
          ) : null}
        </View>
        <Badge
          label={confirmed ? t('confirmed') : t('pending')}
          tone={confirmed ? 'success' : 'warning'}
        />
      </View>
      <View style={styles.detailLine}>
        <AppText variant="label">{date}</AppText>
        <AppText variant="label">{formatClinicTime(booking.startsAt)}</AppText>
      </View>
      <View style={styles.cardBottom}>
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {clinicParts[0]?.trim()}
          {clinicParts.length > 1
            ? ` · ${clinicParts.slice(1).join(',').trim()}`
            : ''}
        </AppText>
        {doctor ? <PriceText amount={doctor.feeInr} /> : null}
      </View>
      <View
        style={[
          styles.statusRail,
          { backgroundColor: confirmed ? colors.success : colors.warning },
        ]}
      />
    </Card>
  );
}

function BookingsSkeleton() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  return (
    <SkeletonGroup
      style={styles.skeleton}
      accessibilityLabel={t('loadingBookings')}
    >
      <SkeletonBox height={34} width={180} />
      <View style={styles.filters}>
        <SkeletonBox width={112} height={48} radius={24} />
        <SkeletonBox width={80} height={48} radius={24} />
      </View>
      {[0, 1, 2].map(item => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonRow}>
            <SkeletonBox width={56} height={56} radius={28} />
            <View style={styles.skeletonDoctor}>
              <SkeletonBox width="75%" height={18} />
              <SkeletonBox width="50%" height={14} />
            </View>
          </View>
          <SkeletonBox height={18} width="65%" />
          <SkeletonBox height={16} width="80%" />
        </View>
      ))}
    </SkeletonGroup>
  );
}

const createStyles = ({ colors, spacing, radii, sizes, elevation }: Theme) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  filters: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  bookingCard: {
    gap: spacing.md,
    overflow: 'hidden' as const,
    ...elevation.card,
  },
  cardTop: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  doctorInfo: { flex: 1, gap: spacing.xs },
  detailLine: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: sizes.hairline,
    borderTopColor: colors.border,
  },
  cardBottom: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.sm,
  },
  statusRail: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: sizes.border,
  },
  skeleton: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  skeletonCard: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  skeletonDoctor: { flex: 1, gap: spacing.sm },
  doctorDataNote: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});

export default MyBookingsScreen;
