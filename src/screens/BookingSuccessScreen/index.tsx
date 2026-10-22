import React, { useCallback } from 'react';
import { BackHandler, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Button from '../../components/Button';
import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type RootStackScreenProps } from '../../container/Routes';

/** Placeholder: success animation and booking summary go here. */
function BookingSuccessScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof Routes.BookingSuccess>) {
  const goHome = useCallback(
    () => navigation.popTo(Routes.MainTabs, { screen: Routes.Home }),
    [navigation],
  );

  // Android back leaves the confirmed booking for Home instead of returning to the booking screen.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goHome();
        return true;
      });
      return () => sub.remove();
    }, [goHome]),
  );

  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">Booking confirmed</Text>
      <Text>Success animation and booking summary go here.</Text>
      <Text>bookingId: {route.params.bookingId}</Text>
      <Button
        label="View my bookings"
        onPress={() => navigation.popTo(Routes.MainTabs, { screen: Routes.Bookings })}
      />
      <Button label="Back to home" onPress={goHome} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default BookingSuccessScreen;
