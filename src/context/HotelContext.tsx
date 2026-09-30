import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isAdminHost, isAdminPath } from '../admin/adminHost';
import { applyLiveMedia, useLiveMediaTick } from '../cms/cmsLiveMedia';
import { isCmsPath } from '../cms/cmsHost';
import { loadHotelContent, type HotelContent } from '../lib/hotelData';
import { mergeHotelLoad } from '../lib/hotelMerge';
import type { HotelFAQ } from '../lib/supabase';
import type { MusterPageKey } from '../lib/musterPages';

interface HotelContextValue {
  content: HotelContent | null;
  loading: boolean;
  error: string | null;
  isPageEnabled: (key: MusterPageKey) => boolean;
  patchSection: (sectionKey: string, data: Record<string, unknown>) => void;
  patchFaqs: (faqs: HotelFAQ[]) => void;
  enablePages: (keys: string[]) => void;
  reload: () => Promise<void>;
}

const HotelContext = createContext<HotelContextValue>({
  content: null,
  loading: true,
  error: null,
  isPageEnabled: () => true,
  patchSection: () => undefined,
  patchFaqs: () => undefined,
  enablePages: () => undefined,
  reload: async () => undefined,
});

export function HotelProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const skipHotel = isAdminHost() || isAdminPath(location.pathname);
  const [content, setContent] = useState<HotelContent | null>(null);
  const [loading, setLoading] = useState(!skipHotel);
  const [error, setError] = useState<string | null>(null);
  const pendingSections = useRef<Record<string, Record<string, unknown>>>({});
  const pendingFaqs = useRef<HotelFAQ[] | null>(null);

  async function load() {
    const data = await loadHotelContent();
    setContent((current) => {
      const next = mergeHotelLoad(data, current, pendingSections.current, pendingFaqs.current);
      pendingSections.current = {};
      pendingFaqs.current = null;
      return next;
    });
  }

  useEffect(() => {
    if (skipHotel) {
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await loadHotelContent();
        if (!cancelled) {
          setContent((current) => {
            const next = mergeHotelLoad(data, current, pendingSections.current, pendingFaqs.current);
            pendingSections.current = {};
            pendingFaqs.current = null;
            return next;
          });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load content');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [skipHotel]);

  useEffect(() => {
    if (!content) return;
    const hotel = content.hotel;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', hotel.primary_color);
    root.style.setProperty('--color-secondary', hotel.secondary_color);
    root.style.setProperty('--color-accent', hotel.accent_color);
    root.style.setProperty('--color-text', hotel.text_color);
    root.style.setProperty('--color-background', hotel.background_color);
    if (hotel.seo_title) {
      document.title = hotel.seo_title;
    }
    if (hotel.seo_description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', hotel.seo_description);
    }
  }, [content]);

  return (
    <HotelContext.Provider
      value={{
        content,
        loading,
        error,
        isPageEnabled: (key) => key === 'home' || content?.pages[key] === true,
        patchSection: (sectionKey, data) => {
          setContent((current) => {
            if (!current) {
              pendingSections.current[sectionKey] = data;
              return current;
            }
            return { ...current, sections: { ...current.sections, [sectionKey]: data } };
          });
        },
        patchFaqs: (faqs) => {
          setContent((current) => {
            if (!current) {
              pendingFaqs.current = faqs;
              return current;
            }
            return { ...current, faqs };
          });
        },
        enablePages: (keys) => {
          setContent((current) => {
            if (!current || !keys.length) return current;
            const pages = { ...current.pages };
            keys.forEach((key) => {
              pages[key] = true;
            });
            return { ...current, pages };
          });
        },
        reload: async () => {
          await load();
        },
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export function useHotelContent(): HotelContextValue {
  return useContext(HotelContext);
}

export function useSection(sectionKey: string): Record<string, any> | null {
  const { content } = useContext(HotelContext);
  useLiveMediaTick();
  const raw = content?.sections[sectionKey] ?? null;
  if (!raw) return null;
  if (typeof window !== 'undefined' && isCmsPath(window.location.pathname)) {
    return applyLiveMedia(sectionKey, raw);
  }
  return raw;
}

export function useHotel() {
  const { content } = useContext(HotelContext);
  return content?.hotel ?? null;
}

export function usePageEnabled(key: MusterPageKey) {
  return useHotelContent().isPageEnabled(key);
}
