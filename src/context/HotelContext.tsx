import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isAdminHost, isAdminPath } from '../admin/adminHost';
import { loadHotelContent, type HotelContent } from '../lib/hotelData';
import type { MusterPageKey } from '../lib/musterPages';

interface HotelContextValue {
  content: HotelContent | null;
  loading: boolean;
  error: string | null;
  isPageEnabled: (key: MusterPageKey) => boolean;
  patchSection: (sectionKey: string, data: Record<string, unknown>) => void;
  reload: () => Promise<void>;
}

const HotelContext = createContext<HotelContextValue>({
  content: null,
  loading: true,
  error: null,
  isPageEnabled: () => true,
  patchSection: () => undefined,
  reload: async () => undefined,
});

export function HotelProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const skipHotel = isAdminHost() || isAdminPath(location.pathname);
  const [content, setContent] = useState<HotelContent | null>(null);
  const [loading, setLoading] = useState(!skipHotel);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await loadHotelContent();
    setContent(data);
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
          setContent(data);
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
        isPageEnabled: (key) => content?.pages[key] !== false,
        patchSection: (sectionKey, data) => {
          setContent((current) =>
            current
              ? { ...current, sections: { ...current.sections, [sectionKey]: data } }
              : current,
          );
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
  return content?.sections[sectionKey] ?? null;
}

export function useHotel() {
  const { content } = useContext(HotelContext);
  return content?.hotel ?? null;
}

export function usePageEnabled(key: MusterPageKey) {
  return useHotelContent().isPageEnabled(key);
}
