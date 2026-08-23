import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://moyjbglcvssxcvqnqmut.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_0ReWgwFr3QhKb-58r-Khnw_9SDDADWi";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Client-side Supabase client for Authentication & public interactions
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin Supabase client with elevated privileges for config management
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
