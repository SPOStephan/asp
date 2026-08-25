import { SUPABASE_ANON_KEYS, SUPABASE_URL_KEYS, readEnv } from './env';

export const config = { runtime: 'edge' };

export default function handler() {
  // Static reads so Vercel attaches these names to the function.
  const pinned = [
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
  ];
  void pinned;

  const url = readEnv(...SUPABASE_URL_KEYS) || pinned[0] || pinned[2] || null;
  const anon = readEnv(...SUPABASE_ANON_KEYS) || pinned[1] || pinned[3] || null;
  return Response.json({ url, anon });
}
