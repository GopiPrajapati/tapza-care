import React from 'react';
import { View } from 'react-native';
import { MapPin, User, Zap } from 'lucide-react-native';

import {
  CLINIC_VISIT_ETA_MINUTES,
  PATIENT,
} from '../../../commonutils/constants';
import {
  useTheme,
  useThemedStyles,
  useTone,
  withAlpha,
  type Theme,
} from '../../../commonutils/theme';
import AppText from '../../../components/AppText';
import PressableScale from '../../../components/PressableScale';
import { Routes } from '../../../container/Routes';
import { useAppNavigation } from '../../../hooks/useAppNavigation';

/** Zepto-style header: visit ETA, patient and locality, profile button. Sits on the top band. */
function HomeHeader() {
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  const tone = useTone();
  const ink = tone?.foreground ?? colors.textPrimary;
  const navigation = useAppNavigation();

  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <View style={styles.eta} accessible accessibilityRole="header">
          <Zap size={sizes.iconLg} color={ink} fill={ink} />
          <AppText variant="title">
            Clinic visit in {CLINIC_VISIT_ETA_MINUTES} min
          </AppText>
        </View>
        <View style={styles.location}>
          <MapPin size={sizes.iconSm} color={ink} />
          <AppText variant="bodyStrong">{PATIENT.firstName}</AppText>
          <AppText color="textSecondary" numberOfLines={1} style={styles.flex}>
            · {PATIENT.locality}
          </AppText>
        </View>
      </View>
      <PressableScale
        accessibilityLabel="Open profile"
        onPress={() =>
          navigation.navigate(Routes.MainTabs, { screen: Routes.Profile })
        }
        style={[styles.profile, { backgroundColor: withAlpha(ink, 0.14) }]}
      >
        <User size={sizes.iconLg} color={ink} />
      </PressableScale>
    </View>
  );
}

const createStyles = ({ spacing, radii, sizes }: Theme) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  texts: { flex: 1, gap: spacing.xxs },
  eta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  location: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  flex: { flex: 1 },
  profile: {
    width: sizes.minTouch + spacing.xs,
    height: sizes.minTouch + spacing.xs,
    borderRadius: radii.pill,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

export default HomeHeader;
