import React, { memo } from 'react';
import { View } from 'react-native';
import { MapPin } from 'lucide-react-native';

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
import type { Doctor } from '../../../networking/types/models';
import { useTranslation } from 'react-i18next';
import { useTranslateContent } from '../../../i18n/useTranslateContent';

export interface DoctorRowProps {
  doctor: Doctor;
  onOpen: (doctorId: string) => void;
}

/** One doctor in the list: who, what they treat, languages, clinic, fee and next free slot. */
function DoctorRow({ doctor, onOpen }: DoctorRowProps) {
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  const { t } = useTranslation();
  const translate = useTranslateContent();
  const open = () => onOpen(doctor.id);

  return (
    <Card
      onPress={open}
      accessibilityLabel={`${doctor.name}, ${translate(doctor.specialty)}, ${t(
        'speaksLanguages',
        { languages: doctor.languages.map(language => t(language)).join(', ') },
      )}, ${formatInr(doctor.feeInr)}`}
      style={styles.card}
    >
      <View style={styles.top}>
        <Avatar name={doctor.name} image={doctor.photoUrl} size="lg" />
        <View style={styles.flex}>
          <AppText variant="heading" numberOfLines={2}>
            {doctor.name}
          </AppText>
          <AppText variant="label" color="primaryText">
            {translate(doctor.specialty)}
          </AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {doctor.languages.map(language => translate(language)).join(' · ')}
          </AppText>
        </View>
      </View>
      {doctor.clinicName ? (
        <View style={styles.clinic}>
          <MapPin size={sizes.iconSm} color={colors.textSecondary} />
          <AppText
            variant="caption"
            color="textSecondary"
            numberOfLines={1}
            style={styles.flex}
          >
            {doctor.clinicName}
          </AppText>
        </View>
      ) : null}
      <View style={styles.bottom}>
        <View style={styles.meta}>
          <PriceText amount={doctor.feeInr} />
          <NextSlotBadge doctorId={doctor.id} />
        </View>
        <Button
          label={t('book')}
          onPress={open}
          accessibilityLabel={t('bookDoctor', { name: doctor.name })}
        />
      </View>
    </Card>
  );
}

const createStyles = ({ spacing }: Theme) => ({
  card: { gap: spacing.md },
  top: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  flex: { flex: 1 },
  clinic: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  bottom: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.md,
  },
  meta: { flex: 1, gap: spacing.xs, alignItems: 'flex-start' as const },
});

export default memo(DoctorRow);
