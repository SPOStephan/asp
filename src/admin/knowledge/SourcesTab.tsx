import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { callAi } from '../../lib/aiClient';
import {
  chunkText,
  KIND_LABEL,
  type KnowledgeChunk,
  type KnowledgeKind,
  type KnowledgeSource,
  type NewChunk,
} from '../../lib/knowledge';
import { supabase } from '../../lib/supabase';
import { formatDate, hotelName, useKnowledge, type KnowledgeScope } from './knowledgeScope';
import { readPdf } from './pdfText';

type AddKind = 'text' | 'url' | 'pdf' | 'email';

const ADD_LABEL: Record<AddKind, string> = {
  text: '+ Text',
  url: '+ Link / Website',
  pdf: '+ PDF',
  email: '+ Antworten aus E-Mails',
};

const MAX_PAGES = 60;

// The first visit reads the own website once; StrictMode and reloads must not start a second run.
const autoSynced = new Set<string>();

function statusLabel(source: KnowledgeSource) {
  if (source.status === 'review') return 'wartet auf Freigabe';
  if (source.status === 'error') return `Fehler${source.error ? `: ${source.error}` : ''}`;
  return source.enabled ? 'aktiv' : 'aus';
}

export function canEditSource(scope: KnowledgeScope, hotelId: string | null) {
  return hotelId ? scope.canEdit : scope.canManage;
}

async function createSource(
  scope: KnowledgeScope,
  groupWide: boolean,
  fields: { kind: KnowledgeKind; title: string; url?: string | null; status?: 'ready' | 'review'; meta?: Record<string, unknown> },
  chunks: NewChunk[] = [],
) {
  const { data, error } = await supabase
    .from('knowledge_sources')
    .insert({
      organization_id: scope.orgId,
      hotel_id: groupWide ? null : scope.hotelId,
      kind: fields.kind,
      title: fields.title,
      url: fields.url ?? null,
      status: fields.status ?? 'ready',
      meta: fields.meta ?? {},
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  const id = (data as { id: string }).id;
  if (chunks.length) {
    const rows = chunks.map((chunk, index) => ({ source_id: id, position: index, heading: chunk.heading ?? null, content: chunk.content, url: chunk.url ?? null }));
    for (let index = 0; index < rows.length; index += 200) {
      const result = await supabase.from('knowledge_chunks').insert(rows.slice(index, index + 200));
      if (result.error) throw new Error(result.error.message);
    }
  }
  return id;
}

export function SourcesTab() {
  const { scope, version, changed } = useKnowledge();
  const [params, setParams] = useSearchParams();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [adding, setAdding] = useState<AddKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const selected = params.get('source');

  const load = useCallback(async () => {
    let query = supabase.from('knowledge_sources').select('*').eq('organization_id', scope.orgId).order('updated_at', { ascending: false });
    query = scope.hotelId ? query.or(`hotel_id.eq.${scope.hotelId},hotel_id.is.null`) : query.is('hotel_id', null);
    const { data, error: loadError } = await query;
    if (loadError) setError(loadError.message);
    setSources((data ?? []) as KnowledgeSource[]);
    return (data ?? []) as KnowledgeSource[];
  }, [scope.hotelId, scope.orgId]);

  const syncWebsite = useCallback(async () => {
    if (!scope.hotelId) return;
    setSyncing(true);
    setError(null);
    try {
      await callAi('sync-website', { hotelId: scope.hotelId });
      changed();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setSyncing(false);
  }, [changed, scope.hotelId]);

  useEffect(() => {
    void load().then((rows) => {
      // The own website is always part of the knowledge: read it once on first visit.
      if (!scope.hotelId || !scope.canEdit || autoSynced.has(scope.hotelId)) return;
      if (rows.some((row) => row.kind === 'website' && row.hotel_id === scope.hotelId)) return;
      autoSynced.add(scope.hotelId);
      void syncWebsite();
    });
  }, [load, version, scope.hotelId, scope.canEdit, syncWebsite]);

  const select = (id: string | null) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (id) next.set('source', id);
      else next.delete('source');
      return next;
    });

  const source = sources.find((item) => item.id === selected);
  if (selected && source) return <SourceDetail source={source} onBack={() => select(null)} onChanged={() => void load().then(changed)} />;

  const website = sources.find((item) => item.kind === 'website' && item.hotel_id === scope.hotelId);
  const visible = sources.filter((item) => item.kind !== 'example');
  const examples = sources.filter((item) => item.kind === 'example').length;

  return (
    <>
      {error ? <p className="admin-error">{error}</p> : null}
      {scope.hotelId ? (
        <div className="admin-card kn-website">
          <div>
            <strong>Eigene Website</strong>
            <span className="admin-muted">
              {website
                ? `${String(website.meta.pages ?? '?')} Seiten · Stand ${formatDate(String(website.meta.synced_at ?? website.updated_at))} · wird nach jedem Speichern im CMS aktualisiert`
                : 'noch nicht eingelesen'}
            </span>
          </div>
          {scope.canEdit ? (
            <button type="button" className="admin-btn admin-btn--ghost" disabled={syncing} onClick={() => void syncWebsite()}>
              {syncing ? 'Liest ein…' : 'Jetzt neu einlesen'}
            </button>
          ) : null}
        </div>
      ) : null}

      {scope.canEdit || scope.canManage ? (
        <div className="kn-add">
          {(Object.keys(ADD_LABEL) as AddKind[]).map((kind) => (
            <button key={kind} type="button" className={`admin-btn${adding === kind ? '' : ' admin-btn--ghost'}`} onClick={() => setAdding(adding === kind ? null : kind)}>
              {ADD_LABEL[kind]}
            </button>
          ))}
        </div>
      ) : null}
      {adding ? (
        <AddSource
          kind={adding}
          onDone={(id) => {
            setAdding(null);
            void load().then(() => {
              changed();
              if (id) select(id);
            });
          }}
        />
      ) : null}

      <table className="admin-table kn-sources">
        <thead>
          <tr>
            <th>Quelle</th>
            <th>Art</th>
            <th>Gilt für</th>
            <th>Stand</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((item) => (
            <tr key={item.id} className={item.needs_check ? 'is-red' : item.status === 'review' ? 'is-review' : undefined}>
              <td>
                <button type="button" className="kn-link" onClick={() => select(item.id)}>
                  {item.title}
                </button>
                {item.needs_check ? <span className="kn-flag">bitte prüfen</span> : null}
              </td>
              <td>{KIND_LABEL[item.kind]}</td>
              <td>{hotelName(scope, item.hotel_id)}</td>
              <td>{formatDate(item.updated_at)}</td>
              <td>{statusLabel(item)}</td>
            </tr>
          ))}
          {!visible.length ? (
            <tr>
              <td colSpan={5} className="admin-muted">Noch keine Quellen.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      {examples ? <p className="admin-muted">Dazu {examples} gut bewertete Antworten als Vorbild (unter „Bewertungen“).</p> : null}
    </>
  );
}

function ScopeChoice({ groupWide, onChange }: { groupWide: boolean; onChange: (value: boolean) => void }) {
  const { scope } = useKnowledge();
  if (!scope.hotelId) return <p className="admin-muted">Gilt für alle Hotels von {scope.orgName}.</p>;
  return (
    <label>
      Gilt für
      <select value={groupWide ? 'group' : 'hotel'} onChange={(event) => onChange(event.target.value === 'group')}>
        <option value="hotel">nur {scope.hotelName}</option>
        <option value="group" disabled={!scope.canManage}>
          ganze Gruppe ({scope.orgName}){scope.canManage ? '' : ' – nur Inhaber/Admins'}
        </option>
      </select>
    </label>
  );
}

function AddSource({ kind, onDone }: { kind: AddKind; onDone: (id?: string) => void }) {
  const { scope } = useKnowledge();
  const [groupWide, setGroupWide] = useState(!scope.hotelId);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [crawl, setCrawl] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function run(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (kind === 'text') {
        const chunks = chunkText(text).map((content) => ({ heading: title, content }));
        if (!chunks.length) throw new Error('Bitte Text eingeben.');
        onDone(await createSource(scope, groupWide, { kind: 'text', title: title || text.slice(0, 60) }, chunks));
      }
      if (kind === 'url') onDone(await importUrl());
      if (kind === 'pdf') onDone(await importPdf());
      if (kind === 'email') onDone(await importEmails());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setBusy(false);
  }

  async function importUrl() {
    const start = new URL(/^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`).toString();
    const id = await createSource(scope, groupWide, { kind: 'url', title: title || new URL(start).host, url: start, meta: { crawl } });
    await crawlSource(id, start, crawl, setProgress);
    return id;
  }

  async function importPdf() {
    if (!file) throw new Error('Bitte eine PDF-Datei wählen.');
    setProgress('PDF wird gelesen…');
    const pages = await readPdf(file, (done, total) => setProgress(`Seite ${done} von ${total} gelesen…`));
    const scans = pages.filter((page) => page.image);
    for (const [index, page] of scans.entries()) {
      setProgress(`Seite ${page.page} ist ein Bild – KI liest den Text (${index + 1}/${scans.length})…`);
      try {
        const result = await callAi<{ text: string }>('ocr', { organizationId: scope.orgId, hotelId: groupWide ? null : scope.hotelId, image: page.image });
        page.text = result.text;
      } catch (err) {
        page.text = page.text || `[Seite konnte nicht gelesen werden: ${err instanceof Error ? err.message : String(err)}]`;
      }
    }
    const name = title || file.name.replace(/\.pdf$/i, '');
    const chunks = pages.flatMap((page) => chunkText(page.text).map((content) => ({ heading: `${name} – Seite ${page.page}`, content })));
    if (!chunks.length) throw new Error('In dieser PDF wurde kein Text gefunden.');
    return createSource(scope, groupWide, { kind: 'pdf', title: name, status: 'review', meta: { file_name: file.name, pages: pages.length, scanned_pages: scans.length } }, chunks);
  }

  async function importEmails() {
    if (!text.trim()) throw new Error('Bitte E-Mails einfügen.');
    setProgress('KI erstellt Fragen und Antworten und entfernt persönliche Daten…');
    const result = await callAi<{ pairs: Array<{ question: string; answer: string }> }>('emails', {
      organizationId: scope.orgId,
      hotelId: groupWide ? null : scope.hotelId,
      text,
    });
    if (!result.pairs.length) throw new Error('In diesen E-Mails stand nichts, das allgemein für Gäste gilt.');
    // The pasted e-mails are not stored, only the anonymised questions and answers.
    return createSource(
      scope,
      groupWide,
      { kind: 'email', title: title || `Antworten aus E-Mails (${new Date().toLocaleDateString('de-DE')})`, status: 'review', meta: { pairs: result.pairs.length } },
      result.pairs.map((pair) => ({ heading: pair.question, content: pair.answer })),
    );
  }

  async function readFiles(files: FileList | null) {
    if (!files) return;
    const parts = await Promise.all([...files].map(async (item) => `--- ${item.name} ---\n${await item.text()}`));
    setText((current) => [current, ...parts].filter(Boolean).join('\n\n'));
  }

  return (
    <form className="admin-form admin-form--wide admin-card kn-form" onSubmit={(event) => void run(event)}>
      <ScopeChoice groupWide={groupWide} onChange={setGroupWide} />
      <label>
        Titel {kind === 'text' ? '' : '(optional)'}
        <input value={title} onChange={(event) => setTitle(event.target.value)} required={kind === 'text'} placeholder={kind === 'text' ? 'z. B. Hunde im Hotel' : ''} />
      </label>
      {kind === 'text' ? (
        <label>
          Text
          <textarea rows={8} value={text} onChange={(event) => setText(event.target.value)} required placeholder="z. B. Hunde sind willkommen, 25 € pro Nacht, max. 2 Hunde, nicht im Spa." />
        </label>
      ) : null}
      {kind === 'url' ? (
        <>
          <label>
            Adresse
            <input value={url} onChange={(event) => setUrl(event.target.value)} required placeholder="https://www.beispiel-hotel.de" />
          </label>
          <label className="admin-choice">
            <input type="checkbox" checked={crawl} onChange={(event) => setCrawl(event.target.checked)} />
            Ganze Website einlesen (alle verlinkten Seiten derselben Domain, höchstens {MAX_PAGES})
          </label>
          <p className="admin-muted">Für die eigene Website auf dieser Plattform nicht nötig – die liest das System selbst.</p>
        </>
      ) : null}
      {kind === 'pdf' ? (
        <>
          <label>
            PDF-Datei
            <input type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required />
          </label>
          <p className="admin-muted">
            Text wird im Browser gelesen. Seiten ohne Text (Scans, gestaltete Prospekte) liest die KI. Danach prüfen und freigeben.
          </p>
        </>
      ) : null}
      {kind === 'email' ? (
        <>
          <label>
            E-Mails (einfügen oder Dateien wählen)
            <textarea rows={10} value={text} onChange={(event) => setText(event.target.value)} placeholder="Antwort-E-Mails an Gäste hier einfügen, gern mehrere hintereinander." />
          </label>
          <label>
            Dateien (.eml, .txt)
            <input type="file" multiple accept=".eml,.txt,message/rfc822,text/plain" onChange={(event) => void readFiles(event.target.files)} />
          </label>
          <p className="admin-muted">
            Die KI macht daraus allgemeine Fragen und Antworten und entfernt Namen, Adressen, Buchungsnummern und andere
            persönliche Daten. Die E-Mails selbst werden nicht gespeichert. Aktiv wird erst, was jemand freigibt.
          </p>
        </>
      ) : null}
      {progress && busy ? <p className="admin-muted">{progress}</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-actions">
        <button type="submit" className="admin-btn" disabled={busy}>
          {busy ? 'Bitte warten…' : kind === 'text' ? 'Speichern' : 'Einlesen'}
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onDone()} disabled={busy}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}

// Reads a page and, when asked, every page it links to on the same site.
async function crawlSource(sourceId: string, start: string, crawl: boolean, progress: (text: string) => void) {
  const queue = [start];
  const seen = new Set<string>([start]);
  const failed: string[] = [];
  let read = 0;
  while (queue.length && read < (crawl ? MAX_PAGES : 1)) {
    const url = queue.shift()!;
    progress(`Liest ${url} (${read + 1}${crawl ? `, ${queue.length} in der Warteschlange` : ''})…`);
    try {
      const result = await callAi<{ url: string; links: string[] }>('import-url', { sourceId, url });
      seen.add(result.url);
      if (crawl) {
        for (const link of result.links) {
          if (!seen.has(link)) {
            seen.add(link);
            queue.push(link);
          }
        }
      }
    } catch (err) {
      failed.push(`${url}: ${err instanceof Error ? err.message : String(err)}`);
    }
    read += 1;
  }
  await supabase
    .from('knowledge_sources')
    .update({
      status: read > failed.length ? 'ready' : 'error',
      error: failed.length ? `${failed.length} Seite(n) nicht lesbar: ${failed.slice(0, 3).join(' · ')}` : null,
      meta: { crawl, pages: read - failed.length, crawled_at: new Date().toISOString(), skipped: queue.length },
    })
    .eq('id', sourceId);
}

function SourceDetail({ source, onBack, onChanged }: { source: KnowledgeSource; onBack: () => void; onChanged: () => void }) {
  const { scope } = useKnowledge();
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [title, setTitle] = useState(source.title);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const editable = canEditSource(scope, source.hotel_id) && source.kind !== 'website';
  const managed = canEditSource(scope, source.hotel_id);

  const loadChunks = useCallback(async () => {
    const { data } = await supabase.from('knowledge_chunks').select('id, source_id, position, heading, content, url').eq('source_id', source.id).order('position');
    setChunks((data ?? []) as KnowledgeChunk[]);
  }, [source.id]);

  useEffect(() => {
    void loadChunks();
  }, [loadChunks]);

  async function update(fields: Partial<KnowledgeSource>) {
    setError(null);
    const { error: updateError } = await supabase.from('knowledge_sources').update(fields).eq('id', source.id);
    if (updateError) setError(updateError.message);
    else onChanged();
  }

  async function remove() {
    if (!window.confirm(`„${source.title}“ mit allen Inhalten löschen?`)) return;
    const { error: removeError } = await supabase.from('knowledge_sources').delete().eq('id', source.id);
    if (removeError) setError(removeError.message);
    else {
      onBack();
      onChanged();
    }
  }

  async function reload() {
    setBusy('Liest neu ein…');
    setError(null);
    try {
      if (source.kind === 'website' && source.hotel_id) await callAi('sync-website', { hotelId: source.hotel_id });
      if (source.kind === 'url' && source.url) {
        await supabase.from('knowledge_chunks').delete().eq('source_id', source.id);
        await crawlSource(source.id, source.url, source.meta.crawl !== false, setBusy);
      }
      await loadChunks();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setBusy('');
  }

  async function saveChunk(chunk: KnowledgeChunk, fields: Partial<KnowledgeChunk>) {
    const { error: saveError } = await supabase.from('knowledge_chunks').update(fields).eq('id', chunk.id);
    if (saveError) setError(saveError.message);
    else {
      await supabase.from('knowledge_sources').update({ updated_at: new Date().toISOString() }).eq('id', source.id);
      await loadChunks();
      onChanged();
    }
  }

  async function removeChunk(chunk: KnowledgeChunk) {
    const { error: removeError } = await supabase.from('knowledge_chunks').delete().eq('id', chunk.id);
    if (removeError) setError(removeError.message);
    else {
      await loadChunks();
      onChanged();
    }
  }

  async function addChunk() {
    const { error: addError } = await supabase
      .from('knowledge_chunks')
      .insert({ source_id: source.id, position: (chunks.at(-1)?.position ?? -1) + 1, heading: source.title, content: 'Neuer Abschnitt' });
    if (addError) setError(addError.message);
    else await loadChunks();
  }

  return (
    <>
      <p>
        <button type="button" className="kn-link" onClick={onBack}>
          ← alle Quellen
        </button>
      </p>
      <div className="admin-row">
        <div>
          <h3>{source.title}</h3>
          <p className="admin-muted">
            {KIND_LABEL[source.kind]} · gilt für {hotelName(scope, source.hotel_id)} · {statusLabel(source)} · Stand {formatDate(source.updated_at)}
            {source.url ? (
              <>
                {' · '}
                <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}</a>
              </>
            ) : null}
          </p>
        </div>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {source.needs_check ? (
        <div className="kn-alert">
          <strong>Bitte prüfen</strong>
          <p>{source.check_reason}</p>
          {managed ? (
            <button type="button" className="admin-btn" onClick={() => void update({ needs_check: false, check_reason: null })}>
              Geprüft und berichtigt
            </button>
          ) : null}
        </div>
      ) : null}
      {source.status === 'review' ? (
        <div className="kn-alert kn-alert--review">
          <strong>Wartet auf Freigabe</strong>
          <p>Bitte die Abschnitte unten lesen und korrigieren. Erst nach der Freigabe nutzt der Chat diese Quelle.</p>
          {managed ? (
            <button type="button" className="admin-btn" onClick={() => void update({ status: 'ready' })}>
              Freigeben
            </button>
          ) : null}
        </div>
      ) : null}
      {managed ? (
        <div className="admin-actions kn-source-actions">
          {editable ? (
            <>
              <input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Titel" />
              <button type="button" className="admin-btn admin-btn--ghost" disabled={title === source.title} onClick={() => void update({ title })}>
                Titel speichern
              </button>
            </>
          ) : null}
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void update({ enabled: !source.enabled })}>
            {source.enabled ? 'Ausschalten' : 'Einschalten'}
          </button>
          {source.kind === 'website' || source.kind === 'url' ? (
            <button type="button" className="admin-btn admin-btn--ghost" disabled={Boolean(busy)} onClick={() => void reload()}>
              {busy || 'Neu einlesen'}
            </button>
          ) : null}
          {source.kind !== 'website' ? (
            <button type="button" className="admin-btn admin-btn--ghost kn-danger" onClick={() => void remove()}>
              Löschen
            </button>
          ) : null}
        </div>
      ) : null}
      {source.kind === 'website' ? (
        <p className="admin-muted">Die eigene Website ändern Sie im CMS; dieses Wissen folgt automatisch.</p>
      ) : null}
      <p className="admin-muted">{chunks.length} Abschnitte</p>
      <div className="kn-chunks">
        {chunks.map((chunk) => (
          <ChunkEditor key={chunk.id} chunk={chunk} editable={editable} onSave={(fields) => void saveChunk(chunk, fields)} onRemove={() => void removeChunk(chunk)} />
        ))}
      </div>
      {editable ? (
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void addChunk()}>
          + Abschnitt
        </button>
      ) : null}
    </>
  );
}

function ChunkEditor({ chunk, editable, onSave, onRemove }: { chunk: KnowledgeChunk; editable: boolean; onSave: (fields: Partial<KnowledgeChunk>) => void; onRemove: () => void }) {
  const [heading, setHeading] = useState(chunk.heading ?? '');
  const [content, setContent] = useState(chunk.content);
  const dirty = heading !== (chunk.heading ?? '') || content !== chunk.content;
  if (!editable) {
    return (
      <article className="kn-chunk">
        {chunk.heading ? <strong>{chunk.heading}</strong> : null}
        {chunk.url ? <a href={chunk.url} target="_blank" rel="noopener noreferrer" className="admin-muted">{chunk.url}</a> : null}
        <p>{chunk.content}</p>
      </article>
    );
  }
  return (
    <article className="kn-chunk">
      <input value={heading} onChange={(event) => setHeading(event.target.value)} placeholder="Überschrift / Frage" />
      <textarea rows={Math.min(14, Math.max(3, Math.ceil(content.length / 90)))} value={content} onChange={(event) => setContent(event.target.value)} />
      <div className="admin-actions">
        {chunk.url ? <a href={chunk.url} target="_blank" rel="noopener noreferrer" className="admin-muted">{chunk.url}</a> : null}
        <button type="button" className="admin-btn" disabled={!dirty || !content.trim()} onClick={() => onSave({ heading: heading || null, content })}>
          Speichern
        </button>
        <button type="button" className="admin-btn admin-btn--ghost kn-danger" onClick={onRemove}>
          Entfernen
        </button>
      </div>
    </article>
  );
}
