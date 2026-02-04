
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

/**
 * Sanitização agressiva para remover espaços, tabs e caracteres invisíveis
 * (Unicode whitespace, zero-width spaces) que quebram o hostname (DNS).
 */
const clean = (val: any): string => {
  if (typeof val !== 'string') return '';
  return val.replace(/[\s\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF\u200B\u200C\u200D]/g, '').trim();
};

// Interface para diagnóstico de ambiente
export interface EnvValidation {
  ok: boolean;
  errors: string[];
  url: string;
  keyLen: number;
  rawUrl: string;
}

/**
 * Valida as configurações do Supabase no ambiente atual (Vite).
 */
export const validateSupabaseEnv = (): EnvValidation => {
  // @ts-ignore - Vite env
  const env = (import.meta as any).env || {};
  
  const rawUrl = env.VITE_SUPABASE_URL || '';
  const rawKey = env.VITE_SUPABASE_ANON_KEY || '';
  
  const url = clean(rawUrl);
  const key = clean(rawKey);
  
  const errors: string[] = [];
  
  if (!url) errors.push("VITE_SUPABASE_URL ausente.");
  if (!key) errors.push("VITE_SUPABASE_ANON_KEY ausente.");
  
  if (url && !url.startsWith("https://")) errors.push("URL deve começar com https://");
  if (url && !url.includes(".supabase.co")) errors.push("URL deve conter .supabase.co");
  
  try {
    if (url) new URL(url);
  } catch (e) {
    errors.push("URL malformada.");
  }

  return {
    ok: errors.length === 0,
    errors,
    url,
    keyLen: key.length,
    rawUrl
  };
};

const diag = validateSupabaseEnv();

// Logs de diagnóstico em tempo de carregamento
console.group("🚀 VIVAPLENA: SUPABASE CONFIG DIAGNOSTIC");
console.log("STATUS:", diag.ok ? "✅ OK" : "❌ INVALID");
console.log("SUPABASE_URL_RAW:", JSON.stringify(diag.rawUrl));
console.log("SUPABASE_URL_CLEAN:", JSON.stringify(diag.url));
console.log("SUPABASE_KEY_LEN:", diag.keyLen);
if (!diag.ok) console.error("ERRORS:", diag.errors);
console.groupEnd();

/**
 * Instância principal do cliente Supabase.
 * VERDADE ABSOLUTA: https://gqgzlwwdrdymiwzmginu.supabase.co
 */
export const sanitizedUrl = diag.url || 'https://gqgzlwwdrdymiwzmginu.supabase.co';
export const sanitizedKey = diag.keyLen > 0 ? clean(((import.meta as any).env || {}).VITE_SUPABASE_ANON_KEY) : 'placeholder-key';

export const supabase = createClient(
  sanitizedUrl,
  sanitizedKey
);

export const isConfigMissing = !diag.ok;
