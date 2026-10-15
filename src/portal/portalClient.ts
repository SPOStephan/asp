import { createClient } from '@supabase/supabase-js';

// Own session for guests: a staff login in the admin area on the same browser stays separate.
export const portal = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'member-portal-auth', detectSessionInUrl: true },
});
