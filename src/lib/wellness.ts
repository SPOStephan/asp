export interface WellnessFact {
  label: string;
  value: string;
}

export interface WellnessPriceItem {
  name: string;
  meta?: string;
  price: string;
}

export interface WellnessPriceGroup {
  title: string;
  items: WellnessPriceItem[];
}

export interface WellnessTopic {
  id: string;
  name: string;
  kicker: string;
  tile_cta: string;
  summary: string;
  text: string[];
  details: WellnessFact[];
  includes: string[];
  prices?: WellnessPriceGroup[];
  price_note?: string;
  image: string;
  image_alt: string;
  hero_image: string;
  hero_image_alt: string;
  pair_image?: string;
  pair_image_alt?: string;
}

export interface WellnessChapter {
  id: string;
  kicker: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  image: string;
  image_alt: string;
}

export const WELLNESS_PAGE_FALLBACK = {
  eyebrow: 'Wellnesserlebnis',
  title: 'Auramaris Spa',
  subtitle: 'Wasser · Wärme · Weitblick',
  intro:
    'Treten Sie ein in eine Welt der Ruhe. An der Nordsee erholen Sie sich, sammeln Kräfte — und unser Team stellt Ihnen ein individuelles Spa-Programm zusammen.',
  hero_image: '/hotel-nordsee-wellness02.webp',
  hero_image_alt: 'Wellnessbereich des ambassador hotel & spa',
  day_kicker: 'Day Spa',
  day_title: 'Auch für Tagesgäste',
  day_text:
    'Nutzung des gesamten Spas ohne Anwendungen, inklusive Bademantel und Schuhe. 29 Euro pro Person.',
  day_cta: 'Zum Day Spa',
  day_cta_href: '/wellness/preisliste',
  chapters: [
    {
      id: 'wasser',
      kicker: 'Schwimmbad & Sauna',
      title: 'Farbe im Wasser, Stille in der Wärme',
      text:
        'Finnische Sauna, Bio-Soft-Sauna, Dampfbad und ein Schwimmbad mit Farblicht. Danach Ruhe — draußen in der Luft oder in den Räumen Feuer und Wasser.',
      href: '/wellness/schwimmbad-sauna',
      cta: 'Schwimmbad & Sauna',
      image: '/collage-pool.webp',
      image_alt: 'Schwimmbad im ambassador hotel & spa',
    },
    {
      id: 'anwendungen',
      kicker: 'Auramaris',
      title: 'Behandlungen mit Blick ins Weite',
      text:
        'Massagen, Babor, Packungen, Thalasso und Whirlpoolbäder auf der Dachterrasse. Fast alle Räume schauen auf Meer und Dünen.',
      href: '/wellness/auramaris',
      cta: 'Auramaris Spa',
      image: '/collage-treatment.webp',
      image_alt: 'Behandlungsraum im Auramaris Spa',
    },
  ] satisfies WellnessChapter[],
  overlap_kicker: 'Ankommen',
  overlap_title: 'Zwei Räume, ein Atem',
  overlap_text:
    'Nach der Sauna bleibt Zeit. Ein Außenbereich mit Frischluft, ein Raum zum Thema Feuer, einer zum Thema Wasser — jeder Gast findet den Rahmen für die eigene Ruhe.',
  overlap_cta: 'Öffnungszeiten & Hinweise',
  overlap_cta_href: '/wellness/informationen',
  overlap_front: '/collage-pool.webp',
  overlap_front_alt: 'Schwimmbad mit Farblicht',
  overlap_back: '/collage-relaxroom.webp',
  overlap_back_alt: 'Ruheraum im Spa',
  note_title: 'Einen Termin vereinbaren?',
  note_text:
    'Behandlungen am besten schon mit der Zimmerbuchung reservieren. Telefon 04863 709811 oder E-Mail an auramarisspa@hotel-ambassador.de.',
  note_cta: 'Termin anfragen',
  note_cta_href: '/wellness/termin',
  items: [
    {
      id: 'schwimmbad-sauna',
      name: 'Schwimmbad & Sauna',
      kicker: 'Wasser & Wärme',
      tile_cta: 'Jetzt ansehen',
      summary: 'Farblicht im Becken, drei Saunen und Räume für die Ruhe danach.',
      text: [
        'Neben finnischer Sauna, Bio-Soft-Sauna und Dampfbad finden Sie ein Schwimmbad mit Farblichttherapie.',
        'Für die Ruhephase stehen verschiedene Räume bereit: ein Außenbereich mit Frischluft, ein Raum zum Thema Feuer und einer zum Thema Wasser.',
        'Der Fitnessraum ist täglich von 17 bis 23 Uhr geöffnet.',
      ],
      details: [
        { label: 'Schwimmbad', value: '07:00–22:00 Uhr' },
        { label: 'Saunen', value: 'Sommer 15–21 Uhr, Winter 12–21 Uhr' },
        { label: 'Fitness', value: 'täglich 17–23 Uhr' },
      ],
      includes: [
        'Finnische Sauna, Bio-Soft-Sauna, Dampfbad',
        'Schwimmbad mit Farblicht',
        'Ruheräume Feuer und Wasser',
        'Außenbereich',
      ],
      image: '/collage-pool.webp',
      image_alt: 'Schwimmbad im ambassador hotel & spa',
      hero_image: '/collage-pool.webp',
      hero_image_alt: 'Schwimmbad mit Farblichttherapie',
      pair_image: '/collage-relaxroom.webp',
      pair_image_alt: 'Ruheraum nach der Sauna',
    },
    {
      id: 'informationen',
      name: 'Wellness-Informationen',
      kicker: 'Gut zu wissen',
      tile_cta: 'Mehr dazu',
      summary: 'Zeiten, Etikette und was in den Arrangements enthalten ist.',
      text: [
        'In den zusammengestellten Programmen sind Saunen, Schwimmbad und Fitnessraum enthalten — ebenso Handtücher und Bademäntel. Preise gelten in Euro inklusive MwSt. pro Person, zuzüglich der ortsüblichen Kurtaxe. Preisänderung vorbehalten.',
        'Bitte reservieren Sie Anwendungen direkt mit der Zimmerbuchung. Bei Anreise ist oft kein Termin mehr frei. Erscheinen Sie mindestens fünf Minuten vorher; Verspätung kann die Behandlung kürzen.',
        'Teilen Sie uns gesundheitliche Umstände mit — Blutdruck, Allergien, Schwangerschaft, Herz oder Einschränkungen. Zur Anwendung erscheinen Sie gern im Bademantel.',
      ],
      details: [
        { label: 'Spa-Rezeption', value: '10:00–18:00 Uhr' },
        { label: 'Ruhetag Auramaris', value: 'Sonntag und Montag' },
        { label: 'Saisonschließung', value: '21. Dezember 2026 bis 1. Januar 2027' },
      ],
      includes: [
        'Sauna, Schwimmbad und Fitness im Arrangement',
        'Handtücher und Bademantel',
        'Termin am besten mit der Buchung',
        '5 Minuten vor der Anwendung da sein',
      ],
      image: '/spa-wellness.webp',
      image_alt: 'Spa-Bereich mit Blick auf die Nordsee',
      hero_image: '/spa-wellness.webp',
      hero_image_alt: 'Hinweis und Ankommen im Auramaris Spa',
      pair_image: '/teaser-spa.webp',
      pair_image_alt: 'Ruhe im Wellnessbereich',
    },
    {
      id: 'auramaris',
      name: 'Auramaris Spa',
      kicker: 'Anwendungen',
      tile_cta: 'Mehr dazu',
      summary: 'Massagen, Babor, Packungen und Bäder — fast überall mit Meerblick.',
      text: [
        'Das Auramaris ist der Ort für Anwendungen. Fast alle Behandlungsräume schauen auf Meer und Dünen.',
        'Zur Karte gehören kosmetische Behandlungen mit Babor, Massagen, Ganzkörperpackungen, Aromaöl- und Thalassobäder sowie Whirlpoolbäder auf der Dachterrasse. Die Terrasse bleibt in den Wintermonaten wegen Frost geschlossen.',
        'Spa-Suiten eignen sich für Parallelbehandlungen. Maniküre und Pediküre nach Verfügbarkeit.',
      ],
      details: [
        { label: 'Produkte', value: 'Babor und hauseigene Fix-Vital-Serie' },
        { label: 'Dachterrasse', value: 'Whirlpool, im Winter geschlossen' },
        { label: 'Kontakt', value: '04863 709811' },
      ],
      includes: [
        'Massagen und Fix-Vital',
        'Babor Gesicht und Körper',
        'Packungen und Thalasso',
        'Private Bäder und Spa-Suiten',
      ],
      image: '/collage-treatment.webp',
      image_alt: 'Behandlungsraum im Auramaris Spa',
      hero_image: '/collage-treatment.webp',
      hero_image_alt: 'Anwendung im Auramaris Spa',
      pair_image: '/spa-adults-only.webp',
      pair_image_alt: 'Erwachsener Spa-Bereich',
    },
    {
      id: 'termin',
      name: 'Termin-Vereinbarung',
      kicker: 'Reservierung',
      tile_cta: 'Mehr dazu',
      summary: 'Telefon, Mail — am besten schon mit der Zimmerbuchung.',
      text: [
        'Für Fragen, Wünsche und Termine: 04863 709811 oder auramarisspa@hotel-ambassador.de.',
        'Reservieren Sie Anwendungen mit der Zimmerbuchung. Später ist der Kalender oft voll.',
        'Bitte mindestens 24 Stunden vorher absagen. Kurzfristige Stornierung: 80 Prozent des Behandlungspreises. Ohne Absage wird die Anwendung berechnet.',
      ],
      details: [
        { label: 'Telefon', value: '04863 709811' },
        { label: 'E-Mail', value: 'auramarisspa@hotel-ambassador.de' },
        { label: 'Absage', value: 'mindestens 24 Stunden vorher' },
      ],
      includes: [
        'Termin mit der Zimmerbuchung sichern',
        '5 Minuten vor der Anwendung da sein',
        'Gesundheitliche Hinweise vorab nennen',
        'Wunsch nach Therapeutin oder Therapeut mitteilen',
      ],
      image: '/collage-restroom.webp',
      image_alt: 'Ankommen an der Spa-Rezeption',
      hero_image: '/hotel-nordsee-wellness02.webp',
      hero_image_alt: 'Auramaris Spa im ambassador hotel & spa',
      pair_image: '/collage-treatment.webp',
      pair_image_alt: 'Behandlungsraum',
    },
    {
      id: 'preisliste',
      name: 'Spa-Preisliste',
      kicker: 'Karte',
      tile_cta: 'Mehr dazu',
      summary: 'Eine Auswahl der aktuellen Karte — die volle Liste gilt an der Rezeption.',
      text: [
        'Eine redaktionelle Auswahl aus der Spa-Broschüre 2025. Die vollständige, jeweils gültige Karte erhalten Sie an der Rezeption und im Auramaris.',
        'Duett-Preise gelten, wenn dieselbe Anwendung zu zweit gebucht wird. Preisänderung vorbehalten.',
      ],
      details: [
        { label: 'Day Spa', value: '29 Euro pro Person' },
        { label: 'Gültigkeit', value: 'Broschüre 2025, Änderung vorbehalten' },
      ],
      includes: [
        'Day Spa mit Schwimmbad, Saunen und Ruhebereichen',
        'Spa-Tasche mit Handtuch, Bademantel und Slipper',
        'Spind nach Verfügbarkeit',
      ],
      prices: [
        {
          title: 'Day Spa',
          items: [
            { name: 'Day Spa', meta: 'ohne Anwendungen', price: '29 Euro p.P.' },
            { name: 'Day-Spa Deluxe', meta: 'für 2 Personen', price: '200 Euro' },
          ],
        },
        {
          title: 'Hausmassagen',
          items: [
            { name: 'Nacken-Schulter', meta: '15 Min.', price: '24 Euro' },
            { name: 'Wellness-Rücken', meta: '25 Min.', price: '40 Euro' },
            { name: 'Teilkörper', meta: '40 Min.', price: '64 Euro' },
            { name: 'Ganzkörper', meta: '60 Min.', price: '96 Euro' },
          ],
        },
        {
          title: 'Bäder',
          items: [
            { name: 'Innenbad', meta: '30 Min., inkl. Sekt', price: '51 Euro' },
            { name: 'Whirlpool Dachterrasse', meta: '45 Min.', price: '65 Euro' },
          ],
        },
      ],
      price_note: 'Auszug aus der Spa-Broschüre 2025. Die aktuelle Karte gilt vor Ort.',
      image: '/teaser-spa.webp',
      image_alt: 'Spa-Anwendungen im ambassador hotel & spa',
      hero_image: '/teaser-spa.webp',
      hero_image_alt: 'Auswahl der Spa-Karte',
      pair_image: '/collage-treatment.webp',
      pair_image_alt: 'Behandlung im Auramaris',
    },
    {
      id: 'angebot',
      name: 'Spa-Angebot des Monats',
      kicker: 'Saison',
      tile_cta: 'Mehr dazu',
      summary: 'Jeden Monat ein anderes Highlight — Me-Time mit Blick auf Dünen und Meer.',
      text: [
        'Jeden Monat steht ein anderes Highlight im Auramaris. Tun Sie sich etwas Gutes, schenken Sie sich Me-Time und den Blick auf Nordsee und Dünen.',
        'Das jeweils aktuelle Monatsangebot nennen wir Ihnen an der Rezeption, telefonisch oder per Mail. So bleibt die Seite ehrlich, wenn die Karte wechselt.',
      ],
      details: [
        { label: 'Wechsel', value: 'monatlich' },
        { label: 'Anfrage', value: '04863 709811' },
      ],
      includes: [
        'Wechselndes Monats-Highlight',
        'Oft kombinierbar mit Day Spa',
        'Termin über das Auramaris',
      ],
      image: '/spa-adults-only.webp',
      image_alt: 'Saisonales Spa-Angebot',
      hero_image: '/spa-adults-only.webp',
      hero_image_alt: 'Me-Time im Auramaris Spa',
      pair_image: '/teaser-yoga.webp',
      pair_image_alt: 'Auszeit am Meer',
    },
  ] satisfies WellnessTopic[],
};

type RawTopic = Partial<WellnessTopic>;
type RawChapter = Partial<WellnessChapter>;

export function resolveWellnessTopics(items?: RawTopic[]): WellnessTopic[] {
  const raw = items?.length ? items : WELLNESS_PAGE_FALLBACK.items;
  return raw.map((item, index) => {
    const fallback = WELLNESS_PAGE_FALLBACK.items[index] ?? WELLNESS_PAGE_FALLBACK.items[0];
    return {
      id: item.id ?? fallback.id,
      name: item.name ?? fallback.name,
      kicker: item.kicker ?? fallback.kicker,
      tile_cta: item.tile_cta ?? fallback.tile_cta,
      summary: item.summary ?? fallback.summary,
      text: item.text?.length ? item.text : fallback.text,
      details: item.details?.length ? item.details : fallback.details,
      includes: item.includes?.length ? item.includes : fallback.includes,
      prices: item.prices?.length ? item.prices : fallback.prices,
      price_note: item.price_note ?? fallback.price_note,
      image: item.image ?? fallback.image,
      image_alt: item.image_alt ?? fallback.image_alt,
      hero_image: item.hero_image ?? item.image ?? fallback.hero_image,
      hero_image_alt: item.hero_image_alt ?? item.image_alt ?? fallback.hero_image_alt,
      pair_image: item.pair_image ?? fallback.pair_image,
      pair_image_alt: item.pair_image_alt ?? fallback.pair_image_alt,
    };
  });
}

export function resolveWellnessChapters(items?: RawChapter[]): WellnessChapter[] {
  const raw = items?.length ? items : WELLNESS_PAGE_FALLBACK.chapters;
  return raw.map((item, index) => {
    const fallback = WELLNESS_PAGE_FALLBACK.chapters[index] ?? WELLNESS_PAGE_FALLBACK.chapters[0];
    return {
      id: item.id ?? fallback.id,
      kicker: item.kicker ?? fallback.kicker,
      title: item.title ?? fallback.title,
      text: item.text ?? fallback.text,
      href: item.href ?? fallback.href,
      cta: item.cta ?? fallback.cta,
      image: item.image ?? fallback.image,
      image_alt: item.image_alt ?? fallback.image_alt,
    };
  });
}

export function wellnessTopicHref(id: string) {
  return `/wellness/${id}`;
}

export function remapWellnessHref(href: string, label?: string) {
  if (label === 'Wellness & Spa' && (href === '#wellness' || href === '/wellness')) {
    return '/wellness';
  }
  if (label === 'Zum Wellnessbereich') return '/wellness';
  if (label === 'Yoga & Retreats' && href === '#wellness') return '/wellness';
  if (label === 'Spa & Wellness' && href === '/wellness') return '/wellness';
  return href;
}

export function menuGroupHref(title: string, href?: string) {
  if (href) return href;
  switch (title) {
    case 'Zimmer & Suiten':
      return '/zimmer';
    case 'Angebote':
      return '/angebote';
    case 'Wellness':
      return '/wellness';
    case 'Kulinarik':
      return '/kulinarik';
    default:
      return undefined;
  }
}
