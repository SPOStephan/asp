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
