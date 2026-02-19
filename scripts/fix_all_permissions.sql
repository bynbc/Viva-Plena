-- CORREÇÃO GERAL DE PERMISSÕES (ERRO 401)
-- Copie e cole este código no SQL Editor do Supabase e clique em RUN.

-- Habilita RLS e Cria Políticas de Acesso para a Aplicação ("anon")

-- 1. TABELA PATIENTS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App Access Patients" ON patients;
CREATE POLICY "App Access Patients" ON patients FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 2. TABELA AGENDA
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App Access Agenda" ON agenda;
CREATE POLICY "App Access Agenda" ON agenda FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 3. TABELA MEDICATIONS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App Access Medications" ON medications;
CREATE POLICY "App Access Medications" ON medications FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 4. TABELA OCCURRENCES
ALTER TABLE occurrences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App Access Occurrences" ON occurrences;
CREATE POLICY "App Access Occurrences" ON occurrences FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 5. TABELA TRANSACTIONS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App Access Transactions" ON transactions;
CREATE POLICY "App Access Transactions" ON transactions FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 6. TABELA INVENTORY
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App Access Inventory" ON inventory;
CREATE POLICY "App Access Inventory" ON inventory FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 7. TABELA DOCUMENTS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App Access Documents" ON documents;
CREATE POLICY "App Access Documents" ON documents FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 8. TABELA PTI_GOALS
ALTER TABLE pti_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App Access PTI" ON pti_goals;
CREATE POLICY "App Access PTI" ON pti_goals FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 9. TABELA HEALTH_RECORDS
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App Access HealthRecords" ON health_records;
CREATE POLICY "App Access HealthRecords" ON health_records FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 10. TABELA APP_USERS (Para login)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App Access Users" ON app_users;
CREATE POLICY "App Access Users" ON app_users FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
