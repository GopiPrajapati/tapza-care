import React from 'react';
import { Pill } from 'lucide-react-native';

import { formatMinutesOfDay } from '../../../commonutils/helpers';
import FloatingBar from '../../../components/FloatingBar';
import { useToast } from '../../../components/Toast';
import { Routes } from '../../../container/Routes';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { useNextDose } from '../../../hooks/useNextDose';
import { useDoseLogStore } from '../../../store/doseLogStore';

const TIMING_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night',
} as const;

/** Floating "Next dose" bar above the tab bar; hidden when every dose for today is taken. */
function NextDoseBar() {
  const dose = useNextDose();
  const markTaken = useDoseLogStore(state => state.markTaken);
  const unmark = useDoseLogStore(state => state.unmark);
  const navigation = useAppNavigation();
  const toast = useToast();

  if (!dose) {
    return null;
  }
  const { medicine, timing, dueAtMinutes, prescriptionId } = dose;

  return (
    <FloatingBar
      icon={Pill}
      title={`Next dose: ${medicine.name}`}
      subtitle={`${TIMING_LABELS[timing]} · ${formatMinutesOfDay(
        dueAtMinutes,
      )} · ${medicine.dose}`}
      onPress={() =>
        navigation.navigate(Routes.PrescriptionDetails, { prescriptionId })
      }
      actionLabel="Mark taken"
      onAction={() => {
        markTaken(dose);
        toast.show({
          message: `${medicine.name} marked taken`,
          tone: 'success',
          actionLabel: 'Undo',
          onAction: () => unmark(dose),
        });
      }}
    />
  );
}

export default NextDoseBar;
