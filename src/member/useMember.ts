import { useEffect, useState } from 'react';
import { portal } from '../portal/portalClient';
import { handoffTarget, portalBookingUrl, readHandoff, withMemberCode } from './handoff';

// The member as a hotel website sees them: signed in through the member portal
// (src/member/handoff.ts). Never stores anything but Supabase's own session.
export type WebsiteMember = {
  firstName: string;
  tier: string;
  points: number;
  rateCode: string;
  rateParam: string;
};

type Summary = {
  member: { first_name: string };
  balance: number;
  tier: { name: string } | null;
  program: { settings: { member_rate_code?: string; member_rate_param?: string } };
};

// Coming from the portal with a one-time code: sign in on this website, then drop the code
// from the address bar. Runs once per page load, however many components ask.
let signingIn: Promise<void> | null = null;
function takeHandoff() {
  if (signingIn) return signingIn;
  const handoff = typeof window === 'undefined' ? null : readHandoff(window.location.href);
  if (!handoff) return (signingIn = Promise.resolve());
  window.history.replaceState(window.history.state, '', handoff.clean);
  signingIn = portal.auth
    .verifyOtp({ token_hash: handoff.code, type: 'magiclink' })
    .then(() => undefined)
    .catch(() => undefined);
  return signingIn;
}

// Navigation bar and booking forms ask at the same time: one request per session.
let cached: { token: string; summary: Promise<Summary | null> } | null = null;
function summaryFor(token: string) {
  if (cached?.token !== token) {
    cached = { token, summary: Promise.resolve(portal.rpc('loyalty_summary')).then(({ data }) => (data as Summary | null) ?? null, () => null) };
  }
  return cached.summary;
}

export function useWebsiteMember(enabled = true) {
  const [member, setMember] = useState<WebsiteMember | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const load = async () => {
      const { data } = await portal.auth.getSession();
      if (!data.session) {
        if (alive) setMember(null);
        return;
      }
      const value = await summaryFor(data.session.access_token);
      if (!alive) return;
      setMember(
        value
          ? {
              firstName: value.member.first_name,
              tier: value.tier?.name ?? '',
              points: value.balance,
              rateCode: value.program.settings.member_rate_code ?? '',
              rateParam: value.program.settings.member_rate_param ?? '',
            }
          : null,
      );
    };
    void takeHandoff().then(load);
    const { data } = portal.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') void load();
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [enabled]);

  return member;
}

// Where a booking goes: members straight to the booking engine with their rate code; everyone
// else through the portal, which adds the code if the guest is signed in there (another hotel's
// website, the app) and otherwise forwards at once.
export function memberBookingTarget(target: string, member: WebsiteMember | null, portalUrl: string) {
  if (!portalUrl) return target;
  if (member) {
    const url = handoffTarget(target);
    return url ? withMemberCode(url, member.rateCode, member.rateParam) : target;
  }
  return portalBookingUrl(portalUrl, target);
}
