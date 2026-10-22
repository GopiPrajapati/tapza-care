import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import DoctorDetailsScreen from '../screens/DoctorDetailsScreen';
import DoctorListScreen from '../screens/DoctorListScreen';
import PrescriptionDetailsScreen from '../screens/PrescriptionDetailsScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import { Routes, type RootStackParamList } from './Routes';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={Routes.MainTabs}
        // Chevron only: the previous route's name (e.g. "MainTabs") is not a useful back label.
        screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
        <Stack.Screen
          name={Routes.MainTabs}
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={Routes.DoctorList}
          component={DoctorListScreen}
          options={{ title: 'Doctors' }}
        />
        <Stack.Screen
          name={Routes.DoctorDetails}
          component={DoctorDetailsScreen}
          options={{ title: 'Book appointment' }}
        />
        <Stack.Screen
          name={Routes.ServiceList}
          component={ServiceListScreen}
          options={{ title: 'Services' }}
        />
        <Stack.Screen
          name={Routes.PrescriptionDetails}
          component={PrescriptionDetailsScreen}
          options={{ title: 'Prescription' }}
        />
        <Stack.Screen
          name={Routes.AdminSettings}
          component={AdminSettingsScreen}
          options={{ title: 'Admin settings' }}
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
    </NavigationContainer>
  );
}

export default RootNavigator;
