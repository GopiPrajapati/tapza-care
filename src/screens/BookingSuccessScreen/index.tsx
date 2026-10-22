import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';

/** Placeholder: Success animation and booking summary go here. */
function BookingSuccessScreen() {
  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">Booking confirmed</Text>
      <Text>Success animation and booking summary go here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default BookingSuccessScreen;
