// One login for all hotel websites of a group: the member portal is the place to sign in,
// hotel websites receive a one-time code in the address (#member=…) and sign in with it.
// Shared by the portal, the hotel websites and the server function api/member-handoff.

export const HANDOFF_PARAM = 'member';

// Only https addresses (plain http just for local development) and without the old fragment.
export function handoffTarget(raw: unknown): URL | null {
  try {
    const url = new URL(String(raw ?? ''));
    const local = url.hostname === 'localhost' || url.hostname.endsWith('.localhost');
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return null;
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

// Reads the one-time code from a website address; returns it and the address without it.
export function readHandoff(href: string): { code: string; clean: string } | null {
  const url = new URL(href);
  const params = new URLSearchParams(url.hash.replace(/^#/, ''));
  const code = params.get(HANDOFF_PARAM);
  if (!code) return null;
  url.hash = '';
  return { code, clean: url.toString() };
}

// Portal address that signs the guest in (if needed) and brings them back to `returnTo`.
export function portalLoginUrl(portalUrl: string, returnTo: string) {
  return `${portalUrl}/weiter?to=${encodeURIComponent(returnTo)}`;
}

// Portal address that passes a booking on to the booking engine, with the member rate code
// if the guest is signed in at the portal – no login prompt for anyone else.
export function portalBookingUrl(portalUrl: string, bookingTarget: string) {
  return `${portalUrl}/weiter?buchen=1&to=${encodeURIComponent(bookingTarget)}`;
}

// A booking target the portal may forward to: a website or booking engine of the group's hotels.
export function allowedBookingTarget(raw: string, hotels: Array<{ domains: string[] | null; booking_url: string | null }>) {
  const target = handoffTarget(raw);
  if (!target) return null;
  const hosts = new Set<string>();
  for (const hotel of hotels) {
    for (const domain of hotel.domains ?? []) hosts.add(domain.toLowerCase());
    try {
      if (hotel.booking_url) hosts.add(new URL(/^https?:\/\//i.test(hotel.booking_url) ? hotel.booking_url : `https://${hotel.booking_url}`).hostname.toLowerCase());
    } catch {
      // A broken booking address in the admin is simply not a target.
    }
  }
  return hosts.has(target.hostname.toLowerCase()) ? target : null;
}

export function withMemberCode(target: URL, code?: string, param?: string) {
  if (code) target.searchParams.set(param || 'code', code);
  return target.toString();
}
