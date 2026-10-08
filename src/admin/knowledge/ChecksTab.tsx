import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDate, hotelName, useKnowledge } from './knowledgeScope';
import { useModels } from './SettingsTab';

type Check = {
  id: string;
  hotel_id: string;
  question: string;
  expected: string;
  wrong_text: string | null;
  enabled: boolean;
  last_status: 'pass' | 'fail' | 'error' | null;
  last_answer: string | null;
  last_reason: string | null;
  last_model: string | null;
  last_run_at: string | null;
};

const STATUS: Record<string, string> = { pass: '✓ bestanden', fail: '✗ nicht bestanden', error: '! Fehler' };

export function ChecksTab() {
  const { scope, version, changed, checks: run, runChecks } = useKnowledge();
  const { models } = useModels();
  const [checks, setChecks] = useState<Check[]>([]);
  const [model, setModel] = useState('');
  const [question, setQuestion] = useState('');
  const [expected, setExpected] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    let query = supabase.from('check_questions').select('*').order('created_at', { ascending: false });
    query = scope.hotelId ? query.eq('hotel_id', scope.hotelId) : query.eq('organization_id', scope.orgId);
    const { data, error: loadError } = await query;
    if (loadError) setError(loadError.message);
    setChecks((data ?? []) as Check[]);
  }, [scope.hotelId, scope.orgId]);

  useEffect(() => {
    void load();
  }, [load, version]);

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!scope.hotelId) return;
    const { error: addError } = await supabase.from('check_questions').insert({ organization_id: scope.orgId, hotel_id: scope.hotelId, question, expected });
    if (addError) return setError(addError.message);
    setQuestion('');
    setExpected('');
    await load();
  }

  async function update(check: Check, fields: Partial<Check>) {
    const { error: updateError } = await supabase.from('check_questions').update(fields).eq('id', check.id);
    if (updateError) setError(updateError.message);
    else await load();
  }

  async function remove(check: Check) {
    if (!window.confirm('Prüffrage löschen?')) return;
    const { error: removeError } = await supabase.from('check_questions').delete().eq('id', check.id);
    if (removeError) setError(removeError.message);
    else await load();
  }

  const active = checks.filter((check) => check.enabled);
  const passed = active.filter((check) => check.last_status === 'pass').length;

  return (
    <>
      <p className="admin-muted">
        Jede Red Flag wird zur Prüffrage. Nach jeder Änderung am Wissen werden alle Prüffragen automatisch erneut gestellt
        und von einer zweiten KI mit der richtigen Aussage verglichen. So fällt sofort auf, wenn ein alter Fehler
        zurückkommt. Mit „Modell“ lassen sich Modelle an denselben Fragen vergleichen.
      </p>
      <div className="kn-chat-tools">
        <strong>
          {passed} von {active.length} bestanden
        </strong>
        <label>
          Modell
          <select value={model} onChange={(event) => setModel(event.target.value)}>
            <option value="">Standard</option>
            {models.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="admin-btn" disabled={run.running || !active.length} onClick={() => void runChecks(active.map((check) => check.id), model || undefined)}>
          {run.running ? `Läuft (${run.done}/${run.total})…` : 'Alle jetzt prüfen'}
        </button>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <table className="admin-table kn-checks">
        <thead>
          <tr>
            <th>Frage</th>
            <th>Richtige Aussage</th>
            {!scope.hotelId ? <th>Hotel</th> : null}
            <th>Ergebnis</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.id} className={check.last_status && check.last_status !== 'pass' && check.enabled ? 'is-red' : undefined}>
              <td>
                <button type="button" className="kn-link" onClick={() => setOpen(open === check.id ? null : check.id)}>
                  {check.question}
                </button>
                {open === check.id ? (
                  <div className="kn-check-detail">
                    {check.wrong_text ? <p><strong>Früher falsch:</strong> {check.wrong_text}</p> : null}
                    <p><strong>Letzte Antwort ({check.last_model ?? '–'}):</strong> {check.last_answer ?? '–'}</p>
                    <p><strong>Begründung:</strong> {check.last_reason ?? '–'}</p>
                  </div>
                ) : null}
              </td>
              <td>{check.expected}</td>
              {!scope.hotelId ? <td>{hotelName(scope, check.hotel_id)}</td> : null}
              <td>
                {check.enabled ? (check.last_status ? STATUS[check.last_status] : 'noch nicht geprüft') : 'aus'}
                <br />
                <span className="admin-muted">{formatDate(check.last_run_at)}</span>
              </td>
              <td className="kn-row-actions">
                <button type="button" className="kn-link" disabled={run.running} onClick={() => void runChecks([check.id], model || undefined)}>
                  prüfen
                </button>
                <button type="button" className="kn-link" onClick={() => void update(check, { enabled: !check.enabled })}>
                  {check.enabled ? 'aus' : 'an'}
                </button>
                {scope.canManage ? (
                  <button type="button" className="kn-link kn-danger" onClick={() => void remove(check)}>
                    löschen
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
          {!checks.length ? (
            <tr>
              <td colSpan={5} className="admin-muted">Noch keine Prüffragen. Sie entstehen aus Red Flags oder hier von Hand.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      {scope.hotelId && scope.canEdit ? (
        <form className="admin-form admin-form--wide" onSubmit={(event) => void add(event).then(changed)}>
          <h3>Prüffrage von Hand</h3>
          <label>
            Frage
            <input value={question} onChange={(event) => setQuestion(event.target.value)} required placeholder="z. B. Darf ich meinen Hund mitbringen?" />
          </label>
          <label>
            Richtige Aussage
            <input value={expected} onChange={(event) => setExpected(event.target.value)} required placeholder="z. B. Ja, 25 € pro Nacht, höchstens zwei Hunde." />
          </label>
          <div className="admin-actions">
            <button type="submit" className="admin-btn">Hinzufügen</button>
          </div>
        </form>
      ) : null}
    </>
  );
}
