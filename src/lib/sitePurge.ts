import { supabase } from './supabase';

// After a save: let the live site show the change at once (see api/purge.ts). Never blocks
// or fails the save; the public pages also refresh their content in the browser.
export async function purgeSite(hotelId: string) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    await fetch('/api/purge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ hotelId }),
    });
  } catch {
    // Offline or locally without the endpoint: the cache then runs out on its own.
  }
}
