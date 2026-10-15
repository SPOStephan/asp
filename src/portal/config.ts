// The member portal of a hotel group (e.g. app.<group>.de). Everything group-specific comes
// from the deployment, never from the code:
//   VITE_PORTAL_HOST     host of the portal (default: any "app." host)
//   VITE_PORTAL_ORG      slug of the organisation whose programme the portal shows
//   VITE_PORTAL_NAME     name shown in the portal (default: the programme's name)
//   VITE_PORTAL_URL      address of the portal, for the login link on the hotel websites

function read(name: string): string {
  const fromVite = (import.meta as { env?: Record<string, string | undefined> }).env?.[name];
  const fromNode = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  return (fromVite || fromNode || '').trim();
}

export const PORTAL_HOST = read('VITE_PORTAL_HOST').toLowerCase();
export const PORTAL_ORG = read('VITE_PORTAL_ORG');
export const PORTAL_NAME = read('VITE_PORTAL_NAME');
export const PORTAL_URL = read('VITE_PORTAL_URL').replace(/\/+$/, '');

export function isPortalHost(host: string) {
  const value = host.toLowerCase().split(':')[0];
  return (Boolean(PORTAL_HOST) && value === PORTAL_HOST) || value.startsWith('app.');
}
