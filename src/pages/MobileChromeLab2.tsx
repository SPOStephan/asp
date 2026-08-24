import { useEffect, useState } from 'react';
import { TextCta } from '../components/TextCta';
import { ChromeDemo } from './MobileChromeLab';
import './MobileChromeLab.css';

export function MobileChromeLab2() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Mobil Leiste 2 · ambassador hotel & spa';
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
          <p className="chrome-lab__kicker">Nur zum Anschauen · Variante 2</p>
          <h1>Leisten mobil</h1>
          <p className="chrome-lab__lead">
            Schlankere Leiste: Menü ohne Text, Telefon zur Hotelnummer, großes BUCHEN.
            Chat als goldener Kreis, der ein Stück auf dem Blau sitzt. Kein Start.
          </p>
        </div>
      </header>

      <section className="chrome-lab__compare">
        <div className="chrome-lab__grid">
          <article className="chrome-lab__card">
            <p className="chrome-lab__card-kicker">Variante 1</p>
            <h2>Chat in der Leiste</h2>
            <p>
              Start, Menü, Buchen und Chat sitzen nebeneinander in der blauen Leiste.
              Vergleich unter /mobil-leiste.
            </p>
          </article>
          <article className="chrome-lab__card">
            <p className="chrome-lab__card-kicker">Variante 2</p>
            <h2>Chat als Goldkreis</h2>
            <p>
              Drei gleich hohe Felder: Menü, BUCHEN, Telefon. Keine tote Fläche.
              Der Goldkreis bleibt rechts auf der Kante der Leiste.
            </p>
            <TextCta onClick={() => setOpen(true)}>Variante öffnen</TextCta>
          </article>
        </div>

        <div className="chrome-lab__stage" aria-hidden={open}>
          <div className="chrome-lab__phone">
            <ChromeDemo chatFloat />
          </div>
        </div>
      </section>

      {open ? (
        <div className="chrome-lab__overlay" role="dialog" aria-modal="true" aria-label="App-Leiste Variante 2">
          <ChromeDemo chatFloat fullscreen onClose={() => setOpen(false)} />
        </div>
      ) : null}
    </main>
  );
}
