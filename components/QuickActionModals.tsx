import React from 'react';
import { useBrain } from '../context/BrainContext';
import NewPatientModal from './NewPatientModal';
import NewRecordModal from './NewRecordModal';
import NewOccurrenceModal from './NewOccurrenceModal';
import NewAgendaModal from './NewAgendaModal';
import NewDocumentModal from './NewDocumentModal';
import NewMedicationModal from './NewMedicationModal';
// Se tiver outros modais (como Inventory), importe aqui também

const QuickActionModals: React.FC = () => {
  const { brain, setQuickAction } = useBrain();
  const { quickAction } = brain.ui;

  if (!quickAction) return null;

  switch (quickAction) {
    case 'new_patient':
      return <NewPatientModal />;
      
    case 'new_record':
      // CORREÇÃO: Passando a prop obrigatória onClose
      return <NewRecordModal onClose={() => setQuickAction(null)} />;
      
    case 'new_occurrence':
      // CORREÇÃO: Passando a prop obrigatória onClose
      return <NewOccurrenceModal onClose={() => setQuickAction(null)} />;
      
    case 'new_agenda':
      return <NewAgendaModal />;
      
    case 'new_document':
      return <NewDocumentModal />;
      
    case 'new_medication':
      return <NewMedicationModal />;
      
    default:
      return null;
  }
};

export default QuickActionModals;
