import {
  clinicDate,
  clinicTimestamp,
  daysBetween,
  hashString,
} from '../../commonutils/helpers';
import type { Slot } from '../types/models';

/** How many days ahead (including today) patients can book. */
export const BOOKING_WINDOW_DAYS = 7;

/** Clinic sessions, in minutes from midnight. */
const SESSIONS = [
  { start: 9 * 60, end: 12 * 60 }, // morning
  { start: 14 * 60, end: 17 * 60 }, // afternoon
  { start: 18 * 60, end: 20 * 60 }, // evening
];

const SLOT_LENGTHS = [15, 20, 30];
/** Roughly 1 in 4 slots is already taken by other patients. */
const TAKEN_PER_100 = 25;

/** e.g. "doc-1_2026-10-22_0930" */
const slotId = (doctorId: string, date: string, minutes: number) => {
  const hhmm = `${Math.floor(minutes / 60)}`.padStart(2, '0') + `${minutes % 60}`.padStart(2, '0');
  return `${doctorId}_${date}_${hhmm}`;
};

/** Parses an id made by slotId(). */
export function parseSlotId(id: string): { doctorId: string; date: string } | null {
  const match = /^(.+)_(\d{4}-\d{2}-\d{2})_\d{4}$/.exec(id);
  return match ? { doctorId: match[1], date: match[2] } : null;
}

/**
 * Deterministic slots for one doctor on one clinic date. The same inputs always give the same slots, so the
 * UI and tests are stable. Dates outside today + 6 days, and Sundays for some doctors, have no slots.
 * Slots that already started (relative to `nowMs`) or were booked are unavailable.
 */
export function generateSlots(
  doctorId: string,
  date: string,
  nowMs: number,
  bookedSlotIds: ReadonlySet<string> = new Set(),
): Slot[] {
  const offset = daysBetween(clinicDate(nowMs), date);
  if (offset < 0 || offset >= BOOKING_WINDOW_DAYS) {
    return [];
  }

  const doctorHash = hashString(doctorId);
  const isSunday = new Date(`${date}T00:00:00Z`).getUTCDay() === 0;
  if (isSunday && doctorHash % 3 === 0) {
    return [];
  }

  const length = SLOT_LENGTHS[doctorHash % SLOT_LENGTHS.length];
  const slots: Slot[] = [];

  for (const session of SESSIONS) {
    for (let start = session.start; start + length <= session.end; start += length) {
      const id = slotId(doctorId, date, start);
      const startsAt = clinicTimestamp(date, start);
      const takenByOthers = hashString(id) % 100 < TAKEN_PER_100;
      const inPast = Date.parse(startsAt) <= nowMs;
      slots.push({
        id,
        doctorId,
        startsAt,
        endsAt: clinicTimestamp(date, start + length),
        available: !takenByOthers && !inPast && !bookedSlotIds.has(id),
      });
    }
  }
  return slots;
}
