import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LAUNCH_COLORS } from '../commonutils/constants';
import { typography } from '../commonutils/typography';

/**
 * Shown for the few frames while persisted settings load. It matches the neutral native launch screen exactly
 * (white, "Tapza Care" centred) so there is no visible jump before the config-aware BrandSplash takes over.
 */
function StartupSplash() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Tapza Care">
      <Text style={styles.title} allowFontScaling={false}>
        Tapza Care
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LAUNCH_COLORS.background,
  },
  title: { ...typography.title, color: LAUNCH_COLORS.text },
});

export default StartupSplash;
