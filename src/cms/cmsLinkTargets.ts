import type { HotelContent } from '../lib/hotelData';
import { blogHref, resolveBlogPosts } from '../lib/blog';
import { remapSiteHref } from '../lib/links';
import { offerHref, resolveOfferStories } from '../lib/offers';
import { genericSectionKey, SYSTEM_TEMPLATES, type PageTemplate } from '../lib/pageTemplates';
import { resolveRooms, roomHref } from '../lib/rooms';
import { resolveWellnessTopics, wellnessTopicHref } from '../lib/wellness';

export type CmsLinkTarget = {
  href: string;
  label: string;
  group: string;
  // false: the page exists as a template but is not switched on for this hotel yet.
  active: boolean;
};

// Every page of the hotel a link in the CMS can point to, for the link picker.
export function cmsLinkTargets(content: HotelContent | null, templates: PageTemplate[] = SYSTEM_TEMPLATES): CmsLinkTarget[] {
  const pages = content?.pages ?? {};
  const sections = content?.sections ?? {};
  const targets: CmsLinkTarget[] = [{ href: '/', label: 'Startseite', group: 'Seiten', active: true }];
  const known = new Set<string>(['home']);

  for (const template of templates) {
    if (template.template_key === 'home') continue;
    known.add(template.template_key);
    targets.push({ href: template.path_prefix, label: template.title, group: 'Seiten', active: pages[template.template_key] === true });
  }
  for (const [key, on] of Object.entries(pages)) {
    if (known.has(key)) continue;
    const title = String(sections[genericSectionKey(key)]?.title || key);
    targets.push({ href: `/seite/${key}`, label: title, group: 'Eigene Seiten', active: on });
  }
  for (const room of resolveRooms(sections.rooms_page?.items)) {
    targets.push({ href: roomHref(room.id), label: room.name, group: 'Zimmer', active: pages.zimmer === true });
  }
  for (const topic of resolveWellnessTopics(sections.wellness_page?.items)) {
    targets.push({ href: wellnessTopicHref(topic.id), label: topic.name, group: 'Wellness', active: pages.wellness === true });
  }
  for (const offer of resolveOfferStories(sections.offers_page?.items, sections.offers?.items)) {
    targets.push({ href: offerHref(offer.id), label: offer.title, group: 'Angebote', active: pages.angebote === true });
  }
  for (const post of resolveBlogPosts(sections.blog_page?.items)) {
    targets.push({ href: blogHref(post.slug), label: post.title, group: 'Journal', active: pages.blog === true });
  }
  return targets;
}

export function isExternalHref(href: string) {
  return /^(https?:)?\/\//i.test(href.trim()) || /^(mailto|tel):/i.test(href.trim());
}

export function matchLinkTarget(targets: CmsLinkTarget[], href: string, label?: string) {
  const resolved = remapSiteHref(href, label);
  return targets.find((target) => target.href === resolved || target.href === href) ?? null;
}

export function filterLinkTargets(targets: CmsLinkTarget[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return targets;
  return targets.filter((target) => `${target.label} ${target.group} ${target.href}`.toLowerCase().includes(needle));
}
