import React, { useCallback } from 'react';
import { StatusBar, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarPlus } from 'lucide-react-native';

import {
  isLightColor,
  useTheme,
  useThemedStyles,
  useTone,
  type Theme,
} from '../../../commonutils/theme';
import AppText from '../../../components/AppText';
import PressableScale from '../../../components/PressableScale';
import SearchBar from '../../../components/SearchBar';
import { Routes } from '../../../container/Routes';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import type { Section } from '../../../networking/types/configSchema';
import { renderSection } from '../sections/registry';
import SectionBackground from '../sections/SectionBackground';
import HomeHeader from './HomeHeader';

/**
 * The coloured band at the top of Home (Zepto's top band): header, search and the first config section, all on
 * the first section's background, with rounded bottom corners. It runs behind the status bar.
 */
function TopBand({ section }: { section: Section }) {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();

  return (
    <SectionBackground
      background={section.background}
      style={[
        styles.band,
        { paddingTop: insets.top + styles.band.paddingBottom / 3 },
      ]}
    >
      <BandStatusBar />
      <HomeHeader />
      <View style={styles.search}>
        <SearchBar
          placeholder='Search "Paediatrics"'
          onPress={() => navigation.navigate(Routes.DoctorList)}
          rightSlot={
            <BookPill onPress={() => navigation.navigate(Routes.DoctorList)} />
          }
        />
      </View>
      {renderSection(section)}
    </SectionBackground>
  );
}

function BookPill({ onPress }: { onPress: () => void }) {
  const styles = useThemedStyles(createStyles);
  const { colors, sizes } = useTheme();
  return (
    <PressableScale
      accessibilityLabel="Book a visit"
      onPress={onPress}
      style={styles.pill}
    >
      <CalendarPlus size={sizes.iconMd} color={colors.primaryText} />
      <AppText variant="label" color="primaryText">
        Book
      </AppText>
    </PressableScale>
  );
}

/** Light or dark status bar icons to match the band while Home is focused. */
function BandStatusBar() {
  const tone = useTone();
  const { statusBarStyle } = useTheme();
  const bandStyle =
    tone && isLightColor(tone.foreground) ? 'light-content' : 'dark-content';

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(bandStyle, true);
      return () => StatusBar.setBarStyle(statusBarStyle, true);
    }, [bandStyle, statusBarStyle]),
  );
  return null;
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  band: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    overflow: 'hidden' as const,
  },
  search: { paddingHorizontal: spacing.lg },
  pill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    minHeight: sizes.minTouch,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.muted,
  },
});

export default TopBand;
