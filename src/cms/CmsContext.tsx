import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type HotelFAQ } from '../lib/supabase';
import { useHotel, useHotelContent } from '../context/HotelContext';
import {
  CMS_FRAME_SOURCE,
  cmsFrameDevice,
  cmsShellPath,
  isCmsFrame,
  isCmsFrameMessage,
  toCmsFrameHref,
} from './cmsFrame';
import { setPath } from './cmsDraft';
import { removedRecordIds } from './cmsHidden';
import type { FocalDevice } from './cmsFocal';
import { createUndoStack } from './cmsUndo';
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
  applyField: (sectionKey: string, path: string, value: unknown, quiet?: boolean) => void;
  focalPreview: FocalDevice;
  setFocalPreview: (device: FocalDevice) => void;
  setFrameWindow: (frame: Window | null) => void;
  canUndo: boolean;
  undo: () => void;
  saveSection: (sectionKey: string, data: Record<string, unknown>) => Promise<boolean>;
  saveFaqs: (faqs: HotelFAQ[]) => Promise<boolean>;
  canSave: boolean;
  setSaveAction: (action: (() => Promise<unknown>) | null) => void;
  runSave: () => Promise<unknown>;
  commitInline: (value: string) => void;
  cancelInline: () => void;
  openImage: (request: CmsImageRequest) => void;
  closeImage: () => void;
}

export const CmsContext = createContext<CmsValue | null>(null);

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
  const saveActionRef = useRef<(() => Promise<unknown>) | null>(null);
  const [canSave, setCanSave] = useState(false);
  const frameMode = isCmsFrame();
  const [focalPreview, setFocalPreview] = useState<FocalDevice>(() => cmsFrameDevice());
  const frameWindowRef = useRef<Window | null>(null);
  const setFrameWindow = useCallback((frame: Window | null) => {
    frameWindowRef.current = frame;
  }, []);
  const postPeer = useCallback((message: Record<string, unknown>) => {
    const payload = { source: CMS_FRAME_SOURCE, ...message };
    const origin = window.location.origin;
    if (frameMode) {
      window.parent?.postMessage(payload, origin);
      return;
    }
    frameWindowRef.current?.postMessage(payload, origin);
  }, [frameMode]);
  const setSaveAction = useCallback((action: (() => Promise<unknown>) | null) => {
    saveActionRef.current = action;
    setCanSave(Boolean(action));
  }, []);
  const runSave = useCallback(() => saveActionRef.current?.() ?? Promise.resolve(), []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const undoStack = useRef(createUndoStack());
  const [canUndo, setCanUndo] = useState(false);
  const inlineRef = useRef(inline);
  inlineRef.current = inline;
  const postPeerRef = useRef(postPeer);
  postPeerRef.current = postPeer;
  const frameModeRef = useRef(frameMode);
  frameModeRef.current = frameMode;
  const focalPreviewRef = useRef(focalPreview);
  focalPreviewRef.current = focalPreview;

  useEffect(() => {
    document.body.classList.add('cms-on');
    if (frameMode) {
      document.body.classList.add('cms-frame');
      if (focalPreview === 'mobile') document.body.classList.add('is-phone', 'has-mobile-dock');
    }
    return () => {
      document.body.classList.remove(
        'cms-on',
        'cms-view-mobile',
        'cms-view-desktop',
        'cms-frame',
        'is-phone',
        'has-mobile-dock',
      );
      delete document.body.dataset.cmsSection;
      delete document.body.dataset.cmsFocus;
    };
  }, [frameMode, focalPreview]);

  useEffect(() => {
    document.body.classList.toggle('cms-view-mobile', focalPreview === 'mobile');
    document.body.classList.toggle('cms-view-desktop', focalPreview === 'desktop');
  }, [focalPreview]);

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

  function rememberSection(sectionKey: string, key: string) {
    if (frameMode) return;
    const before = structuredClone(contentRef.current?.sections[sectionKey] ?? {});
    const size = undoStack.current.push({ kind: 'section', section: sectionKey, before }, key);
    setCanUndo(size > 0);
  }

  function rememberFaqs(key: string) {
    if (frameMode) return;
    const before = structuredClone(contentRef.current?.faqs ?? []);
    const size = undoStack.current.push({ kind: 'faqs', before }, key);
    setCanUndo(size > 0);
  }

  function preview(sectionKey: string, data: Record<string, unknown>, quiet = false, bridge = false) {
    const current = contentRef.current?.sections[sectionKey] ?? {};
    if (JSON.stringify(current) !== JSON.stringify(data)) {
      rememberSection(sectionKey, quiet ? `${sectionKey}:quiet` : `${sectionKey}:edit`);
    }
    patchSection(sectionKey, data);
    setDirty((current) => (current[sectionKey] ? current : { ...current, [sectionKey]: true }));
    if (!bridge) postPeer({ type: 'preview', section: sectionKey, data, quiet });
  }

  function previewFaqs(faqs: HotelFAQ[], bridge = false) {
    rememberFaqs('faqs:edit');
    patchFaqs(faqs);
    setDirty((current) => (current.faq_page ? current : { ...current, faq_page: true }));
    if (!bridge) postPeer({ type: 'preview-faqs', faqs });
  }

  function undo() {
    const entry = undoStack.current.pop();
    setCanUndo(undoStack.current.size > 0);
    if (!entry) return;
    if (entry.kind === 'faqs') {
      const faqs = (entry.before as HotelFAQ[]) ?? [];
      patchFaqs(faqs);
      postPeer({ type: 'preview-faqs', faqs });
    } else {
      patchSection(entry.section, entry.before);
      postPeer({ type: 'preview', section: entry.section, data: entry.before, quiet: false });
    }
    setDraftTick((tick) => tick + 1);
  }

  function applyField(sectionKey: string, path: string, value: unknown, quiet = false) {
    const current = contentRef.current?.sections[sectionKey] ?? {};
    preview(sectionKey, setPath(current, path, value), quiet);
    if (!quiet) setDraftTick((tick) => tick + 1);
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
      if (target instanceof Element && target.closest('.cms-inline, [data-cms-ui], .cms-block__eye, .cms-item-delete')) return;
      if (target instanceof Element && target.closest('[data-cms-pan].is-panned')) {
        event.preventDefault();
        event.stopPropagation();
        target.closest('[data-cms-pan]')?.classList.remove('is-panned');
        return;
      }

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
            const next = frameModeRef.current
              ? toCmsFrameHref(url.pathname, focalPreviewRef.current, url.search, url.hash)
              : `${url.pathname}${url.search}${url.hash}`;
            navigateRef.current(next);
            if (frameModeRef.current) {
              postPeerRef.current({ type: 'navigate', path: cmsShellPath(url.pathname, url.search, url.hash) });
            }
            return;
          }
        }
      }

      const next = selectionFromEvent(event);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      setSelected(next);
      postPeerRef.current({ type: 'select', section: next.section, focus: next.focus, path: next.path });

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

  function select(section: string | null, focus?: string | null, path?: string | null, bridge = false) {
    setSelected(section ? { section, focus: focus || undefined, path: path || undefined } : null);
    if (!bridge) postPeer({ type: 'select', section, focus, path });
  }

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || !isCmsFrameMessage(event.data)) return;
      const message = event.data;
      if (message.type === 'ready' && !frameModeRef.current) {
        const sections = contentRef.current?.sections ?? {};
        postPeerRef.current({ type: 'hydrate', sections, faqs: contentRef.current?.faqs });
        return;
      }
      if (message.type === 'hydrate') {
        Object.entries(message.sections).forEach(([section, data]) => patchSection(section, data));
        if (Array.isArray(message.faqs)) patchFaqs(message.faqs as HotelFAQ[]);
        return;
      }
      if (message.type === 'preview') {
        preview(message.section, message.data, Boolean(message.quiet), true);
        if (!message.quiet) setDraftTick((tick) => tick + 1);
        return;
      }
      if (message.type === 'preview-faqs') {
        previewFaqs(message.faqs as HotelFAQ[], true);
        return;
      }
      if (message.type === 'select') {
        select(message.section, message.focus, message.path, true);
        return;
      }
      if (message.type === 'navigate' && !frameModeRef.current) {
        navigateRef.current(message.path);
        return;
      }
      if (message.type === 'open-image' && !frameModeRef.current) {
        setImageRequest(message.request as CmsImageRequest);
      }
    }
    window.addEventListener('message', onMessage);
    if (frameMode) postPeer({ type: 'ready' });
    return () => window.removeEventListener('message', onMessage);
  }, [frameMode, patchFaqs, patchSection, postPeer]);

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
    const removed = removedRecordIds(
      (contentRef.current?.faqs ?? []).map((faq) => faq.id).filter((id) => !id.startsWith('new-')),
      existing.map((faq) => faq.id),
    );
    if (removed.length) {
      const result = await supabase.from('hotel_faqs').delete().eq('hotel_id', hotel.id).in('id', removed);
      if (result.error) {
        setSaving(false);
        setSaveError(result.error.message);
        return false;
      }
    }

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
        focalPreview,
        setFocalPreview,
        setFrameWindow,
        canUndo,
        undo,
        saveSection,
        saveFaqs,
        canSave,
        setSaveAction,
        runSave,
        commitInline,
        cancelInline,
        openImage: (request) => {
          if (frameMode) postPeer({ type: 'open-image', request });
          else setImageRequest(request);
        },
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
