import {
  doseKey,
  useDoseLogStore,
  type DoseRef,
} from '../src/store/doseLogStore';

describe('dose log', () => {
  const dose: DoseRef = {
    date: '2026-10-23',
    prescriptionId: 'rx-1',
    medicineId: 'rx-1-m1',
    timing: 'morning',
  };

  beforeEach(() => useDoseLogStore.getState().reset());

  it('keys a dose by date, prescription, medicine, and timing', () => {
    expect(doseKey(dose)).toBe('2026-10-23|rx-1|rx-1-m1|morning');
    expect(doseKey({ ...dose, timing: 'night' })).not.toBe(doseKey(dose));
    expect(doseKey({ ...dose, date: '2026-10-24' })).not.toBe(doseKey(dose));
  });

  it('toggles a dose between taken and not taken', () => {
    const store = useDoseLogStore.getState();

    store.toggle(dose);
    expect(useDoseLogStore.getState().taken[doseKey(dose)]).toEqual(
      expect.any(String),
    );

    useDoseLogStore.getState().toggle(dose);
    expect(useDoseLogStore.getState().taken).not.toHaveProperty(doseKey(dose));
  });
});
