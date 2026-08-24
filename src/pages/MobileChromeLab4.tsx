import { useEffect, useState } from 'react';
import { TextCta } from '../components/TextCta';
import { ChromeDemo, ChromeLabSwitch } from './MobileChromeLab';
import './MobileChromeLab.css';

export function MobileChromeLab4() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Mobil Leiste 4 · ambassador hotel & spa';
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
          <p className="chrome-lab__kicker">Nur zum Anschauen · Variante 4</p>
          <h1>Leisten mobil</h1>
          <p className="chrome-lab__lead">
            Eine Zeile: Menü und Hörer klein links, Gäste, Kalender und Buchen auf Gold
            mit weißer Schrift. Der Chat-Kreis ist blau.
          </p>
          <ChromeLabSwitch current="/mobil-leiste4" />
        </div>
      </header>

      <section className="chrome-lab__compare">
        <div className="chrome-lab__grid">
          <article className="chrome-lab__card">
            <p className="chrome-lab__card-kicker">Links</p>
            <h2>Menü und Hörer</h2>
            <p>Klein, weiß, zusammengehalten — nicht die Buchung.</p>
          </article>
          <article className="chrome-lab__card">
            <p className="chrome-lab__card-kicker">Rechts</p>
            <h2>Die Buchung</h2>
            <p>Goldene Fläche, Icons und Buchen weiß. Chat-Kreis dafür in Hotel-Blau.</p>
            <TextCta onClick={() => setOpen(true)}>Variante öffnen</TextCta>
          </article>
        </div>

        <div className="chrome-lab__stage" aria-hidden={open}>
          <div className="chrome-lab__phone">
            <ChromeDemo layout="stack" />
          </div>
        </div>
      </section>

      {open ? (
        <div className="chrome-lab__overlay" role="dialog" aria-modal="true" aria-label="App-Leiste Variante 4">
          <ChromeDemo layout="stack" fullscreen onClose={() => setOpen(false)} />
        </div>
      ) : null}
    </main>
  );
}
