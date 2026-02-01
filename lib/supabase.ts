import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [];
    if (!supabaseUrl) missing.push("VITE_SUPABASE_URL");
    if (!supabaseAnonKey) missing.push("VITE_SUPABASE_ANON_KEY");

    console.error("ERRO: Variáveis de ambiente do Supabase ausentes:", missing.join(", "));
    throw new Error(`Configuração do Supabase incompleta. Verifique se o arquivo .env.local contém: ${missing.join(" e ")}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
