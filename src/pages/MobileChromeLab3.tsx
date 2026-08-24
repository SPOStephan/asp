import { useEffect, useState } from 'react';
import { TextCta } from '../components/TextCta';
import { ChromeDemo, ChromeLabSwitch } from './MobileChromeLab';
import './MobileChromeLab.css';

export function MobileChromeLab3() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Mobil Leiste 3 · ambassador hotel & spa';
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
          <p className="chrome-lab__kicker">Nur zum Anschauen · Variante 3</p>
          <h1>Leisten mobil</h1>
          <p className="chrome-lab__lead">
            Wie Variante 2, ohne Home: nur Menü und Telefon links, BUCHEN rechts. Der
            goldene Chat sitzt wieder etwas tiefer auf der Leiste.
          </p>
          <ChromeLabSwitch current="/mobil-leiste3" />
        </div>
      </header>

      <section className="chrome-lab__compare">
        <div className="chrome-lab__grid">
          <article className="chrome-lab__card">
            <p className="chrome-lab__card-kicker">Variante 2</p>
            <h2>Mit Home</h2>
            <p>Drei Symbole links. Zum direkten Vergleich unter Variante 2.</p>
          </article>
          <article className="chrome-lab__card">
            <p className="chrome-lab__card-kicker">Variante 3</p>
            <h2>Ohne Home</h2>
            <p>Menü und Hörer links, BUCHEN rechts. Chat-Kreis ein Stück tiefer.</p>
            <TextCta onClick={() => setOpen(true)}>Variante öffnen</TextCta>
          </article>
        </div>

        <div className="chrome-lab__stage" aria-hidden={open}>
          <div className="chrome-lab__phone">
            <ChromeDemo layout="icons" />
          </div>
        </div>
      </section>

      {open ? (
        <div className="chrome-lab__overlay" role="dialog" aria-modal="true" aria-label="App-Leiste Variante 3">
          <ChromeDemo layout="icons" fullscreen onClose={() => setOpen(false)} />
        </div>
      ) : null}
    </main>
  );
}
