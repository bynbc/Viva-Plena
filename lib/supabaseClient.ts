/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Tenta pegar do ambiente, se não tiver, usa string vazia (vai dar erro de conexão, mas não de build)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('🚨 ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas!');
    console.error('Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no .env ou no Vercel.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
