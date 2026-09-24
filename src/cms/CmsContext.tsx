import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type HotelFAQ } from '../lib/supabase';
import { useHotel, useHotelContent } from '../context/HotelContext';
import { setPath } from './cmsDraft';
import {
  hitKind,
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
  previewFaqs: (faqs: HotelFAQ[]) => void;
  applyField: (sectionKey: string, path: string, value: unknown) => void;
  saveSection: (sectionKey: string, data: Record<string, unknown>) => Promise<boolean>;
  saveFaqs: (faqs: HotelFAQ[]) => Promise<boolean>;
  commitInline: (value: string) => void;
  cancelInline: () => void;
  openImage: (request: CmsImageRequest) => void;
  closeImage: () => void;
}

const CmsContext = createContext<CmsValue | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const hotel = useHotel();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const { patchSection, patchFaqs, content } = useHotelContent();
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
    setDirty((current) => (current[sectionKey] ? current : { ...current, [sectionKey]: true }));
  }

  function previewFaqs(faqs: HotelFAQ[]) {
    patchFaqs(faqs);
    setDirty((current) => (current.faq_page ? current : { ...current, faq_page: true }));
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

      if (target instanceof Element) {
        const navEl = target.closest('[data-cms-nav]');
        if (navEl instanceof HTMLAnchorElement) {
          const href = navEl.getAttribute('href');
          if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            event.preventDefault();
            event.stopPropagation();
            const url = new URL(href, window.location.origin);
            navigateRef.current(`${url.pathname}${url.search}${url.hash}`);
            return;
          }
        }
      }

      const next = selectionFromEvent(event);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      setSelected(next);

      const kind = hitKind(next, event.target);
      const path = next.path;
      if (kind === 'image') {
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

  async function saveFaqs(faqs: HotelFAQ[]) {
    if (!hotel) return false;
    setSaving(true);
    setSaveError(null);
    const toRow = (faq: HotelFAQ, index: number) => ({
      hotel_id: hotel.id,
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      sort_order: index,
      show_on_home: faq.show_on_home,
    });
    const existing = faqs
      .map((faq, index) => ({ faq, index }))
      .filter(({ faq }) => !faq.id.startsWith('new-'))
      .map(({ faq, index }) => ({ id: faq.id, ...toRow(faq, index) }));
    const created = faqs
      .map((faq, index) => ({ faq, index }))
      .filter(({ faq }) => faq.id.startsWith('new-'))
      .map(({ faq, index }) => toRow(faq, index));

    if (existing.length) {
      const result = await supabase.from('hotel_faqs').upsert(existing);
      if (result.error) {
        setSaving(false);
        setSaveError(result.error.message);
        return false;
      }
    }
    if (created.length) {
      const result = await supabase.from('hotel_faqs').insert(created);
      if (result.error) {
        setSaving(false);
        setSaveError(result.error.message);
        return false;
      }
    }

    const reload = await supabase
      .from('hotel_faqs')
      .select('*')
      .eq('hotel_id', hotel.id)
      .order('sort_order', { ascending: true });
    setSaving(false);
    if (reload.error) {
      setSaveError(reload.error.message);
      return false;
    }
    patchFaqs((reload.data as HotelFAQ[] | null) ?? faqs);
    setDirty((current) => ({ ...current, faq_page: false }));
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
        previewFaqs,
        applyField,
        saveSection,
        saveFaqs,
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

export function useCms() {
  return useContext(CmsContext);
}
