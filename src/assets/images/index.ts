import type { ImageSourcePropType } from 'react-native';

/**
 * Bundled images by key. Config and fixtures reference images by key (e.g. "doctors/doc-1",
 * "home/diwali-banner") so the app looks complete offline.
 *
 * To add one: put the file in src/assets/images/<folder>/ and register it, e.g.
 *   'home/diwali-banner': require('./home/diwali-banner.png'),
 */
const IMAGES: Record<string, ImageSourcePropType> = {};

/**
 * Resolves an image key or URL. Returns undefined when nothing matches so callers can render their own
 * fallback (initials, illustration or gradient).
 */
export function getImage(keyOrUrl: string | undefined): ImageSourcePropType | undefined {
  if (!keyOrUrl) {
    return undefined;
  }
  if (/^https?:\/\//.test(keyOrUrl)) {
    return { uri: keyOrUrl };
  }
  return IMAGES[keyOrUrl];
}
