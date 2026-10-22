import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CalendarDays, Clock3, MapPin } from 'lucide-react-native';
import { trigger } from 'react-native-haptic-feedback';

import {
  clinicDate,
  daysBetween,
  formatClinicDay,
  formatClinicTime,
  getAppLocaleTag,
} from '../../commonutils/helpers';
import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../../components/AppText';
import Avatar from '../../components/Avatar';
import BottomSheet from '../../components/BottomSheet';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PriceText from '../../components/PriceText';
import PressableScale from '../../components/PressableScale';
import { SkeletonBox, SkeletonGroup } from '../../components/Skeleton';
import StickyActionBar from '../../components/StickyActionBar';
import { useToast } from '../../components/Toast';
import ScreenContainer from '../../components/ScreenContainer';
import { useDoctor } from '../../hooks/useDoctors';
import { useSlotsForDates } from '../../hooks/useSlots';
import { useCreateBooking } from '../../hooks/useBookings';
import { useConfig } from '../../hooks/useConfig';
import type { Slot } from '../../networking/types/models';
import { Routes, type RootStackScreenProps } from '../../container/Routes';
import { useTranslation } from 'react-i18next';

const DATE_COUNT = 7;
const SHEET_SNAP_POINTS = ['45%', '90%'];
const SLOT_GROUPS = [
  { labelKey: 'morning', from: 5, to: 12 },
  { labelKey: 'afternoon', from: 12, to: 17 },
  { labelKey: 'evening', from: 17, to: 24 },
] as const;

function getSlotHour(slot: Slot): number {
  return Number(slot.startsAt.slice(11, 13));
}

function DoctorDetailsScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof Routes.DoctorDetails>) {
  const { t } = useTranslation();
  const doctorId = route.params?.doctorId;
  const serviceId = route.params?.serviceId;
  const { doctor, isLoading, isError, refetch, isFetching } = useDoctor(
    doctorId ?? '',
  );
  const { config } = useConfig();
  const today = useMemo(() => clinicDate(Date.now()), []);
  const dates = useMemo(
    () =>
      Array.from({ length: DATE_COUNT }, (_, index) =>
        clinicDate(Date.parse(`${today}T00:00:00Z`), index),
      ),
    [today],
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const recoveryMessage = useRef<string | null>(null);
  const handledFailureAt = useRef(0);
  const { show: showToast } = useToast();
  const {
    mutateOnce: submitBooking,
    isPending: bookingPending,
    isError: bookingFailed,
    isSlotTaken,
    submittedAt,
  } = useCreateBooking();
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();

  const slotQueries = useSlotsForDates(doctorId, dates);
  const selectedIndex = Math.max(0, dates.indexOf(selectedDate));
  const selectedQuery = slotQueries[selectedIndex];
  const availableNextIndex = slotQueries.findIndex(
    (query, index) =>
      index > selectedIndex && query.data?.some(slot => slot.available),
  );

  const service = useMemo(() => {
    if (!serviceId) return undefined;
    for (const section of config.sections) {
      if (section.type !== 'service_grid') continue;
      const item = section.items.find(
        value =>
          typeof value === 'object' &&
          value !== null &&
          'id' in value &&
          value.id === serviceId,
      );
      if (
        item &&
        typeof item === 'object' &&
        'name' in item &&
        'priceInr' in item
      ) {
        return {
          name: String(item.name),
          priceInr: Number(item.priceInr),
        };
      }
    }
    return undefined;
  }, [config.sections, serviceId]);

  const openSheet = useCallback(() => sheetRef.current?.present(), []);
  const selectDate = useCallback(
    (date: string) => {
      setSelectedDate(date);
      setSelectedSlot(null);
      openSheet();
    },
    [openSheet],
  );
  const goToNextAvailableDay = useCallback(() => {
    if (availableNextIndex >= 0) {
      setSelectedDate(dates[availableNextIndex]);
      setSelectedSlot(null);
    }
  }, [availableNextIndex, dates]);

  useFocusEffect(
    useCallback(() => {
      if (recoveryMessage.current) {
        sheetRef.current?.present();
        showToast({ message: recoveryMessage.current, tone: 'error' });
        recoveryMessage.current = null;
      }
    }, [showToast]),
  );

  useEffect(() => {
    if (!bookingFailed || handledFailureAt.current === submittedAt) {
      return;
    }
    handledFailureAt.current = submittedAt;
    recoveryMessage.current = isSlotTaken ? t('slotTaken') : t('bookingFailed');
    setSelectedSlot(null);
    trigger('notificationError');
    navigation.goBack();
  }, [bookingFailed, isSlotTaken, submittedAt, navigation, t]);

  const confirmBooking = useCallback(() => {
    if (!selectedSlot || !doctorId || bookingPending) return;
    const slot = selectedSlot;
    const started = submitBooking(
      { doctorId, slot },
      { onSuccess: () => trigger('notificationSuccess') },
    );
    if (!started) return;
    navigation.navigate(Routes.BookingSuccess, {
      bookingId: `pending-${slot.id}`,
      doctorId,
      slotId: slot.id,
      serviceId,
    });
  }, [
    bookingPending,
    submitBooking,
    doctorId,
    navigation,
    selectedSlot,
    serviceId,
  ]);

  if (!doctorId) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <EmptyState
          title={t('doctorNotFound')}
          message={t('doctorOpenError')}
          actionLabel={t('back')}
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <DoctorDetailsSkeleton />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState
          title={t('doctorLoadError')}
          message={t('pleaseTryAgain')}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      </ScreenContainer>
    );
  }

  if (!doctor) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <EmptyState
          title={t('doctorNotFound')}
          message={t('doctorUnavailable')}
          actionLabel={t('back')}
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  const fee = service?.priceInr ?? doctor.feeInr;
  const clinicParts = (
    doctor.clinicName ?? 'Tapza Clinic, Kondapur, Hyderabad'
  ).split(',');
  const clinicName = clinicParts[0]?.trim() || 'Tapza Clinic';
  const clinicArea = clinicParts.slice(1).join(',').trim();
  const daySlots = selectedQuery?.data ?? [];
  const slotsByGroup = SLOT_GROUPS.map(group => ({
    ...group,
    slots: daySlots.filter(
      slot => getSlotHour(slot) >= group.from && getSlotHour(slot) < group.to,
    ),
  })).filter(group => group.slots.length > 0);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.doctorCard}>
            <View style={styles.doctorTop}>
              <Avatar name={doctor.name} image={doctor.photoUrl} size="lg" />
              <View style={styles.doctorDetails}>
                <AppText variant="title">{doctor.name}</AppText>
                <AppText color="textSecondary">{t(doctor.specialty)}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('speaksLanguages', {
                    languages: doctor.languages
                      .map(language => t(language))
                      .join(' · '),
                  })}
                </AppText>
              </View>
            </View>
            <View style={styles.clinicRow}>
              <MapPin size={sizes.iconSm} color={colors.primaryText} />
              <View style={styles.clinicText}>
                <AppText variant="label">{clinicName}</AppText>
                {clinicArea ? (
                  <AppText variant="caption" color="textSecondary">
                    {clinicArea}
                  </AppText>
                ) : null}
              </View>
              <View style={styles.fee}>
                <AppText variant="caption" color="textSecondary">
                  {service ? t('serviceFee') : t('consultation')}
                </AppText>
                <PriceText amount={fee} variant="title" />
              </View>
            </View>
            {service ? (
              <View style={styles.serviceSelection}>
                <AppText variant="caption" color="textSecondary">
                  {t('selectedService')}
                </AppText>
                <AppText variant="bodyStrong">{t(service.name)}</AppText>
              </View>
            ) : null}
          </Card>

          <View style={styles.sectionHeading}>
            <View style={styles.headingText}>
              <AppText variant="title">{t('chooseDate')}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('appointmentsNext7Days')}
              </AppText>
            </View>
            <CalendarDays size={sizes.iconMd} color={colors.primaryText} />
          </View>

          <FlatList
            horizontal
            data={dates}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
            renderItem={({ item }) => (
              <DateChoice
                date={item}
                today={today}
                selected={item === selectedDate}
                onPress={() => selectDate(item)}
              />
            )}
          />

          <Card style={styles.timeCard}>
            <View style={styles.timeHeader}>
              <View style={styles.headingText}>
                <AppText variant="title">{t('chooseTime')}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {selectedSlot
                    ? formatClinicTime(selectedSlot.startsAt)
                    : formatClinicDay(selectedDate, Date.now())}
                </AppText>
              </View>
              <Clock3 size={sizes.iconMd} color={colors.primaryText} />
            </View>
            <Button
              label={t('chooseTimeButton')}
              variant="secondary"
              onPress={openSheet}
              fullWidth
            />
          </Card>
        </ScrollView>

        <StickyActionBar
          label={service ? t(service.name) : t('consultation')}
          amountInr={fee}
          caption={
            selectedSlot
              ? `${formatClinicDay(
                  selectedDate,
                  Date.now(),
                )}, ${formatClinicTime(selectedSlot.startsAt)}`
              : formatClinicDay(selectedDate, Date.now())
          }
          buttonLabel={t('confirmBooking')}
          onPress={confirmBooking}
          disabled={!selectedSlot || bookingPending}
          loading={bookingPending}
        />
      </View>

      <BottomSheet
        ref={sheetRef}
        title={t('availableTimes', {
          date: formatClinicDay(selectedDate, Date.now()),
        })}
        snapPoints={SHEET_SNAP_POINTS}
        scrollable
      >
        {selectedQuery?.isLoading || selectedQuery?.isPending ? (
          <SlotSkeleton />
        ) : selectedQuery?.isError ? (
          <ErrorState
            title={t('appointmentTimesError')}
            message={t('retryChooseDate')}
            onRetry={() => selectedQuery.refetch()}
            retrying={selectedQuery.isFetching}
          />
        ) : daySlots.filter(slot => slot.available).length === 0 ? (
          <EmptySlots
            canJump={availableNextIndex >= 0}
            onJump={goToNextAvailableDay}
          />
        ) : (
          <View style={styles.slotGroups}>
            {slotsByGroup.map(group => (
              <View key={group.labelKey} style={styles.slotGroup}>
                <AppText variant="bodyStrong">{t(group.labelKey)}</AppText>
                <View style={styles.slotGrid}>
                  {group.slots.map(slot => (
                    <SlotChoice
                      key={slot.id}
                      slot={slot}
                      selected={selectedSlot?.id === slot.id}
                      onPress={() => setSelectedSlot(slot)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </BottomSheet>
    </ScreenContainer>
  );
}

function DateChoice({
  date,
  today,
  selected,
  onPress,
}: {
  date: string;
  today: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { colors, spacing, sizes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const progress = useSharedValue(selected ? 1 : 0);
  const reduceMotion = useReducedMotion();
  React.useEffect(() => {
    progress.value = reduceMotion
      ? Number(selected)
      : withSpring(Number(selected));
  }, [progress, reduceMotion, selected]);
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.surface, colors.primary],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, colors.primary],
    ),
    transform: [{ scale: 1 + progress.value * 0.025 }],
  }));
  const dateValue = new Date(`${date}T00:00:00Z`);
  const weekday =
    daysBetween(today, date) === 0
      ? t('today')
      : daysBetween(today, date) === 1
      ? t('tomorrow')
      : dateValue.toLocaleDateString(getAppLocaleTag(), {
          weekday: 'short',
          timeZone: 'UTC',
        });
  const foreground = selected ? colors.onPrimary : colors.textPrimary;

  return (
    <PressableScale
      accessibilityLabel={t('dateAccessibility', {
        weekday,
        date: dateValue.toLocaleDateString(getAppLocaleTag(), {
          day: 'numeric',
          month: 'short',
          timeZone: 'UTC',
        }),
      })}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{ minWidth: sizes.minTouch + spacing.md, marginRight: spacing.sm }}
    >
      <Animated.View style={[styles.dateChoice, animatedStyle]}>
        <AppText variant="caption" style={{ color: foreground }}>
          {weekday}
        </AppText>
        <AppText variant="bodyStrong" style={{ color: foreground }}>
          {dateValue.getUTCDate()}
        </AppText>
        <AppText variant="caption" style={{ color: foreground }}>
          {dateValue.toLocaleDateString(getAppLocaleTag(), {
            month: 'short',
            timeZone: 'UTC',
          })}
        </AppText>
      </Animated.View>
    </PressableScale>
  );
}

function SlotChoice({
  slot,
  selected,
  onPress,
}: {
  slot: Slot;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Chip
      label={formatClinicTime(slot.startsAt)}
      onPress={onPress}
      selected={selected}
      disabled={!slot.available}
    />
  );
}

function EmptySlots({
  canJump,
  onJump,
}: {
  canJump: boolean;
  onJump: () => void;
}) {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t('noSlots')}
      message={canJump ? t('nextDaySlots') : t('noMoreSlots')}
      illustration="bookings"
      actionLabel={canJump ? t('nextAvailableDay') : undefined}
      onAction={canJump ? onJump : undefined}
    />
  );
}

function SlotSkeleton() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  return (
    <SkeletonGroup
      style={styles.slotGroups}
      accessibilityLabel={t('loadingSlots')}
    >
      {[0, 1, 2].map(group => (
        <View key={group} style={styles.slotGroup}>
          <SkeletonBox width={100} height={20} />
          <View style={styles.slotGrid}>
            {[0, 1, 2, 3, 4].map(slot => (
              <SkeletonBox key={slot} width={88} height={40} radius={24} />
            ))}
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}

function DoctorDetailsSkeleton() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  return (
    <SkeletonGroup
      style={styles.skeletonPage}
      accessibilityLabel={t('loadingDoctorDetails')}
    >
      <SkeletonBox height={190} />
      <SkeletonBox height={30} width={180} />
      <View style={styles.dateList}>
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonBox key={index} width={70} height={88} />
        ))}
      </View>
      <SkeletonBox height={135} />
    </SkeletonGroup>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  doctorCard: { gap: spacing.lg },
  doctorTop: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.lg,
  },
  doctorDetails: { flex: 1, gap: spacing.xs },
  clinicRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: sizes.hairline,
    borderTopColor: colors.border,
  },
  clinicText: { flex: 1, gap: spacing.xs },
  fee: { alignItems: 'flex-end' as const, gap: spacing.xs },
  serviceSelection: {
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.muted,
    borderRadius: radii.md,
  },
  sectionHeading: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.md,
  },
  headingText: { flex: 1, gap: spacing.xs },
  dateList: { alignItems: 'center' as const, paddingVertical: spacing.xs },
  dateChoice: {
    alignItems: 'center' as const,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: sizes.border,
    borderRadius: radii.lg,
  },
  timeCard: { gap: spacing.md },
  timeHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  slotGroups: { gap: spacing.xl, paddingBottom: spacing.lg },
  slotGroup: { gap: spacing.md },
  slotGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
  },
  skeletonPage: { flex: 1, padding: spacing.lg, gap: spacing.xl },
});

export default DoctorDetailsScreen;
