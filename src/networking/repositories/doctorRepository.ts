import { apiClient } from '../api/client';
import { Endpoints } from '../api/endpoints';
import { ApiError } from '../api/errors';
import type { Doctor } from '../types/models';

export const fetchDoctors = (): Promise<Doctor[]> => apiClient.get<Doctor[]>(Endpoints.doctors());

/** There is no GET /doctors/:id in the contract, so this reads the list. */
export async function fetchDoctor(doctorId: string): Promise<Doctor> {
  const doctor = (await fetchDoctors()).find(candidate => candidate.id === doctorId);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }
  return doctor;
}
