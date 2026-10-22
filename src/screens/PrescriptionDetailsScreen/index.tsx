import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, {
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { trigger } from 'react-native-haptic-feedback';
import { Check, Clock3, Moon, Sun, Sunrise } from 'lucide-react-native';

import {
  clinicDate,
  daysBetween,
  formatClinicDay,
  formatMinutesOfDay,
} from '../../commonutils/helpers';
import { DOSE_TIMES } from '../../commonutils/constants';
import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../../components/AppText';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import ScreenContainer from '../../components/ScreenContainer';
import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonGroup,
  SkeletonText,
} from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { Routes, type RootStackScreenProps } from '../../container/Routes';
import { usePrescription } from '../../hooks/usePrescriptions';
import type { DoseTiming, Medicine } from '../../networking/types/models';
import {
  useDoseLogStore,
  useIsDoseTaken,
  type DoseRef,
} from '../../store/doseLogStore';

const GROUPS: { timing: DoseTiming; label: string; icon: typeof Sun }[] = [
  { timing: 'morning', label: 'Morning', icon: Sunrise },
  { timing: 'afternoon', label: 'Afternoon', icon: Sun },
  { timing: 'night', label: 'Night', icon: Moon },
];

function PrescriptionDetailsScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof Routes.PrescriptionDetails>) {
  const prescriptionId = route.params?.prescriptionId;
  const query = usePrescription(prescriptionId ?? '');
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  const today = clinicDate(Date.now());

  if (!prescriptionId) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <EmptyState
          title="Prescription not found"
          message="This prescription could not be opened."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }
  if (query.isPending && !query.prescription) return <PrescriptionSkeleton />;
  if (query.isError) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState
          title="Could not load prescription"
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </ScreenContainer>
    );
  }
  if (!query.prescription) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <EmptyState
          title="Prescription not found"
          message="This prescription may no longer be available."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  const prescription = query.prescription;
  const elapsed = Math.max(
    0,
    daysBetween(prescription.issuedAt.slice(0, 10), today),
  );
  const totalDays = Math.max(
    1,
    ...prescription.medicines.map(medicine => medicine.days),
  );
  const dayNumber = Math.min(totalDays, elapsed + 1);

  return (
    <ScreenContainer edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.headerCard}>
          <View style={styles.headerLine}>
            <View style={styles.doctorIcon}>
              <AppText variant="heading" color="primaryText">
                Rx
              </AppText>
            </View>
            <View style={styles.doctorDetails}>
              <AppText variant="heading">{prescription.doctorName}</AppText>
              <AppText color="textSecondary">{prescription.clinicName}</AppText>
            </View>
          </View>
          <View style={styles.headerFooter}>
            <AppText variant="caption" color="textSecondary">
              Issued{' '}
              {formatClinicDay(prescription.issuedAt.slice(0, 10), Date.now())}
            </AppText>
            <Badge label={`Day ${dayNumber} of ${totalDays}`} tone="primary" />
          </View>
        </Card>

        <View style={styles.scheduleTitle}>
          <View>
            <AppText variant="heading">Medicine schedule</AppText>
            <AppText variant="caption" color="textSecondary">
              Tap a dose when you’ve taken it
            </AppText>
          </View>
          <Clock3 size={sizes.iconMd} color={colors.primaryText} />
        </View>

        {GROUPS.map(group => {
          const medicines = prescription.medicines.filter(medicine =>
            medicine.timing.includes(group.timing),
          );
          if (medicines.length === 0) return null;
          const GroupIcon = group.icon;
          return (
            <View key={group.timing} style={styles.group}>
              <View style={styles.groupHeading}>
                <View style={styles.groupIcon}>
                  <GroupIcon size={sizes.iconMd} color={colors.primaryText} />
                </View>
                <AppText variant="subheading">{group.label}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {formatMinutesOfDay(DOSE_TIMES[group.timing])}
                </AppText>
              </View>
              <View style={styles.medicineList}>
                {medicines.map(medicine => (
                  <DoseRow
                    key={`${medicine.id}-${group.timing}`}
                    medicine={medicine}
                    dose={{
                      date: today,
                      prescriptionId,
                      medicineId: medicine.id,
                      timing: group.timing,
                    }}
                    active={isMedicineActive(
                      prescription.issuedAt,
                      medicine,
                      today,
                    )}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

function isMedicineActive(issuedAt: string, medicine: Medicine, today: string) {
  const elapsed = daysBetween(issuedAt.slice(0, 10), today);
  return elapsed >= 0 && elapsed < medicine.days;
}

function DoseRow({
  medicine,
  dose,
  active,
}: {
  medicine: Medicine;
  dose: DoseRef;
  active: boolean;
}) {
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  const taken = useIsDoseTaken(dose);
  const markTaken = useDoseLogStore(state => state.markTaken);
  const unmark = useDoseLogStore(state => state.unmark);
  const toast = useToast();
  const scale = useSharedValue(taken ? 1 : 0.6);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withSpring(taken ? 1 : 0.6);
  }, [scale, taken]);

  const toggleDose = () => {
    if (!active) return;
    if (taken) {
      unmark(dose);
      return;
    }
    markTaken(dose);
    trigger('impactLight');
    toast.show({
      message: `${medicine.name} marked taken`,
      tone: 'success',
      actionLabel: 'Undo',
      onAction: () => unmark(dose),
    });
  };

  return (
    <Card
      elevated={false}
      style={[styles.doseCard, !active && styles.inactiveCard]}
    >
      <View style={styles.medicineInfo}>
        <AppText variant="bodyStrong">{medicine.name}</AppText>
        <AppText variant="caption" color="textSecondary">
          {medicine.dose}
        </AppText>
      </View>
      <Button
        label={taken ? 'Taken' : 'Mark taken'}
        variant={taken ? 'secondary' : 'primary'}
        icon={taken ? undefined : Check}
        disabled={!active}
        accessibilityLabel={`${taken ? 'Unmark' : 'Mark'} ${medicine.name} ${
          dose.timing
        } dose ${taken ? 'taken' : 'as taken'}`}
        onPress={toggleDose}
        style={styles.doseButton}
      />
      {taken ? (
        <Animated.View
          entering={ZoomIn}
          style={[styles.completedMark, checkStyle]}
        >
          <Check size={sizes.iconSm} color={colors.success} />
        </Animated.View>
      ) : null}
    </Card>
  );
}

function PrescriptionSkeleton() {
  const styles = useThemedStyles(createStyles);
  return (
    <ScreenContainer edges={['bottom', 'left', 'right']}>
      <SkeletonGroup
        style={styles.content}
        accessibilityLabel="Loading prescription"
      >
        <View style={styles.skeletonHeader}>
          <SkeletonCircle size={56} />
          <View style={styles.skeletonText}>
            <SkeletonText lines={2} />
            <SkeletonBox width="70%" height={14} />
          </View>
        </View>
        <SkeletonBox width={210} height={24} />
        {[0, 1, 2].map(group => (
          <View key={group} style={styles.skeletonGroup}>
            <SkeletonBox width={150} height={22} />
            {[0, 1].map(row => (
              <View key={row} style={styles.skeletonRow}>
                <View style={styles.skeletonText}>
                  <SkeletonText lines={2} />
                </View>
                <SkeletonBox width={112} height={48} radius={24} />
              </View>
            ))}
          </View>
        ))}
      </SkeletonGroup>
    </ScreenContainer>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  content: { padding: spacing.lg, gap: spacing.lg },
  headerCard: { gap: spacing.lg },
  headerLine: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  doctorIcon: {
    width: sizes.avatarMd,
    height: sizes.avatarMd,
    borderRadius: radii.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.muted,
  },
  doctorDetails: { flex: 1, gap: spacing.xs },
  headerFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  scheduleTitle: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  group: { gap: spacing.sm },
  groupHeading: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  groupIcon: {
    width: sizes.control,
    height: sizes.control,
    borderRadius: radii.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.muted,
  },
  medicineList: { gap: spacing.sm },
  doseCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.md,
    padding: spacing.md,
  },
  medicineInfo: { flex: 1, gap: spacing.xs },
  doseButton: { minWidth: sizes.controlLarge },
  completedMark: {
    position: 'absolute' as const,
    right: spacing.xs,
    top: spacing.xs,
    width: sizes.iconMd,
    height: sizes.iconMd,
    borderRadius: sizes.iconMd,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.successSurface,
  },
  inactiveCard: { opacity: 0.72 },
  skeletonHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  skeletonText: { flex: 1, gap: spacing.sm },
  skeletonGroup: { gap: spacing.md },
  skeletonRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
});

export default PrescriptionDetailsScreen;
