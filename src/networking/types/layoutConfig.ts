/**
 * LayoutConfig exactly as the assignment defines it (GET /config). This is the raw, unvalidated wire shape.
 * After validation, screens use `ValidatedConfig` from ./configSchema, whose sections are a typed union.
 */

/** Screens a config tab may point to. Anything else is skipped. */
export type TabScreen = 'home' | 'bookings' | 'prescriptions' | 'profile';

export interface TabConfig {
  id: string;
  label: string;
  /** Icon name from our icon map (e.g. "home", "calendar"). Unknown names fall back to a default icon. */
  icon: string;
  /** Typed as string because it comes from remote JSON; validated against TabScreen at render time. */
  screen: string;
}

export interface FestivalTheme {
  name: string;
  greeting: string;
  /** Bundled asset key (e.g. "home/diwali-banner") or a remote URL. */
  bannerImageUrl: string;
}

/** All values are hex colours. */
export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  festival?: FestivalTheme;
}

export type SectionBackgroundKind = 'color' | 'gradient' | 'image';

/**
 * - color: one hex colour, e.g. "#E6F4F1"
 * - gradient: two or more comma-separated hex colours, top to bottom, e.g. "#0F766E,#14B8A6"
 * - image: bundled asset key or remote URL
 */
export interface SectionBackground {
  kind: SectionBackgroundKind;
  value: string;
}

export interface RawSection {
  id: string;
  /** Unknown types are skipped. */
  type: string;
  background: SectionBackground;
  title?: string;
  items: unknown[];
}

export interface LayoutConfig {
  version: number;
  theme: ThemeConfig;
  tabs: TabConfig[];
  sections: RawSection[];
}
