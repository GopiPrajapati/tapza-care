import diwaliConfig from '../src/networking/mockData/config.diwali.json';
import normalConfig from '../src/networking/mockData/config.normal.json';
import { parseConfig } from '../src/networking/types/configSchema';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

describe('parseConfig', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('accepts the normal config and drops only its unknown section', () => {
    const result = parseConfig(normalConfig);
    if (!result.ok) {
      throw new Error(result.error);
    }
    expect(result.config.sections.map(s => s.type)).toEqual([
      'hero_banner',
      'quick_actions',
      'category_chips',
      'doctor_carousel',
      'service_grid',
      'offer_strip',
    ]);
    expect(result.droppedSections).toEqual([
      expect.objectContaining({ type: 'video_reel', reason: 'unknown_type' }),
    ]);
    expect(result.config.theme.festival).toBeUndefined();
  });

  it('accepts the Diwali config with its own theme, festival and section order', () => {
    const result = parseConfig(diwaliConfig);
    if (!result.ok) {
      throw new Error(result.error);
    }
    expect(result.config.theme.festival?.name).toBe('Diwali');
    expect(result.config.theme.primary).not.toBe(normalConfig.theme.primary);
    expect(result.config.sections.map(s => s.type)).toEqual([
      'hero_banner',
      'offer_strip',
      'service_grid',
      'doctor_carousel',
      'quick_actions',
      'category_chips',
    ]);
    expect(result.droppedSections).toEqual([
      expect.objectContaining({ type: 'rangoli_gallery', reason: 'unknown_type' }),
    ]);
  });

  it('drops an invalid section and keeps the rest', () => {
    const raw = clone(normalConfig);
    const grid = raw.sections.find(s => s.type === 'service_grid');
    // A service without a price is invalid.
    delete (grid?.items[0] as { priceInr?: number }).priceInr;

    const result = parseConfig(raw);
    if (!result.ok) {
      throw new Error(result.error);
    }
    expect(result.config.sections.some(s => s.type === 'service_grid')).toBe(false);
    expect(result.config.sections).toHaveLength(5);
    expect(result.droppedSections).toContainEqual(
      expect.objectContaining({ id: 'sec-services', reason: 'invalid' }),
    );
  });

  it('drops a section with a bad background colour', () => {
    const raw = clone(normalConfig);
    raw.sections[1].background.value = 'teal';
    const result = parseConfig(raw);
    expect(result.ok && result.config.sections.some(s => s.id === 'sec-quick')).toBe(false);
  });

  it('drops unknown section types without throwing', () => {
    const raw = clone(normalConfig);
    raw.sections.unshift({
      id: 'sec-new',
      type: 'carousel_3d',
      background: { kind: 'color', value: '#FFFFFF' },
      items: [],
    } as (typeof raw.sections)[number]);

    expect(() => parseConfig(raw)).not.toThrow();
    const result = parseConfig(raw);
    expect(result.ok && result.config.sections[0].type).toBe('hero_banner');
  });

  it('turns unknown action types into "none" instead of dropping the item', () => {
    const raw = clone(normalConfig);
    (raw.sections[1].items[0] as { action: { type: string } }).action = { type: 'open_wallet' };
    const result = parseConfig(raw);
    if (!result.ok) {
      throw new Error(result.error);
    }
    const quick = result.config.sections.find(s => s.type === 'quick_actions');
    expect(quick?.type === 'quick_actions' && quick.items[0].action.type).toBe('none');
  });

  it('rejects a config whose envelope is invalid', () => {
    expect(parseConfig(null).ok).toBe(false);
    expect(parseConfig({ version: 1 }).ok).toBe(false);

    const badTheme = clone(normalConfig);
    badTheme.theme.primary = 'not-a-colour';
    const result = parseConfig(badTheme);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toContain('theme.primary');
  });
});
