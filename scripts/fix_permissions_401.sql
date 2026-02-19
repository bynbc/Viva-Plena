-- CORREÇÃO DE PERMISSÕES (RLS) PARA O ERRO 401
-- Rode este script no Editor SQL do Supabase

-- Como o sistema usa autenticação própria na tabela 'app_users' e não o Supabase Auth padrão,
-- precisamos garantir que o banco permita operações vindas da aplicação (role 'anon').

-- 1. Habilitar RLS na tabela patients (se já não estiver)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 2. Criar política permissiva para a aplicação (já que o controle é feito no código/backend)
-- NOTA: Em produção com dados sensíveis, idealmente migrariamos para Supabase Auth.
-- Mas para corrigir o erro imediato mantendo a arquitetura atual:

DROP POLICY IF EXISTS "Permitir tudo para aplicação" ON patients;

CREATE POLICY "Permitir tudo para aplicação"
ON patients
FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- 3. Repetir para outras tabelas criticas se necessário
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para aplicação" ON agenda;
CREATE POLICY "Permitir tudo para aplicação" ON agenda FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para aplicação" ON medications;
CREATE POLICY "Permitir tudo para aplicação" ON medications FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

ALTER TABLE occurrences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para aplicação" ON occurrences;
CREATE POLICY "Permitir tudo para aplicação" ON occurrences FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
