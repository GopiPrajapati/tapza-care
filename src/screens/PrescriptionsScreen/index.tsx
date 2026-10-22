import React, { useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ChevronRight, ClipboardList, Pill } from 'lucide-react-native';

import {
  clinicDate,
  daysBetween,
  formatClinicDay,
} from '../../commonutils/helpers';
import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../../components/AppText';
import Badge from '../../components/Badge';
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
import { Routes, type TabScreenProps } from '../../container/Routes';
import type { Prescription } from '../../networking/types/models';
import { doseKey, useDoseLogStore } from '../../store/doseLogStore';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { isCourseActive } from '../../hooks/useNextDose';
import { useTranslation } from 'react-i18next';

function PrescriptionsScreen({
  navigation,
}: TabScreenProps<typeof Routes.Prescriptions>) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { colors } = useTheme();
  const query = usePrescriptions();
  const taken = useDoseLogStore(state => state.taken);
  const today = clinicDate(Date.now());

  const adherence = useMemo(() => {
    const doses = (query.data ?? []).flatMap(prescription =>
      prescription.medicines
        .filter(medicine => isCourseActive(prescription, medicine, today))
        .flatMap(medicine =>
          medicine.timing.map(timing => ({
            date: today,
            prescriptionId: prescription.id,
            medicineId: medicine.id,
            timing,
          })),
        ),
    );
    const count = doses.filter(dose => doseKey(dose) in taken).length;
    return { taken: count, total: doses.length };
  }, [query.data, taken, today]);

  const prescriptions = useMemo(
    () =>
      [...(query.data ?? [])].sort((a, b) =>
        b.issuedAt.localeCompare(a.issuedAt),
      ),
    [query.data],
  );

  if (query.isPending && !query.data) {
    return <PrescriptionsSkeleton />;
  }
  if (query.isError && !query.data) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <ErrorState onRetry={query.refetch} retrying={query.isFetching} />
      </ScreenContainer>
    );
  }
  if (prescriptions.length === 0) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <EmptyState
          title={t('noPrescriptions')}
          message={t('prescriptionsEmpty')}
          illustration="generic"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={prescriptions}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => {
              query.refetch();
            }}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="title" accessibilityRole="header">
              {t('prescriptionsTitle')}
            </AppText>
            <AdherenceCard taken={adherence.taken} total={adherence.total} />
            <AppText variant="heading">{t('prescriptionsTitle')}</AppText>
          </View>
        }
        renderItem={({ item }) => (
          <PrescriptionCard
            prescription={item}
            today={today}
            onPress={() =>
              navigation.navigate(Routes.PrescriptionDetails, {
                prescriptionId: item.id,
              })
            }
          />
        )}
        ItemSeparatorComponent={PrescriptionSeparator}
        ListFooterComponent={<View style={styles.footer} />}
      />
    </ScreenContainer>
  );
}

function PrescriptionSeparator() {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.separator} />;
}

function AdherenceCard({ taken, total }: { taken: number; total: number }) {
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  const { t } = useTranslation();
  const diameter = sizes.avatarLg;
  const stroke = sizes.border + 3;
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : Math.min(taken / total, 1);

  return (
    <Card elevated={false} style={styles.adherenceCard}>
      <View style={styles.adherenceCopy}>
        <AppText variant="heading">{t('todayAdherence')}</AppText>
        <AppText color="textSecondary">
          {t('dosesTaken', { taken, total })}
        </AppText>
        {total === 0 ? (
          <AppText variant="caption" color="textSecondary">
            {t('noDosesToday')}
          </AppText>
        ) : null}
      </View>
      <View
        style={{ width: diameter, height: diameter }}
        accessibilityLabel={t('dosesTaken', { taken, total })}
        accessibilityRole="image"
      >
        <Svg width={diameter} height={diameter}>
          <Circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke={colors.muted}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke={colors.success}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * progress} ${circumference}`}
            rotation={-90}
            origin={`${diameter / 2}, ${diameter / 2}`}
            fill="none"
          />
        </Svg>
        <View style={styles.ringLabel}>
          <AppText variant="caption" style={styles.ringPercent}>
            {Math.round(progress * 100)}%
          </AppText>
        </View>
      </View>
    </Card>
  );
}

function PrescriptionCard({
  prescription,
  today,
  onPress,
}: {
  prescription: Prescription;
  today: string;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  const active = prescription.medicines.some(medicine =>
    isCourseActive(prescription, medicine, today),
  );
  const issuedDate = prescription.issuedAt.slice(0, 10);
  const longestCourse = Math.max(
    0,
    ...prescription.medicines.map(medicine => medicine.days),
  );
  const completed = daysBetween(issuedDate, today) >= longestCourse;
  const isActive = active && !completed;
  const status = isActive ? t('active') : t('completed');

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={t('prescriptionFrom', {
        doctor: prescription.doctorName,
        status,
        count: prescription.medicines.length,
      })}
      style={styles.prescriptionCard}
    >
      <View style={styles.cardHeading}>
        <View style={styles.rxIcon}>
          <ClipboardList size={sizes.iconMd} color={colors.primaryText} />
        </View>
        <View style={styles.doctorCopy}>
          <AppText variant="subheading" numberOfLines={1}>
            {prescription.doctorName}
          </AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {prescription.clinicName}
          </AppText>
        </View>
        <Badge label={status} tone={isActive ? 'success' : 'neutral'} />
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardFooter}>
        <View style={styles.metadata}>
          <AppText variant="caption" color="textSecondary">
            {t('issued', { date: formatClinicDay(issuedDate, Date.now()) })}
          </AppText>
          <View style={styles.medicineCount}>
            <Pill size={sizes.iconSm} color={colors.textSecondary} />
            <AppText variant="caption" color="textSecondary">
              {prescription.medicines.length}{' '}
              {prescription.medicines.length === 1
                ? t('medicine')
                : t('medicinesPlural')}
            </AppText>
          </View>
        </View>
        <ChevronRight size={sizes.iconMd} color={colors.textSecondary} />
      </View>
    </Card>
  );
}

function PrescriptionsSkeleton() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <SkeletonGroup
        style={styles.listContent}
        accessibilityLabel={t('loadingPrescriptions')}
      >
        <SkeletonBox height={28} width={180} />
        <View style={styles.skeletonAdherence}>
          <View style={styles.skeletonCopy}>
            <SkeletonText lines={2} />
            <SkeletonBox height={14} width={140} />
          </View>
          <SkeletonCircle size={72} />
        </View>
        <SkeletonBox height={24} width={200} />
        {[0, 1, 2].map(item => (
          <View key={item} style={styles.skeletonCard}>
            <View style={styles.skeletonHeading}>
              <SkeletonCircle size={40} />
              <View style={styles.skeletonCopy}>
                <SkeletonText lines={2} />
              </View>
              <SkeletonBox height={24} width={76} radius={12} />
            </View>
            <SkeletonBox height={1} />
            <View style={styles.skeletonHeading}>
              <SkeletonBox height={14} width={116} />
              <SkeletonBox height={14} width={94} />
            </View>
          </View>
        ))}
      </SkeletonGroup>
    </ScreenContainer>
  );
}

const createStyles = ({ colors, spacing, radii, sizes, elevation }: Theme) => ({
  listContent: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  header: { gap: spacing.md, marginBottom: spacing.xs },
  adherenceCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.md,
    backgroundColor: colors.successSurface,
  },
  adherenceCopy: { flex: 1, gap: spacing.xs },
  ringLabel: {
    position: 'absolute' as const,
    inset: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  ringPercent: { fontWeight: '700' as const, color: colors.success },
  prescriptionCard: { gap: spacing.md },
  cardHeading: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  rxIcon: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radii.md,
    backgroundColor: colors.muted,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  doctorCopy: { flex: 1, gap: spacing.xxs },
  cardDivider: { height: sizes.hairline, backgroundColor: colors.border },
  cardFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  metadata: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.lg,
    flexWrap: 'wrap' as const,
  },
  medicineCount: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  separator: { height: spacing.md },
  footer: { height: spacing.xxl },
  skeletonAdherence: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...elevation.card,
  },
  skeletonHeading: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  skeletonCopy: { flex: 1, gap: spacing.sm },
  skeletonCard: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...elevation.card,
  },
});

export default PrescriptionsScreen;
