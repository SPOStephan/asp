export type ImageHint = {
  width: number;
  height: number;
  aspect: number;
  aspectLabel: string;
};

const WIDE: ImageHint = { width: 1920, height: 1080, aspect: 16 / 9, aspectLabel: '16:9' };
const LAND_16_10: ImageHint = { width: 1600, height: 1000, aspect: 16 / 10, aspectLabel: '16:10' };
const TILE: ImageHint = { width: 1600, height: 1200, aspect: 4 / 3, aspectLabel: '4:3' };
const PHOTO: ImageHint = { width: 1400, height: 1120, aspect: 5 / 4, aspectLabel: '5:4' };
const PORTRAIT: ImageHint = { width: 1200, height: 1600, aspect: 3 / 4, aspectLabel: '3:4' };
const PHONE: ImageHint = { width: 1080, height: 1920, aspect: 9 / 16, aspectLabel: '9:16' };
const LOGO: ImageHint = { width: 720, height: 300, aspect: 12 / 5, aspectLabel: 'ca. 12:5' };
const BADGE: ImageHint = { width: 400, height: 400, aspect: 1, aspectLabel: '1:1' };

function leafOf(path: string) {
  return path.split('.').pop() ?? path;
}

export function imageHint(section: string, path: string): ImageHint {
  const leaf = leafOf(path);

  if (leaf.startsWith('logo_') || leaf.includes('logo')) return LOGO;
  if (leaf === 'hero_image_mobile') return PHONE;
  if (section === 'awards' && (leaf === 'src' || path.includes('items.')) && !path.includes('impressions')) {
    return BADGE;
  }
  if (leaf === 'image_primary') return PORTRAIT;
  if (leaf === 'image_secondary') return PHOTO;
  if (path.includes('feature_image')) return LAND_16_10;
  if (path.includes('tiles.') && leaf === 'image') return TILE;
  if (section === 'discover' && leaf === 'image') return TILE;
  if (section === 'wellness_page' && path.includes('chapters.') && leaf === 'image') return PHOTO;
  if (section === 'wellness_page' && leaf === 'image') return TILE;
  if (section === 'wellness_page' && leaf === 'hero_image') return WIDE;
  if (section === 'wellness' && (leaf === 'hero_image' || leaf === 'src')) return WIDE;
  if (section === 'culinary' && leaf === 'hero_image') return WIDE;
  if (section === 'culinary' && leaf === 'image') return PHOTO;
  if (section === 'culinary_page' && leaf === 'hero_image') return WIDE;
  if (section === 'culinary_page' && leaf === 'image') return PHOTO;
  if (section === 'offers_page' && leaf === 'hero_image') return WIDE;
  if (section === 'offers_page' && leaf === 'image') return PHOTO;
  if (section === 'rooms_page' && leaf === 'hero_image') return WIDE;
  if (section === 'rooms_page' && leaf === 'image') return PHOTO;
  if (section === 'blog_page' && leaf === 'hero_image') return WIDE;
  if (section === 'impressions_page') return TILE;
  if (section === 'highlights' && leaf === 'image') return PHOTO;
  if (section === 'generations' && (leaf === 'image' || leaf === 'src')) return PHOTO;
  if (section === 'awards' && (leaf === 'src' || leaf === 'image')) return TILE;
  if (leaf === 'hero_image') return WIDE;
  if (leaf === 'pair_image') return PHOTO;
  if (leaf === 'src') return TILE;
  if (leaf === 'image') return TILE;
  return TILE;
}

export function formatImageHint(hint: ImageHint) {
  return `Empfehlung: ca. ${hint.width} × ${hint.height} Pixel (${hint.aspectLabel})`;
}
