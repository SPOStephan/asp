import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { callAi } from '../../lib/aiClient';
import { supabase } from '../../lib/supabase';

// Where the knowledge page works: one hotel (its own and the group's knowledge) or the
// whole organisation (group knowledge only).
export type KnowledgeScope = {
  orgId: string;
  orgName: string;
  hotelId: string | null;
  hotelName: string | null;
  hotels: Array<{ id: string; name: string }>;
  // may change knowledge of this scope
  canEdit: boolean;
  // owner/admin of the organisation: group knowledge, settings, closing red flags
  canManage: boolean;
};

type CheckRun = { running: boolean; done: number; total: number; failed: number; lastRun: string | null };

type ScopeValue = {
  scope: KnowledgeScope;
  // Call after every change to knowledge, rules or corrections.
  changed: () => void;
  version: number;
  checks: CheckRun;
  runChecks: (ids?: string[], model?: string) => Promise<void>;
};

const ScopeContext = createContext<ScopeValue | null>(null);

export function useKnowledge() {
  const value = useContext(ScopeContext);
  if (!value) throw new Error('useKnowledge outside KnowledgeScopeProvider');
  return value;
}

export function hotelName(scope: KnowledgeScope, hotelId: string | null) {
  if (!hotelId) return 'ganze Gruppe';
  return scope.hotels.find((hotel) => hotel.id === hotelId)?.name ?? 'Hotel';
}

const AUTO_CHECK_DELAY = 8000;

export function KnowledgeScopeProvider({ scope, children }: { scope: KnowledgeScope; children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const [checks, setChecks] = useState<CheckRun>({ running: false, done: 0, total: 0, failed: 0, lastRun: null });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const running = useRef(false);

  const runChecks = useCallback(
    async (ids?: string[], model?: string) => {
      if (running.current) return;
      let list = ids;
      if (!list) {
        let query = supabase.from('check_questions').select('id').eq('enabled', true).eq('organization_id', scope.orgId);
        if (scope.hotelId) query = query.eq('hotel_id', scope.hotelId);
        const { data } = await query;
        list = (data ?? []).map((row) => row.id as string);
      }
      if (!list.length) return;
      running.current = true;
      setChecks((current) => ({ ...current, running: true, done: 0, total: list.length, failed: 0 }));
      let failed = 0;
      for (const [index, id] of list.entries()) {
        try {
          const result = await callAi<{ status: string }>('run-check', { checkId: id, model });
          if (result.status !== 'pass') failed += 1;
        } catch {
          failed += 1;
        }
        setChecks((current) => ({ ...current, done: index + 1, failed }));
      }
      running.current = false;
      setChecks((current) => ({ ...current, running: false, lastRun: new Date().toISOString() }));
      setVersion((value) => value + 1);
    },
    [scope.hotelId, scope.orgId],
  );

  // Every change to the knowledge asks the check questions again, a few seconds later,
  // so a fix that brings an old mistake back shows up right away.
  const changed = useCallback(() => {
    setVersion((value) => value + 1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void runChecks(), AUTO_CHECK_DELAY);
  }, [runChecks]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return <ScopeContext.Provider value={{ scope, changed, version, checks, runChecks }}>{children}</ScopeContext.Provider>;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '–';
  return new Date(value).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatCost(value: number | null | undefined) {
  if (value === null || value === undefined) return '';
  return `${value.toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} $`;
}
