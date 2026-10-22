import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { mix, useTheme, useTone } from '../../../commonutils/theme';

/**
 * Drawn hero illustration used when the config's hero image is not bundled: a care badge on normal days and a
 * lit diya during a festival. Decorative only.
 */
function HeroArt({ festive }: { festive: boolean }) {
  const { colors, sizes } = useTheme();
  const tone = useTone();
  const ink = tone?.foreground ?? colors.textPrimary;
  const accent = colors.accent;

  return (
    <Svg
      width={sizes.heroArt}
      height={sizes.heroArt}
      viewBox="0 0 120 120"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Circle cx="60" cy="60" r="56" fill={ink} fillOpacity={0.12} />
      {festive ? (
        <G>
          <Circle cx="22" cy="30" r="3" fill={accent} />
          <Circle cx="98" cy="24" r="2.5" fill={ink} fillOpacity={0.7} />
          <Circle cx="102" cy="58" r="3" fill={accent} />
          <Circle cx="18" cy="70" r="2" fill={ink} fillOpacity={0.7} />
          <Path
            d="M60 22 C72 40 71 54 60 60 C49 54 48 40 60 22 Z"
            fill={accent}
          />
          <Path
            d="M60 36 C66 46 65 53 60 56 C55 53 54 46 60 36 Z"
            fill={mix(accent, colors.surface, 0.55)}
          />
          <Ellipse
            cx="60"
            cy="72"
            rx="34"
            ry="7"
            fill={mix(accent, colors.textPrimary, 0.35)}
          />
          <Path d="M26 72 Q60 112 94 72 Z" fill={accent} />
          <Path
            d="M36 82 Q60 100 84 82"
            stroke={ink}
            strokeOpacity={0.6}
            strokeWidth="3"
            fill="none"
          />
        </G>
      ) : (
        <G>
          <Rect
            x="34"
            y="28"
            width="52"
            height="64"
            rx="14"
            fill={ink}
            fillOpacity={0.9}
          />
          <Rect x="54" y="40" width="12" height="40" rx="3" fill={accent} />
          <Rect x="40" y="54" width="40" height="12" rx="3" fill={accent} />
          <Path
            d="M14 96 H40 L47 86 L55 104 L63 90 H106"
            stroke={ink}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>
      )}
    </Svg>
  );
}

export default HeroArt;
