import { onPlatformDomain, PLATFORM_DOMAIN } from '../config/product';
import type { ContentBlock, PageModel, SiteLink, SiteModel } from './pageModel';
import type { HotelContent } from './siteData';
import { cdnSrcSet, HERO_SIZES } from '../lib/media';

// Paths that are tools, not content: never indexed, served as the plain app.
const PRIVATE_PATHS = /^\/(admin|cms|vorschau|schriften|menue-mobil|mobil-leiste\d*)(\/|$)/;

export function isPrivatePath(path: string) {
  return PRIVATE_PATHS.test(path);
}

// One address per hotel: its own domain wins over a subdomain of the platform domain.
export function canonicalOrigin(domains: string[] | null | undefined, requestHost: string, platformDomain = PLATFORM_DOMAIN) {
  const list = (domains ?? []).map((item) => item.trim().toLowerCase()).filter(Boolean);
  const usable = list.filter((item) => !item.startsWith('admin.') && item !== 'localhost' && item !== '127.0.0.1');
  const own = usable.find((item) => !onPlatformDomain(item, platformDomain) && !item.endsWith('.vercel.app'));
  const chosen = own || usable.find((item) => onPlatformDomain(item, platformDomain)) || usable[0] || requestHost;
  return `https://${chosen}`;
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// JSON inside <script> must not be able to close the tag.
export function scriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function linkHtml(link: SiteLink) {
  const external = /^(https?:)?\/\//i.test(link.href);
  return `<a href="${escapeHtml(link.href)}"${external ? ' rel="noopener"' : ''}>${escapeHtml(link.label)}</a>`;
}

function blockHtml(block: ContentBlock) {
  const parts: string[] = [];
  if (block.heading) parts.push(`<h2>${escapeHtml(block.heading)}</h2>`);
  for (const text of block.text ?? []) parts.push(`<p>${escapeHtml(text)}</p>`);
  if (block.items?.length) {
    const items = block.items.map((item) => {
      const title = item.href ? linkHtml({ label: item.title, href: item.href }) : escapeHtml(item.title);
      const facts = item.facts?.length ? `<ul>${item.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul>` : '';
      const text = item.text ? `<p>${escapeHtml(item.text)}</p>` : '';
      // Plain list entries stay list entries; only items with their own content get a heading.
      if (!text && !facts && !item.href) return `<li>${title}</li>`;
      return `<li><h3>${title}</h3>${text}${facts}</li>`;
    });
    parts.push(`<ul>${items.join('')}</ul>`);
  }
  if (block.links?.length) parts.push(`<ul>${block.links.map((link) => `<li>${linkHtml(link)}</li>`).join('')}</ul>`);
  return `<section>${parts.join('')}</section>`;
}

// The readable page as plain HTML. React replaces it once the app has loaded.
export function contentCoreHtml(model: PageModel, site: SiteModel) {
  const nav = site.activePages().map(linkHtml).join(' ');
  const crumbs = model.breadcrumbs.length
    ? `<nav aria-label="Brotkrumen"><ol>${model.breadcrumbs.map((crumb) => `<li>${linkHtml(crumb)}</li>`).join('')}</ol></nav>`
    : '';
  const legal = ['impressum', 'datenschutz', 'agb']
    .filter((key) => site.isAvailable(key))
    .map((key) => linkHtml({ label: key === 'agb' ? 'AGB' : key[0].toUpperCase() + key.slice(1), href: `/${key}` }))
    .join(' ');
  return [
    '<div class="site-core">',
    `<header><nav aria-label="Hauptnavigation">${nav}</nav></header>`,
    '<main>',
    crumbs,
    '<article>',
    model.eyebrow ? `<p>${escapeHtml(model.eyebrow)}</p>` : '',
    `<h1>${escapeHtml(model.h1)}</h1>`,
    model.lead ? `<p>${escapeHtml(model.lead)}</p>` : '',
    model.image ? `<img src="${escapeHtml(model.image)}" alt="${escapeHtml(model.h1)}" width="1200" height="675">` : '',
    ...model.blocks.map(blockHtml),
    '</article>',
    '</main>',
    `<footer><p>${escapeHtml(site.hotel.name)}</p>${legal ? `<nav aria-label="Rechtliches">${legal}</nav>` : ''}</footer>`,
    '</div>',
  ].join('');
}

// Phones with their own hero picture must not download the desktop one first.
const PHONE_MEDIA = '(max-width: 600px)';

// Same choice of sizes as the hero itself, so the preloaded file is the one it shows.
function preload(src: string, sizes: string, media?: string) {
  const srcset = cdnSrcSet(src);
  const sized = srcset ? ` imagesrcset="${escapeHtml(srcset)}" imagesizes="${escapeHtml(sizes)}"` : '';
  return `<link rel="preload" as="image" href="${escapeHtml(src)}"${sized}${media ? ` media="${media}"` : ''}>`;
}

function imagePreloads(model: PageModel) {
  if (!model.image) return [];
  if (!model.imageMobile) return [preload(model.image, HERO_SIZES)];
  return [preload(model.imageMobile, '100vw', PHONE_MEDIA), preload(model.image, HERO_SIZES, '(min-width: 601px)')];
}

function headHtml(model: PageModel, site: SiteModel) {
  const url = site.url(model.path);
  const tags = [
    `<title>${escapeHtml(model.title)}</title>`,
    `<meta name="description" content="${escapeHtml(model.description)}">`,
    model.status === 200 ? `<link rel="canonical" href="${escapeHtml(url)}">` : '',
    `<meta name="robots" content="${model.status === 200 ? 'index, follow, max-image-preview:large' : 'noindex, follow'}">`,
    `<link rel="alternate" type="text/markdown" title="Inhalte für KI-Systeme" href="${escapeHtml(site.url('/llms.txt'))}">`,
    `<meta property="og:type" content="${model.path === '/' ? 'website' : 'article'}">`,
    `<meta property="og:site_name" content="${escapeHtml(site.hotel.name)}">`,
    `<meta property="og:locale" content="de_DE">`,
    `<meta property="og:title" content="${escapeHtml(model.title)}">`,
    `<meta property="og:description" content="${escapeHtml(model.description)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    model.image ? `<meta property="og:image" content="${escapeHtml(model.image)}">` : '',
    ...imagePreloads(model),
    `<meta name="twitter:card" content="${model.image ? 'summary_large_image' : 'summary'}">`,
    ...model.jsonLd.map((data) => `<script type="application/ld+json">${scriptJson(data)}</script>`),
  ];
  return tags.filter(Boolean).join('\n    ');
}

// Takes the built index.html and returns the page with its own head and readable content.
export function renderPage(template: string, model: PageModel, site: SiteModel, content: HotelContent) {
  const head = headHtml(model, site);
  const withoutStatic = template
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+(name|property)="(description|keywords|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
  const embedded = model.status === 200 ? `<script>window.__SITE_CONTENT__=${scriptJson(content)}</script>` : '';
  return withoutStatic
    .replace('</head>', `    ${head}\n  </head>`)
    .replace(/<div id="root"><\/div>/, `<div id="root">${contentCoreHtml(model, site)}</div>${embedded}`);
}

export function robotsTxt(site: SiteModel) {
  return [
    `# ${site.hotel.name}`,
    '# Inhalte dürfen von Suchmaschinen und KI-Systemen gelesen werden.',
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /cms',
    'Disallow: /api/',
    'Disallow: /app-shell.html',
    '',
    `Sitemap: ${site.url('/sitemap.xml')}`,
    '',
  ].join('\n');
}

export function sitemapXml(site: SiteModel) {
  const urls = site
    .allPaths()
    .map((link) => `  <url><loc>${escapeHtml(site.url(link.href))}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function markdownBlock(block: ContentBlock, level = '##') {
  const lines: string[] = [];
  if (block.heading) lines.push(`${level} ${block.heading}`, '');
  for (const text of block.text ?? []) lines.push(text, '');
  for (const item of block.items ?? []) {
    const title = item.href ? `[${item.title}](${item.href})` : item.title;
    lines.push(`- **${title}**${item.text ? `: ${item.text}` : ''}`);
    for (const fact of item.facts ?? []) lines.push(`  - ${fact}`);
  }
  if (block.items?.length) lines.push('');
  for (const link of block.links ?? []) lines.push(`- [${link.label}](${link.href})`);
  if (block.links?.length) lines.push('');
  return lines;
}

export function pageMarkdown(model: PageModel, site: SiteModel) {
  const lines = [`# ${model.h1}`, '', `Quelle: ${site.url(model.path)}`, ''];
  if (model.lead) lines.push(`> ${model.lead}`, '');
  for (const block of model.blocks) lines.push(...markdownBlock(block).map((line) => line.replace(/\]\((\/[^)]*)\)/g, (_, href) => `](${site.url(href)})`)));
  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}

// llms.txt: a short map of the hotel for language models (https://llmstxt.org).
export function llmsTxt(site: SiteModel) {
  const home = site.page('/');
  const lines = [`# ${site.hotel.name}`, '', `> ${home.description}`, ''];
  const contact = site.contact().text ?? [];
  if (contact.length) lines.push(contact.join(' · '), '');
  lines.push('## Seiten', '');
  for (const link of site.allPaths()) {
    const model = site.page(link.href);
    if (model.status !== 200) continue;
    lines.push(`- [${link.label}](${site.url(link.href)}): ${model.description}`);
  }
  lines.push('', '## Vollständige Inhalte', '', `- [Alle Seiten als Text](${site.url('/llms-full.txt')})`, '');
  return lines.join('\n');
}

export function llmsFullTxt(site: SiteModel) {
  return site
    .allPaths()
    .map((link) => site.page(link.href))
    .filter((model) => model.status === 200)
    .map((model) => pageMarkdown(model, site))
    .join('\n\n---\n\n');
}
