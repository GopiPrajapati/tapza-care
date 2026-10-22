import React, { useMemo } from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { getImage } from '../../../assets/images';
import { toneOn, ToneProvider, useTheme } from '../../../commonutils/theme';
import type { SectionBackground as SectionBackgroundConfig } from '../../../networking/types/layoutConfig';

export interface SectionBackgroundProps {
  background: SectionBackgroundConfig;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Colours a section's background resolves to (every gradient stop) and the readable text tone on it.
 * Image backgrounds fall back to the brand gradient when the image key is not bundled.
 */
export function useSectionPaint(background: SectionBackgroundConfig) {
  const { colors } = useTheme();
  const image =
    background.kind === 'image' ? getImage(background.value) : undefined;

  const stops = useMemo(() => {
    if (background.kind === 'color') {
      return [background.value];
    }
    if (background.kind === 'gradient') {
      return background.value.split(',').map(stop => stop.trim());
    }
    // Text on an image sits on a dark scrim; without the image, use the brand gradient.
    return image ? [colors.inverseSurface] : [colors.primary, colors.secondary];
  }, [background, image, colors]);

  const tone = useMemo(() => toneOn(stops, colors), [stops, colors]);
  return { image, stops, tone };
}

/** Paints a section's config background (colour, gradient or image) and gives the text inside a readable tone. */
function SectionBackground({
  background,
  children,
  style,
}: SectionBackgroundProps) {
  const { colors } = useTheme();
  const { image, stops, tone } = useSectionPaint(background);
  const content = <ToneProvider tone={tone}>{children}</ToneProvider>;

  if (image) {
    return (
      <ImageBackground source={image} style={style} resizeMode="cover">
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
        />
        {content}
      </ImageBackground>
    );
  }
  if (stops.length > 1) {
    // The gradient is a background layer: as a legacy (interop) native view it does not grow with its children.
    return (
      <View style={style}>
        <LinearGradient colors={stops} style={StyleSheet.absoluteFill} />
        {content}
      </View>
    );
  }
  return <View style={[style, { backgroundColor: stops[0] }]}>{content}</View>;
}

export default SectionBackground;
