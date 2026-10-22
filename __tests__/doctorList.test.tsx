import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { buildTheme, ThemeProvider } from '../src/commonutils/theme';
import normalConfig from '../src/networking/mockData/config.normal.json';
import type { ThemeConfig } from '../src/networking/types/layoutConfig';
import type { Doctor } from '../src/networking/types/models';
import DoctorRow from '../src/screens/DoctorListScreen/components/DoctorRow';
import {
  filterDoctors,
  specialtiesOf,
} from '../src/screens/DoctorListScreen/filterDoctors';

jest.mock('../src/components/NextSlotBadge', () => () => null);

const doctor = (overrides: Partial<Doctor>): Doctor => ({
  id: 'doc-x',
  name: 'Dr. Test',
  specialty: 'General Physician',
  photoUrl: '',
  feeInr: 500,
  languages: ['English'],
  clinicName: 'Tapza Clinic, Kondapur, Hyderabad',
  ...overrides,
});

const doctors: Doctor[] = [
  doctor({
    id: 'd1',
    name: 'Dr. Ramesh Reddy',
    languages: ['English', 'Telugu'],
  }),
  doctor({
    id: 'd2',
    name: 'Dr. Srinivas Kandula',
    specialty: 'Paediatrics',
    languages: ['Telugu'],
  }),
  doctor({
    id: 'd3',
    name: 'Dr. Ayesha Siddiqui',
    specialty: 'Gynaecology',
    languages: ['Hindi', 'Urdu'],
  }),
  doctor({
    id: 'd4',
    name: 'Dr. Vikram Chowdary',
    clinicName: 'Tapza Clinic, Benz Circle, Vijayawada',
  }),
];

describe('filterDoctors', () => {
  it('returns everyone with no query and no specialty', () => {
    expect(filterDoctors(doctors, '', null)).toHaveLength(4);
  });

  it('matches name, specialty, language and clinic, ignoring case and spaces', () => {
    expect(filterDoctors(doctors, '  REDDY ', null).map(d => d.id)).toEqual([
      'd1',
    ]);
    expect(filterDoctors(doctors, 'paed', null).map(d => d.id)).toEqual(['d2']);
    expect(filterDoctors(doctors, 'urdu', null).map(d => d.id)).toEqual(['d3']);
    expect(filterDoctors(doctors, 'vijayawada', null).map(d => d.id)).toEqual([
      'd4',
    ]);
  });

  it('matches the start of words only', () => {
    const withOrtho = [
      ...doctors,
      doctor({ id: 'd5', specialty: 'Orthopaedics' }),
    ];
    expect(filterDoctors(withOrtho, 'paed', null).map(d => d.id)).toEqual([
      'd2',
    ]);
    expect(filterDoctors(doctors, 'dr. reddy', null).map(d => d.id)).toEqual([
      'd1',
    ]);
  });

  it('requires every word to match', () => {
    expect(
      filterDoctors(doctors, 'telugu paediatrics', null).map(d => d.id),
    ).toEqual(['d2']);
  });

  it('combines the query with the specialty filter', () => {
    expect(
      filterDoctors(doctors, 'telugu', 'General Physician').map(d => d.id),
    ).toEqual(['d1']);
    expect(filterDoctors(doctors, 'hindi', 'Paediatrics')).toEqual([]);
  });

  it('lists specialties once each, in order', () => {
    expect(specialtiesOf(doctors)).toEqual([
      'General Physician',
      'Paediatrics',
      'Gynaecology',
    ]);
  });
});

describe('DoctorRow', () => {
  const theme = buildTheme(normalConfig.theme as ThemeConfig);

  it('shows the doctor and opens booking from the Book button', async () => {
    const onOpen = jest.fn();
    await render(
      <ThemeProvider theme={theme}>
        <DoctorRow doctor={doctors[0]} onOpen={onOpen} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Dr. Ramesh Reddy')).toBeTruthy();
    expect(screen.getByText('English · Telugu')).toBeTruthy();
    expect(screen.getByText('₹500')).toBeTruthy();

    fireEvent.press(
      screen.getByRole('button', { name: 'Book Dr. Ramesh Reddy' }),
    );
    expect(onOpen).toHaveBeenCalledWith('d1');
  });
});
