/**
 * In-app mock backend. Routes requests by method + path, like a real server would, so the api client can be
 * pointed at `fetch` later without touching repositories, hooks or screens.
 *
 * All people, clinics and prescriptions in the fixtures are fictional.
 *
 * This is the only module allowed to import the JSON fixtures.
 */
import { clinicDate, isIsoDate } from '../../commonutils/helpers';
import { ApiError } from '../api/errors';
import type {
  Booking,
  CreateBookingRequest,
  Doctor,
  DoseTiming,
  Prescription,
} from '../types/models';
import diwaliConfig from './config.diwali.json';
import normalConfig from './config.normal.json';
import doctorsFixture from './doctors.json';
import prescriptionsFixture from './prescriptions.json';
import { generateSlots, parseSlotId } from './slotGenerator';

// ---------- Controls ----------

export type ConfigVariant = 'normal' | 'diwali' | 'custom';
export type MockLatency = 0 | 800 | 3000;
/**
 * - config: only GET /config fails
 * - all: every request fails
 * - booking409: POST /bookings always answers 409 (slot taken)
 * - empty: list endpoints return []
 */
export type MockFailure = 'none' | 'config' | 'all' | 'booking409' | 'empty';

export interface MockControls {
  configVariant: ConfigVariant;
  /** Raw JSON served when configVariant is "custom" (from the admin config editor). */
  customConfig: unknown;
  latencyMs: MockLatency;
  failure: MockFailure;
}

const DEFAULT_CONTROLS: MockControls = {
  configVariant: 'normal',
  customConfig: null,
  latencyMs: 800,
  failure: 'none',
};

// ---------- State ----------

interface ServerState {
  controls: MockControls;
  bookedSlotIds: Set<string>;
  bookings: Booking[];
  nextBookingNumber: number;
  now: () => number;
}

const createState = (now: () => number = Date.now): ServerState => ({
  controls: { ...DEFAULT_CONTROLS },
  bookedSlotIds: new Set(),
  bookings: [],
  nextBookingNumber: 1,
  now,
});

let state = createState();

export const getMockControls = (): MockControls => ({ ...state.controls });

export function setMockControls(changes: Partial<MockControls>): void {
  state.controls = { ...state.controls, ...changes };
}

/** Clears bookings and controls. `now` lets tests pin the clock. */
export function resetMockServer(options: { now?: () => number } = {}): void {
  state = createState(options.now);
}

/** Clears created bookings and their reserved slots while preserving the active mock controls. */
export function resetMockBookings(): void {
  state.bookings = [];
  state.bookedSlotIds.clear();
  state.nextBookingNumber = 1;
}

// ---------- Fixtures ----------

interface PrescriptionFixture
  extends Omit<Prescription, 'issuedAt' | 'medicines'> {
  /** Kept relative so the data never goes stale. */
  issuedDaysAgo: number;
  medicines: Array<
    Omit<Prescription['medicines'][number], 'timing'> & { timing: string[] }
  >;
}

const doctors: Doctor[] = doctorsFixture;

const DOSE_TIMINGS: readonly string[] = ['morning', 'afternoon', 'night'];
const isDoseTiming = (value: string): value is DoseTiming =>
  DOSE_TIMINGS.includes(value);

function buildPrescriptions(nowMs: number): Prescription[] {
  return (prescriptionsFixture as PrescriptionFixture[]).map(
    ({ issuedDaysAgo, medicines, ...rest }) => ({
      ...rest,
      issuedAt: `${clinicDate(nowMs, -issuedDaysAgo)}T10:30:00+05:30`,
      medicines: medicines.map(medicine => ({
        ...medicine,
        timing: medicine.timing.filter(isDoseTiming),
      })),
    }),
  );
}

// ---------- Routing ----------

export type HttpMethod = 'GET' | 'POST';

export interface MockResponse {
  status: number;
  data: unknown;
}

const delay = (ms: number) =>
  ms > 0
    ? new Promise<void>(resolve => setTimeout(resolve, ms))
    : Promise.resolve();

/** Minimal query parser: React Native's URLSearchParams does not implement get(). */
function splitPath(path: string): {
  pathname: string;
  query: Record<string, string>;
} {
  const [pathname, search = ''] = path.split('?');
  const query: Record<string, string> = {};
  for (const pair of search.split('&')) {
    if (!pair) {
      continue;
    }
    const [key, value = ''] = pair.split('=');
    query[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  return { pathname, query };
}

function isCreateBookingRequest(body: unknown): body is CreateBookingRequest {
  const candidate = body as Partial<CreateBookingRequest> | null;
  return (
    typeof candidate?.doctorId === 'string' &&
    typeof candidate?.slotId === 'string'
  );
}

function getConfig(): unknown {
  switch (state.controls.configVariant) {
    case 'diwali':
      return diwaliConfig;
    case 'custom':
      return state.controls.customConfig;
    default:
      return normalConfig;
  }
}

function getSlots(query: Record<string, string>): MockResponse {
  const { doctorId, date } = query;
  if (!doctorId || !date || !isIsoDate(date)) {
    throw new ApiError(400, 'doctorId and date (YYYY-MM-DD) are required');
  }
  if (!doctors.some(doctor => doctor.id === doctorId)) {
    throw new ApiError(404, 'Doctor not found');
  }
  return {
    status: 200,
    data: generateSlots(doctorId, date, state.now(), state.bookedSlotIds),
  };
}

function createBooking(body: unknown): MockResponse {
  if (!isCreateBookingRequest(body)) {
    throw new ApiError(400, 'doctorId and slotId are required');
  }
  if (state.controls.failure === 'booking409') {
    throw new ApiError(409, 'This slot was just booked by someone else');
  }

  const parsed = parseSlotId(body.slotId);
  if (!parsed || parsed.doctorId !== body.doctorId) {
    throw new ApiError(404, 'Slot not found');
  }
  const slot = generateSlots(
    body.doctorId,
    parsed.date,
    state.now(),
    state.bookedSlotIds,
  ).find(candidate => candidate.id === body.slotId);
  if (!slot) {
    throw new ApiError(404, 'Slot not found');
  }
  if (!slot.available) {
    throw new ApiError(409, 'This slot was just booked by someone else');
  }

  const booking: Booking = {
    id: `bk-${state.nextBookingNumber++}`,
    doctorId: body.doctorId,
    slotId: slot.id,
    startsAt: slot.startsAt,
    status: 'confirmed',
    createdAt: new Date(state.now()).toISOString(),
  };
  state.bookedSlotIds.add(slot.id);
  state.bookings.push(booking);
  return { status: 201, data: booking };
}

function route(method: HttpMethod, path: string, body: unknown): MockResponse {
  const { pathname, query } = splitPath(path);
  const { failure } = state.controls;

  if (failure === 'all' || (failure === 'config' && pathname === '/config')) {
    throw new ApiError(503, 'Service temporarily unavailable');
  }
  const empty = failure === 'empty';

  switch (`${method} ${pathname}`) {
    case 'GET /config':
      return { status: 200, data: getConfig() };
    case 'GET /doctors':
      return { status: 200, data: empty ? [] : doctors };
    case 'GET /slots':
      return empty ? { status: 200, data: [] } : getSlots(query);
    case 'POST /bookings':
      return createBooking(body);
    // Addition: lists this patient's bookings for the Bookings tab.
    case 'GET /bookings':
      return { status: 200, data: empty ? [] : [...state.bookings] };
    case 'GET /prescriptions':
      return {
        status: 200,
        data: empty ? [] : buildPrescriptions(state.now()),
      };
    default:
      throw new ApiError(404, `No route for ${method} ${pathname}`);
  }
}

/** Handles one request after the configured latency. Errors reject with ApiError. */
export async function handleRequest(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<MockResponse> {
  await delay(state.controls.latencyMs);
  return route(method, path, body);
}
