import type { CropRect } from './cmsImage';
import type { FocalDevice } from './cmsFocal';
import { CMS_PHONE_HEIGHT, CMS_PHONE_WIDTH } from './cmsFrame';

// The ratio in which a picture really shows on the page, so the crop dialog frames exactly
// what visitors see (the page fills its slot with object-fit: cover and would cut the rest).

const PHONE_SUFFIX = '_mobile';

function previewDocument(): Document {
  const frame = document.querySelector('iframe.cms-frame');
  return (frame as HTMLIFrameElement | null)?.contentDocument || document;
}

function slotElement(doc: Document, section: string, path: string) {
  const escape = (value: string) => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value);
  const inSection = doc.querySelector(`[data-cms-section="${escape(section)}"] [data-cms-path="${escape(path)}"]`);
  // The preview runs in an iframe with its own HTMLElement, so no instanceof check here.
  if (inSection) return inSection;
  // A picture that is shown for another device (phone image while previewing desktop) has no slot.
  return null;
}

// Ratio for the crop frame, or undefined when the slot cannot be measured.
export function slotAspect(section: string, path: string, device: FocalDevice): number | undefined {
  const doc = previewDocument();
  const view = doc.defaultView ?? window;
  const phoneImage = path.endsWith(PHONE_SUFFIX);
  const element = slotElement(doc, section, path);
  if (!element) return phoneImage ? CMS_PHONE_WIDTH / CMS_PHONE_HEIGHT : undefined;
  const { width, height } = element.getBoundingClientRect();
  if (width < 20 || height < 20) return undefined;
  const fullScreen = width >= view.innerWidth * 0.95 && height >= view.innerHeight * 0.9;
  if (fullScreen && !phoneImage) {
    // Full-screen pictures (hero) take the shape of the visitor's window. The editor's own
    // browser window is the best guess; the preview beside the panel is narrower.
    return window.innerWidth / Math.max(1, window.innerHeight);
  }
  // A picture shared by desktop and phone is cropped for desktop; the phone preview only
  // shows its slice of it (set there by dragging the picture).
  if (device === 'mobile' && !phoneImage) return undefined;
  return width / height;
}

// Brings a saved crop to a new ratio around the same centre, about as close as before.
export function refitCrop(crop: CropRect, aspect: number, imageWidth: number, imageHeight: number): CropRect {
  let width = Math.sqrt(crop.width * crop.height * aspect);
  let height = width / aspect;
  if (width > imageWidth) {
    width = imageWidth;
    height = width / aspect;
  }
  if (height > imageHeight) {
    height = imageHeight;
    width = height * aspect;
  }
  const centerX = crop.x + crop.width / 2;
  const centerY = crop.y + crop.height / 2;
  return {
    x: Math.min(Math.max(0, centerX - width / 2), imageWidth - width),
    y: Math.min(Math.max(0, centerY - height / 2), imageHeight - height),
    width,
    height,
  };
}

// Hero pictures also carry a drag/zoom position; after a crop that matches the screen it
// would shift the picture again, so it starts fresh for that device.
export function focalPathFor(path: string) {
  const leaf = path.split('.').pop() ?? path;
  if (leaf !== 'hero_image' && leaf !== 'hero_image_mobile') return null;
  return { path: path.slice(0, path.length - leaf.length) + 'hero_focal', device: (leaf === 'hero_image' ? 'desktop' : 'mobile') as FocalDevice };
}
