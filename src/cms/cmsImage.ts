export const IMAGE_MAX_EDGE = 2400;
export const IMAGE_WEBP_QUALITY = 0.86;
// Originals are kept large and nearly lossless, so a later, tighter crop stays sharp
// (the crop is encoded a second time from them).
export const ORIGINAL_MAX_EDGE = 4096;
export const ORIGINAL_WEBP_QUALITY = 0.94;
// Full-screen pictures (hero): a phone with a 3x display shows a ~2100 px tall slice of the
// landscape picture, a large desktop screen ~3840 px of its width.
const SCREEN_SHORT_EDGE = 2160;
const SCREEN_MAX_EDGE = 4096;

export function screenMaxEdge(crop: CropRect) {
  const ratio = Math.max(crop.width, crop.height) / Math.max(1, Math.min(crop.width, crop.height));
  return Math.min(SCREEN_MAX_EDGE, Math.max(3200, Math.ceil(SCREEN_SHORT_EDGE * ratio)));
}

export type CropRect = { x: number; y: number; width: number; height: number };

const HEIC_NAME = /\.(heic|heif)$/i;
const HEIC_TYPE = /image\/hei[cf]/i;

export function rejectUnsupportedImage(file: Blob & { name?: string; type?: string }) {
  const name = file.name ?? '';
  const type = file.type ?? '';
  if (HEIC_NAME.test(name) || HEIC_TYPE.test(type)) {
    throw new Error('HEIC/HEIF vom iPhone wird im Browser nicht gelesen. Bitte als JPG oder PNG sichern.');
  }
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Datei unlesbar.'));
    };
    reader.onerror = () => reject(new Error('Datei unlesbar.'));
    reader.readAsDataURL(file);
  });
}

export async function loadImage(file: Blob): Promise<HTMLImageElement> {
  rejectUnsupportedImage(file);
  const src = await readFileAsDataUrl(file);
  const image = new Image();
  image.decoding = 'async';
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Bild konnte nicht gelesen werden. Bitte JPG, PNG oder WebP verwenden.'));
    image.src = src;
  });
  if (typeof image.decode === 'function') {
    try {
      await image.decode();
    } catch {
      /* onload is enough when decode() is missing or rejects after a successful load */
    }
  }
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error('Bild hat keine erkennbare Größe.');
  }
  return image;
}

export function fitRect(width: number, height: number, aspect?: number): CropRect {
  if (!aspect) return { x: 0, y: 0, width, height };
  const current = width / height;
  if (current > aspect) {
    const nextWidth = height * aspect;
    return { x: (width - nextWidth) / 2, y: 0, width: nextWidth, height };
  }
  const nextHeight = width / aspect;
  return { x: 0, y: (height - nextHeight) / 2, width, height: nextHeight };
}

export function zoomRect(
  crop: CropRect,
  imageWidth: number,
  imageHeight: number,
  factor: number,
  aspect?: number,
): CropRect {
  const centerX = crop.x + crop.width / 2;
  const centerY = crop.y + crop.height / 2;
  let width = crop.width * factor;
  let height = crop.height * factor;
  if (aspect) {
    height = width / aspect;
    if (width > imageWidth) {
      width = imageWidth;
      height = width / aspect;
    }
    if (height > imageHeight) {
      height = imageHeight;
      width = height * aspect;
    }
  } else {
    width = Math.min(width, imageWidth);
    height = Math.min(height, imageHeight);
  }
  const minEdge = 80;
  width = Math.max(minEdge, Math.min(width, imageWidth));
  height = Math.max(minEdge, Math.min(height, imageHeight));
  if (aspect) {
    if (width / height > aspect) width = Math.min(imageWidth, height * aspect);
    else height = Math.min(imageHeight, width / aspect);
  }
  const x = Math.min(Math.max(0, centerX - width / 2), Math.max(0, imageWidth - width));
  const y = Math.min(Math.max(0, centerY - height / 2), Math.max(0, imageHeight - height));
  return { x, y, width, height };
}

function blobFromCanvas(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((next) => resolve(next), type, quality);
  });
}

function canvasOf(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Bildverarbeitung nicht verfügbar.');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return { canvas, context };
}

// Shrinking in one big step makes browsers skip pixels (soft, grainy edges); halving step
// by step keeps the picture sharp.
function downscale(image: HTMLImageElement, crop: CropRect, width: number, height: number) {
  let source: CanvasImageSource = image;
  let rect = { ...crop };
  while (rect.width / 2 >= width && rect.height / 2 >= height) {
    const half = canvasOf(Math.round(rect.width / 2), Math.round(rect.height / 2));
    half.context.drawImage(source, rect.x, rect.y, rect.width, rect.height, 0, 0, half.canvas.width, half.canvas.height);
    source = half.canvas;
    rect = { x: 0, y: 0, width: half.canvas.width, height: half.canvas.height };
  }
  const target = canvasOf(width, height);
  target.context.drawImage(source, rect.x, rect.y, rect.width, rect.height, 0, 0, width, height);
  return target.canvas;
}

export async function exportWebp(image: HTMLImageElement, crop: CropRect, quality = IMAGE_WEBP_QUALITY, maxEdge = IMAGE_MAX_EDGE): Promise<File> {
  if (typeof image.decode === 'function') {
    try {
      await image.decode();
    } catch {
      /* already loaded */
    }
  }
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error('Bild ist nicht geladen. Bitte die Datei erneut wählen.');
  }
  const scale = Math.min(1, maxEdge / Math.max(crop.width, crop.height));
  const width = Math.max(1, Math.round(crop.width * scale));
  const height = Math.max(1, Math.round(crop.height * scale));
  const canvas = downscale(image, crop, width, height);
  const blob =
    (await blobFromCanvas(canvas, 'image/webp', quality)) ??
    (await blobFromCanvas(canvas, 'image/jpeg', 0.88));
  if (!blob) throw new Error('Bild-Export fehlgeschlagen.');
  const type = blob.type || 'image/jpeg';
  const ext = type === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `bild-${Date.now()}.${ext}`, { type });
}

export function waitForImage(url: string, timeoutMs = 20000): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => fail('Zeitüberschreitung'), timeoutMs);
    function fail(reason: string) {
      window.clearTimeout(timer);
      reject(new Error(`Das WebP ist hochgeladen, lädt aber nicht von ${url} (${reason}). Bunny-Pull-Zone prüfen.`));
    }
    image.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    image.onerror = () => fail('Bild nicht erreichbar');
    image.src = url;
  });
}
