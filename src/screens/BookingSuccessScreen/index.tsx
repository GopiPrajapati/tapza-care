import React, { useCallback, useMemo, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CircleCheck, Clock3, MapPin } from 'lucide-react-native';
import LottieView from 'lottie-react-native';

import {
  clinicTimestamp,
  formatClinicDay,
  formatClinicTime,
} from '../../commonutils/helpers';
import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../../components/AppText';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import PriceText from '../../components/PriceText';
import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type RootStackScreenProps } from '../../container/Routes';
import { useConfig } from '../../hooks/useConfig';
import { useMyBookings } from '../../hooks/useBookings';
import { useDoctor } from '../../hooks/useDoctors';
import { useSlots } from '../../hooks/useSlots';

function slotDateAndTime(
  slotId: string,
): { date: string; minutes: number } | undefined {
  const match = /_(\d{4}-\d{2}-\d{2})_(\d{4})$/.exec(slotId);
  if (!match) return undefined;
  const minutes = Number(match[2].slice(0, 2)) * 60 + Number(match[2].slice(2));
  return { date: match[1], minutes };
}

function BookingSuccessScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof Routes.BookingSuccess>) {
  const { bookingId, doctorId, slotId, serviceId } = route.params;
  const { data: bookings } = useMyBookings();
  const { doctor } = useDoctor(doctorId);
  const { config } = useConfig();
  const [lottieFailed, setLottieFailed] = useState(false);
  const fallback = slotDateAndTime(slotId);
  const { data: slots } = useSlots(doctorId, fallback?.date);
  const booking =
    bookings?.find(item => item.slotId === slotId) ??
    bookings?.find(item => item.id === bookingId);
  const slot = slots?.find(item => item.id === slotId);
  const startsAt =
    booking?.startsAt ??
    slot?.startsAt ??
    (fallback ? clinicTimestamp(fallback.date, fallback.minutes) : undefined);
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const checkScale = useSharedValue(0.6);
  React.useEffect(() => {
    checkScale.value = reduceMotion
      ? 1
      : withSpring(1, { damping: 12, stiffness: 150 });
  }, [checkScale, reduceMotion]);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const service = useMemo(() => {
    if (!serviceId) return undefined;
    for (const section of config.sections) {
      if (section.type === 'service_grid') {
        const match = section.items.find(item => item.id === serviceId);
        if (match) return match;
      }
    }
    return undefined;
  }, [config.sections, serviceId]);
  const fee = service?.priceInr ?? doctor?.feeInr;
  const clinicParts = (
    doctor?.clinicName ?? 'Tapza Clinic, Kondapur, Hyderabad'
  ).split(',');
  const clinic = clinicParts[0]?.trim() ?? 'Tapza Clinic';
  const area = clinicParts.slice(1).join(',').trim();
  const goHome = useCallback(
    () => navigation.popTo(Routes.MainTabs, { screen: Routes.Home }),
    [navigation],
  );

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goHome();
        return true;
      });
      return () => sub.remove();
    }, [goHome]),
  );

  const confirmed = booking?.status === 'confirmed';
  const dateLabel = startsAt
    ? formatClinicDay(startsAt.slice(0, 10), Date.now())
    : 'Your selected appointment';

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.content}>
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(320)}
          style={styles.successMark}
        >
          {lottieFailed || reduceMotion ? (
            <Animated.View style={checkStyle}>
              <CircleCheck
                size={sizes.illustration * 0.62}
                color={colors.success}
                strokeWidth={1.7}
              />
            </Animated.View>
          ) : (
            <View accessible accessibilityLabel="Booking success animation">
              <LottieView
                source={require('../../assets/animations/booking-success.json')}
                autoPlay
                loop={false}
                onAnimationFailure={() => setLottieFailed(true)}
                colorFilters={[{ keypath: '**', color: colors.success }]}
                style={styles.animation}
              />
            </View>
          )}
        </Animated.View>
        <AppText variant="heading" align="center" accessibilityRole="header">
          {confirmed ? 'Appointment confirmed' : 'Booking your appointment'}
        </AppText>
        <Badge
          label={confirmed ? 'Confirmed' : 'Pending confirmation'}
          tone={confirmed ? 'success' : 'warning'}
        />

        <Card style={styles.bookingCard}>
          <View style={styles.doctorRow}>
            {doctor ? (
              <Avatar name={doctor.name} image={doctor.photoUrl} size="md" />
            ) : null}
            <View style={styles.doctorInfo}>
              <AppText variant="bodyStrong">
                {doctor?.name ?? 'Your doctor'}
              </AppText>
              {doctor ? (
                <AppText variant="caption" color="textSecondary">
                  {doctor.specialty}
                </AppText>
              ) : null}
            </View>
            {fee !== undefined ? (
              <PriceText amount={fee} variant="title" />
            ) : null}
          </View>
          {service ? <AppText variant="label">{service.name}</AppText> : null}
          <View style={styles.detailRow}>
            <Clock3 size={sizes.iconMd} color={colors.primaryText} />
            <AppText>
              {startsAt
                ? `${dateLabel}, ${formatClinicTime(startsAt)}`
                : 'Your selected date and time'}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={sizes.iconMd} color={colors.primaryText} />
            <View style={styles.clinicText}>
              <AppText>{clinic}</AppText>
              {area ? (
                <AppText variant="caption" color="textSecondary">
                  {area}
                </AppText>
              ) : null}
            </View>
          </View>
        </Card>

        <AppText variant="caption" color="textSecondary" align="center">
          {confirmed
            ? 'We’ve saved your appointment. You can find it in My bookings.'
            : 'Please wait while we confirm your selected time.'}
        </AppText>
        <View style={styles.actions}>
          <Button
            label="View my bookings"
            onPress={() =>
              navigation.popTo(Routes.MainTabs, { screen: Routes.Bookings })
            }
            size="large"
            fullWidth
          />
          <Button
            label="Back to home"
            onPress={goHome}
            variant="secondary"
            fullWidth
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  screen: { backgroundColor: colors.background },
  content: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  successMark: {
    width: sizes.illustration * 0.78,
    height: sizes.illustration * 0.78,
    borderRadius: radii.pill,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.successSurface,
  },
  animation: {
    width: sizes.illustration * 0.75,
    height: sizes.illustration * 0.75,
  },
  bookingCard: { alignSelf: 'stretch' as const, gap: spacing.lg },
  doctorRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  doctorInfo: { flex: 1, gap: spacing.xs },
  detailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  clinicText: { flex: 1, gap: spacing.xxs },
  actions: { alignSelf: 'stretch' as const, gap: spacing.md },
});

export default BookingSuccessScreen;
