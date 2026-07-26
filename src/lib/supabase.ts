import { createClient } from '@supabase/supabase-js';

// ── Read credentials from environment variables (never hardcode) ───────────
// Set these in .env (local) or Vercel Environment Variables (production).
// See .env.example for the full list of required variables.
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // In development this surfaces immediately; in production the app gracefully
  // degrades (auth calls will simply fail with network errors).
  console.error(
    '[DTU Hub] Missing Supabase env vars. ' +
    'Copy .env.example → .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist session across page reloads via localStorage
    persistSession: true,
    // Auto-refresh JWT before it expires
    autoRefreshToken: true,
    // Detect OAuth redirect on page load
    detectSessionInUrl: true,
  },
});

export type DbProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  roll_no: string | null;
  branch: string | null;
  semester: string | null;
  section: string | null;
  subjects: string[] | null;
  onboarding_done: boolean | null;
};

export type DbAttendance = {
  id: string;
  user_id: string;
  subject: string;
  date: string;
  status: 'present' | 'absent' | 'miss' | 'leave';
  created_at: string;
};

export type DbAssignment = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  done: boolean;
  created_at: string;
};

export type DbResource = {
  id: string;
  subject: string;
  semester: string | null;
  tab_type: string; // 'pyq' | 'notes' | 'tutorial' | 'assignment' | 'lab' | 'video' | any custom
  file_name: string;
  file_url: string;
  year: string | null;
  file_size: string | null;
  created_at: string;
};
