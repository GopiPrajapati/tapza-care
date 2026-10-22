import type { Doctor } from '../../networking/types/models';

/** Lower-case, trimmed, accents removed: so "dermatology " matches "Dermatology". */
const normalise = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Specialties in the order they first appear, for the filter chips. */
export function specialtiesOf(doctors: Doctor[]): string[] {
  return [...new Set(doctors.map(doctor => doctor.specialty))];
}

/**
 * Doctors matching the specialty filter (null = all) and every word of the query. Each query word must match the
 * start of a word in the doctor's name, specialty, languages or clinic: "paed" finds Paediatrics but not
 * Orthopaedics, and "telugu child" style combinations narrow the list.
 */
export function filterDoctors(
  doctors: Doctor[],
  query: string,
  specialty: string | null,
): Doctor[] {
  const queryWords = normalise(query).split(/\s+/).filter(Boolean);
  return doctors.filter(doctor => {
    if (specialty && doctor.specialty !== specialty) {
      return false;
    }
    const doctorWords = normalise(
      [
        doctor.name,
        doctor.specialty,
        doctor.clinicName ?? '',
        ...doctor.languages,
      ].join(' '),
    ).split(/[^a-z0-9]+/);
    return queryWords.every(word => {
      const term = word.replace(/[^a-z0-9]/g, '');
      return (
        term === '' || doctorWords.some(candidate => candidate.startsWith(term))
      );
    });
  });
}
