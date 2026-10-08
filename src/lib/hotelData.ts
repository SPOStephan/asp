import { loadSiteContent, type HotelContent } from '../site/siteData';
import { supabase } from './supabase';

export type { HotelContent } from '../site/siteData';

declare global {
  interface Window {
    __SITE_CONTENT__?: HotelContent;
  }
}

function resolveDomain(): string {
  if (typeof window === 'undefined') return 'localhost';
  return window.location.hostname;
}

// Content the server already rendered into the page, so the first paint needs no extra request.
export function takeEmbeddedContent(): HotelContent | null {
  if (typeof window === 'undefined') return null;
  const content = window.__SITE_CONTENT__ ?? null;
  delete window.__SITE_CONTENT__;
  return content;
}

export async function loadHotelContent(): Promise<HotelContent> {
  return loadSiteContent(supabase, resolveDomain());
}
