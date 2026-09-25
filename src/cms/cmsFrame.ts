import type { FocalDevice } from './cmsFocal';

export const CMS_FRAME_QUERY = 'cms-frame';
export const CMS_DEVICE_QUERY = 'cms-device';
export const CMS_PHONE_WIDTH = 390;
export const CMS_PHONE_HEIGHT = 844;
export const CMS_FRAME_SOURCE = 'lohbeck-cms';

export function isCmsFrameSearch(search: string) {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get(CMS_FRAME_QUERY) === '1';
}

export function isCmsFrame() {
  return typeof window !== 'undefined' && isCmsFrameSearch(window.location.search);
}

export function cmsFrameDevice(search = typeof window !== 'undefined' ? window.location.search : ''): FocalDevice {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get(CMS_DEVICE_QUERY) === 'mobile'
    ? 'mobile'
    : 'desktop';
}

export function toCmsFrameHref(pathname: string, device: FocalDevice, search = '', hash = '') {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  params.set(CMS_FRAME_QUERY, '1');
  params.set(CMS_DEVICE_QUERY, device);
  return `${pathname}?${params.toString()}${hash}`;
}

export function cmsShellPath(pathname: string, search = '', hash = '') {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  params.delete(CMS_FRAME_QUERY);
  params.delete(CMS_DEVICE_QUERY);
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ''}${hash}`;
}

export type CmsFrameMessage =
  | { source: typeof CMS_FRAME_SOURCE; type: 'ready' }
  | { source: typeof CMS_FRAME_SOURCE; type: 'hydrate'; sections: Record<string, Record<string, unknown>>; faqs?: unknown }
  | { source: typeof CMS_FRAME_SOURCE; type: 'preview'; section: string; data: Record<string, unknown>; quiet?: boolean }
  | { source: typeof CMS_FRAME_SOURCE; type: 'preview-faqs'; faqs: unknown }
  | { source: typeof CMS_FRAME_SOURCE; type: 'select'; section: string | null; focus?: string | null; path?: string | null }
  | { source: typeof CMS_FRAME_SOURCE; type: 'navigate'; path: string }
  | { source: typeof CMS_FRAME_SOURCE; type: 'open-image'; request: unknown };

export function isCmsFrameMessage(data: unknown): data is CmsFrameMessage {
  return Boolean(data && typeof data === 'object' && (data as { source?: string }).source === CMS_FRAME_SOURCE);
}
