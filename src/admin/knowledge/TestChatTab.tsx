import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { callAi } from '../../lib/aiClient';
import { KIND_LABEL, stripGapMarker, type ChatTurn, type Rating, type SourceRef } from '../../lib/knowledge';
import { supabase } from '../../lib/supabase';
import { formatCost, hotelName, useKnowledge } from './knowledgeScope';
import { useModels } from './SettingsTab';

export type Answer = {
  id: string | null;
  answer: string;
  gap: boolean;
  sources: SourceRef[];
  model: string;
  cost: number | null;
  searchTerms?: string;
  error?: string;
  streaming?: boolean;
  rated?: Rating;
};

type Turn = { question: string; answers: Answer[] };

export function TestChatTab() {
  const { scope } = useKnowledge();
  const { models, defaults } = useModels();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState('');
  const [modelA, setModelA] = useState('');
  const [modelB, setModelB] = useState('');
  const [compare, setCompare] = useState(false);
  const [busy, setBusy] = useState(false);
  const conversation = useRef(crypto.randomUUID());
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns]);

  function patch(turnIndex: number, answerIndex: number, fields: Partial<Answer>) {
    setTurns((current) =>
      current.map((turn, index) =>
        index !== turnIndex ? turn : { ...turn, answers: turn.answers.map((answer, inner) => (inner === answerIndex ? { ...answer, ...fields } : answer)) },
      ),
    );
  }

  async function ask(event: FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (!text || !scope.hotelId) return;
    // The conversation so far, as model A answered it.
    const history: ChatTurn[] = turns.flatMap((turn) => [
      { role: 'user' as const, content: turn.question },
      { role: 'assistant' as const, content: turn.answers[0]?.answer ?? '' },
    ]);
    const runs = compare ? [modelA, modelB || modelA] : [modelA];
    const turnIndex = turns.length;
    setTurns((current) => [...current, { question: text, answers: runs.map((model) => ({ id: null, answer: '', gap: false, sources: [], model: model || 'Standard', cost: null, streaming: true })) }]);
    setQuestion('');
    setBusy(true);
    await Promise.all(
      runs.map(async (model, answerIndex) => {
        let streamed = '';
        try {
          const result = await callAi<Answer>(
            'chat',
            { hotelId: scope.hotelId, question: text, history, conversationId: conversation.current, model: model || undefined },
            (delta) => {
              streamed += delta;
              patch(turnIndex, answerIndex, { answer: stripGapMarker(streamed) });
            },
          );
          patch(turnIndex, answerIndex, { ...result, streaming: false });
        } catch (err) {
          patch(turnIndex, answerIndex, { streaming: false, error: err instanceof Error ? err.message : String(err) });
        }
      }),
    );
    setBusy(false);
  }

  function reset() {
    conversation.current = crypto.randomUUID();
    setTurns([]);
  }

  const modelOptions = (
    <>
      <option value="">Standard{defaults.chat ? ` (${defaults.chat})` : ''}</option>
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
          {model.inputPrice !== undefined ? ` · ${model.inputPrice.toFixed(2)}/${model.outputPrice?.toFixed(2)} $ je Mio. Tokens` : ''}
        </option>
      ))}
    </>
  );

  return (
    <div className="kn-chat">
      <div className="kn-chat-tools">
        <label>
          Modell
          <select value={modelA} onChange={(event) => setModelA(event.target.value)}>
            {modelOptions}
          </select>
        </label>
        <label className="admin-choice">
          <input type="checkbox" checked={compare} onChange={(event) => setCompare(event.target.checked)} />
          Vergleichen mit
        </label>
        {compare ? (
          <select value={modelB} onChange={(event) => setModelB(event.target.value)}>
            {modelOptions}
          </select>
        ) : null}
        <button type="button" className="admin-btn admin-btn--ghost" onClick={reset} disabled={busy}>
          Neues Gespräch
        </button>
      </div>
      <p className="admin-muted">
        Fragen Sie wie ein Gast. Jede Antwort bewerten: Gute Antworten werden Vorbild, Hinweise werden Antwortregeln,
        falsche Aussagen werden als Red Flag sofort korrigiert und als Prüffrage gespeichert.
      </p>
      <div className="kn-turns">
        {turns.map((turn, turnIndex) => (
          <Fragment key={turnIndex}>
            <div className="kn-question">{turn.question}</div>
            <div className={turn.answers.length > 1 ? 'kn-compare' : undefined}>
              {turn.answers.map((answer, answerIndex) => (
                <AnswerCard
                  key={answerIndex}
                  question={turn.question}
                  answer={answer}
                  onRated={(rating) => patch(turnIndex, answerIndex, { rated: rating })}
                />
              ))}
            </div>
          </Fragment>
        ))}
        <div ref={end} />
      </div>
      <form className="kn-ask" onSubmit={(event) => void ask(event)}>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={`Frage an den Concierge von ${scope.hotelName}…`} disabled={busy} />
        <button type="submit" className="admin-btn" disabled={busy || !question.trim()}>
          {busy ? 'Antwortet…' : 'Fragen'}
        </button>
      </form>
    </div>
  );
}

// "[2]" -> a small reference that names the source on hover.
function AnswerText({ text, sources }: { text: string; sources: SourceRef[] }) {
  const parts = text.split(/(\[\d+(?:\s*,\s*\d+)*\])/g);
  return (
    <div className="kn-answer-text">
      {parts.map((part, index) => {
        const match = part.match(/^\[(\d+(?:\s*,\s*\d+)*)\]$/);
        if (!match) return <Fragment key={index}>{part}</Fragment>;
        return (
          <sup key={index} className="kn-cite">
            {match[1].split(',').map((value) => {
              const source = sources.find((item) => item.n === Number(value.trim()));
              return (
                <span key={value} title={source ? `${source.title}${source.heading ? ` – ${source.heading}` : ''}` : 'unbekannte Quelle'}>
                  [{value.trim()}]
                </span>
              );
            })}
          </sup>
        );
      })}
    </div>
  );
}

const RATING_LABEL: Record<Rating, string> = { good: '👍 Gut', improve: '👎 Verbesserungswürdig', wrong: '🚩 Falsch' };

export function AnswerCard({ question, answer, onRated }: { question: string; answer: Answer; onRated: (rating: Rating) => void }) {
  const { scope } = useKnowledge();
  const [form, setForm] = useState<Rating | null>(null);
  const [showSources, setShowSources] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const cited = answer.sources.filter((source) => source.cited);

  // Selecting the wrong sentence in the answer before clicking "Falsch" fills it in.
  const [selection, setSelection] = useState('');
  function openForm(rating: Rating) {
    const selected = window.getSelection()?.toString().trim() ?? '';
    setSelection(selected && textRef.current?.textContent?.includes(selected) ? selected : '');
    setForm(form === rating ? null : rating);
  }

  return (
    <article className={`kn-answer${answer.rated === 'wrong' ? ' is-red' : ''}`}>
      <header>
        <span>{answer.model}</span>
        <span>
          {answer.gap ? <span className="kn-flag">Wissenslücke</span> : null}
          {answer.cost !== null ? ` ${formatCost(answer.cost)}` : ''}
        </span>
      </header>
      {answer.error ? <p className="admin-error">{answer.error}</p> : null}
      <div ref={textRef}>
        <AnswerText text={answer.answer || (answer.streaming ? '…' : '')} sources={answer.sources} />
      </div>
      {!answer.streaming && answer.sources.length ? (
        <div className="kn-sources-used">
          <button type="button" className="kn-link" onClick={() => setShowSources(!showSources)}>
            {cited.length} von {answer.sources.length} Quellen zitiert {showSources ? '▲' : '▼'}
          </button>
          {showSources ? (
            <ol>
              {answer.sources.map((source) => (
                <li key={source.n} value={source.n} className={source.cited ? 'is-cited' : undefined}>
                  {source.title}
                  {source.heading && source.heading !== source.title ? ` – ${source.heading}` : ''}{' '}
                  <span className="admin-muted">
                    ({KIND_LABEL[source.kind]}, {hotelName(scope, source.hotel_id)})
                  </span>{' '}
                  {source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">öffnen</a> : null}
                </li>
              ))}
            </ol>
          ) : null}
          {answer.searchTerms ? <p className="admin-muted">Gesucht nach: {answer.searchTerms}</p> : null}
        </div>
      ) : null}
      {answer.id && !answer.streaming ? (
        answer.rated ? (
          <p className="kn-rated">Bewertet: {RATING_LABEL[answer.rated]}</p>
        ) : (
          <div className="kn-rate">
            {(Object.keys(RATING_LABEL) as Rating[]).map((rating) => (
              <button
                key={rating}
                type="button"
                className={`kn-rate-${rating}${form === rating ? ' is-on' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openForm(rating)}
              >
                {RATING_LABEL[rating]}
              </button>
            ))}
          </div>
        )
      ) : null}
      {form && answer.id && !answer.rated ? (
        <RatingForm
          rating={form}
          messageId={answer.id}
          question={question}
          initialWrong={selection}
          onDone={() => {
            onRated(form);
            setForm(null);
          }}
        />
      ) : null}
    </article>
  );
}

function RatingForm({ rating, messageId, question, initialWrong, onDone }: { rating: Rating; messageId: string; question: string; initialWrong: string; onDone: () => void }) {
  const { scope, changed } = useKnowledge();
  const [comment, setComment] = useState('');
  const [asRule, setAsRule] = useState(true);
  const [rule, setRule] = useState('');
  const [wrong, setWrong] = useState(initialWrong);
  const [correct, setCorrect] = useState('');
  const [groupWide, setGroupWide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: rateError } = await supabase.rpc('rate_answer', {
      p_message: messageId,
      p_rating: rating,
      p_comment: comment || null,
      p_wrong: wrong || null,
      p_correct: correct || null,
      p_group_wide: groupWide,
      p_rule: rating === 'improve' && asRule ? rule || comment : null,
    });
    setBusy(false);
    if (rateError) {
      setError(rateError.message);
      return;
    }
    changed();
    onDone();
  }

  const scopeSelect = (
    <label>
      Gilt für
      <select value={groupWide ? 'group' : 'hotel'} onChange={(event) => setGroupWide(event.target.value === 'group')}>
        <option value="hotel">nur {scope.hotelName}</option>
        <option value="group" disabled={!scope.canManage}>
          ganze Gruppe{scope.canManage ? '' : ' – nur Inhaber/Admins'}
        </option>
      </select>
    </label>
  );

  return (
    <form className={`admin-form kn-rating kn-rating--${rating}`} onSubmit={(event) => void submit(event)}>
      {rating === 'good' ? (
        <>
          <p>Die Antwort wird als Vorbild für ähnliche Fragen gespeichert.</p>
          {scopeSelect}
          <label>
            Anmerkung (optional)
            <input value={comment} onChange={(event) => setComment(event.target.value)} />
          </label>
        </>
      ) : null}
      {rating === 'improve' ? (
        <>
          <label>
            Was hätte besser sein sollen? *
            <textarea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} required placeholder="z. B. zu lang; Telefonnummer fehlt; bitte Spa-Öffnungszeiten immer nennen" />
          </label>
          <label className="admin-choice">
            <input type="checkbox" checked={asRule} onChange={(event) => setAsRule(event.target.checked)} />
            Als Regel für alle künftigen Antworten übernehmen
          </label>
          {asRule ? (
            <>
              <label>
                Regel (so formulieren, dass sie allgemein gilt)
                <input value={rule} onChange={(event) => setRule(event.target.value)} placeholder={comment || 'z. B. Nenne bei Spa-Fragen immer die Öffnungszeiten.'} />
              </label>
              {scopeSelect}
            </>
          ) : null}
        </>
      ) : null}
      {rating === 'wrong' ? (
        <>
          <p>
            <strong>Red Flag:</strong> Die richtige Aussage gilt sofort mit Vorrang vor allen Quellen. Die zitierten Quellen
            werden zum Prüfen markiert, und „{question}“ wird künftig nach jeder Änderung erneut gefragt.
          </p>
          <label>
            Falsche Aussage (Tipp: in der Antwort markieren, dann auf „Falsch“ klicken)
            <textarea rows={2} value={wrong} onChange={(event) => setWrong(event.target.value)} />
          </label>
          <label>
            Richtige Aussage *
            <textarea rows={3} value={correct} onChange={(event) => setCorrect(event.target.value)} required placeholder="z. B. Hunde kosten 25 € pro Nacht, höchstens zwei pro Zimmer." />
          </label>
          {scopeSelect}
        </>
      ) : null}
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-actions">
        <button type="submit" className={`admin-btn${rating === 'wrong' ? ' kn-btn-red' : ''}`} disabled={busy}>
          {rating === 'wrong' ? 'Red Flag setzen' : 'Bewerten'}
        </button>
      </div>
    </form>
  );
}
