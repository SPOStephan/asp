import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { PORTAL_ORG } from './config';
import { portal } from './portalClient';
import type { Benefit, LedgerRow, PortalHotel, Redemption, Stay, Summary } from './types';

type PortalValue = {
  session: Session | null;
  ready: boolean;
  summary: Summary | null;
  stays: Stay[];
  ledger: LedgerRow[];
  benefits: Benefit[];
  redemptions: Redemption[];
  hotels: PortalHotel[];
  error: string | null;
  reload: () => Promise<void>;
  join: (firstName: string, lastName: string, marketing: boolean) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const PortalContext = createContext<PortalValue | null>(null);

export function usePortal() {
  const value = useContext(PortalContext);
  if (!value) throw new Error('usePortal outside PortalProvider');
  return value;
}

function message(error: unknown) {
  return error && typeof error === 'object' && 'message' in error ? String((error as { message: unknown }).message) : 'Unbekannter Fehler';
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [stays, setStays] = useState<Stay[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [hotels, setHotels] = useState<PortalHotel[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    // Stays booked with the confirmed address since the last visit become the member's.
    await portal.rpc('loyalty_link_stays');
    const [sum, stayRows, ledgerRows, benefitRows, redemptionRows] = await Promise.all([
      portal.rpc('loyalty_summary'),
      portal.from('loyalty_stays').select('id, hotel_id, hotel_name, booking_ref, arrival, departure, room, guests, amount_eur, channel, status').order('arrival', { ascending: false }),
      portal.from('loyalty_ledger').select('id, points, reason, stay_id, created_at, expires_at').order('created_at', { ascending: false }).limit(50),
      portal.from('loyalty_benefits').select('id, hotel_id, kind, title, description, image, min_tier, points_cost, link, valid_until').order('sort_order'),
      portal.from('loyalty_redemptions').select('id, title, points, code, status, created_at').order('created_at', { ascending: false }),
    ]);
    const failed = [sum, stayRows, ledgerRows, benefitRows, redemptionRows].find((result) => result.error);
    if (failed?.error) setError(message(failed.error));
    setSummary((sum.data as Summary | null) ?? null);
    setStays((stayRows.data ?? []) as Stay[]);
    setLedger((ledgerRows.data ?? []) as LedgerRow[]);
    setBenefits(((benefitRows.data ?? []) as Benefit[]).filter((item) => !item.valid_until || item.valid_until >= new Date().toISOString().slice(0, 10)));
    setRedemptions((redemptionRows.data ?? []) as Redemption[]);
  }, []);

  const loadHotels = useCallback(async () => {
    const rows = await portal.rpc('loyalty_portal_hotels', { org_slug: PORTAL_ORG });
    setHotels((rows.data ?? []) as PortalHotel[]);
  }, []);

  useEffect(() => {
    void portal.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = portal.auth.onAuthStateChange((_event, next) => setSession(next));
    void loadHotels();
    return () => data.subscription.unsubscribe();
  }, [loadHotels]);

  useEffect(() => {
    if (!session) {
      setSummary(null);
      setStays([]);
      setLedger([]);
      setRedemptions([]);
      return;
    }
    void reload();
  }, [session, reload]);

  const join = useCallback(async (firstName: string, lastName: string, marketing: boolean) => {
    const result = await portal.rpc('loyalty_join', { org_slug: PORTAL_ORG, first_name: firstName, last_name: lastName, marketing });
    if (result.error) return message(result.error);
    await reload();
    return null;
  }, [reload]);

  const signOut = useCallback(async () => {
    await portal.auth.signOut();
  }, []);

  return (
    <PortalContext.Provider value={{ session, ready, summary, stays, ledger, benefits, redemptions, hotels, error, reload, join, signOut }}>
      {children}
    </PortalContext.Provider>
  );
}
