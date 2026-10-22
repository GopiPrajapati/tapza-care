import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { LucideIcon } from 'lucide-react-native';

import { DEFAULT_TABS } from '../commonutils/constants';
import { useTheme } from '../commonutils/theme';
import { getIcon } from '../components/Icon';
import { useTranslateContent } from '../i18n/useTranslateContent';
import { useConfig } from '../hooks/useConfig';
import type { TabConfig, TabScreen } from '../networking/types/layoutConfig';
import HomeScreen from '../screens/HomeScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import PrescriptionsScreen from '../screens/PrescriptionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Routes, type TabParamList } from './Routes';

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Screen component for a tab. The route is chosen at runtime from config, so TypeScript cannot pair each component
 * with its own route props here; `any` mirrors React Navigation's own ScreenComponentType.
 */
type TabComponent = React.ComponentType<any>;

/** config.tabs[].screen → tab route + component. */
const SCREEN_MAP: Record<
  TabScreen,
  { route: keyof TabParamList; component: TabComponent }
> = {
  home: { route: Routes.Home, component: HomeScreen },
  bookings: { route: Routes.Bookings, component: MyBookingsScreen },
  prescriptions: {
    route: Routes.Prescriptions,
    component: PrescriptionsScreen,
  },
  profile: { route: Routes.Profile, component: ProfileScreen },
};

export interface ResolvedTab {
  id: string;
  label: string;
  route: keyof TabParamList;
  component: TabComponent;
  Icon: LucideIcon;
  renderIcon: (props: { color: string; size: number }) => React.ReactNode;
}

const makeTabIcon =
  (Icon: LucideIcon) =>
  ({ color, size }: { color: string; size: number }) =>
    <Icon color={color} size={size} />;

const isTabScreen = (screen: string): screen is TabScreen =>
  screen in SCREEN_MAP;

/**
 * Turns config tabs into renderable tabs. Unknown screens and repeated screens are skipped (route names must be
 * unique). If nothing usable is left, the default tabs are used so the app always has a tab bar.
 */
export function resolveTabs(tabs: TabConfig[]): ResolvedTab[] {
  const seen = new Set<TabScreen>();
  const resolved: ResolvedTab[] = [];

  for (const tab of tabs) {
    if (!isTabScreen(tab.screen) || seen.has(tab.screen)) {
      if (__DEV__) {
        console.warn(
          `[tabs] Skipping tab "${tab.id}" with screen "${tab.screen}"`,
        );
      }
      continue;
    }
    seen.add(tab.screen);
    const Icon = getIcon(tab.icon);
    resolved.push({
      id: tab.id,
      label: tab.label,
      ...SCREEN_MAP[tab.screen],
      Icon,
      renderIcon: makeTabIcon(Icon),
    });
  }

  return resolved.length > 0 || tabs === DEFAULT_TABS
    ? resolved
    : resolveTabs(DEFAULT_TABS);
}

function TabNavigator() {
  const { config } = useConfig();
  const { colors } = useTheme();
  const translate = useTranslateContent();
  const resolved = useMemo(() => resolveTabs(config.tabs), [config.tabs]);

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primaryText,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      },
      tabBarAllowFontScaling: true,
    }),
    [colors],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      {resolved.map(({ id, label, route, component, renderIcon }) => {
        const localizedLabel = translate(label);
        return (
          <Tab.Screen
            key={id}
            name={route}
            component={component}
            options={{
              title: localizedLabel,
              tabBarAccessibilityLabel: localizedLabel,
              tabBarIcon: renderIcon,
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}

export default TabNavigator;
