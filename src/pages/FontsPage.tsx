import { useEffect, useState, type CSSProperties } from 'react';
import './FontsPage.css';

const FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2' +
  '?family=Birthstone' +
  '&family=Bodoni+Moda:opsz,wght@6..96,600;6..96,700' +
  '&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700' +
  '&family=DM+Serif+Display' +
  '&family=Ephesis' +
  '&family=Fraunces:opsz,wght@9..144,600;9..144,700' +
  '&family=Imperial+Script' +
  '&family=Instrument+Serif' +
  '&family=Kaushan+Script' +
  '&family=Mea+Culpa' +
  '&family=Mr+Dafoe' +
  '&family=Newsreader:opsz,wght@6..72,600;6..72,700' +
  '&family=Playfair+Display:wght@600;700' +
  '&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700' +
  '&family=Style+Script' +
  '&family=The+Nautigal' +
  '&display=swap';

interface Typeface {
  id: string;
  name: string;
  stack: string;
  weight?: number;
  note: string;
  current?: boolean;
}

const HEADINGS: Typeface[] = [
  {
    id: 'cormorant',
    name: 'Cormorant Garamond',
    stack: '"Cormorant Garamond", Georgia, serif',
    weight: 400,
    note: 'Aktuell — klassisch, eher zart',
    current: true,
  },
  {
    id: 'cormorant-bold',
    name: 'Cormorant Garamond 700',
    stack: '"Cormorant Garamond", Georgia, serif',
    weight: 700,
    note: 'Dieselbe Familie, nur deutlich fetter',
  },
  {
    id: 'fraunces',
    name: 'Fraunces',
    stack: '"Fraunces", Georgia, serif',
    weight: 700,
    note: 'Moderner Display-Serif, weich und kräftig',
  },
  {
    id: 'dm-serif',
    name: 'DM Serif Display',
    stack: '"DM Serif Display", Georgia, serif',
    weight: 400,
    note: 'Grafisch, hoher Kontrast, sehr präsent',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    stack: '"Playfair Display", Georgia, serif',
    weight: 700,
    note: 'Editorial, luxuriös, klarer als Garamond',
  },
  {
    id: 'newsreader',
    name: 'Newsreader',
    stack: '"Newsreader", Georgia, serif',
    weight: 700,
    note: 'Zeitgenössische Leseserif, ruhig und modern',
  },
  {
    id: 'source-serif',
    name: 'Source Serif 4',
    stack: '"Source Serif 4", Georgia, serif',
    weight: 700,
    note: 'Sauber, aktuell, ohne Historismus',
  },
  {
    id: 'bodoni',
    name: 'Bodoni Moda',
    stack: '"Bodoni Moda", Georgia, serif',
    weight: 700,
    note: 'Fashion-Look, sehr hoher Kontrast',
  },
  {
    id: 'instrument',
    name: 'Instrument Serif',
    stack: '"Instrument Serif", Georgia, serif',
    weight: 400,
    note: 'Sehr zeitgenössisch, eher fein',
  },
];

const SCRIPTS: Typeface[] = [
  {
    id: 'allura',
    name: 'Allura',
    stack: '"Allura", cursive',
    note: 'Aktuell — elegant, gleichmäßig, eher ruhig',
    current: true,
  },
  {
    id: 'dafoe',
    name: 'Mr Dafoe',
    stack: '"Mr Dafoe", cursive',
    note: 'Dynamischer Pinsel, viel Bewegung',
  },
  {
    id: 'style-script',
    name: 'Style Script',
    stack: '"Style Script", cursive',
    note: 'Zeitgenössisch, federnd, lebendig',
  },
  {
    id: 'nautigal',
    name: 'The Nautigal',
    stack: '"The Nautigal", cursive',
    note: 'Unregelmäßig, handschriftlich, küstenhaft',
  },
  {
    id: 'ephesis',
    name: 'Ephesis',
    stack: '"Ephesis", cursive',
    note: 'Fließend und leichter als Allura, mehr Schwung',
  },
  {
    id: 'birthstone',
    name: 'Birthstone',
    stack: '"Birthstone", cursive',
    note: 'Luftig, modern, etwas verspielter',
  },
  {
    id: 'kaushan',
    name: 'Kaushan Script',
    stack: '"Kaushan Script", cursive',
    note: 'Kräftiger und burschikoser Pinsel',
  },
  {
    id: 'imperial',
    name: 'Imperial Script',
    stack: '"Imperial Script", cursive',
    note: 'Dramatischer Kupferstich, mehr Kontrast',
  },
  {
    id: 'mea-culpa',
    name: 'Mea Culpa',
    stack: '"Mea Culpa", cursive',
    note: 'Sehr expressiv, große Bögen',
  },
];

const PAIRINGS = [
  { heading: 'cormorant', script: 'allura', label: 'Aktuell', note: 'Cormorant Garamond + Allura' },
  { heading: 'fraunces', script: 'dafoe', label: 'Kraftvoll & bewegt', note: 'Fraunces + Mr Dafoe' },
  { heading: 'dm-serif', script: 'style-script', label: 'Grafisch & modern', note: 'DM Serif Display + Style Script' },
  { heading: 'playfair', script: 'ephesis', label: 'Editorial & fließend', note: 'Playfair Display + Ephesis' },
  { heading: 'newsreader', script: 'nautigal', label: 'Ruhig & küstenhaft', note: 'Newsreader + The Nautigal' },
  { heading: 'source-serif', script: 'birthstone', label: 'Klar & luftig', note: 'Source Serif 4 + Birthstone' },
  { heading: 'bodoni', script: 'imperial', label: 'Fashion & Drama', note: 'Bodoni Moda + Imperial Script' },
  { heading: 'fraunces', script: 'kaushan', label: 'Fett & dynamisch', note: 'Fraunces + Kaushan Script' },
];

const SAMPLES = [
  { key: 'welcome', roman: 'Willkommen in der', script: 'Familie' },
  { key: 'offers', roman: 'Unsere besten Angebote für Ihre', script: 'Nordsee-Ferien', breakAfter: 'Angebote' },
  { key: 'wellness', roman: 'Zeit für', script: 'Wellness' },
  { key: 'discover', roman: 'Entdecken Sie Ihr', script: 'ambassador' },
];

function splitRoman(roman: string, breakAfter?: string) {
  if (!breakAfter) return [roman];
  const needle = `${breakAfter}`;
  const index = roman.indexOf(needle);
  if (index < 0) return [roman];
  const end = index + needle.length;
  return [roman.slice(0, end), roman.slice(end).trim()];
}

export function FontsPage() {
  const [headingId, setHeadingId] = useState('cormorant');
  const [scriptId, setScriptId] = useState('allura');

  const heading = HEADINGS.find((font) => font.id === headingId) ?? HEADINGS[0];
  const script = SCRIPTS.find((font) => font.id === scriptId) ?? SCRIPTS[0];

  useEffect(() => {
    const link = document.createElement('link');
    link.id = 'font-lab-fonts';
    link.rel = 'stylesheet';
    link.href = FONT_STYLESHEET;
    document.head.appendChild(link);

    const previousTitle = document.title;
    document.title = 'Schriftlabor · ambassador hotel & spa';

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

  const previewStyle = {
    '--lab-heading': heading.stack,
    '--lab-heading-weight': String(heading.weight ?? 400),
    '--lab-script': script.stack,
  } as CSSProperties;

  return (
    <main className="font-lab">
      <header className="font-lab__hero">
        <div className="container">
          <p className="font-lab__kicker">Nur zum Anschauen · keine globale Änderung</p>
          <h1>Schriftlabor</h1>
          <p className="font-lab__lead">
            Die Website lädt aktuell drei <strong>Google Fonts</strong>: die Headline-Serif
            {' '}<em>Cormorant Garamond</em>, die Schreibschrift <em>Allura</em> und als Brotschrift
            {' '}<em>Inter</em>. Hier vergleichen wir nur die Headline-Kombination aus römischer
            und geschwungener Schrift — Inter bleibt unangetastet.
          </p>
          <dl className="font-lab__facts">
            <div>
              <dt>Cormorant Garamond</dt>
              <dd>Christian Thalmann, 2015. Elegante Garamond-Interpretation, eher leicht und literarisch.</dd>
            </div>
            <div>
              <dt>Allura</dt>
              <dd>Rob Leuschke, 2011. Formelle Kupferstich-Schreibschrift, gleichmäßig und eher ruhig.</dd>
            </div>
            <div>
              <dt>Inter</dt>
              <dd>Rasmus Andersson, 2017. Neutrale UI-Sans für Fließtext, Navigation und Buttons.</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="font-lab__studio" id="schriftlabor" style={previewStyle}>
        <div className="container">
          <div className="font-lab__picker">
            <div>
              <p className="font-lab__picker-label">Headline-Schrift</p>
              <div className="font-lab__chips">
                {HEADINGS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    className={`font-lab__chip${headingId === font.id ? ' is-active' : ''}`}
                    onClick={() => setHeadingId(font.id)}
                  >
                    <span>{font.name}</span>
                    <small>{font.note}</small>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-lab__picker-label">Geschwungene Schrift</p>
              <div className="font-lab__chips">
                {SCRIPTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    className={`font-lab__chip${scriptId === font.id ? ' is-active' : ''}`}
                    onClick={() => setScriptId(font.id)}
                  >
                    <span>{font.name}</span>
                    <small>{font.note}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="font-lab__now">
            Gerade aktiv: <strong>{heading.name}</strong> + <strong>{script.name}</strong>
          </p>

          <div className="font-lab__preview">
            {SAMPLES.map((sample) => (
              <h2 key={sample.key} className="font-lab__sample">
                {splitRoman(sample.roman, sample.breakAfter).map((line, index, lines) => (
                  <span key={`${sample.key}-${line}`}>
                    {line}
                    {index < lines.length - 1 ? <br /> : ' '}
                  </span>
                ))}
                <span className="font-lab__script">{sample.script}</span>
              </h2>
            ))}
          </div>
        </div>
      </section>

      <section className="font-lab__pairs">
        <div className="container">
          <h2 className="font-lab__section-title">Kuratierte Paare zum Anklicken</h2>
          <p className="font-lab__section-copy">
            Die Alternativen gehen in die Richtung: Headline fetter und etwas moderner,
            Schreibschrift dynamischer. Ein Klick setzt das Paar oben ins Labor.
          </p>
          <div className="font-lab__pair-grid">
            {PAIRINGS.map((pair) => {
              const pairHeading = HEADINGS.find((font) => font.id === pair.heading);
              const pairScript = SCRIPTS.find((font) => font.id === pair.script);
              if (!pairHeading || !pairScript) return null;
              const active = headingId === pair.heading && scriptId === pair.script;
              return (
                <button
                  key={`${pair.heading}-${pair.script}-${pair.label}`}
                  type="button"
                  className={`font-lab__pair${active ? ' is-active' : ''}`}
                  style={{
                    '--lab-heading': pairHeading.stack,
                    '--lab-heading-weight': String(pairHeading.weight ?? 400),
                    '--lab-script': pairScript.stack,
                  } as CSSProperties}
                  onClick={() => {
                    setHeadingId(pair.heading);
                    setScriptId(pair.script);
                    document.getElementById('schriftlabor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <p className="font-lab__pair-label">{pair.label}</p>
                  <p className="font-lab__pair-sample">
                    Auszeit am <span>Meer</span>
                  </p>
                  <p className="font-lab__pair-meta">{pair.note}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
