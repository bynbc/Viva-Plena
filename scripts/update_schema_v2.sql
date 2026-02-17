-- 0. Garantir que a coluna exit_date existe (Se o erro diz que não existe, vamos criar)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='exit_date') THEN
        ALTER TABLE patients ADD COLUMN exit_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='exit_reason') THEN
        ALTER TABLE patients ADD COLUMN exit_reason TEXT;
    END IF;
END $$;

-- 1. Tabela de Histórico de Movimentações (Para precisão de Tempo Médio e Reincidência)
CREATE TABLE IF NOT EXISTS patient_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('admission', 'discharge', 'evasion', 'transfer', 'death')),
    date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Gatilho para alimentar Movimentações automaticamente
CREATE OR REPLACE FUNCTION log_patient_movement() RETURNS TRIGGER AS $$
BEGIN
    -- Se entrou (Novo paciente)
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO patient_movements (patient_id, type, date, reason)
        VALUES (NEW.id, 'admission', COALESCE(NEW.entry_date::date, CURRENT_DATE), 'Admissão Inicial');
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active') THEN
        -- Se saiu (Update de status para inativo)
        INSERT INTO patient_movements (patient_id, type, date, reason)
        VALUES (NEW.id, 
                CASE 
                    WHEN NEW.status = 'evaded' THEN 'evasion'
                    WHEN NEW.status = 'deceased' THEN 'death'
                    ELSE 'discharge'
                END, 
                COALESCE(NEW.exit_date::date, CURRENT_DATE), 
                NEW.exit_reason);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_patient_movement ON patients;
CREATE TRIGGER trg_patient_movement
AFTER INSERT OR UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION log_patient_movement();

-- 3. View Otimizada para Relatório Governamental
CREATE OR REPLACE VIEW view_government_reports AS
SELECT 
    (SELECT COUNT(*) FROM patients WHERE status = 'active') as active_count,
    (SELECT COUNT(*) FROM patients WHERE status = 'discharged') as discharged_count,
    (SELECT COUNT(*) FROM patients WHERE status = 'evaded') as evasion_count,
    -- Cálculo seguro de tempo médio (evita erro se não tiver datas)
    (SELECT COALESCE(AVG(exit_date::date - entry_date::date), 0)::int 
     FROM patients 
     WHERE exit_date IS NOT NULL AND entry_date IS NOT NULL) as avg_stay_days,
     
    -- Reincidência: Total de CPFs únicos que aparecem >1 vez no cadastro
    (SELECT COUNT(*) FROM (
        SELECT cpf FROM patients 
        WHERE cpf IS NOT NULL AND LENGTH(cpf) > 5 
        GROUP BY cpf HAVING COUNT(*) > 1
    ) as recidivists) as recidivism_count;
