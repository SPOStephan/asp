import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { useHotel } from '../context/HotelContext';
import { type CropRect, exportWebp, fitRect, loadImage } from './cmsImage';
import { uploadToBunny } from './cmsUpload';
import { useCms } from './CmsContext';

const ASPECTS: Array<{ label: string; value?: number }> = [
  { label: 'Frei' },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '4:3', value: 4 / 3 },
  { label: '1:1', value: 1 },
  { label: '9:16', value: 9 / 16 },
];

export function CmsImageDialog() {
  const cms = useCms();
  const hotel = useHotel();
  const request = cms?.imageRequest;
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [alt, setAlt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stageWidth, setStageWidth] = useState(0);
  const drag = useRef<{ startX: number; startY: number; crop: CropRect } | null>(null);

  useEffect(() => {
    if (!request) {
      setImage(null);
      setError(null);
      setAlt('');
      return;
    }
    setAlt('');
    inputRef.current?.click();
  }, [request]);

  useEffect(() => {
    return () => {
      if (image?.src.startsWith('blob:')) URL.revokeObjectURL(image.src);
    };
  }, [image]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => setStageWidth(stage.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [image]);

  if (!cms || !request) return null;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const next = await loadImage(file);
      setImage(next);
      setCrop(fitRect(next.naturalWidth, next.naturalHeight, aspect));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Datei unlesbar.');
    }
  }

  function applyAspect(next?: number) {
    setAspect(next);
    if (image) setCrop(fitRect(image.naturalWidth, image.naturalHeight, next));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!image) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startY: event.clientY, crop };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !image || !stageRef.current) return;
    const box = stageRef.current.getBoundingClientRect();
    const scaleX = image.naturalWidth / box.width;
    const scaleY = image.naturalHeight / box.height;
    const dx = (event.clientX - drag.current.startX) * scaleX;
    const dy = (event.clientY - drag.current.startY) * scaleY;
    const next = {
      ...drag.current.crop,
      x: Math.min(Math.max(0, drag.current.crop.x + dx), image.naturalWidth - drag.current.crop.width),
      y: Math.min(Math.max(0, drag.current.crop.y + dy), image.naturalHeight - drag.current.crop.height),
    };
    setCrop(next);
  }

  async function upload() {
    if (!image || !hotel) return;
    setBusy(true);
    setError(null);
    try {
      const file = await exportWebp(image, crop);
      const url = await uploadToBunny(file, hotel.id, alt);
      cms.applyField(request.section, request.path, url);
      if (request.altPath && alt) cms.applyField(request.section, request.altPath, alt);
      cms.closeImage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.');
    }
    setBusy(false);
  }

  const scale = image && stageWidth ? stageWidth / image.naturalWidth : 0;

  return (
    <div className="cms-modal" role="dialog" aria-label="Bild hochladen">
      <div className="cms-modal__card">
        <header>
          <strong>Bild nach Bunny</strong>
          <p>Wird als WebP gespeichert, große Dateien werden verkleinert. Zuschnitt per Ziehen verschieben.</p>
        </header>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
        <div className="cms-modal__actions">
          <button type="button" className="cms-btn cms-btn--ghost" onClick={() => inputRef.current?.click()}>
            Datei wählen
          </button>
          {ASPECTS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`cms-chip${aspect === item.value ? ' is-on' : ''}`}
              onClick={() => applyAspect(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {image ? (
          <div
            ref={stageRef}
            className="cms-crop"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => {
              drag.current = null;
            }}
          >
            <img src={image.src} alt="" />
            {scale ? (
              <div
                className="cms-crop__box"
                style={{
                  left: crop.x * scale,
                  top: crop.y * scale,
                  width: crop.width * scale,
                  height: crop.height * scale,
                }}
              />
            ) : null}
          </div>
        ) : (
          <button type="button" className="cms-drop" onClick={() => inputRef.current?.click()}>
            Bild hierher oder Datei wählen
          </button>
        )}
        <label className="cms-field">
          Alt-Text
          <input value={alt} onChange={(event) => setAlt(event.target.value)} />
        </label>
        {error ? <p className="cms-error">{error}</p> : null}
        <div className="cms-modal__actions">
          <button type="button" className="cms-btn" disabled={!image || busy} onClick={() => void upload()}>
            {busy ? 'Lädt…' : 'Hochladen und übernehmen'}
          </button>
          <button type="button" className="cms-btn cms-btn--ghost" onClick={() => cms.closeImage()}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
