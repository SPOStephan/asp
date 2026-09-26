export type PageLayoutKey =
  | 'home'
  | 'rooms'
  | 'wellness'
  | 'offers'
  | 'culinary'
  | 'blog'
  | 'impressions'
  | 'faq'
  | 'legal'
  | 'generic';

export type PageTemplateKind = 'system' | 'library';

export type PageTemplate = {
  id?: string;
  template_key: string;
  title: string;
  description: string;
  path_prefix: string;
  tags: string[];
  preview_url: string | null;
  kind: PageTemplateKind;
  layout_key: PageLayoutKey;
  section_keys: string[];
  skeleton: Record<string, Record<string, unknown>>;
  default_selected: boolean;
  required: boolean;
  sort_order: number;
  created_from_hotel_id?: string | null;
};

export const HOME_SECTION_KEYS = [
  'hero',
  'welcome',
  'highlight_strip',
  'discover',
  'direct_booking',
  'offers',
  'wellness',
  'highlights',
  'culinary',
  'generations',
  'awards',
  'facts',
  'faq_home_section',
  'blog_page',
  'newsletter',
] as const;

export const CHROME_SECTION_KEYS = ['navbar', 'footer'] as const;

export const LEGAL_SKELETON: Record<string, unknown> = {
  eyebrow: '',
  title: '',
  subtitle: '',
  hero_image: '',
  hero_image_alt: '',
  body: '',
};

export const GENERIC_SKELETON: Record<string, unknown> = {
  ...LEGAL_SKELETON,
  items: [] as unknown[],
};

function emptySections(keys: readonly string[], shared?: Record<string, unknown>): Record<string, Record<string, unknown>> {
  return Object.fromEntries(keys.map((key) => [key, shared ? { ...shared } : {}]));
}

export const SYSTEM_TEMPLATES: PageTemplate[] = [
  {
    template_key: 'home',
    title: 'Startseite',
    description: 'Grundlayout der Startseite als leerer Container.',
    path_prefix: '/',
    tags: ['start', 'standard', 'home'],
    preview_url: null,
    kind: 'system',
    layout_key: 'home',
    section_keys: [...HOME_SECTION_KEYS],
    skeleton: emptySections(HOME_SECTION_KEYS),
    default_selected: true,
    required: true,
    sort_order: 10,
  },
  {
    template_key: 'zimmer',
    title: 'Zimmer & Suiten',
    description: 'Zimmerübersicht und Zimmer-Detailseiten.',
    path_prefix: '/zimmer',
    tags: ['zimmer', 'standard'],
    preview_url: null,
    kind: 'system',
    layout_key: 'rooms',
    section_keys: ['rooms_page'],
    skeleton: emptySections(['rooms_page']),
    default_selected: true,
    required: false,
    sort_order: 20,
  },
  {
    template_key: 'angebote',
    title: 'Angebote',
    description: 'Angebotsübersicht und Angebots-Details.',
    path_prefix: '/angebote',
    tags: ['angebote', 'standard'],
    preview_url: null,
    kind: 'system',
    layout_key: 'offers',
    section_keys: ['offers_page'],
    skeleton: emptySections(['offers_page']),
    default_selected: true,
    required: false,
    sort_order: 30,
  },
  {
    template_key: 'kulinarik',
    title: 'Restaurant / Kulinarik',
    description: 'Restaurantseite und kulinarische Bereiche.',
    path_prefix: '/kulinarik',
    tags: ['restaurant', 'kulinarik', 'standard'],
    preview_url: null,
    kind: 'system',
    layout_key: 'culinary',
    section_keys: ['culinary_page'],
    skeleton: emptySections(['culinary_page']),
    default_selected: true,
    required: false,
    sort_order: 40,
  },
  {
    template_key: 'impressum',
    title: 'Impressum',
    description: 'Rechtliche Pflichtseite.',
    path_prefix: '/impressum',
    tags: ['recht', 'standard'],
    preview_url: null,
    kind: 'system',
    layout_key: 'legal',
    section_keys: ['legal_impressum'],
    skeleton: { legal_impressum: { ...LEGAL_SKELETON, title: 'Impressum' } },
    default_selected: true,
    required: false,
    sort_order: 50,
  },
  {
    template_key: 'datenschutz',
    title: 'Datenschutz',
    description: 'Datenschutzerklärung als leerer Container.',
    path_prefix: '/datenschutz',
    tags: ['recht', 'standard'],
    preview_url: null,
    kind: 'system',
    layout_key: 'legal',
    section_keys: ['legal_datenschutz'],
    skeleton: { legal_datenschutz: { ...LEGAL_SKELETON, title: 'Datenschutz' } },
    default_selected: true,
    required: false,
    sort_order: 60,
  },
  {
    template_key: 'wellness',
    title: 'Wellness',
    description: 'Wellness-Hub und Themen-Unterseiten.',
    path_prefix: '/wellness',
    tags: ['wellness', 'spa'],
    preview_url: null,
    kind: 'system',
    layout_key: 'wellness',
    section_keys: ['wellness_page'],
    skeleton: emptySections(['wellness_page']),
    default_selected: false,
    required: false,
    sort_order: 70,
  },
  {
    template_key: 'blog',
    title: 'Journal / Blog',
    description: 'Beitragsübersicht und einzelne Artikel.',
    path_prefix: '/blog',
    tags: ['blog', 'journal'],
    preview_url: null,
    kind: 'system',
    layout_key: 'blog',
    section_keys: ['blog_page'],
    skeleton: emptySections(['blog_page']),
    default_selected: false,
    required: false,
    sort_order: 80,
  },
  {
    template_key: 'impressionen',
    title: 'Impressionen',
    description: 'Bildergalerie der Unterkunft.',
    path_prefix: '/impressionen',
    tags: ['galerie', 'bilder'],
    preview_url: null,
    kind: 'system',
    layout_key: 'impressions',
    section_keys: ['impressions_page'],
    skeleton: emptySections(['impressions_page']),
    default_selected: false,
    required: false,
    sort_order: 90,
  },
  {
    template_key: 'faqs',
    title: 'FAQ',
    description: 'Fragen und Antworten.',
    path_prefix: '/faqs',
    tags: ['faq', 'service'],
    preview_url: null,
    kind: 'system',
    layout_key: 'faq',
    section_keys: ['faq_page'],
    skeleton: emptySections(['faq_page']),
    default_selected: false,
    required: false,
    sort_order: 100,
  },
  {
    template_key: 'agb',
    title: 'AGB',
    description: 'Allgemeine Geschäftsbedingungen.',
    path_prefix: '/agb',
    tags: ['recht'],
    preview_url: null,
    kind: 'system',
    layout_key: 'legal',
    section_keys: ['legal_agb'],
    skeleton: { legal_agb: { ...LEGAL_SKELETON, title: 'AGB' } },
    default_selected: false,
    required: false,
    sort_order: 110,
  },
];

export function emptyContainer(value: unknown): unknown {
  if (typeof value === 'string') return '';
  if (typeof value === 'number' || typeof value === 'boolean' || value == null) return value;
  if (Array.isArray(value)) return value.map((item) => emptyContainer(item));
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, emptyContainer(child)]),
    );
  }
  return value;
}

export function defaultSelectedKeys(templates: PageTemplate[] = SYSTEM_TEMPLATES): string[] {
  return templates.filter((item) => item.required || item.default_selected).map((item) => item.template_key);
}

export function requiredPageKeys(templates: PageTemplate[] = SYSTEM_TEMPLATES): string[] {
  return templates.filter((item) => item.required).map((item) => item.template_key);
}

export function normalizeSelection(templates: PageTemplate[], selected: string[]): string[] {
  const required = new Set(requiredPageKeys(templates));
  const allowed = new Set(templates.map((item) => item.template_key));
  return [...new Set([...selected, ...required])].filter((key) => allowed.has(key));
}

export function pageRowsForHotel(
  hotelId: string,
  templates: PageTemplate[],
  selected: string[],
): Array<{ hotel_id: string; page_key: string; enabled: boolean; muster_version: string; template_id?: string }> {
  const on = new Set(normalizeSelection(templates, selected));
  return templates
    .filter((item) => item.kind === 'system' || on.has(item.template_key))
    .map((item) => ({
      hotel_id: hotelId,
      page_key: item.template_key,
      enabled: on.has(item.template_key),
      muster_version: 'v1',
      ...(item.id ? { template_id: item.id } : {}),
    }));
}

export function sectionsToSeed(
  templates: PageTemplate[],
  selected: string[],
  existingKeys: string[],
): Array<{ section_key: string; data: Record<string, unknown> }> {
  const on = new Set(normalizeSelection(templates, selected));
  const have = new Set(existingKeys);
  const next: Array<{ section_key: string; data: Record<string, unknown> }> = [];

  for (const key of CHROME_SECTION_KEYS) {
    if (!have.has(key)) next.push({ section_key: key, data: {} });
  }

  for (const template of templates) {
    if (!on.has(template.template_key)) continue;
    for (const sectionKey of template.section_keys) {
      if (have.has(sectionKey) || next.some((row) => row.section_key === sectionKey)) continue;
      next.push({
        section_key: sectionKey,
        data: (template.skeleton[sectionKey] as Record<string, unknown> | undefined) ?? {},
      });
    }
  }
  return next;
}

export function slugifyTemplateKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function genericSectionKey(templateKey: string) {
  return `page_${templateKey}`;
}

export function templateFromLibraryDraft(input: {
  title: string;
  template_key?: string;
  description?: string;
  tags?: string[];
  preview_url?: string | null;
  layout_key?: PageLayoutKey;
  section_data?: Record<string, Record<string, unknown>>;
  created_from_hotel_id?: string | null;
}): PageTemplate {
  const key = slugifyTemplateKey(input.template_key || input.title);
  const sectionKey = genericSectionKey(key);
  const skeleton = input.section_data
    ? Object.fromEntries(Object.entries(input.section_data).map(([name, data]) => [name, emptyContainer(data) as Record<string, unknown>]))
    : { [sectionKey]: { ...GENERIC_SKELETON } };
  return {
    template_key: key,
    title: input.title.trim(),
    description: input.description?.trim() || 'Leerer Seiten-Container aus der Bibliothek.',
    path_prefix: `/seite/${key}`,
    tags: (input.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean),
    preview_url: input.preview_url || null,
    kind: 'library',
    layout_key: input.layout_key ?? 'generic',
    section_keys: Object.keys(skeleton),
    skeleton,
    default_selected: false,
    required: false,
    sort_order: 200,
    created_from_hotel_id: input.created_from_hotel_id ?? null,
  };
}

export function matchesTemplateQuery(template: PageTemplate, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const hay = [template.title, template.description, template.template_key, template.path_prefix, ...template.tags]
    .join(' ')
    .toLowerCase();
  return hay.includes(needle);
}

function splitPath(pathname: string) {
  const path = pathname.split('?')[0] || '/';
  return path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
}

export function pageKeyFromPath(pathname: string, templates: PageTemplate[] = SYSTEM_TEMPLATES): string | null {
  const path = splitPath(pathname);
  if (path === '/' || path === '') return 'home';
  const seite = path.match(/^\/seite\/([^/]+)/);
  if (seite) return seite[1];
  const match = [...templates]
    .filter((item) => item.path_prefix !== '/')
    .sort((a, b) => b.path_prefix.length - a.path_prefix.length)
    .find((item) => path === item.path_prefix || path.startsWith(`${item.path_prefix}/`));
  return match?.template_key ?? null;
}

export function pageKeyFromHref(href: string, templates: PageTemplate[] = SYSTEM_TEMPLATES): string | null {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
  try {
    const path = href.startsWith('http') ? new URL(href).pathname : href.split('#')[0];
    return pageKeyFromPath(path || '/', templates);
  } catch {
    return pageKeyFromPath(href.split('#')[0] || '/', templates);
  }
}

export function isHomePageKey(key: string | null | undefined) {
  return key === 'home';
}

export function rowToTemplate(row: Record<string, unknown>): PageTemplate {
  return {
    id: typeof row.id === 'string' ? row.id : undefined,
    template_key: String(row.template_key ?? ''),
    title: String(row.title ?? row.template_key ?? ''),
    description: String(row.description ?? ''),
    path_prefix: String(row.path_prefix ?? '/'),
    tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag)) : [],
    preview_url: typeof row.preview_url === 'string' ? row.preview_url : null,
    kind: row.kind === 'library' ? 'library' : 'system',
    layout_key: (row.layout_key as PageLayoutKey) || 'generic',
    section_keys: Array.isArray(row.section_keys) ? row.section_keys.map((key) => String(key)) : [],
    skeleton:
      row.skeleton && typeof row.skeleton === 'object' && !Array.isArray(row.skeleton)
        ? (row.skeleton as Record<string, Record<string, unknown>>)
        : {},
    default_selected: row.default_selected === true,
    required: row.required === true,
    sort_order: typeof row.sort_order === 'number' ? row.sort_order : 200,
    created_from_hotel_id: typeof row.created_from_hotel_id === 'string' ? row.created_from_hotel_id : null,
  };
}
