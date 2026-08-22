import { useEffect, useState } from 'react';
import './TypePreviewHome.css';

const FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2' +
  '?family=Alex+Brush' +
  '&family=Allura' +
  '&family=Caveat:wght@400;500' +
  '&family=Corinthia' +
  '&family=Dancing+Script:wght@400;500' +
  '&family=Great+Vibes' +
  '&family=Gwendolyn' +
  '&family=Inspiration' +
  '&family=Italianno' +
  '&family=Lovers+Quarrel' +
  '&family=MonteCarlo' +
  '&family=Mr+Dafoe' +
  '&family=Mrs+Saint+Delafield' +
  '&family=Ms+Madi' +
  '&family=Newsreader:opsz,wght@6..72,300..700' +
  '&family=Oooh+Baby' +
  '&family=Pinyon+Script' +
  '&family=Sacramento' +
  '&family=WindSong' +
  '&display=swap';

const PREVIEW_SCRIPTS = [
  { id: 'dafoe', name: 'Mr Dafoe', stack: '"Mr Dafoe", cursive', note: 'Aktueller Favorit, nur ein Schnitt, eher fett' },
  { id: 'alex-brush', name: 'Alex Brush', stack: '"Alex Brush", cursive', note: 'Nächster Verwandter, feinerer Strich' },
  { id: 'great-vibes', name: 'Great Vibes', stack: '"Great Vibes", cursive', note: 'Leichter, gleichmäßiger, weniger Pinsel' },
  { id: 'pinyon', name: 'Pinyon Script', stack: '"Pinyon Script", cursive', note: 'Elegant und schmaler' },
  { id: 'sacramento', name: 'Sacramento', stack: '"Sacramento", cursive', note: 'Monoline, sehr dünn, handschriftlich' },
  { id: 'italianno', name: 'Italianno', stack: '"Italianno", cursive', note: 'Fein und fließend' },
  { id: 'corinthia', name: 'Corinthia', stack: '"Corinthia", cursive', note: 'Zarte Kalligrafie' },
  { id: 'windsong', name: 'WindSong', stack: '"WindSong", cursive', note: 'Luftige Handschrift' },
  { id: 'montecarlo', name: 'MonteCarlo', stack: '"MonteCarlo", cursive', note: 'Leicht, etwas verspielter' },
  { id: 'gwendolyn', name: 'Gwendolyn', stack: '"Gwendolyn", cursive', note: 'Dünne Schreibschrift' },
  { id: 'delafield', name: 'Mrs Saint Delafield', stack: '"Mrs Saint Delafield", cursive', note: 'Sehr fein, signaturhaft' },
  { id: 'lovers', name: 'Lovers Quarrel', stack: '"Lovers Quarrel", cursive', note: 'Leicht und unregelmäßig' },
  { id: 'dancing', name: 'Dancing Script', stack: '"Dancing Script", cursive', note: 'Eher Handschrift als Pinsel' },
  { id: 'caveat', name: 'Caveat', stack: '"Caveat", cursive', note: 'Natürliche Notiz-Handschrift' },
  { id: 'oooh-baby', name: 'Oooh Baby', stack: '"Oooh Baby", cursive', note: 'Leichte moderne Handschrift' },
  { id: 'ms-madi', name: 'Ms Madi', stack: '"Ms Madi", cursive', note: 'Monoline, nah am Beispielbild' },
  { id: 'inspiration', name: 'Inspiration', stack: '"Inspiration", cursive', note: 'Fein, eher Marker' },
  { id: 'allura', name: 'Allura', stack: '"Allura", cursive', note: 'Vorher live' },
];

export function TypePreviewHomeNote() {
  const [scriptId, setScriptId] = useState('alex-brush');
  const script = PREVIEW_SCRIPTS.find((item) => item.id === scriptId) ?? PREVIEW_SCRIPTS[0];

  useEffect(() => {
    const link = document.createElement('link');
    link.id = 'type-preview-fonts';
    link.rel = 'stylesheet';
    link.href = FONT_STYLESHEET;
    document.head.appendChild(link);

    const previousTitle = document.title;
    document.title = `Schriftvorschau · Newsreader + ${script.name}`;

    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);

    return () => {
      link.remove();
      robots.remove();
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    const root = document.querySelector('.type-preview');
    if (root instanceof HTMLElement) {
      root.style.setProperty('--font-script', script.stack);
    }
    document.title = `Schriftvorschau · Newsreader + ${script.name}`;
  }, [script]);

  return (
    <aside className="type-preview__panel" aria-label="Schriftvorschau">
      <p className="type-preview__kicker">Nur Vorschau · Newsreader bleibt</p>
      <p className="type-preview__lead">
        Mr Dafoe gibt es nicht schmaler — nur einen Schnitt. Hier leichtere,
        handschriftlichere Alternativen im echten Layout.
      </p>
      <div className="type-preview__scripts">
        {PREVIEW_SCRIPTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`type-preview__script${scriptId === item.id ? ' is-active' : ''}`}
            onClick={() => setScriptId(item.id)}
          >
            <em style={{ fontFamily: item.stack }}>Meer</em>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <p className="type-preview__now">{script.name} — {script.note}</p>
      <p className="type-preview__links">
        <a href="/schriften">Labor</a>
        {' · '}
        <a href="/">Original</a>
      </p>
    </aside>
  );
}
