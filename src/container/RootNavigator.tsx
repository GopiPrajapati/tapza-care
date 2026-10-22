import React, { useMemo } from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { useTheme } from '../commonutils/theme';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import DoctorDetailsScreen from '../screens/DoctorDetailsScreen';
import DoctorListScreen from '../screens/DoctorListScreen';
import PrescriptionDetailsScreen from '../screens/PrescriptionDetailsScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import { Routes, type RootStackParamList } from './Routes';
import TabNavigator from './TabNavigator';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Headers, tab bar and screen backgrounds follow the config theme.
  const navigationTheme = useMemo<NavigationTheme>(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: colors.primaryText,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.danger,
      },
    }),
    [colors],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <BottomSheetModalProvider>
        <Stack.Navigator
          initialRouteName={Routes.MainTabs}
          // Chevron only: the previous route's name (e.g. "MainTabs") is not a useful back label.
          screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}
        >
          <Stack.Screen
            name={Routes.MainTabs}
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={Routes.DoctorList}
            component={DoctorListScreen}
            // In-screen header: back button, search and filters.
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={Routes.DoctorDetails}
            component={DoctorDetailsScreen}
            options={{ title: t('bookAppointment') }}
          />
          <Stack.Screen
            name={Routes.ServiceList}
            component={ServiceListScreen}
            options={{ title: t('serviceListTitle') }}
          />
          <Stack.Screen
            name={Routes.PrescriptionDetails}
            component={PrescriptionDetailsScreen}
            options={{ title: t('prescriptionSingular') }}
          />
          <Stack.Screen
            name={Routes.AdminSettings}
            component={AdminSettingsScreen}
            options={{ title: t('adminTitle') }}
          />
          {/* No swipe-to-dismiss: leaving a confirmed booking goes through the screen's own actions. */}
          <Stack.Screen
            name={Routes.BookingSuccess}
            component={BookingSuccessScreen}
            options={{
              presentation: 'fullScreenModal',
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
}

export default RootNavigator;
