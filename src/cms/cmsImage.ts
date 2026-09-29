export const IMAGE_MAX_EDGE = 2400;
export const IMAGE_WEBP_QUALITY = 0.82;

export type CropRect = { x: number; y: number; width: number; height: number };

export async function loadImage(file: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = 'async';
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Bild konnte nicht gelesen werden.'));
    };
    image.src = url;
  });
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

export async function exportWebp(image: HTMLImageElement, crop: CropRect, quality = IMAGE_WEBP_QUALITY): Promise<File> {
  const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(crop.width, crop.height));
  const width = Math.max(1, Math.round(crop.width * scale));
  const height = Math.max(1, Math.round(crop.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Bildverarbeitung nicht verfügbar.');
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (next) => (next ? resolve(next) : reject(new Error('WebP-Export fehlgeschlagen.'))),
      'image/webp',
      quality,
    );
  });
  const name = `bild-${Date.now()}.webp`;
  return new File([blob], name, { type: 'image/webp' });
}
