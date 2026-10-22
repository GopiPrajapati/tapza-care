import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

export interface ScreenContainerProps {
  children: React.ReactNode;
  /** Safe-area edges to pad. Defaults to all four. */
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

function ScreenContainer({ children, edges, style }: ScreenContainerProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default ScreenContainer;
