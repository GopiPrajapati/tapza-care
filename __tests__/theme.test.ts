import diwaliConfig from '../src/networking/mockData/config.diwali.json';
import normalConfig from '../src/networking/mockData/config.normal.json';
import {
  buildTheme,
  contrastRatio,
  ensureContrast,
  MIN_TEXT_CONTRAST,
  type Theme,
} from '../src/commonutils/theme';
import type { ThemeConfig } from '../src/networking/types/layoutConfig';

/** Every text/background pair the UI uses. */
const textPairs = ({ colors: c }: Theme): Array<[string, string, string]> => [
  ['textPrimary on background', c.textPrimary, c.background],
  ['textPrimary on surface', c.textPrimary, c.surface],
  ['textSecondary on background', c.textSecondary, c.background],
  ['textSecondary on surface', c.textSecondary, c.surface],
  ['primaryText on surface', c.primaryText, c.surface],
  ['primaryText on background', c.primaryText, c.background],
  ['onPrimary on primary', c.onPrimary, c.primary],
  ['onSecondary on secondary', c.onSecondary, c.secondary],
  ['onAccent on accent', c.onAccent, c.accent],
  ['danger on surface', c.danger, c.surface],
  ['success on surface', c.success, c.surface],
  ['warning on surface', c.warning, c.surface],
  ['onDanger on danger', c.onDanger, c.danger],
];

/** A deliberately bad config: pale text on pale backgrounds and a yellow brand colour. */
const lowContrast: ThemeConfig = {
  primary: '#FDE047',
  secondary: '#A5F3FC',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#D4D4D4',
  textSecondary: '#E5E5E5',
  accent: '#FEF08A',
};

/** A dark config, to check the helpers work in both directions. */
const dark: ThemeConfig = {
  primary: '#1E3A8A',
  secondary: '#334155',
  background: '#0B1120',
  surface: '#111827',
  textPrimary: '#334155',
  textSecondary: '#1F2937',
  accent: '#F59E0B',
};

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 1);
  });

  it('leaves a colour that already passes untouched', () => {
    expect(ensureContrast('#0F172A', ['#FFFFFF'])).toBe('#0F172A');
  });
});

describe.each([
  ['normal config', normalConfig.theme as ThemeConfig],
  ['Diwali config', diwaliConfig.theme as ThemeConfig],
  ['low-contrast config', lowContrast],
  ['dark config', dark],
])('buildTheme(%s)', (_name, themeConfig) => {
  const theme = buildTheme(themeConfig);

  it.each(textPairs(theme))('%s reaches WCAG AA', (_pair, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it('keeps the brand colours from the config', () => {
    expect(theme.colors.primary).toBe(themeConfig.primary);
    expect(theme.colors.background).toBe(themeConfig.background);
  });
});

describe('buildTheme', () => {
  it('flags festival themes and picks a readable status bar', () => {
    expect(buildTheme(diwaliConfig.theme as ThemeConfig).isFestival).toBe(true);
    expect(buildTheme(normalConfig.theme as ThemeConfig).statusBarStyle).toBe('dark-content');
    expect(buildTheme(dark).statusBarStyle).toBe('light-content');
  });
});
