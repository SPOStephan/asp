import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type OrgAccess = { id: string; slug: string; name: string; role: 'owner' | 'admin' | 'editor' };

export type AdminProfile = {
  user_id: string;
  email: string;
  // Platform team: every organisation, the shared libraries and the platform admins.
  platform: boolean;
  organizations: OrgAccess[];
};

export function canManageOrg(admin: AdminProfile | null, organizationId: string | null | undefined) {
  if (!admin) return false;
  if (admin.platform) return true;
  return admin.organizations.some((org) => org.id === organizationId && org.role !== 'editor');
}

export function managedOrgs(admin: AdminProfile | null) {
  return admin?.organizations.filter((org) => admin.platform || org.role !== 'editor') ?? [];
}

interface AdminAuthValue {
  session: Session | null;
  user: User | null;
  admin: AdminProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

function missingMigration(err: unknown) {
  const message = err instanceof Error ? err.message : String(err ?? '');
  if (/claim_admin|could not find the function|schema cache/i.test(message)) {
    return 'Die Admin-Migration 021 ist auf diesem Supabase-Projekt noch nicht gelaufen.';
  }
  return message || 'Admin-Prüfung fehlgeschlagen.';
}

async function resolveAdmin(user: User | null): Promise<AdminProfile | null> {
  if (!user) return null;
  const { data, error } = await supabase.rpc('claim_admin');
  if (error) throw error;
  if (data !== true) return null;
  const access = await supabase.rpc('my_access');
  // Before migration 025 there are no organisations: every admin is platform team, as before.
  const value = (access.error ? null : access.data) as { platform?: boolean; organizations?: OrgAccess[] } | null;
  return {
    user_id: user.id,
    email: user.email ?? '',
    platform: value ? value.platform === true : true,
    organizations: value?.organizations ?? [],
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      const next = data.session ?? null;
      if (cancelled) return;
      setSession(next);
      try {
        setAdmin(await resolveAdmin(next?.user ?? null));
      } catch (err) {
        setError(missingMigration(err));
        setAdmin(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        setAdmin(null);
        return;
      }
      resolveAdmin(next.user)
        .then(setAdmin)
        .catch((err) => {
          setAdmin(null);
          setError(missingMigration(err));
        });
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { data, error: signError } = await supabase.auth.signInWithPassword({ email, password });
    if (signError) {
      const message = signError.message;
      return { error: message };
    }
    try {
      const profile = await resolveAdmin(data.user);
      setAdmin(profile);
      if (!profile) {
        await supabase.auth.signOut();
        return { error: 'Diese E-Mail ist nicht als Admin eingeladen.' };
      }
      return {};
    } catch (err) {
      await supabase.auth.signOut();
      const message = missingMigration(err);
      setError(message);
      return { error: message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        admin,
        isAdmin: Boolean(admin),
        loading,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error('useAdminAuth outside provider');
  return value;
}
