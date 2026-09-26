import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CMS_ICON_NAMES } from '../cms/cmsIcons';
import { supabase } from '../lib/supabase';
import {
  generateLucideMark,
  matchIconFromDescription,
  rowToIcon,
  sanitizeSvg,
  slugifyIconName,
  type CmsIconRecord,
} from '../lib/cmsIconLibrary';

type IconLibraryValue = {
  icons: CmsIconRecord[];
  loading: boolean;
  addIcon: (input: {
    name: string;
    description?: string;
    tags?: string[];
    svgText?: string;
    imageUrl?: string;
  }) => Promise<{ error?: string; icon?: CmsIconRecord }>;
  reload: () => Promise<void>;
};

const IconLibraryContext = createContext<IconLibraryValue>({
  icons: [],
  loading: true,
  addIcon: async () => ({}),
  reload: async () => undefined,
});

function lucideRecords(): CmsIconRecord[] {
  return CMS_ICON_NAMES.map((name) => ({
    name,
    kind: 'lucide' as const,
    tags: [],
    description: '',
  }));
}

export function IconLibraryProvider({ children }: { children: ReactNode }) {
  const [custom, setCustom] = useState<CmsIconRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const { data, error } = await supabase.from('cms_icons').select('*').order('name');
    setCustom(error ? [] : (data ?? []).map((row) => rowToIcon(row as Record<string, unknown>)));
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, []);

  const icons = useMemo(() => {
    const seen = new Set<string>();
    const next: CmsIconRecord[] = [];
    for (const icon of [...custom, ...lucideRecords()]) {
      if (seen.has(icon.name)) continue;
      seen.add(icon.name);
      next.push(icon);
    }
    return next.sort((a, b) => a.name.localeCompare(b.name));
  }, [custom]);

  async function addIcon(input: {
    name: string;
    description?: string;
    tags?: string[];
    svgText?: string;
    imageUrl?: string;
  }) {
    const description = input.description?.trim() ?? '';
    const requested = slugifyIconName(input.name || description || 'Icon');
    let record: CmsIconRecord;

    if (input.svgText) {
      record = {
        name: requested,
        kind: 'svg',
        svg: sanitizeSvg(input.svgText),
        tags: input.tags ?? [],
        description,
      };
    } else if (input.imageUrl) {
      record = {
        name: requested,
        kind: 'image',
        image_url: input.imageUrl,
        tags: input.tags ?? [],
        description,
      };
    } else {
      const matched = matchIconFromDescription(description || requested, icons.map((item) => item.name));
      if (matched) {
        record = {
          name: matched,
          kind: 'lucide',
          tags: input.tags ?? [],
          description,
        };
      } else {
        record = {
          name: requested,
          kind: 'svg',
          svg: generateLucideMark(requested, description),
          tags: input.tags ?? [],
          description,
        };
      }
    }

    const result = await supabase.from('cms_icons').upsert(
      {
        name: record.name,
        kind: record.kind,
        svg: record.svg ?? null,
        image_url: record.image_url ?? null,
        tags: record.tags,
        description: record.description,
      },
      { onConflict: 'name' },
    );
    if (result.error) return { error: result.error.message };
    await reload();
    return { icon: record };
  }

  return (
    <IconLibraryContext.Provider value={{ icons, loading, addIcon, reload }}>
      {children}
    </IconLibraryContext.Provider>
  );
}

export function useIconLibrary() {
  return useContext(IconLibraryContext);
}
