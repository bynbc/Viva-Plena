-- RODE ESSE SCRIPT NO EDITOR SQL DO SUPABASE PARA CONFERIR AS TABELAS

SELECT 
    table_name, 
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
FROM 
    information_schema.tables t
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;

-- VERIFICA SE AS TABELAS FUNDAMENTAIS EXISTEM
DO $$
DECLARE
    required_tables text[] := ARRAY[
        'patients', 
        'agenda', 
        'occurrences', 
        'documents', 
        'pti_goals', 
        'health_records', 
        'transactions', 
        'inventory', 
        'app_users'
    ];
    t text;
    missing_tables text[] := ARRAY[]::text[];
BEGIN
    FOREACH t IN ARRAY required_tables LOOP
        IF NOT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = t
        ) THEN
            missing_tables := array_append(missing_tables, t);
        END IF;
    END LOOP;

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '⚠️ TABELAS FALTANDO: %', missing_tables;
    ELSE
        RAISE NOTICE '✅ TODAS AS TABELAS NECESSÁRIAS FORAM ENCONTRADAS!';
    END IF;
END $$;
