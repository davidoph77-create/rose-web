import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://intmggzouwcaidotikbt.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludG1nZ3pvdXdjYWlkb3Rpa2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODUxMTIsImV4cCI6MjA4NDY2MTExMn0.cSz1eI4E3xPY3LWY5lhy8QqDd0K5x8mcpdspb6w_kec";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
