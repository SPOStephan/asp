import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { useHotel } from '../context/HotelContext';
import { type CropRect, exportWebp, fitRect, loadImage, waitForImage, zoomRect } from './cmsImage';
import { formatImageHint, imageHint } from './cmsImageHints';
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

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif';

export function CmsImageDialog() {
  const cms = useCms();
  const hotel = useHotel();
  const request = cms?.imageRequest;
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [alt, setAlt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [appliedUrl, setAppliedUrl] = useState<string | null>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const drag = useRef<{ startX: number; startY: number; crop: CropRect } | null>(null);

  useEffect(() => {
    if (!request) {
      setImage(null);
      setFileName(null);
      setError(null);
      setAlt('');
      setAppliedUrl(null);
      setBusy(false);
      return;
    }
    setAlt('');
    setAppliedUrl(null);
    setAspect(imageHint(request.section, request.path).aspect);
  }, [request]);

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

  const hint = imageHint(request.section, request.path);

  function nudgeZoom(factor: number) {
    if (!image) return;
    setCrop(zoomRect(crop, image.naturalWidth, image.naturalHeight, factor, aspect));
  }

  async function pushUpload(source: HTMLImageElement, sourceCrop: CropRect) {
    if (!hotel) {
      setError('Hotel noch nicht geladen. Bitte kurz warten und die Datei noch einmal wählen.');
      return;
    }
    setBusy(true);
    setError(null);
    setAppliedUrl(null);
    try {
      const file = await exportWebp(source, sourceCrop);
      const url = await uploadToBunny(file, hotel.id, alt);
      await waitForImage(url);
      cms.applyField(request.section, request.path, url);
      if (request.altPath && alt) cms.applyField(request.section, request.altPath, alt);
      setAppliedUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.');
    }
    setBusy(false);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setAppliedUrl(null);
    try {
      const next = await loadImage(file);
      const nextCrop = fitRect(next.naturalWidth, next.naturalHeight, aspect);
      setImage(next);
      setFileName(file.name);
      setCrop(nextCrop);
      await pushUpload(next, nextCrop);
    } catch (err) {
      setImage(null);
      setFileName(null);
      setError(err instanceof Error ? err.message : 'Datei unlesbar.');
    }
    if (inputRef.current) inputRef.current.value = '';
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
    if (!image) return;
    await pushUpload(image, crop);
  }

  const scale = image && stageWidth ? stageWidth / image.naturalWidth : 0;

  return (
    <div className="cms-modal" role="dialog" aria-label="Bild hochladen">
      <div className="cms-modal__card">
        <header>
          <strong>Bild nach Bunny</strong>
          <p>
            {formatImageHint(hint)}. Datei wählen legt das WebP nach Bunny und schreibt es direkt ins Layout.
          </p>
        </header>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
        <div className="cms-modal__actions">
          <button type="button" className="cms-btn cms-btn--ghost" onClick={() => inputRef.current?.click()}>
            Datei wählen
          </button>
          <button type="button" className="cms-btn cms-btn--ghost" disabled={!image} onClick={() => nudgeZoom(0.9)}>
            + Näher
          </button>
          <button type="button" className="cms-btn cms-btn--ghost" disabled={!image} onClick={() => nudgeZoom(1.12)}>
            − Weiter
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
            JPG, PNG oder WebP hierher oder Datei wählen
          </button>
        )}
        {fileName ? <p className="cms-muted">Gewählt: {fileName}</p> : null}
        {busy ? <p className="cms-muted">Wird als WebP optimiert und nach Bunny gelegt…</p> : null}
        {appliedUrl ? (
          <p className="cms-muted">
            WebP ist im Layout. Zuschnitt ändern und erneut übernehmen, wenn der Ausschnitt noch nicht stimmt.
            <br />
            <a href={appliedUrl} target="_blank" rel="noreferrer">{appliedUrl}</a>
          </p>
        ) : null}
        <label className="cms-field">
          Alt-Text
          <input value={alt} onChange={(event) => setAlt(event.target.value)} />
        </label>
        {error ? <p className="cms-error">{error}</p> : null}
        <div className="cms-modal__actions">
          <button type="button" className="cms-btn" disabled={!image || busy} onClick={() => void upload()}>
            {busy ? 'Lädt…' : appliedUrl ? 'Zuschnitt erneut übernehmen' : 'Hochladen und übernehmen'}
          </button>
          <button type="button" className="cms-btn cms-btn--ghost" onClick={() => cms.closeImage()}>
            {appliedUrl ? 'Fertig' : 'Abbrechen'}
          </button>
        </div>
      </div>
    </div>
  );
}
