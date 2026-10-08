import { createClient } from '@supabase/supabase-js';
import { normalizePath, SiteModel } from '../src/site/pageModel';
import {
  canonicalOrigin,
  isPrivatePath,
  llmsFullTxt,
  llmsTxt,
  renderPage,
  robotsTxt,
  sitemapXml,
} from '../src/site/renderSite';
import { siteCacheTag } from '../src/site/cacheTag';
import { loadSiteContent } from '../src/site/siteData';

// Every page request and the crawler files (robots.txt, sitemap.xml, llms.txt) end up here,
// so crawlers and AI systems get finished HTML instead of an empty app shell.

const TEMPLATE_HEADER = 'x-site-template';
const CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400';
let template: { html: string; at: number } | null = null;

function env(name: string) {
  return (process.env[name] || '').trim();
}

function requestHost(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  return host.split(',')[0].trim().toLowerCase();
}

async function loadTemplate(host: string) {
  if (template && Date.now() - template.at < 60_000) return template.html;
  const response = await fetch(`https://${host}/app-shell.html`, { headers: { [TEMPLATE_HEADER]: '1' } });
  if (!response.ok) throw new Error(`app-shell.html ${response.status}`);
  template = { html: await response.text(), at: Date.now() };
  return template.html;
}

function text(body: string, type: string, tag: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': CACHE, 'Vercel-Cache-Tag': tag } });
}

export default async function handler(request: Request) {
  if (request.headers.get(TEMPLATE_HEADER)) return new Response('Not found', { status: 404 });
  const url = new URL(request.url);
  const host = requestHost(request);
  const file = url.searchParams.get('file');
  const path = normalizePath(url.searchParams.get('path') ?? '/');

  if (!file && isPrivatePath(path)) {
    const html = await loadTemplate(host);
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
    });
  }

  const client = createClient(env('VITE_SUPABASE_URL'), env('VITE_SUPABASE_ANON_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let content;
  try {
    content = await loadSiteContent(client, host.split(':')[0]);
  } catch {
    // Without data the visitor still gets the app, which loads the content itself.
    if (file) return new Response('Vorübergehend nicht verfügbar.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
    return new Response(await loadTemplate(host), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  const tag = siteCacheTag(content.hotel.id);
  const site = new SiteModel(content, canonicalOrigin(content.hotel.domains, host), `https://${host}`);

  if (file === 'robots') return text(robotsTxt(site), 'text/plain', tag);
  if (file === 'sitemap') return text(sitemapXml(site), 'application/xml', tag);
  if (file === 'llms') return text(llmsTxt(site), 'text/markdown', tag);
  if (file === 'llms-full') return text(llmsFullTxt(site), 'text/markdown', tag);

  const model = site.page(path);
  const html = renderPage(await loadTemplate(host), model, site, content);
  return new Response(html, {
    status: model.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': model.status === 200 ? CACHE : 'public, max-age=0, s-maxage=60',
      Link: `<${site.url('/llms.txt')}>; rel="alternate"; type="text/markdown"`,
      'Vercel-Cache-Tag': tag,
    },
  });
}

export const config = { runtime: 'edge' };
