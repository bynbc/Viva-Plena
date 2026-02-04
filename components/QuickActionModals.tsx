import React from 'react';
import { useBrain } from '../context/BrainContext';

// Importação dos Modais
import NewPatientModal from './NewPatientModal';
import NewRecordModal from './NewRecordModal';
import NewOccurrenceModal from './NewOccurrenceModal';
import NewAgendaModal from './NewAgendaModal';
import NewDocumentModal from './NewDocumentModal';
import NewMedicationModal from './NewMedicationModal'; // <--- O NOVO INTEGRANTE

const QuickActionModals: React.FC = () => {
  const { brain } = useBrain();
  const { quickAction } = brain.ui;

  if (!quickAction) return null;

  // Renderiza o modal correto baseado na ação clicada
  switch (quickAction) {
    case 'new_patient':
      return <NewPatientModal />;
    case 'new_record':
      return <NewRecordModal />;
    case 'new_occurrence':
      return <NewOccurrenceModal />;
    case 'new_agenda':
      return <NewAgendaModal />;
    case 'new_document':
      return <NewDocumentModal />;
    case 'new_medication': // <--- AQUI ESTÁ A LIGAÇÃO
      return <NewMedicationModal />;
    default:
      return null;
  }
};

export default QuickActionModals;