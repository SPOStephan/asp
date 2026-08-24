export interface CulinaryFact {
  label: string;
  value: string;
}

export interface CulinaryVenue {
  id: string;
  name: string;
  kicker: string;
  text: string;
  details: CulinaryFact[];
  includes: string[];
  image: string;
  image_alt: string;
}

export interface CulinaryRhythm {
  kicker: string;
  title: string;
  text: string;
}

export const CULINARY_PAGE_FALLBACK = {
  eyebrow: 'Kulinarik',
  title: 'Genuss am Meer',
  subtitle: 'Restaurant · Bar · Steakhouse',
  intro:
    'Norddeutsche Küche, Fine Dining und Grill — drei Adressen im Haus, eine Küche mit Produkten von der Küste und den Höfen ringsum. Halbpension, vegetarisch und vegan sind selbstverständlich.',
  hero_image: '/culinary-dining.webp',
  hero_image_alt: 'Gedeckter Tisch im Restaurant des ambassador hotel & spa',
  also_title: 'Auch im Haus',
  also_text:
    'Sushi-Bar und Nordseelounge bleiben zwei leise Alternativen, wenn der Abend eine andere Richtung nimmt.',
  note_title: 'Einen Tisch reservieren?',
  note_text:
    'Wir decken gern Ihren Tisch. Schreiben Sie uns oder sprechen Sie die Rezeption an — Allergien und Wünsche nehmen wir vorher auf.',
  note_cta: 'Persönliche Beratung',
  items: [
    {
      id: 'restaurant',
      name: 'Restaurant & Bar',
      kicker: 'Hausrestaurant',
      text:
        'Der Abend beginnt hier. Nordseefisch, Gemüse von den Höfen ringsum und eine Bar, die nicht hetzt. Regionale Tradition, internationale Ideen — und immer ein Tisch zum Horizont.',
      details: [
        { label: 'Stil', value: 'À la carte & Bar' },
        { label: 'Küche', value: 'Nordsee, international, vegetarisch und vegan' },
      ],
      includes: [
        'Regionale Produkte',
        'Internationale Karte',
        'Vegetarisch und vegan',
        'Bar im Haus',
      ],
      image: '/culinary-dining.webp',
      image_alt: 'Fine Dining und Bar im ambassador hotel & spa',
    },
    {
      id: 'strandstube',
      name: 'Strandstube',
      kicker: 'Fine Dining',
      text:
        'Weniger Tische, mehr Ruhe. Die Strandstube ist das Fine Dining im Haus — saisonale Gänge, präzise und ohne Spektakel. Für Abende, die länger werden als die Speisekarte.',
      details: [
        { label: 'Stil', value: 'Fine Dining' },
        { label: 'Küche', value: 'Saisonale Menüs, 5-Gang-Wahlmenü zur Halbpension' },
      ],
      includes: [
        'Saisonale Karte',
        '5-Gang-Wahlmenü zur Halbpension',
        'Individuelle Alternativen bei Unverträglichkeiten',
      ],
      image: '/collage-dining1.webp',
      image_alt: 'Gourmetküche in der Strandstube',
    },
    {
      id: 'grill',
      name: 'Grill & Dine',
      kicker: 'Steakhouse',
      text:
        'Feuer, Fleisch und ein klarer Teller. Das Steakhouse im Haus — geradlinig, regional, ohne Schnörkel. Für Gäste, die den Abend lieber am Grill als an sieben Gängen verbringen.',
      details: [
        { label: 'Stil', value: 'Steakhouse' },
        { label: 'Küche', value: 'Grill und regionale Cuts' },
      ],
      includes: ['Steaks vom Grill', 'Regionale Beilagen', 'Abendliche Atmosphäre'],
      image: '/collage-dining2.webp',
      image_alt: 'Steakhouse Grill & Dine',
    },
  ] satisfies CulinaryVenue[],
  rhythm: [
    {
      kicker: 'Morgen',
      title: 'Frühstück',
      text: 'Ein reichhaltiges Buffet, ohne Uhr. Der Tag darf langsam beginnen — bevor der Deich den Takt übernimmt.',
    },
    {
      kicker: 'Abend',
      title: 'Halbpension',
      text: 'Frühstück und ein 5-Gang-Wahlmenü. Zusätzliche Getränke sind nicht enthalten — Allergien klären wir vorher.',
    },
    {
      kicker: 'Spät',
      title: 'Bar',
      text: 'Ein Glas nach dem letzten Gang. Die Bar bleibt der leise Ort im Haus, wenn der Wind von See kommt.',
    },
  ] satisfies CulinaryRhythm[],
};

type RawVenue = Partial<CulinaryVenue> & {
  alt?: string;
  eyebrow?: string;
};

type RawFact = Partial<CulinaryFact>;
type RawRhythm = Partial<CulinaryRhythm>;

export function resolveCulinaryVenues(items?: RawVenue[]): CulinaryVenue[] {
  const raw = items?.length ? items : CULINARY_PAGE_FALLBACK.items;
  return raw.map((item, index) => {
    const fallback = CULINARY_PAGE_FALLBACK.items[index] ?? CULINARY_PAGE_FALLBACK.items[0];
    return {
      id: item.id ?? fallback.id,
      name: item.name ?? fallback.name,
      kicker: item.kicker ?? item.eyebrow ?? fallback.kicker,
      text: item.text ?? fallback.text,
      details: resolveFacts(item.details, fallback.details),
      includes: item.includes?.length ? item.includes : fallback.includes,
      image: item.image ?? fallback.image,
      image_alt: item.image_alt ?? item.alt ?? fallback.image_alt,
    };
  });
}

export function resolveCulinaryRhythm(items?: RawRhythm[]): CulinaryRhythm[] {
  const raw = items?.length ? items : CULINARY_PAGE_FALLBACK.rhythm;
  return raw.map((item, index) => {
    const fallback = CULINARY_PAGE_FALLBACK.rhythm[index] ?? CULINARY_PAGE_FALLBACK.rhythm[0];
    return {
      kicker: item.kicker ?? fallback.kicker,
      title: item.title ?? fallback.title,
      text: item.text ?? fallback.text,
    };
  });
}

function resolveFacts(items: RawFact[] | undefined, fallback: CulinaryFact[]): CulinaryFact[] {
  if (!items?.length) return fallback;
  return items
    .map((item, index) => ({
      label: item.label ?? fallback[index]?.label ?? '',
      value: item.value ?? fallback[index]?.value ?? '',
    }))
    .filter((item) => item.label && item.value);
}

export function culinaryVenueHref(id: string) {
  return `/kulinarik#${id}`;
}

export function remapCulinaryHref(href: string, label?: string) {
  const culinaryHash = href === '#kulinarik' || href === '#culinary';
  if (!culinaryHash) return href;
  if (label === 'Strandstube') return culinaryVenueHref('strandstube');
  if (label === 'Grill & Dine') return culinaryVenueHref('grill');
  if (label === 'Restaurant & Bar') return culinaryVenueHref('restaurant');
  return '/kulinarik';
}
