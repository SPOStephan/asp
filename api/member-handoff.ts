import { createClient } from '@supabase/supabase-js';
import { HANDOFF_PARAM, handoffTarget } from '../src/member/handoff';

// One login for all hotel websites of a group. The member portal (app.<group>.de) is where
// guests sign in; a hotel website gets its own session through this hand-over:
//   portal (signed in) → POST here with the guest's token and the website address
//   → one-time login code (no e-mail is sent) → website#member=<code> → website signs in.
// The website must belong to an active hotel of the member's group (its domains in the admin),
// so the code never leaves the group's own addresses. Works the same on preview and live domains.

function env(name: string) {
  return (process.env[name] || '').trim();
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const supabaseUrl = env('VITE_SUPABASE_URL');
  const supabaseAnon = env('VITE_SUPABASE_ANON_KEY');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseAnon || !serviceKey) return json(503, { error: 'Anmeldung auf den Hotel-Websites ist noch nicht eingerichtet.' });

  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!token) return json(401, { error: 'Nicht angemeldet.' });
  const input = (await request.json().catch(() => ({}))) as { returnTo?: unknown };
  const target = handoffTarget(input.returnTo);
  if (!target) return json(400, { error: 'Ungültige Adresse.' });

  // Who the guest is and which hotels count are read with the guest's own rights;
  // the service key is only used for the one-time code.
  const guest = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: who, error: whoError } = await guest.auth.getUser(token);
  const email = who.user?.email;
  if (whoError || !who.user || !email) return json(401, { error: 'Nicht angemeldet.' });
  if (!who.user.email_confirmed_at && !who.user.confirmed_at) return json(403, { error: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.' });

  const { data: member } = await guest.from('loyalty_members').select('organization_id').eq('user_id', who.user.id).maybeSingle();
  if (!member) return json(403, { error: 'Kein Mitgliedskonto.' });
  const host = target.hostname.toLowerCase();
  const { data: hotels, error: hotelError } = await guest
    .from('hotels')
    .select('id')
    .eq('organization_id', member.organization_id)
    .eq('is_active', true)
    .contains('domains', [host])
    .limit(1);
  if (hotelError) return json(500, { error: hotelError.message });
  if (!hotels?.length) return json(403, { error: 'Diese Website gehört nicht zur Hotelgruppe.' });

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  const code = link?.properties?.hashed_token;
  if (linkError || !code) return json(500, { error: linkError?.message ?? 'Anmeldung nicht möglich.' });

  target.hash = `${HANDOFF_PARAM}=${encodeURIComponent(code)}`;
  return json(200, { url: target.toString() });
}
