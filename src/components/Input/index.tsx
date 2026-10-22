import React, { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';

export interface InputProps
  extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  /** Visible label; also the accessibility label. */
  label: string;
  /** Error message shown under the field. */
  error?: string;
  hint?: string;
}

function Input({
  label,
  error,
  hint,
  onFocus,
  onBlur,
  multiline,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primaryText}
        multiline={multiline}
        onFocus={event => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.focused,
          error ? styles.errored : null,
        ]}
        {...rest}
      />
      {error || hint ? (
        <AppText variant="caption" color={error ? 'danger' : 'textSecondary'}>
          {error ?? hint}
        </AppText>
      ) : null}
    </View>
  );
}

const createStyles = ({
  colors,
  spacing,
  radii,
  sizes,
  typography,
}: Theme) => ({
  wrapper: { gap: spacing.xs },
  input: {
    ...typography.body,
    minHeight: sizes.control,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: sizes.border,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  multiline: { textAlignVertical: 'top' as const },
  focused: { borderColor: colors.primaryText },
  errored: { borderColor: colors.danger },
});

export default Input;
