import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';

/** Placeholder: Upcoming and past bookings go here. */
function MyBookingsScreen() {
  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">My bookings</Text>
      <Text>Upcoming and past bookings go here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default MyBookingsScreen;
