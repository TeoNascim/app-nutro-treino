
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Substitua por suas credenciais reais do Supabase
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
