import React, { useEffect, useRef } from 'react';
import { useBrain } from '../../context/BrainContext';

const MedicationNotifier: React.FC = () => {
  const { brain, addToast } = useBrain();
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  const getNotificationId = (medId: string, tag: 'due' | 'delayed') => {
    const day = new Date().toISOString().slice(0, 10);
    return `${tag}:${day}:${medId}`;
  };

  const shouldNotify = (notificationId: string) => {
    if (notifiedIdsRef.current.has(notificationId)) return false;
    notifiedIdsRef.current.add(notificationId);
    return true;
  };

  useEffect(() => {
    const checkMedications = () => {
      if (!brain.medications) return;

      const now = new Date();
      const pendingMeds = brain.medications.filter(m => m.status !== 'administered');
      const dueNow = pendingMeds.filter((med) => {
        const [medHours, medMinutes] = med.scheduled_time.split(':').map(Number);
        return now.getHours() === medHours && now.getMinutes() === medMinutes;
      });

      if (dueNow.length > 0) {
        const unseenDueNow = dueNow.filter((med) => shouldNotify(getNotificationId(med.id, 'due')));
        if (unseenDueNow.length > 0) {
          const suffix = unseenDueNow.length > 1 ? 's' : '';
          addToast(`⏰ ${unseenDueNow.length} medicamento${suffix} no horário agora.`, 'info');
        }
      }

      pendingMeds.forEach(med => {
        const [medHours, medMinutes] = med.scheduled_time.split(':').map(Number);

        const medTime = new Date();
        medTime.setHours(medHours, medMinutes, 0, 0);

        const diffMs = now.getTime() - medTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins >= 15 && diffMins < 16 && shouldNotify(getNotificationId(med.id, 'delayed'))) {
          addToast(`⚠️ Atraso: ${med.name} (${med.scheduled_time}) para ${med.patient_name} ainda não registrado!`, 'warning');

          try {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-2573.mp3');
            audio.play().catch(() => {});
          } catch (e) { }
        }
      });
    };

    const interval = setInterval(checkMedications, 60000);
    checkMedications();

    return () => clearInterval(interval);
  }, [brain.medications, addToast]);

  return null; // Componente invisível
};

export default MedicationNotifier;
