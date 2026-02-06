import React, { useEffect } from 'react';
import { useBrain } from '../../context/BrainContext';

const MedicationNotifier: React.FC = () => {
  const { brain, addToast } = useBrain();

  useEffect(() => {
    // Função que verifica os remédios
    const checkMedications = () => {
      if (!brain.medications) return;

      const now = new Date();
      const currentHours = now.getHours();
      
      // Filtra remédios pendentes
      const pendingMeds = brain.medications.filter(m => m.status !== 'administered');

      pendingMeds.forEach(med => {
        const [medHours, medMinutes] = med.scheduled_time.split(':').map(Number);
        
        // Cria data do remédio para hoje
        const medTime = new Date();
        medTime.setHours(medHours, medMinutes, 0, 0);

        // Tempo de atraso em minutos
        const diffMs = now.getTime() - medTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        // Regra de Notificação:
        // Se estiver atrasado entre 15 e 16 minutos (pra não ficar apitando pra sempre, só avisa uma vez nesse intervalo)
        if (diffMins === 15) {
          addToast(`⚠️ Atraso: ${med.name} (${med.scheduled_time}) para ${med.patient_name} ainda não registrado!`, 'warning');
          
          // Tenta tocar um som se o navegador deixar
          try {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-2573.mp3');
            audio.play().catch(() => {}); // Ignora erro se não tiver permissão de autoplay
          } catch (e) {}
        }
      });
    };

    // Roda a verificação a cada 60 segundos
    const interval = setInterval(checkMedications, 60000);

    // Roda uma vez assim que carrega
    checkMedications();

    return () => clearInterval(interval);
  }, [brain.medications, addToast]);

  return null; // Componente invisível
};

export default MedicationNotifier;
