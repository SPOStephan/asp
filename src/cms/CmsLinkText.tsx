import { useEffect, useMemo, useRef, useState } from 'react';
import { Link2, Link2Off, Sparkles } from 'lucide-react';
import { useHotel, useHotelContent } from '../context/HotelContext';
import { callAi } from '../lib/aiClient';
import { parseInline } from '../lib/inlineLinks';
import { cmsLinkTargets, type CmsLinkTarget } from './cmsLinkTargets';
import { suggestLinks } from './linkSuggest';

// The text of an element with its links back as stored text: "[Zimmer](/zimmer)".
// Also used when a text is edited directly on the page (CmsInlineEdit).
export function serializeLinked(root: Node): string {
  let out = '';
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? '';
    } else if (node instanceof HTMLElement) {
      const href = node.getAttribute('data-md-href') || (node.tagName === 'A' ? node.getAttribute('href') : null);
      if (href) out += `[${(node.textContent ?? '').replace(/[[\]]/g, '')}](${href})`;
      else if (node.tagName === 'BR') out += '\n';
      else out += (node.tagName === 'DIV' || node.tagName === 'P') && out ? `\n${serializeLinked(node)}` : serializeLinked(node);
    }
  });
  return out;
}

function renderInto(el: HTMLElement, value: string) {
  el.replaceChildren(
    ...parseInline(value).map((part) => {
      if (!('href' in part)) return document.createTextNode(part.text);
      const a = document.createElement('a');
      a.setAttribute('data-md-href', part.href);
      a.className = 'cms-linktext__link';
      a.title = part.href;
      a.textContent = part.text;
      return a;
    }),
  );
}

function sentenceAround(text: string, start: number, end: number) {
  const before = text.slice(0, start);
  const from = Math.max(before.lastIndexOf('. '), before.lastIndexOf('! '), before.lastIndexOf('? '));
  const after = text.slice(end).search(/[.!?](\s|$)/);
  return text.slice(from >= 0 ? from + 2 : 0, after >= 0 ? end + after + 1 : text.length).trim();
}

// A text field whose words or sentences can be linked: mark them, "Verlinken", pick the
// suggested page (instant suggestions, then the AI's choice) or paste an address.
// Stored as plain text with link marks (src/lib/inlineLinks.ts); the editor never sees them.
export function CmsLinkText({
  label,
  value,
  onChange,
  focus,
  path,
  onCaret,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  focus?: string;
  path?: string;
  // Where the cursor stands, counted in the stored text (for the "Weiterlesen" mark).
  onCaret?: (position: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hotel = useHotel();
  const { content } = useHotelContent();
  const targets = useMemo(() => cmsLinkTargets(content), [content]);
  const [range, setRange] = useState<Range | null>(null);
  const [inLink, setInLink] = useState<HTMLElement | null>(null);
  const [panel, setPanel] = useState<null | { text: string; context: string }>(null);
  const [address, setAddress] = useState('');
  const [ai, setAi] = useState<{ state: 'idle' | 'busy' | 'done' | 'off'; href?: string | null }>({ state: 'idle' });

  // Keep the field in step with the stored text, unless the change came from typing here.
  useEffect(() => {
    const el = ref.current;
    if (el && serializeLinked(el) !== value) renderInto(el, value);
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (el) onChange(serializeLinked(el));
  };

  const readSelection = () => {
    const el = ref.current;
    const selection = window.getSelection();
    if (!el || !selection || !selection.rangeCount) return;
    const current = selection.getRangeAt(0);
    if (!el.contains(current.commonAncestorContainer)) return;
    const node = current.startContainer instanceof HTMLElement ? current.startContainer : current.startContainer.parentElement;
    setInLink((node?.closest('[data-md-href]') as HTMLElement | null) ?? null);
    setRange(current.collapsed ? null : current.cloneRange());
    if (onCaret) {
      const before = document.createRange();
      before.setStart(el, 0);
      before.setEnd(current.startContainer, current.startOffset);
      const holder = document.createElement('div');
      holder.append(before.cloneContents());
      onCaret(serializeLinked(holder).length);
    }
  };

  const openPanel = () => {
    const el = ref.current;
    if (!range || !el) return;
    const text = range.toString().trim();
    if (!text) return;
    const plain = el.textContent ?? '';
    const pre = document.createRange();
    pre.setStart(el, 0);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    setPanel({ text, context: sentenceAround(plain, start, start + text.length) });
    setAddress('');
    setAi({ state: hotel ? 'busy' : 'off' });
    if (!hotel) return;
    callAi<{ href: string | null }>('suggest-link', {
      hotelId: hotel.id,
      text,
      context: sentenceAround(plain, start, start + text.length),
      pages: targets.filter((target) => target.active).map(({ href, label: name, group }) => ({ href, label: name, group })),
    })
      .then((result) => setAi({ state: 'done', href: result.href }))
      .catch(() => setAi({ state: 'off' }));
  };

  const apply = (href: string) => {
    const el = ref.current;
    const clean = href.trim();
    if (!el || !range || !clean) return;
    const a = document.createElement('a');
    a.setAttribute('data-md-href', clean);
    a.className = 'cms-linktext__link';
    a.title = clean;
    a.textContent = range.toString();
    range.deleteContents();
    range.insertNode(a);
    el.normalize();
    setPanel(null);
    setRange(null);
    emit();
  };

  const unlink = () => {
    if (!inLink) return;
    inLink.replaceWith(document.createTextNode(inLink.textContent ?? ''));
    ref.current?.normalize();
    setInLink(null);
    emit();
  };

  const quick = panel ? suggestLinks(panel.text, panel.context, targets) : [];
  const aiTarget = ai.href ? targets.find((target) => target.href === ai.href) : undefined;
  const choices: Array<{ target: CmsLinkTarget; byAi: boolean }> = [
    ...(aiTarget ? [{ target: aiTarget, byAi: true }] : []),
    ...quick.filter((target) => target.href !== aiTarget?.href).map((target) => ({ target, byAi: false })),
  ];

  return (
    <div className="cms-field cms-linktext" data-cms-panel-focus={focus ?? path}>
      <span>{label}</span>
      <div className="cms-linktext__bar">
        <button type="button" className="cms-btn cms-btn--ghost" disabled={!range} onMouseDown={(event) => event.preventDefault()} onClick={openPanel}>
          <Link2 size={14} strokeWidth={1.8} /> Verlinken
        </button>
        {inLink ? (
          <button type="button" className="cms-btn cms-btn--ghost" onMouseDown={(event) => event.preventDefault()} onClick={unlink}>
            <Link2Off size={14} strokeWidth={1.8} /> Link entfernen ({inLink.getAttribute('data-md-href')})
          </button>
        ) : (
          <span className="cms-muted">Wort oder Satz markieren, dann „Verlinken“.</span>
        )}
      </div>
      <div
        ref={ref}
        className="cms-linktext__input"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        onInput={emit}
        onKeyUp={readSelection}
        onMouseUp={readSelection}
        onPaste={(event) => {
          // Only plain text from outside; links are set with "Verlinken".
          event.preventDefault();
          document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
        }}
      />
      {panel ? (
        <div className="cms-linktext__panel">
          <p>
            Verlinken: <strong>„{panel.text}“</strong>
          </p>
          {choices.length ? (
            <ul>
              {choices.map(({ target, byAi }) => (
                <li key={target.href}>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => apply(target.href)}>
                    {byAi ? <Sparkles size={13} strokeWidth={1.8} aria-label="Vorschlag der KI" /> : null}
                    <span>{target.label}</span>
                    <small>
                      {target.group} · {target.href}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="cms-muted">
            {ai.state === 'busy' ? 'Die KI sucht die passende Seite …' : ai.state === 'done' && !ai.href ? 'Die KI hat keine passende Seite gefunden.' : null}
          </p>
          <label className="cms-field">
            Oder Adresse einfügen
            <input
              value={address}
              placeholder="/zimmer oder https://…"
              onChange={(event) => setAddress(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  apply(address);
                }
              }}
            />
          </label>
          <div className="cms-modal__actions">
            <button type="button" className="cms-btn" disabled={!address.trim()} onClick={() => apply(address)}>
              Übernehmen
            </button>
            <button type="button" className="cms-btn cms-btn--ghost" onClick={() => setPanel(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
