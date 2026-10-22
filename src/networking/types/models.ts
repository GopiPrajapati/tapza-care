/**
 * Domain models returned by the API. Field names follow the assignment's shapes; additions are marked.
 */

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  /** Bundled asset key (e.g. "doctors/doc-1") or a remote URL. Missing images fall back to initials. */
  photoUrl: string;
  feeInr: number;
  languages: string[];
  /** Addition: clinic shown on cards and the booking screen. */
  clinicName?: string;
}

export interface Slot {
  id: string;
  doctorId: string;
  /** ISO 8601 with the clinic's offset (IST, +05:30). */
  startsAt: string;
  endsAt: string;
  available: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'failed';

export interface Booking {
  id: string;
  doctorId: string;
  slotId: string;
  startsAt: string;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingRequest {
  doctorId: string;
  slotId: string;
}

export type DoseTiming = 'morning' | 'afternoon' | 'night';

export interface Medicine {
  id: string;
  name: string;
  /** e.g. "1 tablet", "5 ml" */
  dose: string;
  /** Course length in days. */
  days: number;
  timing: DoseTiming[];
}

export interface Prescription {
  id: string;
  issuedAt: string;
  doctorName: string;
  clinicName: string;
  medicines: Medicine[];
}
