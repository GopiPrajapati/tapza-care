/**
 * Small pure helpers: dates, ₹ formatting, names.
 */

/** Indian grouping: 1200 → "₹1,200", 120000 → "₹1,20,000". Avoids relying on Intl support in the JS engine. */
export function formatInr(amount: number): string {
  const rounded = Math.round(amount);
  const digits = String(Math.abs(rounded));
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`
    : lastThree;
  return `${rounded < 0 ? '-' : ''}₹${grouped}`;
}

/** "Dr. Lakshmi Prasanna" → "LP". Titles are ignored. */
export function getInitials(name: string): string {
  const words = name
    .replace(/^(dr|mr|mrs|ms)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

/** The clinic works in India Standard Time (UTC+05:30). Dates in the API are clinic-local. */
export const CLINIC_UTC_OFFSET_MINUTES = 330;
export const CLINIC_UTC_OFFSET = '+05:30';

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

/** YYYY-MM-DD of the clinic-local calendar day for `nowMs` plus `addDays`, regardless of device time zone. */
export function clinicDate(nowMs: number, addDays = 0): string {
  const shifted =
    nowMs + CLINIC_UTC_OFFSET_MINUTES * MS_PER_MINUTE + addDays * MS_PER_DAY;
  return new Date(shifted).toISOString().slice(0, 10);
}

/** Whole days from clinic date `from` to clinic date `to` (both YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / MS_PER_DAY);
}

/** Clinic-local ISO timestamp, e.g. "2026-10-22T09:30:00+05:30". */
export function clinicTimestamp(
  date: string,
  minutesFromMidnight: number,
): string {
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

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Hour (0–23) on the clinic's clock. */
export const clinicHour = (nowMs: number): number =>
  new Date(nowMs + CLINIC_UTC_OFFSET_MINUTES * MS_PER_MINUTE).getUTCHours();

/** "2026-10-22T16:30:00+05:30" → "4:30 PM". Reads the clinic-local time written in the timestamp. */
export function formatClinicTime(iso: string): string {
  const [hours, minutes] = iso.slice(11, 16).split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

/** "Today", "Tomorrow" or "Thu 23 Oct" for a clinic date (YYYY-MM-DD). */
export function formatClinicDay(date: string, nowMs: number): string {
  const offset = daysBetween(clinicDate(nowMs), date);
  if (offset === 0) {
    return 'Today';
  }
  if (offset === 1) {
    return 'Tomorrow';
  }
  const day = new Date(`${date}T00:00:00Z`);
  return `${WEEKDAYS[day.getUTCDay()]} ${day.getUTCDate()} ${
    MONTHS[day.getUTCMonth()]
  }`;
}

/** "Good morning" / "Good afternoon" / "Good evening" by clinic time. */
export function greetingFor(nowMs: number): string {
  const hour = clinicHour(nowMs);
  if (hour < 12) {
    return 'Good morning';
  }
  return hour < 17 ? 'Good afternoon' : 'Good evening';
}

/** 840 → "2:00 PM" (minutes from midnight). */
export const formatMinutesOfDay = (minutes: number): string =>
  formatClinicTime(clinicTimestamp('2000-01-01', minutes));
