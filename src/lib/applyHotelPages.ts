import { supabase } from './supabase';
import {
  pageRowsForHotel,
  rowToTemplate,
  sectionsToSeed,
  SYSTEM_TEMPLATES,
  type PageTemplate,
} from './pageTemplates';

export async function loadPageTemplates(): Promise<PageTemplate[]> {
  const { data, error } = await supabase
    .from('page_templates')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true });
  if (error || !data?.length) return SYSTEM_TEMPLATES;
  return data.map((row) => rowToTemplate(row as Record<string, unknown>));
}

export async function applyHotelPageSelection(
  hotelId: string,
  selectedKeys: string[],
  templates?: PageTemplate[],
): Promise<{ error?: string }> {
  const catalog = templates ?? (await loadPageTemplates());
  const rows = pageRowsForHotel(hotelId, catalog, selectedKeys);
  const pageResult = await supabase.from('hotel_pages').upsert(rows, { onConflict: 'hotel_id,page_key' });
  if (pageResult.error) return { error: pageResult.error.message };

  const existing = await supabase.from('hotel_sections').select('section_key').eq('hotel_id', hotelId);
  if (existing.error) return { error: existing.error.message };
  const missing = sectionsToSeed(
    catalog,
    selectedKeys,
    (existing.data ?? []).map((row) => String(row.section_key)),
  ).map((row) => ({ hotel_id: hotelId, ...row }));
  if (missing.length) {
    const sectionResult = await supabase.from('hotel_sections').insert(missing);
    if (sectionResult.error) return { error: sectionResult.error.message };
  }
  return {};
}

export async function saveLibraryTemplate(template: PageTemplate): Promise<{ error?: string; template?: PageTemplate }> {
  const payload = {
    template_key: template.template_key,
    title: template.title,
    description: template.description,
    path_prefix: template.path_prefix,
    tags: template.tags,
    preview_url: template.preview_url,
    kind: 'library',
    layout_key: template.layout_key,
    section_keys: template.section_keys,
    skeleton: template.skeleton,
    default_selected: false,
    required: false,
    sort_order: template.sort_order,
    created_from_hotel_id: template.created_from_hotel_id ?? null,
  };
  const result = await supabase.from('page_templates').insert(payload).select('*').single();
  if (result.error) return { error: result.error.message };
  return { template: rowToTemplate(result.data as Record<string, unknown>) };
}

export async function updateLibraryTemplate(
  id: string,
  patch: Partial<Pick<PageTemplate, 'title' | 'description' | 'tags' | 'preview_url'>>,
): Promise<{ error?: string }> {
  const result = await supabase.from('page_templates').update(patch).eq('id', id);
  if (result.error) return { error: result.error.message };
  return {};
}
