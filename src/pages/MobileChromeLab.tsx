import { useEffect, useRef, useState } from 'react';
import { CalendarCheck, CalendarDays, House, Menu, Phone, Users, X } from 'lucide-react';
import { ChatCircleTextIcon } from '@phosphor-icons/react';
import { useHotel, useSection } from '../context/HotelContext';
import { TextCta } from '../components/TextCta';
import './MobileChromeLab.css';

export const CHROME_LAB_VARIANTS = [
  { href: '/mobil-leiste', label: 'Variante 1' },
  { href: '/mobil-leiste2', label: 'Variante 2' },
  { href: '/mobil-leiste3', label: 'Variante 3' },
  { href: '/mobil-leiste4', label: 'Variante 4' },
];

export function ChromeLabSwitch({ current }: { current: string }) {
  return (
    <nav className="chrome-lab__switch" aria-label="Labor-Varianten">
      {CHROME_LAB_VARIANTS.map((item) => (
        <a key={item.href} href={item.href} className={item.href === current ? 'is-on' : ''}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

type Sheet = 'menu' | 'book' | 'chat' | null;

function telHref(phone?: string | null) {
  const cleaned = (phone || '+49 4863 7090').replace(/\(0\)/g, '').replace(/[^\d+]/g, '');
  return `tel:${cleaned || '+4948637090'}`;
}

export type ChromeLayout = 'bar' | 'icons-home' | 'icons' | 'stack';

export function ChromeDemo({
  fullscreen,
  onClose,
  layout = 'bar',
  chatFloat,
}: {
  fullscreen?: boolean;
  onClose?: () => void;
  layout?: ChromeLayout;
  chatFloat?: boolean;
}) {
  const dock = chatFloat ? 'icons-home' : layout;
  const data = useSection('navbar');
  const hotel = useHotel();
  const scroller = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);

  const toggle = (next: Sheet) => setSheet((current) => (current === next ? null : next));

  const onScroll = () => {
    const node = scroller.current;
    if (!node) return;
    const y = node.scrollTop;
    if (y < 24) setHidden(false);
    else if (y > lastY.current + 6) setHidden(true);
    else if (y < lastY.current - 6) setHidden(false);
    lastY.current = y;
  };

  return (
    <div
      className={`chrome-demo${fullscreen ? ' is-full' : ''}${dock !== 'bar' ? ' has-chat-fab' : ''} is-${dock}`}
      style={{ ['--demo-dock' as string]: hotel?.primary_color || 'var(--primary-500)' }}
    >
      <header className={`chrome-demo__top${hidden ? ' is-hidden' : ''}`}>
        {data?.logo_normal ? (
          <img src={data.logo_normal} alt={hotel?.name || 'ambassador'} />
        ) : (
          <strong>ambassador</strong>
        )}
        <span>DE</span>
      </header>

      <div className="chrome-demo__scroll" ref={scroller} onScroll={onScroll}>
        <div className="chrome-demo__hero">
          <img src="/collage-pool.webp" alt="" />
          <p>Auramaris Spa</p>
        </div>
        <article className="chrome-demo__copy">
          <p className="chrome-demo__kicker">Vorschlag · nur Labor</p>
          <h2>Mehr Bild, weniger Leiste</h2>
          <p>
            Oben verschwindet das Logo nach dem Scrollen. Unten eine schmale Leiste in
            Hotel-Blau: Start, Menü, Buchen, Chat. Die Farbe kommt vom Hotel — später im CMS
            also auch Rot oder Grün. Buchen öffnet die Verfügbarkeit erst auf Zuruf.
          </p>
          <p>
            Sprache und das lange Menü sitzen nicht mehr oben fest. Menü öffnet die zweistufige
            Navigation. Chat bleibt erreichbar, ohne über dem Inhalt zu schweben.
          </p>
          <img src="/teaser-suite.webp" alt="" />
          <p>
            Scrollen Sie hier im Rahmen nach unten: die Kopfzeile geht aus dem Weg. Nach oben
            scrollen holt sie zurück — falls jemand doch zum Logo will.
          </p>
          <img src="/spa-wellness.webp" alt="" />
          <p>
            Die feste Buchungsleiste und die hohe Kopfnavigation zusammen nehmen heute oft ein
            Drittel des Telefons. Diese Variante lässt den Inhalt die Fläche.
          </p>
        </article>
      </div>

      {sheet ? (
        <div className="chrome-demo__sheet">
          <div className="chrome-demo__sheet-head">
            <h3>
              {sheet === 'menu' ? 'Menü' : sheet === 'book' ? 'Verfügbarkeit' : 'Chat'}
            </h3>
            <button type="button" onClick={() => setSheet(null)} aria-label="Schließen">
              <X size={18} strokeWidth={1.6} />
            </button>
          </div>
          {sheet === 'book' ? (
            <form
              className="chrome-demo__book"
              onSubmit={(event) => {
                event.preventDefault();
                setSheet(null);
              }}
            >
              <label>
                Gästezahl
                <input defaultValue="2 Erwachsene" readOnly />
              </label>
              <label>
                Anreise
                <input defaultValue="Datum wählen" readOnly />
              </label>
              <label>
                Abreise
                <input defaultValue="Datum wählen" readOnly />
              </label>
              <button type="submit">Verfügbarkeit prüfen</button>
            </form>
          ) : (
            <p className="chrome-demo__sheet-text">
              {sheet === 'menu'
                ? 'Hier öffnet später das zweistufige Mobilmenü — ohne zweite Leiste oben.'
                : 'Der Assistent, bisher als schwebendes Icon über der Buchungsleiste.'}
            </p>
          )}
        </div>
      ) : null}

      <nav className="chrome-demo__dock" aria-label="App-Leiste">
        {dock === 'stack' ? (
          <>
            <button
              type="button"
              className={`chrome-demo__icon-only${sheet === 'menu' ? ' is-on' : ''}`}
              aria-label="Menü"
              onClick={() => toggle('menu')}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
            <a className="chrome-demo__icon-only" href={telHref(hotel?.phone)} aria-label="Hotel anrufen">
              <Phone size={20} strokeWidth={1.5} />
            </a>
            <button
              type="button"
              className={`chrome-demo__book-group${sheet === 'book' ? ' is-on' : ''}`}
              aria-label="Gäste"
              onClick={() => toggle('book')}
            >
              <Users size={20} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className={`chrome-demo__book-group${sheet === 'book' ? ' is-on' : ''}`}
              aria-label="Reisezeitraum"
              onClick={() => toggle('book')}
            >
              <CalendarDays size={20} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className={`chrome-demo__book-word chrome-demo__book-group${sheet === 'book' ? ' is-on' : ''}`}
              onClick={() => toggle('book')}
            >
              Buchen
            </button>
          </>
        ) : dock === 'icons' || dock === 'icons-home' ? (
          <>
            {dock === 'icons-home' ? (
              <button
                type="button"
                className="chrome-demo__icon-only"
                aria-label="Start"
                onClick={() => scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <House size={24} strokeWidth={1.5} />
              </button>
            ) : null}
            <button
              type="button"
              className={`chrome-demo__icon-only${sheet === 'menu' ? ' is-on' : ''}`}
              aria-label="Menü"
              onClick={() => toggle('menu')}
            >
              <Menu size={26} strokeWidth={1.5} />
            </button>
            <a className="chrome-demo__icon-only" href={telHref(hotel?.phone)} aria-label="Hotel anrufen">
              <Phone size={24} strokeWidth={1.5} />
            </a>
            <button
              type="button"
              className={`chrome-demo__book-word${sheet === 'book' ? ' is-on' : ''}`}
              onClick={() => toggle('book')}
            >
              Buchen
            </button>
          </>
        ) : (
          <>
            <button type="button" className="is-active" onClick={() => scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })}>
              <House size={22} strokeWidth={1.5} />
              <span>Start</span>
            </button>
            <button type="button" className={sheet === 'menu' ? 'is-on' : ''} onClick={() => toggle('menu')}>
              <Menu size={22} strokeWidth={1.5} />
              <span>Menü</span>
            </button>
            <button type="button" className="chrome-demo__book-btn" onClick={() => toggle('book')}>
              <CalendarCheck size={22} strokeWidth={1.6} />
              <span>Buchen</span>
            </button>
            <button type="button" className={sheet === 'chat' ? 'is-on' : ''} onClick={() => toggle('chat')}>
              <ChatCircleTextIcon size={24} weight="thin" />
              <span>Chat</span>
            </button>
          </>
        )}
      </nav>

      {dock !== 'bar' ? (
        <button
          type="button"
          className={`chrome-demo__chat-fab${sheet === 'chat' ? ' is-on' : ''}`}
          onClick={() => toggle('chat')}
          aria-label="Chat"
        >
          <ChatCircleTextIcon size={28} weight="thin" />
        </button>
      ) : null}

      {fullscreen && onClose ? (
        <button type="button" className="chrome-demo__leave" onClick={onClose}>
          Labor schließen
        </button>
      ) : null}
    </div>
  );
}

export function MobileChromeLab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Mobil Leiste · ambassador hotel & spa';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
      robots.remove();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('chrome-lab-open', open);
    return () => document.body.classList.remove('chrome-lab-open');
  }, [open]);

  return (
    <main className="chrome-lab">
      <header className="chrome-lab__hero">
        <div className="container">
          <p className="chrome-lab__kicker">Nur zum Anschauen · keine globale Änderung</p>
          <h1>Leisten mobil</h1>
          <p className="chrome-lab__lead">
            Oben und unten zugleich fest stehend frisst zu viel Fläche. Vorschlag: das Logo
            nach dem Scrollen ausblenden. Alles Wichtige wandert in eine schmale App-Leiste
            unten — Buchen öffnet die Verfügbarkeit erst auf Zuruf.
          </p>
          <ChromeLabSwitch current="/mobil-leiste" />
        </div>
      </header>

      <section className="chrome-lab__compare">
        <div className="chrome-lab__grid">
          <article className="chrome-lab__card">
            <p className="chrome-lab__card-kicker">Heute</p>
            <h2>Zwei feste Bänder</h2>
            <p>
              Kopf mit Logo und Menü bleibt. Auf Unterseiten klebt darunter die ganze
              Verfügbarkeitsleiste, dazu der Chat. Am Telefon bleibt oft nur ein Streifen
              Inhalt.
            </p>
          </article>
          <article className="chrome-lab__card">
            <p className="chrome-lab__card-kicker">Vorschlag</p>
            <h2>Eine Leiste unten</h2>
            <p>
              Start · Menü · Buchen · Chat, in Hotel-Blau. Anfragen entfällt. Kopfzeile nur
              am Anfang, dann weg. Am Desktop im Rahmen, am Telefon über den Button.
            </p>
            <TextCta onClick={() => setOpen(true)}>Variante öffnen</TextCta>
          </article>
        </div>

        <div className="chrome-lab__stage" aria-hidden={open}>
          <div className="chrome-lab__phone">
            <ChromeDemo />
          </div>
        </div>
      </section>

      {open ? (
        <div className="chrome-lab__overlay" role="dialog" aria-modal="true" aria-label="App-Leiste">
          <ChromeDemo fullscreen onClose={() => setOpen(false)} />
        </div>
      ) : null}
    </main>
  );
}
