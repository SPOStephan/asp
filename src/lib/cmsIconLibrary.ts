import { CMS_ICON_NAMES } from '../cms/cmsIcons';

export type CmsIconKind = 'lucide' | 'svg' | 'image';

export type CmsIconRecord = {
  name: string;
  kind: CmsIconKind;
  svg?: string | null;
  image_url?: string | null;
  tags: string[];
  description: string;
};

export const ICON_ALIASES: Record<string, string> = {
  hund: 'Dog',
  hunde: 'Dog',
  dog: 'Dog',
  wlan: 'Wifi',
  wifi: 'Wifi',
  internet: 'Wifi',
  park: 'Car',
  parken: 'Car',
  auto: 'Car',
  parkplatz: 'ParkingCircle',
  bett: 'BedDouble',
  zimmer: 'BedDouble',
  suite: 'BedDouble',
  uhr: 'Clock',
  zeit: 'Clock',
  anreise: 'Clock',
  stern: 'Star',
  meer: 'Waves',
  welle: 'Waves',
  wellen: 'Waves',
  pool: 'Waves',
  spa: 'Flower2',
  wellness: 'Flower2',
  blume: 'Flower2',
  essen: 'Utensils',
  restaurant: 'Utensils',
  kulinarik: 'Utensils',
  wein: 'Wine',
  kaffee: 'Coffee',
  familie: 'Baby',
  baby: 'Baby',
  kind: 'Baby',
  barrierefrei: 'Accessibility',
  rollstuhl: 'Accessibility',
  flug: 'Plane',
  flughafen: 'Plane',
  boot: 'Sailboat',
  segeln: 'Sailboat',
  sonne: 'Sun',
  baum: 'Trees',
  wald: 'Trees',
  natur: 'Leaf',
  herz: 'Heart',
  liebe: 'Heart',
  blitz: 'Zap',
  strom: 'Zap',
  rad: 'Bike',
  fahrrad: 'Bike',
  sport: 'Dumbbell',
  fitness: 'Dumbbell',
  bad: 'Bath',
  dusche: 'Bath',
  schirm: 'Umbrella',
  strand: 'Umbrella',
  preis: 'BadgePercent',
  rabatt: 'BadgePercent',
  check: 'BadgeCheck',
  bestaetigung: 'BadgeCheck',
  service: 'ConciergeBell',
};

export function slugifyIconName(value: string) {
  const slug = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  if (!slug) return `icon-${Date.now()}`;
  return slug[0].toUpperCase() + slug.slice(1);
}

function normalizeHay(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function matchIconFromDescription(description: string, names: string[] = CMS_ICON_NAMES): string | null {
  const hay = normalizeHay(description);
  if (!hay) return null;
  for (const [alias, name] of Object.entries(ICON_ALIASES)) {
    if (hay.split(' ').includes(alias) || hay.includes(alias)) return name;
  }
  const compact = hay.replace(/\s+/g, '');
  for (const name of names) {
    const key = normalizeHay(name).replace(/\s+/g, '');
    if (key && (compact.includes(key) || hay.includes(key))) return name;
  }
  return null;
}

export function sanitizeSvg(raw: string): string {
  const trimmed = raw.trim();
  const svgMatch = trimmed.match(/<svg[\s\S]*<\/svg>/i);
  let svg = svgMatch ? svgMatch[0] : trimmed;
  svg = svg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z]+="[^"]*"/gi, '')
    .replace(/\son[a-z]+='[^']*'/gi, '');
  if (!/viewBox=/i.test(svg)) {
    svg = svg.replace(/<svg/i, '<svg viewBox="0 0 24 24"');
  }
  if (!/xmlns=/i.test(svg)) {
    svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  svg = svg.replace(/stroke="(?!none)[^"]*"/gi, 'stroke="currentColor"');
  svg = svg.replace(/fill="(?!none)[^"]*"/gi, 'fill="none"');
  if (!/stroke-width=/i.test(svg)) {
    svg = svg.replace(/<svg/i, '<svg stroke-width="1.75"');
  }
  return svg;
}

export function generateLucideMark(name: string, description = ''): string {
  const seed = [...`${name}:${description}`].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const variant = seed % 4;
  const inner =
    variant === 0
      ? '<path d="M8 12h8" /><path d="M12 8v8" />'
      : variant === 1
        ? '<path d="M12 7v10" /><path d="M7 12h10" /><circle cx="12" cy="12" r="2" />'
        : variant === 2
          ? '<path d="M8 16l4-8 4 8" />'
          : '<rect x="8" y="8" width="8" height="8" rx="1.5" />';
  return sanitizeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/>${inner}</svg>`,
  );
}

export function isIconColorPath(path: string) {
  const leaf = path.split('.').pop() ?? path;
  return leaf === 'icon_color' || leaf.endsWith('_icon_color');
}

export function rowToIcon(row: Record<string, unknown>): CmsIconRecord {
  const kind = row.kind === 'svg' || row.kind === 'image' ? row.kind : 'lucide';
  return {
    name: String(row.name ?? ''),
    kind,
    svg: typeof row.svg === 'string' ? row.svg : null,
    image_url: typeof row.image_url === 'string' ? row.image_url : null,
    tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag)) : [],
    description: String(row.description ?? ''),
  };
}

export function matchesIconQuery(icon: CmsIconRecord, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [icon.name, icon.description, icon.kind, ...icon.tags].join(' ').toLowerCase().includes(needle);
}
