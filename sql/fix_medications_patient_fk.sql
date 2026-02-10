-- Corrige a FK medications_patient_id_fkey para permitir remover paciente
-- Opção recomendada para este projeto: ON DELETE CASCADE (apaga meds vinculadas ao paciente)

BEGIN;

ALTER TABLE public.medications
  DROP CONSTRAINT IF EXISTS medications_patient_id_fkey;

ALTER TABLE public.medications
  ADD CONSTRAINT medications_patient_id_fkey
  FOREIGN KEY (patient_id)
  REFERENCES public.patients(id)
  ON DELETE CASCADE;

COMMIT;
