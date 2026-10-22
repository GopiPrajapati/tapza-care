import { apiClient } from '../api/client';
import { Endpoints } from '../api/endpoints';
import { ApiError } from '../api/errors';
import type { Prescription } from '../types/models';

export const fetchPrescriptions = (): Promise<Prescription[]> =>
  apiClient.get<Prescription[]>(Endpoints.prescriptions());

/** There is no GET /prescriptions/:id in the contract, so this reads the list. */
export async function fetchPrescription(prescriptionId: string): Promise<Prescription> {
  const prescription = (await fetchPrescriptions()).find(
    candidate => candidate.id === prescriptionId,
  );
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }
  return prescription;
}
