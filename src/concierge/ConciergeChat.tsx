import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { answerParts } from '../lib/concierge';
import { useConcierge, type GuestMessage } from './ConciergeContext';
import './concierge.css';

function AnswerLine({ line }: { line: string }) {
  return (
    <>
      {answerParts(line).map((part, index) => {
        if (part.type === 'bold') return <strong key={index}>{part.text}</strong>;
        if (part.type === 'link') {
          const own = part.href.startsWith('/') || part.href.startsWith(window.location.origin);
          return (
            <a key={index} href={part.href} {...(own ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
              {part.text}
            </a>
          );
        }
        return <Fragment key={index}>{part.text}</Fragment>;
      })}
    </>
  );
}

// Paragraphs and simple lists, no HTML from the model.
function AnswerText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split('\n').filter((line) => line.trim());
        if (lines.length && lines.every((line) => /^\s*([-*•]|\d+\.)\s+/.test(line))) {
          return (
            <ul key={index}>
              {lines.map((line, inner) => (
                <li key={inner}>
                  <AnswerLine line={line.replace(/^\s*([-*•]|\d+\.)\s+/, '')} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            {lines.map((line, inner) => (
              <Fragment key={inner}>
                {inner ? <br /> : null}
                <AnswerLine line={line} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

function Message({ message }: { message: GuestMessage }) {
  if (message.role === 'user') return <div className="concierge__msg concierge__msg--guest">{message.content}</div>;
  return (
    <div className={`concierge__msg concierge__msg--bot${message.error ? ' is-error' : ''}`}>
      {message.content ? <AnswerText text={message.content} /> : <span className="concierge__typing" aria-label="schreibt"><i /><i /><i /></span>}
      {message.links?.length ? (
        <div className="concierge__links">
          {message.links.map((link) => (
            <a key={link.url} href={link.url}>
              {link.title}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// The chat itself: in the desktop panel and in the sheet of the mobile bar.
export function ConciergeChat({ onClose }: { onClose?: () => void }) {
  const hotel = useHotel();
  const { config, messages, busy, ask, reset } = useConcierge();
  const [question, setQuestion] = useState('');
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) input.current?.focus();
  }, []);

  function send(event?: FormEvent) {
    event?.preventDefault();
    if (!question.trim()) return;
    void ask(question);
    setQuestion('');
  }

  const mail = hotel?.email ? `mailto:${hotel.email}` : null;
  const phone = hotel?.phone ? `tel:${hotel.phone.replace(/\s/g, '')}` : null;

  if (!config.enabled) {
    return (
      <div className="concierge concierge--off">
        <header className="concierge__head">
          <strong>Schreiben Sie uns</strong>
          {onClose ? (
            <button type="button" className="concierge__close" aria-label="Schließen" onClick={onClose}>
              <X size={20} strokeWidth={1.5} />
            </button>
          ) : null}
        </header>
        <p>Wir sind gern für Sie da.</p>
        <div className="concierge__contact">
          {mail ? <a href={mail}>E-Mail an das Hotel</a> : null}
          {phone ? <a href={phone}>Anrufen</a> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="concierge">
      <header className="concierge__head">
        <div>
          <strong>{config.name}</strong>
          <span>{hotel?.name}</span>
        </div>
        {messages.length ? (
          <button type="button" className="concierge__new" onClick={reset} disabled={busy}>
            Neu
          </button>
        ) : null}
        {onClose ? (
          <button type="button" className="concierge__close" aria-label="Chat schließen" onClick={onClose}>
            <X size={20} strokeWidth={1.5} />
          </button>
        ) : null}
      </header>
      <div className="concierge__list" ref={list} aria-live="polite">
        <div className="concierge__msg concierge__msg--bot">
          <p>{config.greeting}</p>
        </div>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        {!messages.length && config.suggestions.length ? (
          <div className="concierge__suggestions">
            {config.suggestions.map((item) => (
              <button key={item} type="button" onClick={() => void ask(item)}>
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <form className="concierge__ask" onSubmit={send}>
        <textarea
          ref={input}
          rows={1}
          value={question}
          maxLength={1000}
          placeholder="Ihre Frage…"
          aria-label="Ihre Frage"
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) send(event);
          }}
        />
        <button type="submit" aria-label="Senden" disabled={busy || !question.trim()}>
          <ArrowUp size={20} strokeWidth={1.8} />
        </button>
      </form>
      <p className="concierge__note">
        KI-Assistent – Antworten können Fehler enthalten. Bitte keine persönlichen Daten eingeben.
{' '}
        <a href="/datenschutz">Datenschutz</a>
      </p>
    </div>
  );
}
