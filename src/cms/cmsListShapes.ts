// The fields of a new entry in a list that is still empty (a new hotel has no examples to
// copy from). Keys: "<section>:<list>".
export const CMS_LIST_SHAPES: Record<string, Record<string, unknown>> = {
  'wellness_page:items': { id: '', name: '', kicker: '', tile_cta: '', summary: '', text: [''], details: [], includes: [], image: '', image_alt: '', hero_image: '', hero_image_alt: '' },
  'wellness_page:chapters': { id: '', kicker: '', title: '', text: '', href: '', cta: '', image: '', image_alt: '' },
  'culinary_page:items': { id: '', name: '', kicker: '', text: '', details: [], includes: [], image: '', image_alt: '' },
  'culinary_page:rhythm': { kicker: '', title: '', text: '' },
  'offers_page:items': { id: '', title: '', subtitle: '', text: '', detail_text: [''], details: [], travel_period_label: '', travel_period: '', includes: [], image: '', image_alt: '', hero_image: '', hero_image_alt: '' },
  'rooms_page:items': { id: '', name: '', kicker: '', text: '', detail_text: [''], size: '', view: '', occupancy: '', price_from: '', price_unit: '', tags: [], amenities: [], image: '', image_alt: '', hero_image: '', hero_image_alt: '', gallery: [] },
  'impressions_page:items': { src: '', alt: '', topic: 'haus' },
  'blog_page:items': { id: '', slug: '', title: '', excerpt: '', topic: '', hero_image: '', hero_image_alt: '', published_at: '', source: 'human', blocks: [] },
  'occasions_page:items': { id: '', name: '', kicker: '', summary: '', text: [''], details: [], includes: [], links: [], faqs: [], community: [], cta: '', cta_href: '', image: '', image_alt: '', hero_image: '', hero_image_alt: '' },
  'direct_booking:items': { icon: 'BadgeCheck', title: '', text: '' },
  'offers:items': { title: '', subtitle: '', text: '', details: [], links: [], image_primary: '', image_primary_alt: '', image_secondary: '', image_secondary_alt: '' },
  'discover:tiles': { id: '', image: '', eyebrow: '', title: '', href: '' },
};
