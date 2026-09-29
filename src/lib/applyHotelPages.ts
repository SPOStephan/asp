import { supabase } from './supabase';
import { canResumeHotelSlug, isHotelSlugConflict } from './hotelSave';
import {
  pageRowsForHotel,
  rowToTemplate,
  sectionsToSeed,
  SYSTEM_TEMPLATES,
  type PageTemplate,
} from './pageTemplates';

export { findHotelBySlug, isHotelSlugConflict } from './hotelSave';

export async function saveHotelRecord(
  payload: Record<string, unknown> & { slug: string },
  existingId?: string,
): Promise<{ id?: string; error?: string; recovered?: boolean }> {
  if (existingId) {
    const result = await supabase.from('hotels').update(payload).eq('id', existingId).select('id').single();
    if (result.error || !result.data) {
      return { error: result.error?.message ?? 'Hotel konnte nicht gespeichert werden.' };
    }
    return { id: String(result.data.id) };
  }

  const inserted = await supabase.from('hotels').insert(payload).select('id').single();
  if (!inserted.error && inserted.data) {
    return { id: String(inserted.data.id) };
  }

  if (isHotelSlugConflict(inserted.error?.message) && canResumeHotelSlug(payload.slug)) {
    const existing = await supabase.from('hotels').select('id').eq('slug', payload.slug).maybeSingle();
    if (existing.data?.id) {
      const updated = await supabase
        .from('hotels')
        .update(payload)
        .eq('id', existing.data.id)
        .select('id')
        .single();
      if (updated.error || !updated.data) {
        return { error: updated.error?.message ?? 'Hotel konnte nicht gespeichert werden.' };
      }
      return { id: String(updated.data.id), recovered: true };
    }
  }

  return { error: inserted.error?.message ?? 'Hotel konnte nicht gespeichert werden.' };
}

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

export async function cloneHotelContent(
  sourceHotelId: string,
  targetHotelId: string,
): Promise<{ error?: string }> {
  if (!sourceHotelId || sourceHotelId === targetHotelId) return {};

  const [sections, faqs] = await Promise.all([
    supabase.from('hotel_sections').select('section_key, data').eq('hotel_id', sourceHotelId),
    supabase
      .from('hotel_faqs')
      .select('category, question, answer, sort_order, show_on_home')
      .eq('hotel_id', sourceHotelId),
  ]);
  if (sections.error) return { error: sections.error.message };
  if (faqs.error) return { error: faqs.error.message };

  if (sections.data?.length) {
    const sectionResult = await supabase.from('hotel_sections').upsert(
      sections.data.map((row) => ({
        hotel_id: targetHotelId,
        section_key: row.section_key,
        data: row.data,
      })),
      { onConflict: 'hotel_id,section_key' },
    );
    if (sectionResult.error) return { error: sectionResult.error.message };
  }

  if (faqs.data?.length) {
    const cleared = await supabase.from('hotel_faqs').delete().eq('hotel_id', targetHotelId);
    if (cleared.error) return { error: cleared.error.message };
    const faqResult = await supabase.from('hotel_faqs').insert(
      faqs.data.map((row) => ({
        hotel_id: targetHotelId,
        category: row.category,
        question: row.question,
        answer: row.answer,
        sort_order: row.sort_order,
        show_on_home: row.show_on_home,
      })),
    );
    if (faqResult.error) return { error: faqResult.error.message };
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
