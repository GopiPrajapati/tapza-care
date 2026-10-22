import React, { useCallback } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';

/** Call ref.current?.present() / dismiss(). */
export type BottomSheetRef = BottomSheetModal;

export interface BottomSheetProps {
  ref?: React.Ref<BottomSheetModal>;
  children: React.ReactNode;
  title?: string;
  /** e.g. ['50%', '90%']. Without snap points the sheet sizes to its content. */
  snapPoints?: Array<string | number>;
  onDismiss?: () => void;
}

/**
 * Thin, themed wrapper over @gorhom's BottomSheetModal: swipe down or tap the backdrop to close.
 * Needs BottomSheetModalProvider above it (inside the NavigationContainer).
 */
function BottomSheet({
  ref,
  children,
  title,
  snapPoints,
  onDismiss,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        style={[props.style, { backgroundColor: colors.inverseSurface }]}
      />
    ),
    [colors.inverseSurface],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={!snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={onDismiss}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      accessibilityLabel={title}
    >
      <BottomSheetView
        style={[
          styles.content,
          { paddingBottom: insets.bottom + styles.content.paddingTop },
        ]}
      >
        {title ? (
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
        ) : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  background: { backgroundColor: colors.surface, borderRadius: radii.xxl },
  handle: { backgroundColor: colors.border, width: sizes.handleWidth },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
});

export default BottomSheet;
