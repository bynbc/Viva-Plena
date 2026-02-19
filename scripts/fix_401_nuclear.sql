-- SOLUÇÃO DEFINITIVA PARA ERRO 401 (NUCLEAR FIX)
-- Este script garante que o "usuário anônimo" (sua aplicação) tenha permissão total.

BEGIN;

-- 1. Garante acesso ao Schema Public
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 2. Concede permissão em TODAS as tabelas para 'anon' (sua aplicação)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 3. Concede permissão nas SEQUÊNCIAS (para criar IDs novos)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 4. Reescreve as Políticas de Segurança (RLS) para serem Permissivas
-- (Isso garante que o RLS não bloqueie o acesso que acabamos de dar)

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' LOOP
        
        -- Habilita RLS (obrigatório para políticas funcionarem)
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        
        -- Remove políticas antigas que podem estar bloqueando
        EXECUTE format('DROP POLICY IF EXISTS "Liberar Geral" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "App Access %I" ON %I', t, t);
        
        -- Cria nova política permissiva
        EXECUTE format('CREATE POLICY "Liberar Geral" ON %I FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true)', t);
        
    END LOOP;
END $$;

COMMIT;

-- FIM DO SCRIPT
