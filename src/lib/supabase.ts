import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kstylmkguvphdopremrx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9SAE2cSCgRNZ6MkQfczf8w_JGhUXcto';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
