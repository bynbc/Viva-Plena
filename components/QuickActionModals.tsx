import React from 'react';
import { useBrain } from '../context/BrainContext';
import NewPatientModal from './NewPatientModal';
import NewRecordModal from './NewRecordModal';
import NewOccurrenceModal from './NewOccurrenceModal';
import NewAgendaModal from './NewAgendaModal';
import NewDocumentModal from './NewDocumentModal';
import NewMedicationModal from './NewMedicationModal';
import NewItemModal from './NewItemModal';
import NewUserModal from './NewUserModal'; // <--- IMPORTANTE: Importando o modal de usuário

const QuickActionModals: React.FC = () => {
  const { brain, setQuickAction } = useBrain();
  const { quickAction } = brain.ui;

  if (!quickAction) return null;

  switch (quickAction) {
    case 'new_patient': return <NewPatientModal />;
    case 'new_record': return <NewRecordModal onClose={() => setQuickAction(null)} />;
    case 'new_occurrence': return <NewOccurrenceModal onClose={() => setQuickAction(null)} />;
    case 'new_agenda': return <NewAgendaModal />;
    case 'new_document': return <NewDocumentModal />;
    case 'new_medication': return <NewMedicationModal />;
    case 'new_stock': return <NewItemModal />;
    case 'new_user': return <NewUserModal />; // <--- AQUI: Conectando a ação ao modal
    default: return null;
  }
};
export default QuickActionModals;
