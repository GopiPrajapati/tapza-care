/**
 * Small pure helpers (dates, ids). ₹ formatting is added with the UI components.
 */

/** The clinic works in India Standard Time (UTC+05:30). Dates in the API are clinic-local. */
export const CLINIC_UTC_OFFSET_MINUTES = 330;
export const CLINIC_UTC_OFFSET = '+05:30';

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

/** YYYY-MM-DD of the clinic-local calendar day for `nowMs` plus `addDays`, regardless of device time zone. */
export function clinicDate(nowMs: number, addDays = 0): string {
  const shifted = nowMs + CLINIC_UTC_OFFSET_MINUTES * MS_PER_MINUTE + addDays * MS_PER_DAY;
  return new Date(shifted).toISOString().slice(0, 10);
}

/** Whole days from clinic date `from` to clinic date `to` (both YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / MS_PER_DAY);
}

/** Clinic-local ISO timestamp, e.g. "2026-10-22T09:30:00+05:30". */
export function clinicTimestamp(date: string, minutesFromMidnight: number): string {
  const hh = String(Math.floor(minutesFromMidnight / 60)).padStart(2, '0');
  const mm = String(minutesFromMidnight % 60).padStart(2, '0');
  return `${date}T${hh}:${mm}:00${CLINIC_UTC_OFFSET}`;
}

export const isIsoDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

/** Deterministic 32-bit FNV-1a hash, for stable pseudo-random mock data. */
/* eslint-disable no-bitwise -- FNV-1a is defined in terms of XOR and unsigned 32-bit math. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
/* eslint-enable no-bitwise */
