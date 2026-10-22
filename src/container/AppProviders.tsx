import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * App-wide providers. QueryClient, Theme and BottomSheetModalProvider are added in later phases.
 */
function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default AppProviders;
