// File names that tell search engines what a picture shows ("hotel-nordsee-meerblick.webp")
// instead of upload numbers. Taken from the photo's own name when it means something,
// else from the alt text, else from the hotel's name.

const UMLAUTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss', Ä: 'ae', Ö: 'oe', Ü: 'ue' };

export function slugifyFileName(value: string) {
  return value
    .replace(/[äöüßÄÖÜ]/g, (char) => UMLAUTS[char] ?? char)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/(\.(jpe?g|png|webp|gif|avif|heic|heif|tiff?|bmp))+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

// Camera and system names carry no meaning: IMG_1234, DSC01234, PXL_2026…, Screenshot…
const MEANINGLESS = /^(img|dsc|dscn|dcim|pxl|photo|foto|image|bild|screenshot|bildschirmfoto|whatsapp|original|aktuelles-bild)?[-_ ]?[\d\s._-]*$/i;

export function meaningfulName(value: string | null | undefined) {
  const slug = slugifyFileName(value ?? '');
  if (!slug || MEANINGLESS.test(slug) || slug.replace(/[^a-z]/g, '').length < 3) return '';
  return slug;
}

// Base name from an earlier upload ("hotels/…/meerblick-terrasse-k3x9.webp" → "meerblick-terrasse").
export function nameFromUrl(url: string | null | undefined) {
  if (!url) return '';
  const last = decodeURIComponent(url.split('?')[0].split('/').pop() ?? '');
  const base = last.replace(/\.[a-z0-9]+$/i, '').replace(/-original$/i, '').replace(/-[a-z0-9]{4}$/i, '').replace(/^\d{10,}-/, '');
  return meaningfulName(base);
}

export function pictureBaseName(...candidates: Array<string | null | undefined>) {
  for (const candidate of candidates) {
    const name = meaningfulName(candidate);
    if (name) return name;
  }
  return 'bild';
}
