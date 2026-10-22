import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { buildTheme, ThemeProvider } from '../src/commonutils/theme';
import normalConfig from '../src/networking/mockData/config.normal.json';
import {
  parseConfig,
  type ServiceGridSection,
} from '../src/networking/types/configSchema';
import type { ThemeConfig } from '../src/networking/types/layoutConfig';
import { renderSection } from '../src/screens/HomeScreen/sections/registry';
import ServiceGrid from '../src/screens/HomeScreen/sections/ServiceGrid';
import { findNextDose } from '../src/hooks/useNextDose';
import type { Prescription } from '../src/networking/types/models';

const mockNavigate = jest.fn();
jest.mock('../src/hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

const theme = buildTheme(normalConfig.theme as ThemeConfig);
const withTheme = (ui: React.ReactElement) => (
  <ThemeProvider theme={theme}>{ui}</ThemeProvider>
);

const serviceGrid = (() => {
  const result = parseConfig(normalConfig);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.config.sections.find(
    (section): section is ServiceGridSection => section.type === 'service_grid',
  )!;
})();

describe('ServiceGrid', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('renders every service with its ₹ price and badge', async () => {
    await render(withTheme(<ServiceGrid section={serviceGrid} />));

    expect(screen.getByText('Popular consultations')).toBeTruthy();
    for (const item of serviceGrid.items) {
      expect(screen.getByText(item.name)).toBeTruthy();
    }
    expect(screen.getAllByText('₹500').length).toBeGreaterThan(0);
    expect(screen.getByText('₹1,200')).toBeTruthy();
    expect(screen.getByText('Most booked')).toBeTruthy();
  });

  it("opens booking for the service's doctor", async () => {
    await render(withTheme(<ServiceGrid section={serviceGrid} />));
    fireEvent.press(screen.getByRole('button', { name: /Heart consultation/ }));

    expect(mockNavigate).toHaveBeenCalledWith('DoctorDetails', {
      doctorId: 'doc-5',
      serviceId: 'svc-heart',
    });
  });
});

describe('renderSection', () => {
  it('renders nothing for an unknown section type', () => {
    expect(renderSection({ type: 'video_reel' })).toBeNull();
    expect(renderSection({ type: '' })).toBeNull();
  });

  it('renders a known section type', () => {
    expect(renderSection(serviceGrid)).not.toBeNull();
  });
});

describe('findNextDose', () => {
  // 22 Oct 2026, 10:00 IST
  const NOW = Date.parse('2026-10-22T10:00:00+05:30');
  const prescriptions: Prescription[] = [
    {
      id: 'rx-a',
      issuedAt: '2026-10-21T10:30:00+05:30',
      doctorName: 'Dr. Test',
      clinicName: 'Clinic',
      medicines: [
        {
          id: 'm-night',
          name: 'Night tablet',
          dose: '1 tablet',
          days: 5,
          timing: ['night'],
        },
        {
          id: 'm-morning',
          name: 'Morning tablet',
          dose: '1 tablet',
          days: 5,
          timing: ['morning'],
        },
        {
          id: 'm-ended',
          name: 'Ended course',
          dose: '1 tablet',
          days: 1,
          timing: ['morning'],
        },
      ],
    },
  ];

  it('picks the earliest dose not yet taken, skipping finished courses', () => {
    expect(findNextDose(prescriptions, {}, NOW)?.medicine.id).toBe('m-morning');
  });

  it('moves on once a dose is marked taken, then returns null', () => {
    const morningTaken = { '2026-10-22|rx-a|m-morning|morning': 'x' };
    expect(findNextDose(prescriptions, morningTaken, NOW)?.medicine.id).toBe(
      'm-night',
    );

    const allTaken = { ...morningTaken, '2026-10-22|rx-a|m-night|night': 'x' };
    expect(findNextDose(prescriptions, allTaken, NOW)).toBeNull();
  });
});
