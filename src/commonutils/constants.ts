import type { TabConfig } from '../networking/types/layoutConfig';

/**
 * App-wide constants. Query keys and AsyncStorage keys are added here as the data layer lands.
 */
export const APP_NAME = 'Tapza Care';

/**
 * TEMP: static tabs shaped like config.tabs. Used until the config lands, then kept as the fallback when a
 * config has no usable tabs.
 */
export const DEFAULT_TABS: TabConfig[] = [
  { id: 'tab-home', label: 'Home', icon: 'home', screen: 'home' },
  { id: 'tab-bookings', label: 'Bookings', icon: 'calendar', screen: 'bookings' },
  { id: 'tab-prescriptions', label: 'Medicines', icon: 'pill', screen: 'prescriptions' },
  { id: 'tab-profile', label: 'Profile', icon: 'user', screen: 'profile' },
];
