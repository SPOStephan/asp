import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { canManageOrg, useAdminAuth } from '../AdminAuth';
import { ChecksTab } from './ChecksTab';
import { FeedbackTab } from './FeedbackTab';
import { formatDate, KnowledgeScopeProvider, useKnowledge, type KnowledgeScope } from './knowledgeScope';
import { RulesTab } from './RulesTab';
import { SettingsTab } from './SettingsTab';
import { SourcesTab } from './SourcesTab';
import { TestChatTab } from './TestChatTab';
import { WebsiteChatTab } from './WebsiteChatTab';
import './knowledge.css';

type OrgRow = { id: string; name: string };
type HotelRow = { id: string; name: string; organization_id: string | null };

// /admin/wissen: pick the group or a hotel.
export function KnowledgeIndexPage() {
  const { admin } = useAdminAuth();
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [hotels, setHotels] = useState<HotelRow[]>([]);

  useEffect(() => {
    void supabase
      .from('organizations')
      .select('id, name')
      .order('name')
      .then(({ data }) => setOrgs((data ?? []) as OrgRow[]));
    void supabase
      .from('hotels')
      .select('id, name, organization_id')
      .order('name')
      .then(({ data }) => {
        const rows = (data ?? []) as HotelRow[];
        setHotels(admin?.platform ? rows : rows.filter((hotel) => admin?.organizations.some((org) => org.id === hotel.organization_id)));
      });
  }, [admin]);

  return (
    <>
      <h2>KI-Wissen</h2>
      <p className="lead">
        Alles, was der KI-Concierge weiß: pro Hotel und für die ganze Gruppe. Wissen der Gruppe gilt in jedem Hotel der
        Organisation, Wissen eines Hotels nur dort. Andere Kunden sehen davon nichts.
      </p>
      {orgs.map((org) => (
        <section key={org.id} className="admin-team">
          <h3>{org.name}</h3>
          <div className="admin-list">
            <Link className="admin-card admin-hotel" to={`/admin/wissen/gruppe/${org.id}`}>
              <span className="admin-dot" style={{ background: '#957640' }} />
              <span>
                <strong>Gruppenwissen</strong>
                <span>gilt für alle Hotels von {org.name}</span>
              </span>
              <span />
            </Link>
            {hotels
              .filter((hotel) => hotel.organization_id === org.id)
              .map((hotel) => (
                <Link key={hotel.id} className="admin-card admin-hotel" to={`/admin/wissen/hotel/${hotel.id}`}>
                  <span className="admin-dot" style={{ background: '#133b5c' }} />
                  <span>
                    <strong>{hotel.name}</strong>
                    <span>Wissen, Testchat, Bewertungen</span>
                  </span>
                  <span />
                </Link>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}

type TabKey = 'overview' | 'sources' | 'chat' | 'website' | 'feedback' | 'checks' | 'rules' | 'settings';

const TABS: Array<{ key: TabKey; label: string; hotelOnly?: boolean }> = [
  { key: 'overview', label: 'Übersicht' },
  { key: 'sources', label: 'Quellen' },
  { key: 'chat', label: 'Testchat', hotelOnly: true },
  { key: 'website', label: 'Website-Chat', hotelOnly: true },
  { key: 'feedback', label: 'Bewertungen & Lücken' },
  { key: 'checks', label: 'Prüffragen' },
  { key: 'rules', label: 'Antwortregeln' },
  { key: 'settings', label: 'Einstellungen' },
];

// /admin/wissen/hotel/:hotelId and /admin/wissen/gruppe/:orgId
export function KnowledgePage({ level }: { level: 'hotel' | 'group' }) {
  const params = useParams();
  const { admin } = useAdminAuth();
  const [scope, setScope] = useState<KnowledgeScope | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      let orgId = params.orgId ?? '';
      let hotel: HotelRow | null = null;
      if (level === 'hotel') {
        const result = await supabase.from('hotels').select('id, name, organization_id').eq('id', params.hotelId ?? '').maybeSingle();
        hotel = result.data as HotelRow | null;
        if (!hotel) return setError('Hotel nicht gefunden.');
        if (!hotel.organization_id) return setError('Das Hotel gehört zu keiner Organisation.');
        orgId = hotel.organization_id;
      }
      const [orgResult, hotelsResult] = await Promise.all([
        supabase.from('organizations').select('id, name').eq('id', orgId).maybeSingle(),
        supabase.from('hotels').select('id, name').eq('organization_id', orgId).order('name'),
      ]);
      const org = orgResult.data as OrgRow | null;
      if (!org) return setError('Organisation nicht gefunden oder kein Zugriff.');
      const member = Boolean(admin?.platform || admin?.organizations.some((item) => item.id === org.id));
      const canManage = canManageOrg(admin, org.id);
      if (cancelled) return;
      setScope({
        orgId: org.id,
        orgName: org.name,
        hotelId: hotel?.id ?? null,
        hotelName: hotel?.name ?? null,
        hotels: (hotelsResult.data ?? []) as Array<{ id: string; name: string }>,
        canEdit: level === 'hotel' ? member : canManage,
        canManage,
      });
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [admin, level, params.hotelId, params.orgId]);

  if (error) return <p className="admin-error">{error}</p>;
  if (!scope) return <p className="admin-muted">Lädt…</p>;
  return (
    <KnowledgeScopeProvider key={`${scope.orgId}-${scope.hotelId ?? 'group'}`} scope={scope}>
      <KnowledgeShell />
    </KnowledgeScopeProvider>
  );
}

function KnowledgeShell() {
  const { scope, checks } = useKnowledge();
  const [params, setParams] = useSearchParams();
  const tabs = TABS.filter((tab) => scope.hotelId || !tab.hotelOnly);
  const tab = (tabs.find((item) => item.key === params.get('tab'))?.key ?? 'overview') as TabKey;
  const open = (key: TabKey) => setParams((current) => {
    const next = new URLSearchParams(current);
    next.set('tab', key);
    next.delete('source');
    return next;
  });

  return (
    <>
      <p className="admin-muted">
        <Link to="/admin/wissen">KI-Wissen</Link> › {scope.orgName}
        {scope.hotelName ? ` › ${scope.hotelName}` : ' › Gruppenwissen'}
      </p>
      <h2>{scope.hotelName ? `KI-Wissen: ${scope.hotelName}` : `Gruppenwissen: ${scope.orgName}`}</h2>
      {!scope.canEdit ? <p className="admin-note">Nur lesen: Gruppenwissen ändern Inhaber und Admins der Organisation.</p> : null}
      <nav className="kn-tabs">
        {tabs.map((item) => (
          <button key={item.key} type="button" className={item.key === tab ? 'is-on' : undefined} onClick={() => open(item.key)}>
            {item.label}
          </button>
        ))}
      </nav>
      {checks.running ? (
        <p className="kn-banner">
          Prüffragen laufen ({checks.done}/{checks.total}){checks.failed ? ` – ${checks.failed} nicht bestanden` : ''}…
        </p>
      ) : null}
      {tab === 'overview' ? <OverviewTab open={open} /> : null}
      {tab === 'sources' ? <SourcesTab /> : null}
      {tab === 'chat' ? <TestChatTab /> : null}
      {tab === 'website' ? <WebsiteChatTab /> : null}
      {tab === 'feedback' ? <FeedbackTab /> : null}
      {tab === 'checks' ? <ChecksTab /> : null}
      {tab === 'rules' ? <RulesTab /> : null}
      {tab === 'settings' ? <SettingsTab /> : null}
    </>
  );
}

type Stats = {
  answers: number;
  good: number;
  improve: number;
  wrong: number;
  openFlags: number;
  gaps: number;
  needsCheck: number;
  review: number;
  sources: number;
  checks: number;
  failing: number;
  lastCheck: string | null;
};

function OverviewTab({ open }: { open: (key: TabKey) => void }) {
  const { scope, version } = useKnowledge();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    // Supabase's builder types are too deep for a generic helper.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byScope = (query: any) => (scope.hotelId ? query.eq('hotel_id', scope.hotelId) : query.eq('organization_id', scope.orgId));
    async function load() {
      const sourceQuery = supabase.from('knowledge_sources').select('status, needs_check, hotel_id').eq('organization_id', scope.orgId);
      const [messages, feedback, flags, gaps, sources, checks] = await Promise.all([
        byScope(supabase.from('chat_messages').select('id', { count: 'exact', head: true }).neq('channel', 'check').gte('created_at', since)),
        byScope(supabase.from('chat_feedback').select('rating').gte('created_at', since)),
        byScope(supabase.from('chat_feedback').select('id', { count: 'exact', head: true }).eq('status', 'open')),
        byScope(supabase.from('chat_messages').select('id', { count: 'exact', head: true }).eq('gap', true).is('gap_resolved_at', null).neq('channel', 'check')),
        scope.hotelId ? sourceQuery.or(`hotel_id.eq.${scope.hotelId},hotel_id.is.null`) : sourceQuery.is('hotel_id', null),
        byScope(supabase.from('check_questions').select('last_status, last_run_at').eq('enabled', true)),
      ]);
      const ratings = (feedback.data ?? []) as Array<{ rating: string }>;
      const sourceRows = (sources.data ?? []) as Array<{ status: string; needs_check: boolean }>;
      const checkRows = (checks.data ?? []) as Array<{ last_status: string | null; last_run_at: string | null }>;
      setStats({
        answers: messages.count ?? 0,
        good: ratings.filter((row) => row.rating === 'good').length,
        improve: ratings.filter((row) => row.rating === 'improve').length,
        wrong: ratings.filter((row) => row.rating === 'wrong').length,
        openFlags: flags.count ?? 0,
        gaps: gaps.count ?? 0,
        needsCheck: sourceRows.filter((row) => row.needs_check).length,
        review: sourceRows.filter((row) => row.status === 'review').length,
        sources: sourceRows.length,
        checks: checkRows.length,
        failing: checkRows.filter((row) => row.last_status && row.last_status !== 'pass').length,
        lastCheck: checkRows.map((row) => row.last_run_at).filter(Boolean).sort().pop() ?? null,
      });
    }
    void load();
  }, [scope.hotelId, scope.orgId, version]);

  if (!stats) return <p className="admin-muted">Lädt…</p>;
  const rated = stats.good + stats.improve + stats.wrong;
  const percent = (value: number) => (rated ? `${Math.round((value / rated) * 100)} %` : '–');
  const todo = [
    stats.openFlags ? { text: `${stats.openFlags} offene Red Flag${stats.openFlags > 1 ? 's' : ''}`, tab: 'feedback' as TabKey, red: true } : null,
    stats.failing ? { text: `${stats.failing} Prüffrage${stats.failing > 1 ? 'n' : ''} nicht bestanden`, tab: 'checks' as TabKey, red: true } : null,
    stats.needsCheck ? { text: `${stats.needsCheck} Quelle${stats.needsCheck > 1 ? 'n' : ''} widersprechen einer Korrektur – bitte prüfen`, tab: 'sources' as TabKey, red: true } : null,
    stats.review ? { text: `${stats.review} Quelle${stats.review > 1 ? 'n' : ''} warten auf Freigabe`, tab: 'sources' as TabKey } : null,
    stats.gaps ? { text: `${stats.gaps} Wissenslücke${stats.gaps > 1 ? 'n' : ''}: Fragen ohne Antwort`, tab: 'feedback' as TabKey } : null,
  ].filter(Boolean) as Array<{ text: string; tab: TabKey; red?: boolean }>;

  return (
    <>
      <div className="kn-stats">
        <div><strong>{stats.sources}</strong><span>Quellen{scope.hotelId ? ' (inkl. Gruppe)' : ''}</span></div>
        <div><strong>{stats.answers}</strong><span>Antworten (30 Tage)</span></div>
        <div><strong>{percent(stats.good)}</strong><span>gut bewertet ({stats.good})</span></div>
        <div><strong>{percent(stats.improve)}</strong><span>verbesserungswürdig ({stats.improve})</span></div>
        <div className={stats.wrong ? 'is-red' : undefined}><strong>{percent(stats.wrong)}</strong><span>falsch ({stats.wrong})</span></div>
        <div><strong>{stats.checks}</strong><span>Prüffragen · zuletzt {formatDate(stats.lastCheck)}</span></div>
      </div>
      <h3>Zu tun</h3>
      {todo.length ? (
        <ul className="kn-todo">
          {todo.map((item) => (
            <li key={item.text} className={item.red ? 'is-red' : undefined}>
              <button type="button" onClick={() => open(item.tab)}>{item.text}</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-muted">Nichts offen.</p>
      )}
      {scope.hotelId ? (
        <p className="admin-muted">
          So wird der Chat besser: im Testchat Fragen stellen und jede Antwort bewerten. Falsche Antworten als Red Flag
          melden – die Korrektur gilt sofort und wird als Prüffrage nach jeder Änderung erneut gestellt.
        </p>
      ) : null}
    </>
  );
}
