import React from 'react';
import { ScrollView, View } from 'react-native';
import Chip from '../../components/Chip';
import {
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Languages,
  Bell,
  Building2,
  Users,
  Pill,
  Code2,
  Sun,
} from 'lucide-react-native';

import packageJson from '../../../package.json';
import { PATIENT } from '../../commonutils/constants';
import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../../components/AppText';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import ScreenContainer from '../../components/ScreenContainer';
import { useToast } from '../../components/Toast';
import { useTranslation } from 'react-i18next';
import { Routes, type TabScreenProps } from '../../container/Routes';
import { useLanguageStore } from '../../store/languageStore';
import { useAppearanceStore } from '../../store/appearanceStore';

function ProfileScreen({ navigation }: TabScreenProps<typeof Routes.Profile>) {
  const styles = useThemedStyles(createStyles);
  const toast = useToast();
  const { t } = useTranslation();
  const language = useLanguageStore(state => state.language);
  const setLanguage = useLanguageStore(state => state.setLanguage);
  const appearance = useAppearanceStore(state => state.preference);
  const setAppearance = useAppearanceStore(state => state.setPreference);
  const comingSoon = () =>
    toast.show({ message: t('comingSoon'), tone: 'info' });

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" accessibilityRole="header">
          {t('profileTitle')}
        </AppText>
        <Card style={styles.profileCard}>
          <Avatar name={PATIENT.fullName} size="lg" />
          <View style={styles.patientInfo}>
            <AppText variant="heading">{PATIENT.fullName}</AppText>
            <AppText color="textSecondary">{PATIENT.phone}</AppText>
          </View>
        </Card>

        <View style={styles.tiles}>
          <ProfileTile
            label={t('myBookings')}
            icon={CalendarDays}
            onPress={() => navigation.navigate(Routes.Bookings)}
          />
          <ProfileTile
            label={t('prescriptionsTitle')}
            icon={Pill}
            onPress={() => navigation.navigate(Routes.Prescriptions)}
          />
          <ProfileTile label={t('family')} icon={Users} onPress={comingSoon} />
        </View>

        <ListGroup title={t('yourAccount')}>
          <ProfileRow
            title={t('familyMembers')}
            subtitle="Riya Prajapati · Aarav Prajapati"
            icon={Users}
            onPress={comingSoon}
          />
          <ProfileRow
            title={t('savedClinics')}
            subtitle="Tapza Clinic · Kondapur"
            icon={Building2}
            onPress={comingSoon}
          />
        </ListGroup>
        <ListGroup title={t('preferencesSupport')}>
          <ProfileRow
            title={t('appearance')}
            subtitle={t('chooseAppearance')}
            icon={Sun}
          />
          <View
            style={styles.languageChoices}
            accessibilityLabel={t('chooseAppearance')}
          >
            {(['system', 'light', 'dark'] as const).map(option => (
              <Chip
                key={option}
                label={t(
                  `appearance${option[0].toUpperCase()}${option.slice(1)}`,
                )}
                selected={appearance === option}
                onPress={() => setAppearance(option)}
              />
            ))}
          </View>
          <ProfileRow
            title={t('language')}
            subtitle={t('selectLanguage')}
            icon={Languages}
          />
          <View
            style={styles.languageChoices}
            accessibilityLabel={t('selectLanguage')}
          >
            <Chip
              label={t('languageNameEnglish')}
              selected={language === 'en'}
              onPress={() => setLanguage('en')}
            />
            <Chip
              label={t('languageNameHindi')}
              selected={language === 'hi'}
              onPress={() => setLanguage('hi')}
            />
            <Chip
              label={t('languageNameTelugu')}
              selected={language === 'te'}
              onPress={() => setLanguage('te')}
            />
          </View>
          <ProfileRow
            title={t('notifications')}
            subtitle={t('manageNotifications')}
            icon={Bell}
            onPress={comingSoon}
          />
          <ProfileRow
            title={t('helpSupport')}
            subtitle={t('hereToHelp')}
            icon={CircleHelp}
            onPress={comingSoon}
          />
        </ListGroup>
        <ListGroup title={t('developer')}>
          <ProfileRow
            title={t('developerSettings')}
            subtitle={t('developerDescription')}
            icon={Code2}
            onPress={() => navigation.navigate(Routes.AdminSettings)}
          />
        </ListGroup>
        <AppText
          variant="caption"
          color="textSecondary"
          align="center"
          style={styles.version}
        >
          Tapza Care · v{packageJson.version}
        </AppText>
      </ScrollView>
    </ScreenContainer>
  );
}

function ProfileTile({
  label,
  icon: Icon,
  onPress,
}: {
  label: string;
  icon: typeof CalendarDays;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  return (
    <Card onPress={onPress} accessibilityLabel={label} style={styles.tile}>
      <Icon size={sizes.iconLg} color={colors.primaryText} />
      <AppText variant="label" align="center">
        {label}
      </AppText>
    </Card>
  );
}

function ListGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.group}>
      <AppText variant="subheading">{title}</AppText>
      <Card elevated={false} style={styles.rows}>
        {children}
      </Card>
    </View>
  );
}

function ProfileRow({
  title,
  subtitle,
  icon: Icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: typeof Users;
  onPress?: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${title}. ${subtitle}`}
      elevated={false}
      style={styles.row}
    >
      <Icon size={sizes.iconMd} color={colors.primaryText} />
      <View style={styles.rowCopy}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption" color="textSecondary">
          {subtitle}
        </AppText>
      </View>
      {onPress ? (
        <ChevronRight size={sizes.iconMd} color={colors.textSecondary} />
      ) : null}
    </Card>
  );
}

const createStyles = ({ colors, spacing, sizes }: Theme) => ({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.lg,
    backgroundColor: colors.muted,
  },
  patientInfo: { flex: 1, gap: spacing.xs },
  tiles: { flexDirection: 'row' as const, gap: spacing.sm },
  languageChoices: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  tile: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    minHeight: sizes.controlLarge + spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  group: { gap: spacing.sm },
  rows: { padding: 0, overflow: 'hidden' as const },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    borderWidth: 0,
    borderRadius: 0,
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
    paddingVertical: spacing.md,
  },
  rowCopy: { flex: 1, gap: spacing.xxs },
  version: { marginTop: spacing.xs },
});

export default ProfileScreen;
