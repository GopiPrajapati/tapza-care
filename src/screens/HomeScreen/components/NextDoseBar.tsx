import React from 'react';
import { Pill } from 'lucide-react-native';

import { formatMinutesOfDay } from '../../../commonutils/helpers';
import FloatingBar from '../../../components/FloatingBar';
import { useToast } from '../../../components/Toast';
import { Routes } from '../../../container/Routes';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { useNextDose } from '../../../hooks/useNextDose';
import { useDoseLogStore } from '../../../store/doseLogStore';
import { useTranslation } from 'react-i18next';

/** Floating "Next dose" bar above the tab bar; hidden when every dose for today is taken. */
function NextDoseBar() {
  const { t } = useTranslation();
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
      title={t('nextDose', { medicine: medicine.name })}
      subtitle={`${t(timing)} · ${formatMinutesOfDay(dueAtMinutes)} · ${
        medicine.dose
      }`}
      onPress={() =>
        navigation.navigate(Routes.PrescriptionDetails, { prescriptionId })
      }
      actionLabel={t('markTaken')}
      onAction={() => {
        markTaken(dose);
        toast.show({
          message: t('doseMarked', { medicine: medicine.name }),
          tone: 'success',
          actionLabel: t('undo'),
          onAction: () => unmark(dose),
        });
      }}
    />
  );
}

export default NextDoseBar;
