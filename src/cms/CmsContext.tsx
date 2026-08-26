import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useHotel, useHotelContent } from '../context/HotelContext';
import { selectionFromEvent, type CmsSelection } from './cmsSelect';

interface CmsValue {
  active: true;
  selected: CmsSelection | null;
  select: (section: string | null, focus?: string | null) => void;
  saving: boolean;
  saveError: string | null;
  saveSection: (sectionKey: string, data: Record<string, unknown>) => Promise<boolean>;
}

const CmsContext = createContext<CmsValue | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const hotel = useHotel();
  const { patchSection } = useHotelContent();
  const [selected, setSelected] = useState<CmsSelection | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const next = selectionFromEvent(event);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      setSelected(next);
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  function select(section: string | null, focus?: string | null) {
    setSelected(section ? { section, focus: focus || undefined } : null);
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
    return true;
  }

  return (
    <CmsContext.Provider
      value={{
        active: true,
        selected,
        select,
        saving,
        saveError,
        saveSection,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  return useContext(CmsContext);
}
