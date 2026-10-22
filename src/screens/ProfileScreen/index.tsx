import React from 'react';
import { ScrollView, View } from 'react-native';
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
} from 'lucide-react-native';

import packageJson from '../../../package.json';
import { PATIENT } from '../../commonutils/constants';
import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../../components/AppText';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import ScreenContainer from '../../components/ScreenContainer';
import { useToast } from '../../components/Toast';
import { Routes, type TabScreenProps } from '../../container/Routes';

function ProfileScreen({ navigation }: TabScreenProps<typeof Routes.Profile>) {
  const styles = useThemedStyles(createStyles);
  const toast = useToast();
  const comingSoon = () => toast.show({ message: 'Coming soon', tone: 'info' });

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" accessibilityRole="header">
          Profile
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
            label="My bookings"
            icon={CalendarDays}
            onPress={() => navigation.navigate(Routes.Bookings)}
          />
          <ProfileTile
            label="Prescriptions"
            icon={Pill}
            onPress={() => navigation.navigate(Routes.Prescriptions)}
          />
          <ProfileTile label="Family" icon={Users} onPress={comingSoon} />
        </View>

        <ListGroup title="Your account">
          <ProfileRow
            title="Family members"
            subtitle="Riya Prajapati · Aarav Prajapati"
            icon={Users}
            onPress={comingSoon}
          />
          <ProfileRow
            title="Saved clinics"
            subtitle="Tapza Clinic · Kondapur"
            icon={Building2}
            onPress={comingSoon}
          />
        </ListGroup>
        <ListGroup title="Preferences & support">
          <ProfileRow
            title="Language"
            subtitle="English · More languages coming soon"
            icon={Languages}
            onPress={comingSoon}
          />
          <ProfileRow
            title="Notifications"
            subtitle="Manage reminders and updates"
            icon={Bell}
            onPress={comingSoon}
          />
          <ProfileRow
            title="Help & support"
            subtitle="We’re here to help"
            icon={CircleHelp}
            onPress={comingSoon}
          />
        </ListGroup>
        <ListGroup title="Developer">
          <ProfileRow
            title="Developer settings"
            subtitle="Config and mock network controls"
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
  onPress: () => void;
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
      <ChevronRight size={sizes.iconMd} color={colors.textSecondary} />
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
