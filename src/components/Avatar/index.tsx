import React, { useState } from 'react';
import { Image, View } from 'react-native';

import { getImage } from '../../assets/images';
import { getInitials } from '../../commonutils/helpers';
import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  name: string;
  /** Image key or URL; falls back to initials when missing or when it fails to load. */
  image?: string;
  size?: AvatarSize;
}

function Avatar({ name, image, size = 'md' }: AvatarProps) {
  const { sizes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [failed, setFailed] = useState(false);
  const source = failed ? undefined : getImage(image);
  const dimension = {
    sm: sizes.avatarSm,
    md: sizes.avatarMd,
    lg: sizes.avatarLg,
  }[size];
  const frame = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  if (source) {
    return (
      <Image
        source={source}
        accessibilityLabel={name}
        onError={() => setFailed(true)}
        style={[styles.image, frame]}
      />
    );
  }
  return (
    <View style={[styles.fallback, frame]} accessible accessibilityLabel={name}>
      <AppText
        variant={size === 'sm' ? 'label' : 'heading'}
        color="primaryText"
        maxFontSizeMultiplier={1}
      >
        {getInitials(name)}
      </AppText>
    </View>
  );
}

const createStyles = ({ colors }: Theme) => ({
  image: { backgroundColor: colors.muted },
  fallback: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.muted,
  },
});

export default Avatar;
