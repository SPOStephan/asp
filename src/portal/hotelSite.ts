import { portal } from './portalClient';

// Asks the server for a one-time code that signs the guest in on the hotel website.
export async function hotelSiteUrl(returnTo: string) {
  const { data } = await portal.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return returnTo;
  const response = await fetch('/api/member-handoff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ returnTo }),
  }).catch(() => null);
  const result = response ? ((await response.json().catch(() => ({}))) as { url?: string; error?: string }) : {};
  if (!response?.ok || !result.url) {
    throw new Error(result.error || `Die Anmeldung auf der Hotel-Website hat nicht geklappt${response ? ` (Fehler ${response.status})` : ''}.`);
  }
  return result.url;
}
