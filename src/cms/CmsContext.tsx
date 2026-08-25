import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useHotel, useHotelContent } from '../context/HotelContext';

interface CmsValue {
  active: true;
  selected: string | null;
  select: (key: string | null) => void;
  saving: boolean;
  saveError: string | null;
  saveSection: (sectionKey: string, data: Record<string, unknown>) => Promise<boolean>;
}

const CmsContext = createContext<CmsValue | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const hotel = useHotel();
  const { patchSection } = useHotelContent();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add('cms-on');
    return () => document.body.classList.remove('cms-on');
  }, []);

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
        select: setSelected,
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
