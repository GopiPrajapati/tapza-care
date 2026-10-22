import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';
import { StyleSheet, type StatusBarStyle, type ViewStyle } from 'react-native';

import type { ThemeConfig } from '../networking/types/layoutConfig';
import { MIN_TAP_TARGET } from './dimensions';
import { typography, type TypographyScale } from './typography';

/**
 * Builds every visual token from config.theme. Components read colours, spacing, radii and type sizes from
 * useTheme() and never hard-code them.
 */

// ---------- Colour math ----------

/** WCAG AA for normal text. */
export const MIN_TEXT_CONTRAST = 4.5;

const BLACK = '#000000';
const WHITE = '#FFFFFF';

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  let value = hex.replace('#', '');
  if (value.length === 3) {
    value = value
      .split('')
      .map(char => char + char)
      .join('');
  }
  // 8-digit hex: ignore alpha for contrast purposes.
  const int = parseInt(value.slice(0, 6), 16);
  return [Math.floor(int / 65536) % 256, Math.floor(int / 256) % 256, int % 256];
}

const rgbToHex = ([r, g, b]: Rgb): string =>
  `#${[r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

/** Linear mix: amount 0 → a, 1 → b. */
export function mix(a: string, b: string, amount: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex([0, 1, 2].map(i => ca[i] + (cb[i] - ca[i]) * amount) as Rgb);
}

/** Adds alpha to a hex colour: withAlpha('#0F172A', 0.5) → '#0F172A80'. */
export const withAlpha = (hex: string, alpha: number): string =>
  `${rgbToHex(hexToRgb(hex))}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()}`;

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(channel => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const isLight = (hex: string) => relativeLuminance(hex) > 0.4;

/**
 * Returns `fg`, nudged towards black or white just enough to reach `min` contrast against every background.
 * Falls back to black or white (whichever contrasts best) if nudging cannot get there.
 */
export function ensureContrast(
  fg: string,
  backgrounds: string[],
  min = MIN_TEXT_CONTRAST,
): string {
  const passes = (color: string) => backgrounds.every(bg => contrastRatio(color, bg) >= min);
  if (passes(fg)) {
    return fg.toUpperCase();
  }
  const target = isLight(backgrounds[0]) ? BLACK : WHITE;
  for (let step = 1; step <= 20; step++) {
    const candidate = mix(fg, target, step / 20);
    if (passes(candidate)) {
      return candidate;
    }
  }
  return readableOn(backgrounds[0]);
}

/** Black or white, whichever reads better on `bg`. */
export const readableOn = (bg: string): string =>
  contrastRatio(WHITE, bg) >= contrastRatio(BLACK, bg) ? WHITE : BLACK;

/** White if it passes on `bg` (it looks friendlier on brand colours), otherwise the best of black/white. */
const textOnFill = (bg: string): string =>
  contrastRatio(WHITE, bg) >= MIN_TEXT_CONTRAST ? WHITE : readableOn(bg);

// ---------- Tokens ----------

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

/** Fixed component sizes, so components never hard-code dimensions. */
export const sizes = {
  minTouch: MIN_TAP_TARGET,
  control: 48,
  controlLarge: 56,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  avatarSm: 40,
  avatarMd: 56,
  avatarLg: 72,
  illustration: 160,
  hairline: StyleSheet.hairlineWidth,
  border: 1,
  handleWidth: 40,
  /** Space kept free above the tab bar for floating UI (toasts, floating bar). */
  tabBarClearance: 64,
} as const;

/** Durations (ms) shared by animations. */
export const motion = {
  pressIn: 90,
  fast: 160,
  normal: 240,
  slow: 400,
  shimmer: 900,
} as const;

export interface ThemeColors {
  // From config (text colours adjusted for contrast if needed)
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  // Derived
  onPrimary: string;
  onSecondary: string;
  onAccent: string;
  /** Primary usable as text/icon colour on background and surface. */
  primaryText: string;
  border: string;
  /** Subtle fill for chips, inputs, pressed states. */
  muted: string;
  success: string;
  onSuccess: string;
  successSurface: string;
  warning: string;
  warningSurface: string;
  danger: string;
  onDanger: string;
  dangerSurface: string;
  overlay: string;
  /** Dark fill for floating bars and toasts (Zepto's "Unlock free delivery" bar). */
  inverseSurface: string;
  onInverse: string;
  skeleton: string;
  skeletonHighlight: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  sizes: typeof sizes;
  motion: typeof motion;
  typography: TypographyScale;
  elevation: Record<'none' | 'card' | 'raised', ViewStyle>;
  statusBarStyle: StatusBarStyle;
  isFestival: boolean;
}

/** Base hues for status colours; adjusted per theme for contrast. */
const STATUS_HUES = { success: '#15803D', warning: '#B45309', danger: '#B91C1C' };

export function buildTheme(config: ThemeConfig): Theme {
  const { primary, secondary, background, surface, accent } = config;
  const surfaces = [background, surface];

  const textPrimary = ensureContrast(config.textPrimary, surfaces);
  const textSecondary = ensureContrast(config.textSecondary, surfaces);
  const status = (hue: string) => ensureContrast(hue, surfaces);
  const success = status(STATUS_HUES.success);
  const warning = status(STATUS_HUES.warning);
  const danger = status(STATUS_HUES.danger);

  const colors: ThemeColors = {
    primary,
    secondary,
    background,
    surface,
    textPrimary,
    textSecondary,
    accent,
    onPrimary: textOnFill(primary),
    onSecondary: textOnFill(secondary),
    onAccent: textOnFill(accent),
    primaryText: ensureContrast(primary, surfaces),
    border: mix(surface, textPrimary, 0.12),
    muted: mix(surface, primary, 0.08),
    success,
    onSuccess: textOnFill(success),
    successSurface: mix(surface, success, 0.12),
    warning,
    warningSurface: mix(surface, warning, 0.12),
    danger,
    onDanger: textOnFill(danger),
    dangerSurface: mix(surface, danger, 0.1),
    overlay: withAlpha(textPrimary, 0.45),
    inverseSurface: textPrimary,
    onInverse: surface,
    skeleton: mix(surface, textPrimary, 0.08),
    skeletonHighlight: mix(surface, textPrimary, 0.03),
  };

  const shadow = (opacity: number, radius: number, offsetY: number, androidElevation: number) => ({
    shadowColor: textPrimary,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: offsetY },
    elevation: androidElevation,
  });

  return {
    colors,
    spacing,
    radii,
    sizes,
    motion,
    typography,
    elevation: {
      none: {},
      card: shadow(0.08, 12, 4, 2),
      raised: shadow(0.14, 18, 8, 6),
    },
    statusBarStyle: isLight(background) ? 'dark-content' : 'light-content',
    isFestival: Boolean(config.festival),
  };
}

// ---------- Provider ----------

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ theme, children }: { theme: Theme; children: ReactNode }) {
  // createElement instead of JSX keeps this file .ts, as in the agreed folder structure.
  return createElement(ThemeContext.Provider, { value: theme }, children);
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return theme;
}

/**
 * Memoised StyleSheet built from the theme. Pass a module-level factory so it is created once per theme:
 *   const createStyles = (t: Theme) => ({ box: { padding: t.spacing.lg } });
 *   const styles = useThemedStyles(createStyles);
 */
export function useThemedStyles<T extends Parameters<typeof StyleSheet.create>[0]>(
  factory: (theme: Theme) => T,
): Readonly<T> {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
