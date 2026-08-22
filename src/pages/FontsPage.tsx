import { useEffect, useState, type CSSProperties } from 'react';
import './FontsPage.css';

const FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2' +
  '?family=Alex+Brush' +
  '&family=Allison' +
  '&family=Birthstone' +
  '&family=Caveat:wght@400;500' +
  '&family=Corinthia' +
  '&family=Dancing+Script:wght@400;500' +
  '&family=Bodoni+Moda:opsz,wght@6..96,600;6..96,700' +
  '&family=Caramel' +
  '&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700' +
  '&family=DM+Serif+Display' +
  '&family=Ephesis' +
  '&family=Explora' +
  '&family=Fraunces:opsz,wght@9..144,600;9..144,700' +
  '&family=Great+Vibes' +
  '&family=Gwendolyn' +
  '&family=Imperial+Script' +
  '&family=Inspiration' +
  '&family=Instrument+Serif' +
  '&family=Island+Moments' +
  '&family=Italianno' +
  '&family=Kaushan+Script' +
  '&family=Lovers+Quarrel' +
  '&family=Licorice' +
  '&family=Mea+Culpa' +
  '&family=MonteCarlo' +
  '&family=Mr+Dafoe' +
  '&family=Mrs+Saint+Delafield' +
  '&family=Ms+Madi' +
  '&family=Newsreader:opsz,wght@6..72,600;6..72,700' +
  '&family=Oooh+Baby' +
  '&family=Pinyon+Script' +
  '&family=Playfair+Display:wght@600;700' +
  '&family=Qwigley' +
  '&family=Sacramento' +
  '&family=Send+Flowers' +
  '&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700' +
  '&family=Style+Script' +
  '&family=The+Nautigal' +
  '&family=Whisper' +
  '&family=WindSong' +
  '&display=swap';

interface Typeface {
  id: string;
  name: string;
  stack: string;
  weight?: number;
  note: string;
  current?: boolean;
  nearRef?: boolean;
  lighter?: boolean;
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
    note: 'Favorit im Labor — nur ein Schnitt, im Einsatz eher fett',
  },
  {
    id: 'alex-brush',
    name: 'Alex Brush',
    stack: '"Alex Brush", cursive',
    note: 'Nächster Verwandter von Mr Dafoe, feinerer Strich',
    lighter: true,
  },
  {
    id: 'great-vibes',
    name: 'Great Vibes',
    stack: '"Great Vibes", cursive',
    note: 'Leichter und gleichmäßiger als Dafoe',
    lighter: true,
  },
  {
    id: 'pinyon',
    name: 'Pinyon Script',
    stack: '"Pinyon Script", cursive',
    note: 'Elegant, schmaler, eher Schreibfeder',
    lighter: true,
  },
  {
    id: 'sacramento',
    name: 'Sacramento',
    stack: '"Sacramento", cursive',
    note: 'Monoline, sehr dünn, handschriftlich',
    lighter: true,
  },
  {
    id: 'italianno',
    name: 'Italianno',
    stack: '"Italianno", cursive',
    note: 'Fein und fließend',
    lighter: true,
  },
  {
    id: 'corinthia',
    name: 'Corinthia',
    stack: '"Corinthia", cursive',
    note: 'Zarte Kalligrafie',
    lighter: true,
  },
  {
    id: 'windsong',
    name: 'WindSong',
    stack: '"WindSong", cursive',
    note: 'Luftige Handschrift',
    lighter: true,
  },
  {
    id: 'montecarlo',
    name: 'MonteCarlo',
    stack: '"MonteCarlo", cursive',
    note: 'Leicht, etwas verspielter',
    lighter: true,
  },
  {
    id: 'gwendolyn',
    name: 'Gwendolyn',
    stack: '"Gwendolyn", cursive',
    note: 'Dünne Schreibschrift',
    lighter: true,
  },
  {
    id: 'delafield',
    name: 'Mrs Saint Delafield',
    stack: '"Mrs Saint Delafield", cursive',
    note: 'Sehr fein, signaturhaft',
    lighter: true,
  },
  {
    id: 'lovers',
    name: 'Lovers Quarrel',
    stack: '"Lovers Quarrel", cursive',
    note: 'Leicht und unregelmäßig',
    lighter: true,
  },
  {
    id: 'dancing',
    name: 'Dancing Script',
    stack: '"Dancing Script", cursive',
    note: 'Eher Handschrift als Pinsel',
    lighter: true,
  },
  {
    id: 'caveat',
    name: 'Caveat',
    stack: '"Caveat", cursive',
    note: 'Natürliche Notiz-Handschrift',
    lighter: true,
  },
  {
    id: 'oooh-baby',
    name: 'Oooh Baby',
    stack: '"Oooh Baby", cursive',
    note: 'Leichte moderne Handschrift, offene Bögen',
    nearRef: true,
  },
  {
    id: 'ms-madi',
    name: 'Ms Madi',
    stack: '"Ms Madi", cursive',
    note: 'Monoline, klein und natürlich — sehr nah am Beispiel',
    nearRef: true,
  },
  {
    id: 'caramel',
    name: 'Caramel',
    stack: '"Caramel", cursive',
    note: 'Organische Handlettering-Schrift, lockere Caps',
    nearRef: true,
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    stack: '"Inspiration", cursive',
    note: 'Fein, fließend, eher Marker als Pinsel',
    nearRef: true,
  },
  {
    id: 'licorice',
    name: 'Licorice',
    stack: '"Licorice", cursive',
    note: 'Zart, unregelmäßig, echte Handschrift',
    nearRef: true,
  },
  {
    id: 'send-flowers',
    name: 'Send Flowers',
    stack: '"Send Flowers", cursive',
    note: 'Luftig, lange Verbindungen, moderne Kalligrafie',
    nearRef: true,
  },
  {
    id: 'qwigley',
    name: 'Qwigley',
    stack: '"Qwigley", cursive',
    note: 'Sehr leicht, offene Schlaufen, viel Luft',
    nearRef: true,
  },
  {
    id: 'explora',
    name: 'Explora',
    stack: '"Explora", cursive',
    note: 'Delikate Kalligrafie, feiner Strich',
    nearRef: true,
  },
  {
    id: 'whisper',
    name: 'Whisper',
    stack: '"Whisper", cursive',
    note: 'Hauchdünn und bewegt, fast gezeichnet',
    nearRef: true,
  },
  {
    id: 'island-moments',
    name: 'Island Moments',
    stack: '"Island Moments", cursive',
    note: 'Weich, küstenhaft, moderne Schreibschrift',
    nearRef: true,
  },
  {
    id: 'allison',
    name: 'Allison',
    stack: '"Allison", cursive',
    note: 'Tinten-Handschrift, etwas unregelmäßiger',
    nearRef: true,
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
  { heading: 'newsreader', script: 'alex-brush', label: 'Aktuell live', note: 'Newsreader Medium + Alex Brush' },
  { heading: 'newsreader', script: 'dafoe', label: 'Newsreader + Mr Dafoe', note: 'Im Einsatz zu fett' },
  { heading: 'cormorant', script: 'allura', label: 'Vorher live', note: 'Cormorant Garamond + Allura' },
  { heading: 'newsreader', script: 'great-vibes', label: 'Newsreader + Great Vibes', note: 'Leichter und gleichmäßiger' },
  { heading: 'newsreader', script: 'sacramento', label: 'Newsreader + Sacramento', note: 'Sehr dünn, handschriftlich' },
  { heading: 'newsreader', script: 'oooh-baby', label: 'Newsreader + Oooh Baby', note: 'Leichte moderne Handschrift' },
  { heading: 'newsreader', script: 'ms-madi', label: 'Newsreader + Ms Madi', note: 'Monoline, nah am Beispielbild' },
  { heading: 'newsreader', script: 'inspiration', label: 'Newsreader + Inspiration', note: 'Fein, eher Marker' },
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
            Live stehen jetzt <strong>Newsreader Medium</strong> und <strong>Alex Brush</strong>,
            dazu <em>Inter</em> als Brotschrift. Hier bleiben die Alternativen zum Vergleich —
            Inter bleibt unangetastet.
          </p>
          <dl className="font-lab__facts">
            <div>
              <dt>Newsreader</dt>
              <dd>Production Type, 2020. Zeitgenössische Leseserif. Live in Medium (500).</dd>
            </div>
            <div>
              <dt>Alex Brush</dt>
              <dd>TypeSETit / Rob Leuschke. Pinsel-Schreibschrift, feiner als Mr Dafoe.</dd>
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
              <p className="font-lab__picker-sub">
                Leichter als Mr Dafoe — Alex Brush zuerst, dann weitere schmale Handschriften
              </p>
              <div className="font-lab__chips">
                {SCRIPTS.filter((font) => font.lighter).map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    className={`font-lab__chip font-lab__chip--script${scriptId === font.id ? ' is-active' : ''}`}
                    onClick={() => setScriptId(font.id)}
                  >
                    <em className="font-lab__chip-preview" style={{ fontFamily: font.stack }}>Meer</em>
                    <span>{font.name}</span>
                    <small>{font.note}</small>
                  </button>
                ))}
              </div>
              <p className="font-lab__picker-sub">
                Näher am Beispielbild: leichte, moderne Handschrift
              </p>
              <div className="font-lab__chips">
                {SCRIPTS.filter((font) => font.nearRef).map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    className={`font-lab__chip font-lab__chip--script${scriptId === font.id ? ' is-active' : ''}`}
                    onClick={() => setScriptId(font.id)}
                  >
                    <em className="font-lab__chip-preview" style={{ fontFamily: font.stack }}>Meer</em>
                    <span>{font.name}</span>
                    <small>{font.note}</small>
                  </button>
                ))}
              </div>
              <p className="font-lab__picker-sub">Weitere, inkl. Mr Dafoe und Allura</p>
              <div className="font-lab__chips">
                {SCRIPTS.filter((font) => !font.nearRef && !font.lighter).map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    className={`font-lab__chip font-lab__chip--script${scriptId === font.id ? ' is-active' : ''}`}
                    onClick={() => setScriptId(font.id)}
                  >
                    <em className="font-lab__chip-preview" style={{ fontFamily: font.stack }}>Meer</em>
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
            <div className="font-lab__ref">
              <p className="font-lab__ref-note">Wie im Beispiel: zuerst die Schreibschrift, darunter die Headline</p>
              <p className="font-lab__ref-script">Wellnessurlaub</p>
              <p className="font-lab__ref-serif">Auszeit am Meer</p>
            </div>
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
            Newsreader bleibt die Headline. Mr Dafoe hat nur einen Schnitt — deshalb
            hier Alex Brush und weitere leichtere Handschriften. Ein Klick setzt das Paar ins Labor.
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
