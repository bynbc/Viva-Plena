import { createClient } from '@supabase/supabase-js';

// Tenta pegar do ambiente, se não tiver, usa string vazia (vai dar erro de conexão, mas não de build)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
