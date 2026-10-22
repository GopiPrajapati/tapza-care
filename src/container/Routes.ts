import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Route names. Use these instead of string literals. */
export const Routes = {
  MainTabs: 'MainTabs',
  DoctorList: 'DoctorList',
  DoctorDetails: 'DoctorDetails',
  ServiceList: 'ServiceList',
  BookingSuccess: 'BookingSuccess',
  PrescriptionDetails: 'PrescriptionDetails',
  AdminSettings: 'AdminSettings',
  Home: 'Home',
  Bookings: 'Bookings',
  Prescriptions: 'Prescriptions',
  Profile: 'Profile',
} as const;

/** Bottom tabs. Which of these exist at runtime is decided by config.tabs. */
export type TabParamList = {
  [Routes.Home]: undefined;
  [Routes.Bookings]: undefined;
  [Routes.Prescriptions]: undefined;
  [Routes.Profile]: undefined;
};

/** Root native stack. Params carry IDs only, never domain objects. */
export type RootStackParamList = {
  [Routes.MainTabs]: NavigatorScreenParams<TabParamList> | undefined;
  [Routes.DoctorList]:
    | {
        /** Pre-selects this specialty filter. */
        specialty?: string;
        serviceId?: string;
        /** Opens with the search field focused (from the Home search bar). */
        focusSearch?: boolean;
      }
    | undefined;
  [Routes.DoctorDetails]: { doctorId: string; serviceId?: string };
  [Routes.ServiceList]: undefined;
  [Routes.BookingSuccess]: { bookingId: string };
  [Routes.PrescriptionDetails]: { prescriptionId: string };
  [Routes.AdminSettings]: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/** Tab screen props that can also navigate to root stack routes. */
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    // Lets untyped useNavigation()/Link infer our routes.
    interface RootParamList extends RootStackParamList {}
  }
}
