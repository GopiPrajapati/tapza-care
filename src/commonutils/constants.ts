import type { TabConfig } from '../networking/types/layoutConfig';

/**
 * App-wide constants. Query keys and AsyncStorage keys are added here as the data layer lands.
 */
export const APP_NAME = 'Tapza Care';

/** Fallback tabs, used when a config has no usable tabs (see resolveTabs). */
export const DEFAULT_TABS: TabConfig[] = [
  { id: 'tab-home', label: 'Home', icon: 'home', screen: 'home' },
  {
    id: 'tab-bookings',
    label: 'Bookings',
    icon: 'calendar',
    screen: 'bookings',
  },
  {
    id: 'tab-prescriptions',
    label: 'Medicines',
    icon: 'pill',
    screen: 'prescriptions',
  },
  { id: 'tab-profile', label: 'Profile', icon: 'user', screen: 'profile' },
];

/** AsyncStorage keys. Bump the version suffix when a persisted shape changes incompatibly. */
export const STORAGE_KEYS = {
  config: 'tapza.config.v1',
  mockControls: 'tapza.mockControls.v1',
  doseLog: 'tapza.doseLog.v1',
  language: 'tapza.language.v1',
  appearance: 'tapza.appearance.v1',
} as const;

/** TanStack Query keys. */
export const QUERY_KEYS = {
  config: (variant: string, customConfigJson: string | null) =>
    ['config', variant, customConfigJson] as const,
  doctors: ['doctors'] as const,
  slots: (doctorId: string, date: string) => ['slots', doctorId, date] as const,
  slotsForDoctor: (doctorId: string) => ['slots', doctorId] as const,
  bookings: ['bookings'] as const,
  prescriptions: ['prescriptions'] as const,
};

/** Mock signed-in patient (no auth in this assignment). */
export const PATIENT = {
  firstName: 'Gopi',
  fullName: 'Gopi Prajapati',
  phone: '+91 98765 43210',
  locality: 'Kondapur, Hyderabad',
} as const;

/** Shown in the Home header, like Zepto's delivery ETA. */
export const CLINIC_VISIT_ETA_MINUTES = 20;

/** Clock time (minutes from midnight) each dose timing is due. */
export const DOSE_TIMES = {
  morning: 8 * 60,
  afternoon: 14 * 60,
  night: 21 * 60,
} as const;
