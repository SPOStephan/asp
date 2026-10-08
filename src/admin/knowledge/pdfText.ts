import type { PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';

// Reads a PDF in the browser: no upload size limit, no server time limit. Pages without
// a text layer (scans, designed brochures) come back as an image for the AI to read.

export type PdfPage = { page: number; text: string; image?: string };

const MIN_TEXT = 60;

export async function readPdf(file: File, onProgress?: (done: number, total: number) => void): Promise<PdfPage[]> {
  // The legacy build carries polyfills; the modern one needs a very new browser.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pdf = await task.promise;
  const pages: PdfPage[] = [];
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    const content = await page.getTextContent();
    let text = '';
    for (const item of content.items) {
      if (!('str' in item)) continue;
      text += item.str;
      text += item.hasEOL ? '\n' : ' ';
    }
    text = text.replace(/[ \t]+/g, ' ').replace(/\n /g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const entry: PdfPage = { page: number, text };
    if (text.replace(/\s/g, '').length < MIN_TEXT) entry.image = await renderPage(page);
    pages.push(entry);
    page.cleanup();
    onProgress?.(number, pdf.numPages);
  }
  await task.destroy();
  return pages;
}

async function renderPage(page: PDFPageProxy) {
  const base = page.getViewport({ scale: 1 });
  // About 1600 px on the long side: readable for the AI, small enough to send.
  const scale = Math.min(2.5, 1600 / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const context = canvas.getContext('2d');
  if (!context) return undefined;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.82);
}
