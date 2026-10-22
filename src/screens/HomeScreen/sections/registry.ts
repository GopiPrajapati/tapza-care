import { createElement, type ComponentType } from 'react';

import type {
  Section,
  SectionType,
} from '../../../networking/types/configSchema';
import CategoryChips from './CategoryChips';
import DoctorCarousel from './DoctorCarousel';
import HeroBanner from './HeroBanner';
import OfferStrip from './OfferStrip';
import QuickActions from './QuickActions';
import ServiceGrid from './ServiceGrid';

type SectionComponents = {
  [Type in SectionType]: ComponentType<{
    section: Extract<Section, { type: Type }>;
  }>;
};

/** Section type → renderer. Adding a section type means adding a schema and an entry here. */
export const SECTION_COMPONENTS: SectionComponents = {
  hero_banner: HeroBanner,
  category_chips: CategoryChips,
  quick_actions: QuickActions,
  service_grid: ServiceGrid,
  doctor_carousel: DoctorCarousel,
  offer_strip: OfferStrip,
};

/** Sections that sit in a thin band instead of a full section block. */
export const COMPACT_SECTION_TYPES: ReadonlySet<string> = new Set([
  'offer_strip',
]);

const isKnownType = (type: string): type is SectionType =>
  type in SECTION_COMPONENTS;

/**
 * Renders a section's content, or null for a type this app does not know (never throws). parseConfig already
 * drops unknown types; this is the second line of defence.
 */
export function renderSection(section: { type: string }) {
  if (!isKnownType(section.type)) {
    return null;
  }
  const Component = SECTION_COMPONENTS[section.type] as ComponentType<{
    section: Section;
  }>;
  return createElement(Component, { section: section as Section });
}
