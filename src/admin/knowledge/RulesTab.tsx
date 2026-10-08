import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDate, hotelName, useKnowledge } from './knowledgeScope';

type Rule = { id: string; hotel_id: string | null; rule: string; enabled: boolean; feedback_id: string | null; created_at: string };

export function RulesTab() {
  const { scope, version, changed } = useKnowledge();
  const [rules, setRules] = useState<Rule[]>([]);
  const [text, setText] = useState('');
  const [groupWide, setGroupWide] = useState(!scope.hotelId);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    let query = supabase.from('answer_rules').select('*').eq('organization_id', scope.orgId).order('created_at');
    query = scope.hotelId ? query.or(`hotel_id.eq.${scope.hotelId},hotel_id.is.null`) : query.is('hotel_id', null);
    const { data, error: loadError } = await query;
    if (loadError) setError(loadError.message);
    setRules((data ?? []) as Rule[]);
  }, [scope.hotelId, scope.orgId]);

  useEffect(() => {
    void load();
  }, [load, version]);

  const editable = (rule: { hotel_id: string | null }) => (rule.hotel_id ? scope.canEdit : scope.canManage);

  async function act(run: () => PromiseLike<{ error: { message: string } | null }>) {
    setError(null);
    const { error: actError } = await run();
    if (actError) setError(actError.message);
    else {
      await load();
      changed();
    }
  }

  function add(event: FormEvent) {
    event.preventDefault();
    void act(() => supabase.from('answer_rules').insert({ organization_id: scope.orgId, hotel_id: groupWide ? null : scope.hotelId, rule: text.trim() })).then(() => setText(''));
  }

  return (
    <>
      <p className="admin-muted">
        Regeln bestimmen, wie geantwortet wird – nicht, was stimmt (Fakten gehören in die Quellen). Sie gelten für jede
        Antwort. Aus „Verbesserungswürdig“-Bewertungen entstehen sie automatisch.
      </p>
      {error ? <p className="admin-error">{error}</p> : null}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Regel</th>
            <th>Gilt für</th>
            <th>Seit</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <RuleRow key={rule.id} rule={rule} editable={editable(rule)} onAct={act} />
          ))}
          {!rules.length ? (
            <tr>
              <td colSpan={4} className="admin-muted">Noch keine Regeln.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      {scope.canEdit || scope.canManage ? (
        <form className="admin-form admin-form--wide" onSubmit={add}>
          <h3>Neue Regel</h3>
          <label>
            Regel
            <input value={text} onChange={(event) => setText(event.target.value)} required placeholder="z. B. Nenne bei Fragen zum Spa immer die Öffnungszeiten." />
          </label>
          {scope.hotelId ? (
            <label>
              Gilt für
              <select value={groupWide ? 'group' : 'hotel'} onChange={(event) => setGroupWide(event.target.value === 'group')}>
                <option value="hotel">nur {scope.hotelName}</option>
                <option value="group" disabled={!scope.canManage}>
                  ganze Gruppe{scope.canManage ? '' : ' – nur Inhaber/Admins'}
                </option>
              </select>
            </label>
          ) : null}
          <div className="admin-actions">
            <button type="submit" className="admin-btn">Hinzufügen</button>
          </div>
        </form>
      ) : null}
    </>
  );
}

function RuleRow({ rule, editable, onAct }: { rule: Rule; editable: boolean; onAct: (run: () => PromiseLike<{ error: { message: string } | null }>) => Promise<void> }) {
  const { scope } = useKnowledge();
  const [text, setText] = useState(rule.rule);
  return (
    <tr className={rule.enabled ? undefined : 'is-off'}>
      <td>
        {editable ? <input className="kn-inline-input" value={text} onChange={(event) => setText(event.target.value)} /> : rule.rule}
        {rule.feedback_id ? <span className="admin-muted"> · aus Bewertung</span> : null}
      </td>
      <td>{hotelName(scope, rule.hotel_id)}</td>
      <td>{formatDate(rule.created_at)}</td>
      <td className="kn-row-actions">
        {editable ? (
          <>
            {text !== rule.rule ? (
              <button type="button" className="kn-link" onClick={() => void onAct(() => supabase.from('answer_rules').update({ rule: text }).eq('id', rule.id))}>
                speichern
              </button>
            ) : null}
            <button type="button" className="kn-link" onClick={() => void onAct(() => supabase.from('answer_rules').update({ enabled: !rule.enabled }).eq('id', rule.id))}>
              {rule.enabled ? 'aus' : 'an'}
            </button>
            <button type="button" className="kn-link kn-danger" onClick={() => void onAct(() => supabase.from('answer_rules').delete().eq('id', rule.id))}>
              löschen
            </button>
          </>
        ) : null}
      </td>
    </tr>
  );
}
