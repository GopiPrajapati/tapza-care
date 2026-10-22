import type { TextStyle } from 'react-native';

/**
 * Type scale. Sizes are generous because many users are older; body text is 16pt.
 * Text keeps OS font scaling on (React Native's default); components cap it with maxFontSizeMultiplier only where a
 * layout would break.
 */
export type TypographyVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption';

export type TypographyScale = Record<
  TypographyVariant,
  Required<Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>>
>;

export const typography: TypographyScale = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  subheading: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
};

/** Upper bound for OS font scaling on dense UI (chips, tab labels, badges). */
export const MAX_FONT_SCALE_DENSE = 1.4;
