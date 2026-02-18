-- ADICIONAR COLUNAS QUE FALTAM NA TABELA PATIENTS
-- Rode este script no Editor SQL do Supabase

DO $$
BEGIN
    -- Referência e Origem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='origin_city') THEN
        ALTER TABLE patients ADD COLUMN origin_city TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='reference_service') THEN
        ALTER TABLE patients ADD COLUMN reference_service TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='therapeutic_accompaniment') THEN
        ALTER TABLE patients ADD COLUMN therapeutic_accompaniment TEXT;
    END IF;

    -- Responsável Medicação
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='medication_responsible_name') THEN
        ALTER TABLE patients ADD COLUMN medication_responsible_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='medication_responsible_contact') THEN
        ALTER TABLE patients ADD COLUMN medication_responsible_contact TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='mental_health_recommendations') THEN
        ALTER TABLE patients ADD COLUMN mental_health_recommendations TEXT;
    END IF;

    -- Financeiro / Convênio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='insurance_name') THEN
        ALTER TABLE patients ADD COLUMN insurance_name TEXT;
    END IF;

    -- Campos extras de saúde (se faltar)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='sus_number') THEN
        ALTER TABLE patients ADD COLUMN sus_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='detox_time') THEN
        ALTER TABLE patients ADD COLUMN detox_time TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='diagnosis') THEN
        ALTER TABLE patients ADD COLUMN diagnosis TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='dependence_history') THEN
        ALTER TABLE patients ADD COLUMN dependence_history TEXT;
    END IF;

END $$;
