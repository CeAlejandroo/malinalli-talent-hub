import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://lwxisnjtajsgclbwqqq.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_3so9SweiYwy-D9gzoBk6g_sRLpQ0P1";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);