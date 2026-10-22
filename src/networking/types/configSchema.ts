import { z } from 'zod';

import type { LayoutConfig } from './layoutConfig';

/**
 * zod schemas for GET /config and parseConfig().
 *
 * Validation is two-level so one bad section never breaks the page:
 * 1. The envelope (version, theme, tabs, sections array) must be valid, otherwise the whole config is rejected.
 * 2. Each section is validated on its own. Unknown types and invalid sections are dropped, never thrown.
 */

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const HEX = '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})';
/** Two or more comma-separated hex colours. */
const GRADIENT = new RegExp(`^${HEX}(?:\\s*,\\s*${HEX})+$`);

const hexColor = z.string().regex(HEX_COLOR, 'Expected a hex colour like #0F766E');
const nonEmpty = z.string().trim().min(1);

// ---------- Envelope ----------

const FestivalSchema = z.object({
  name: nonEmpty,
  greeting: nonEmpty,
  bannerImageUrl: nonEmpty,
});

export const ThemeSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  background: hexColor,
  surface: hexColor,
  textPrimary: hexColor,
  textSecondary: hexColor,
  accent: hexColor,
  festival: FestivalSchema.optional(),
});

const TabSchema = z.object({
  id: nonEmpty,
  label: nonEmpty,
  icon: z.string(),
  // Not restricted here: resolveTabs() skips unknown screens so one bad tab does not reject the config.
  screen: z.string(),
});

export const SectionBackgroundSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('color'), value: hexColor }),
  z.object({
    kind: z.literal('gradient'),
    value: z.string().regex(GRADIENT, 'Expected comma-separated hex colours'),
  }),
  z.object({ kind: z.literal('image'), value: nonEmpty }),
]);

const EnvelopeSchema = z.object({
  version: z.number().int().nonnegative(),
  theme: ThemeSchema,
  tabs: z.array(TabSchema),
  sections: z.array(z.unknown()),
});

/** Fields every section has, regardless of type. */
const SectionBaseSchema = z.object({
  id: nonEmpty,
  type: nonEmpty,
  background: SectionBackgroundSchema,
  title: z.string().optional(),
  items: z.array(z.unknown()),
});

// ---------- Section items ----------

/**
 * What tapping a chip/tile/banner does. Unknown action types become "none" instead of invalidating the item,
 * so a newer config never breaks an older app.
 */
export const APP_ACTIONS = [
  'open_doctors',
  'open_services',
  'open_bookings',
  'open_prescriptions',
  'open_reminders',
  'open_family',
  'coming_soon',
  'none',
] as const;
export type AppActionType = (typeof APP_ACTIONS)[number];

const ActionSchema = z.object({
  type: z.enum(APP_ACTIONS).catch('none'),
  /** Pre-selects a specialty filter for open_doctors. */
  specialty: z.string().optional(),
});
export type AppAction = z.infer<typeof ActionSchema>;

const HeroBannerItemSchema = z.object({
  id: nonEmpty,
  title: nonEmpty,
  subtitle: z.string().optional(),
  imageKey: z.string().optional(),
  ctaLabel: z.string().optional(),
  action: ActionSchema.optional(),
});

/** Used by both category_chips and quick_actions. */
const IconActionItemSchema = z.object({
  id: nonEmpty,
  label: nonEmpty,
  icon: z.string(),
  action: ActionSchema,
});

const ServiceItemSchema = z.object({
  id: nonEmpty,
  name: nonEmpty,
  priceInr: z.number().nonnegative(),
  imageKey: z.string().optional(),
  badge: z.string().optional(),
  /** The doctor whose booking screen opens for this service. */
  doctorId: nonEmpty,
});

const DoctorRefItemSchema = z.object({ doctorId: nonEmpty });

const OfferItemSchema = z.object({
  id: nonEmpty,
  message: nonEmpty,
  icon: z.string().optional(),
  action: ActionSchema.optional(),
});

export type HeroBannerItem = z.infer<typeof HeroBannerItemSchema>;
export type IconActionItem = z.infer<typeof IconActionItemSchema>;
export type ServiceItem = z.infer<typeof ServiceItemSchema>;
export type DoctorRefItem = z.infer<typeof DoctorRefItemSchema>;
export type OfferItem = z.infer<typeof OfferItemSchema>;

// ---------- Typed sections ----------

const sectionOf = <T extends string, I extends z.ZodType>(type: T, item: I) =>
  SectionBaseSchema.extend({ type: z.literal(type), items: z.array(item).min(1) });

const SECTION_SCHEMAS = {
  hero_banner: sectionOf('hero_banner', HeroBannerItemSchema),
  category_chips: sectionOf('category_chips', IconActionItemSchema),
  quick_actions: sectionOf('quick_actions', IconActionItemSchema),
  // Addition to the assignment's section shape: service_grid may set columns (default 2).
  service_grid: sectionOf('service_grid', ServiceItemSchema).extend({
    columns: z.union([z.literal(2), z.literal(3)]).default(2),
  }),
  doctor_carousel: sectionOf('doctor_carousel', DoctorRefItemSchema),
  offer_strip: sectionOf('offer_strip', OfferItemSchema),
} as const;

export type SectionType = keyof typeof SECTION_SCHEMAS;
export const SECTION_TYPES = Object.keys(SECTION_SCHEMAS) as SectionType[];

export type HeroBannerSection = z.infer<typeof SECTION_SCHEMAS.hero_banner>;
export type CategoryChipsSection = z.infer<typeof SECTION_SCHEMAS.category_chips>;
export type QuickActionsSection = z.infer<typeof SECTION_SCHEMAS.quick_actions>;
export type ServiceGridSection = z.infer<typeof SECTION_SCHEMAS.service_grid>;
export type DoctorCarouselSection = z.infer<typeof SECTION_SCHEMAS.doctor_carousel>;
export type OfferStripSection = z.infer<typeof SECTION_SCHEMAS.offer_strip>;

export type Section =
  | HeroBannerSection
  | CategoryChipsSection
  | QuickActionsSection
  | ServiceGridSection
  | DoctorCarouselSection
  | OfferStripSection;

/** A config after validation: same envelope as LayoutConfig, with only known, valid sections. */
export type ValidatedConfig = Omit<LayoutConfig, 'sections'> & { sections: Section[] };

// ---------- parseConfig ----------

export interface DroppedSection {
  /** Index in the original sections array. */
  index: number;
  id?: string;
  type?: string;
  reason: 'unknown_type' | 'invalid';
  details?: string;
}

export type ParseConfigResult =
  | { ok: true; config: ValidatedConfig; droppedSections: DroppedSection[] }
  | { ok: false; error: string };

const isSectionType = (type: string): type is SectionType => type in SECTION_SCHEMAS;

const formatIssues = (error: z.ZodError): string =>
  error.issues
    .map(issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');

function parseSection(
  raw: unknown,
  index: number,
): { section: Section } | { dropped: DroppedSection } {
  const base = SectionBaseSchema.safeParse(raw);
  if (!base.success) {
    return { dropped: { index, reason: 'invalid', details: formatIssues(base.error) } };
  }
  const { id, type } = base.data;
  if (!isSectionType(type)) {
    return { dropped: { index, id, type, reason: 'unknown_type' } };
  }
  const typed = SECTION_SCHEMAS[type].safeParse(raw);
  if (!typed.success) {
    return {
      dropped: { index, id, type, reason: 'invalid', details: formatIssues(typed.error) },
    };
  }
  return { section: typed.data };
}

/**
 * Validates a raw config. Never throws.
 * Returns ok:false only when the envelope itself is invalid; bad or unknown sections are dropped and reported.
 */
export function parseConfig(raw: unknown): ParseConfigResult {
  const envelope = EnvelopeSchema.safeParse(raw);
  if (!envelope.success) {
    return { ok: false, error: formatIssues(envelope.error) };
  }

  const sections: Section[] = [];
  const droppedSections: DroppedSection[] = [];
  const seenIds = new Set<string>();

  envelope.data.sections.forEach((rawSection, index) => {
    const result = parseSection(rawSection, index);
    if ('dropped' in result) {
      droppedSections.push(result.dropped);
      return;
    }
    // Section ids are list keys, so they must be unique.
    if (seenIds.has(result.section.id)) {
      droppedSections.push({
        index,
        id: result.section.id,
        type: result.section.type,
        reason: 'invalid',
        details: 'Duplicate section id',
      });
      return;
    }
    seenIds.add(result.section.id);
    sections.push(result.section);
  });

  if (__DEV__ && droppedSections.length > 0) {
    console.warn('[config] Dropped sections:', droppedSections);
  }

  const { version, theme, tabs } = envelope.data;
  return { ok: true, config: { version, theme, tabs, sections }, droppedSections };
}
