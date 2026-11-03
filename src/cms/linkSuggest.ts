import type { CmsLinkTarget } from './cmsLinkTargets';

// Which page of the website a marked text most likely means – instantly, without the AI:
// words of the page names, and for the main pages the words people use for them
// ("Suite", "Sauna", "Frühstück" …). The AI suggestion comes on top when it answers.

const TOPICS: Array<{ href: string; words: string[] }> = [
  { href: '/ueber-uns', words: ['über uns', 'geschichte', 'tradition', 'familie dr', 'eigentümer', 'gastgeber', 'team', 'hotelgruppe'] },
  { href: '/anreise', words: ['anreise', 'anfahrt', 'lage', 'adresse', 'bahn', 'auto', 'route', 'parken', 'parkplatz', 'tiefgarage'] },
  { href: '/zimmer', words: ['zimmer', 'suite', 'suiten', 'doppelzimmer', 'einzelzimmer', 'apartment', 'übernacht', 'schlafen', 'unterkunft', 'balkon', 'meerblick'] },
  { href: '/wellness', words: ['wellness', 'spa', 'sauna', 'saunen', 'schwimmbad', 'pool', 'massage', 'kosmetik', 'thalasso', 'dampfbad', 'entspann', 'ruheraum', 'anwendung'] },
  { href: '/kulinarik', words: ['restaurant', 'kulinar', 'frühstück', 'abendessen', 'essen', 'küche', 'bar', 'halbpension', 'genuss', 'speise', 'menü', 'bistro'] },
  { href: '/angebote', words: ['angebot', 'arrangement', 'pauschale', 'paket', 'special', 'urlaub buchen'] },
  { href: '/tagen', words: ['tagung', 'tagen', 'seminar', 'meeting', 'konferenz', 'feier', 'hochzeit', 'geburtstag', 'familienfeier', 'incentive'] },
  { href: '/region', words: ['region', 'umgebung', 'ausflug', 'strand', 'natur', 'veranstaltung', 'familie', 'kinder', 'hund', 'aktiv', 'radfahren', 'wandern'] },
  { href: '/impressionen', words: ['bilder', 'fotos', 'impression', 'video', 'galerie'] },
  { href: '/faqs', words: ['frage', 'faq', 'anreise', 'check-in', 'check-out', 'parken', 'parkplatz', 'tiefgarage', 'haustier'] },
  { href: '/blog', words: ['blog', 'journal', 'tipp', 'ausflug', 'ausflüge', 'umgebung'] },
];

function norm(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

function stem(word: string) {
  return word.replace(/(en|er|es|e|n|s)$/u, '');
}

export function suggestLinks(selected: string, context: string, targets: CmsLinkTarget[], limit = 5): CmsLinkTarget[] {
  const text = norm(selected);
  const around = norm(context);
  if (!text) return [];
  const words = text.split(' ').filter((word) => word.length >= 3).map(stem);
  const scored = targets
    .filter((target) => target.active)
    .map((target) => {
      const label = norm(target.label);
      let score = 0;
      if (label && (text.includes(label) || label.includes(text))) score += 10;
      for (const word of words) if (word && label.includes(word)) score += 3;
      const topic = TOPICS.find((item) => item.href === target.href);
      if (topic) {
        for (const word of topic.words) {
          if (text.includes(word)) score += 4;
          else if (around.includes(word)) score += 1;
        }
      }
      // Pages of a kind (one room, one wellness topic) when their area is meant.
      const area = TOPICS.find((item) => target.href.startsWith(`${item.href}/`));
      if (area && area.words.some((word) => text.includes(word))) score += 1;
      return { target, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.target.href.length - b.target.href.length);
  return scored.slice(0, limit).map((item) => item.target);
}
