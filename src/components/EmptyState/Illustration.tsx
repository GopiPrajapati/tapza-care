import React from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { mix, useTheme } from '../../commonutils/theme';

export type IllustrationName =
  | 'bookings'
  | 'prescriptions'
  | 'search'
  | 'error'
  | 'generic';

/**
 * Simple drawn illustrations in theme colours, so empty and error states look designed in both themes without
 * bundling images. All are decorative (hidden from screen readers).
 */
function Illustration({ name }: { name: IllustrationName }) {
  const { colors, sizes } = useTheme();
  const size = sizes.illustration;
  const soft = mix(colors.background, colors.primary, 0.12);
  const mid = mix(colors.surface, colors.primary, 0.35);
  const strong = colors.primary;
  const accent = colors.accent;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Circle cx="80" cy="80" r="72" fill={soft} />
      {name === 'bookings' && (
        <G>
          <Rect
            x="40"
            y="46"
            width="80"
            height="72"
            rx="12"
            fill={colors.surface}
            stroke={mid}
            strokeWidth="3"
          />
          <Rect x="40" y="46" width="80" height="20" rx="10" fill={strong} />
          <Line
            x1="58"
            y1="38"
            x2="58"
            y2="54"
            stroke={strong}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Line
            x1="102"
            y1="38"
            x2="102"
            y2="54"
            stroke={strong}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Circle cx="62" cy="84" r="5" fill={mid} />
          <Circle cx="80" cy="84" r="5" fill={mid} />
          <Circle cx="98" cy="84" r="5" fill={accent} />
          <Circle cx="62" cy="102" r="5" fill={mid} />
          <Circle cx="80" cy="102" r="5" fill={mid} />
        </G>
      )}
      {name === 'prescriptions' && (
        <G>
          <Rect
            x="46"
            y="36"
            width="68"
            height="88"
            rx="10"
            fill={colors.surface}
            stroke={mid}
            strokeWidth="3"
          />
          <Line
            x1="58"
            y1="58"
            x2="102"
            y2="58"
            stroke={mid}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Line
            x1="58"
            y1="72"
            x2="94"
            y2="72"
            stroke={mid}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Line
            x1="58"
            y1="86"
            x2="86"
            y2="86"
            stroke={mid}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <G rotation="-35" origin="104, 112">
            <Rect x="86" y="102" width="40" height="20" rx="10" fill={accent} />
            <Rect x="86" y="102" width="20" height="20" rx="10" fill={strong} />
          </G>
        </G>
      )}
      {name === 'search' && (
        <G>
          <Circle
            cx="72"
            cy="72"
            r="28"
            fill={colors.surface}
            stroke={strong}
            strokeWidth="6"
          />
          <Line
            x1="92"
            y1="92"
            x2="114"
            y2="114"
            stroke={strong}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <Path
            d="M62 66 Q72 58 82 66"
            stroke={mid}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </G>
      )}
      {name === 'error' && (
        <G>
          <Path
            d="M50 104 a20 20 0 0 1 4-39 a28 28 0 0 1 53-6 a22 22 0 0 1 3 45 z"
            fill={colors.surface}
            stroke={mid}
            strokeWidth="3"
          />
          <Line
            x1="72"
            y1="78"
            x2="90"
            y2="96"
            stroke={colors.danger}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <Line
            x1="90"
            y1="78"
            x2="72"
            y2="96"
            stroke={colors.danger}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </G>
      )}
      {name === 'generic' && (
        <G>
          <Rect
            x="44"
            y="52"
            width="72"
            height="60"
            rx="12"
            fill={colors.surface}
            stroke={mid}
            strokeWidth="3"
          />
          <Path d="M44 72 H116" stroke={mid} strokeWidth="3" />
          <Circle cx="80" cy="92" r="8" fill={accent} />
        </G>
      )}
    </Svg>
  );
}

export default Illustration;
