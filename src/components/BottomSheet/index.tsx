import React from 'react';
import { View } from 'react-native';

export interface BottomSheetProps {
  children: React.ReactNode;
}

/**
 * Stub. The components phase replaces this with a thin wrapper over @gorhom/bottom-sheet's BottomSheetModal.
 */
function BottomSheet({ children }: BottomSheetProps) {
  return <View>{children}</View>;
}

export default BottomSheet;
