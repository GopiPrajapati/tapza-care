import { isApiError } from '../src/networking/api/errors';
import {
  handleRequest,
  resetMockServer,
  setMockControls,
} from '../src/networking/mockData/mockServer';
import type { Booking, Slot } from '../src/networking/types/models';

// Wednesday 22 Oct 2026, 08:00 IST: before the first session, so every slot today is in the future.
const NOW = Date.parse('2026-10-22T08:00:00+05:30');
const TODAY = '2026-10-22';

const getSlots = async (date = TODAY) =>
  (await handleRequest('GET', `/slots?doctorId=doc-1&date=${date}`)).data as Slot[];

describe('mockServer', () => {
  beforeEach(() => {
    resetMockServer({ now: () => NOW });
    setMockControls({ latencyMs: 0 });
  });

  it('generates the same slots for the same doctor and date', async () => {
    const first = await getSlots();
    const second = await getSlots();
    expect(first.length).toBeGreaterThan(0);
    expect(second).toEqual(first);
    expect(first.some(slot => !slot.available)).toBe(true);
  });

  it('only offers slots from today to 6 days ahead', async () => {
    expect(await getSlots('2026-10-21')).toEqual([]);
    expect((await getSlots('2026-10-28')).length).toBeGreaterThan(0);
    expect(await getSlots('2026-10-29')).toEqual([]);
  });

  it('books a free slot once and answers 409 the second time', async () => {
    const slot = (await getSlots()).find(candidate => candidate.available)!;
    const created = await handleRequest('POST', '/bookings', { doctorId: 'doc-1', slotId: slot.id });
    expect(created.status).toBe(201);
    expect((created.data as Booking).status).toBe('confirmed');

    await expect(
      handleRequest('POST', '/bookings', { doctorId: 'doc-1', slotId: slot.id }),
    ).rejects.toMatchObject({ status: 409 });
    expect((await getSlots()).find(candidate => candidate.id === slot.id)?.available).toBe(false);
  });

  it('honours the failure switch', async () => {
    setMockControls({ failure: 'config' });
    const error = await handleRequest('GET', '/config').catch((e: unknown) => e);
    expect(isApiError(error) && error.status).toBe(503);
    expect((await handleRequest('GET', '/doctors')).status).toBe(200);

    setMockControls({ failure: 'empty' });
    expect((await handleRequest('GET', '/doctors')).data).toEqual([]);

    setMockControls({ failure: 'booking409' });
    const slot = (await getSlots()).find(candidate => candidate.available)!;
    await expect(
      handleRequest('POST', '/bookings', { doctorId: 'doc-1', slotId: slot.id }),
    ).rejects.toMatchObject({ status: 409 });

    setMockControls({ failure: 'all' });
    await expect(getSlots()).rejects.toMatchObject({ status: 503 });
  });

  it('serves the selected config variant', async () => {
    setMockControls({ configVariant: 'diwali' });
    const config = (await handleRequest('GET', '/config')).data as { theme: { festival?: unknown } };
    expect(config.theme.festival).toBeDefined();
  });
});
