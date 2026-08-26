import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useHotel, useHotelContent } from '../context/HotelContext';
import { setPath } from './cmsDraft';
import {
  hitKind,
  inferAltPath,
  isPlainTextHost,
  selectionFromEvent,
  type CmsImageRequest,
  type CmsInline,
  type CmsSelection,
} from './cmsSelect';

interface CmsValue {
  active: true;
  selected: CmsSelection | null;
  select: (section: string | null, focus?: string | null, path?: string | null) => void;
  dirty: Record<string, boolean>;
  draftTick: number;
  inline: CmsInline | null;
  imageRequest: CmsImageRequest | null;
  saving: boolean;
  saveError: string | null;
  preview: (sectionKey: string, data: Record<string, unknown>) => void;
  applyField: (sectionKey: string, path: string, value: unknown) => void;
  saveSection: (sectionKey: string, data: Record<string, unknown>) => Promise<boolean>;
  commitInline: (value: string) => void;
  cancelInline: () => void;
  openImage: (request: CmsImageRequest) => void;
  closeImage: () => void;
}

const CmsContext = createContext<CmsValue | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const hotel = useHotel();
  const { patchSection, content } = useHotelContent();
  const contentRef = useRef(content);
  contentRef.current = content;
  const [selected, setSelected] = useState<CmsSelection | null>(null);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [draftTick, setDraftTick] = useState(0);
  const [inline, setInline] = useState<CmsInline | null>(null);
  const [imageRequest, setImageRequest] = useState<CmsImageRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const inlineRef = useRef(inline);
  inlineRef.current = inline;

  useEffect(() => {
    document.body.classList.add('cms-on');
    return () => {
      document.body.classList.remove('cms-on');
      delete document.body.dataset.cmsSection;
      delete document.body.dataset.cmsFocus;
    };
  }, []);

  useEffect(() => {
    if (selected) {
      document.body.dataset.cmsSection = selected.section;
      if (selected.focus) document.body.dataset.cmsFocus = selected.focus;
      else delete document.body.dataset.cmsFocus;
    } else {
      delete document.body.dataset.cmsSection;
      delete document.body.dataset.cmsFocus;
    }

    document.querySelectorAll('[data-cms-focus].is-on').forEach((node) => node.classList.remove('is-on'));
    if (selected?.focus) {
      document
        .querySelectorAll(`[data-cms-focus="${CSS.escape(selected.focus)}"]`)
        .forEach((node) => node.classList.add('is-on'));
    }
  }, [selected]);

  function preview(sectionKey: string, data: Record<string, unknown>) {
    patchSection(sectionKey, data);
    setDirty((current) => ({ ...current, [sectionKey]: true }));
  }

  function applyField(sectionKey: string, path: string, value: unknown) {
    const current = contentRef.current?.sections[sectionKey] ?? {};
    preview(sectionKey, setPath(current, path, value));
    setDraftTick((tick) => tick + 1);
  }

  function commitInline(value: string) {
    const current = inlineRef.current;
    if (!current) return;
    applyField(current.section, current.path, value);
    setInline(null);
  }

  function cancelInline() {
    const current = inlineRef.current;
    if (current) {
      const el = document.querySelector(`.cms-stage [data-cms-path="${CSS.escape(current.path)}"]`);
      if (el instanceof HTMLElement) el.innerText = current.original;
    }
    setInline(null);
  }

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (target instanceof Element && target.closest('.cms-inline')) return;

      if (inlineRef.current && target instanceof Element && !target.closest('[data-cms-editing]')) {
        const el = document.querySelector(`.cms-stage [data-cms-path="${CSS.escape(inlineRef.current.path)}"]`);
        commitInline(el instanceof HTMLElement ? el.innerText : inlineRef.current.original);
      }

      const next = selectionFromEvent(event);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      setSelected(next);

      const kind = hitKind(next, event.target);
      const path = next.path;
      if (kind === 'image') {
        const imagePath = path || inferImagePath(next);
        if (imagePath) {
          setImageRequest({ section: next.section, path: imagePath, altPath: inferAltPath(imagePath) });
        }
        return;
      }
      if (kind === 'text' && path && isPlainTextHost(event.target instanceof Element ? event.target.closest('[data-cms-path]') : null)) {
        const host = event.target instanceof Element ? event.target.closest('[data-cms-path]') : null;
        if (host instanceof HTMLElement) {
          setInline({ section: next.section, path, original: host.innerText });
        }
      }
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  function select(section: string | null, focus?: string | null, path?: string | null) {
    setSelected(section ? { section, focus: focus || undefined, path: path || undefined } : null);
  }

  async function saveSection(sectionKey: string, data: Record<string, unknown>) {
    if (!hotel) return false;
    setSaving(true);
    setSaveError(null);
    const result = await supabase.from('hotel_sections').upsert(
      { hotel_id: hotel.id, section_key: sectionKey, data },
      { onConflict: 'hotel_id,section_key' },
    );
    setSaving(false);
    if (result.error) {
      setSaveError(result.error.message);
      return false;
    }
    patchSection(sectionKey, data);
    setDirty((current) => ({ ...current, [sectionKey]: false }));
    return true;
  }

  return (
    <CmsContext.Provider
      value={{
        active: true,
        selected,
        select,
        dirty,
        draftTick,
        inline,
        imageRequest,
        saving,
        saveError,
        preview,
        applyField,
        saveSection,
        commitInline,
        cancelInline,
        openImage: setImageRequest,
        closeImage: () => setImageRequest(null),
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

function inferImagePath(selection: CmsSelection) {
  if (selection.focus === 'feature_left') return 'feature_image_left';
  if (selection.focus === 'feature_right') return 'feature_image_right';
  if (selection.focus === 'image') {
    if (selection.section === 'hero') return 'hero_image';
    if (selection.section === 'rooms_page') return 'hero_image';
    return 'image';
  }
  return selection.path;
}

export function useCms() {
  return useContext(CmsContext);
}
