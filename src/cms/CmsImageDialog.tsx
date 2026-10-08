import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { useHotel, useHotelContent } from '../context/HotelContext';
import { getPath } from './cmsDraft';
import { type CropRect, exportWebp, fitRect, loadImage, ORIGINAL_MAX_EDGE, waitForImage, zoomRect } from './cmsImage';
import { clampCrop, editableImageUrl, readMediaSource } from './cmsMediaSource';
import { formatImageHint, imageHint } from './cmsImageHints';
import { focalPathFor, refitCrop, slotAspect } from './cmsSlot';
import { readHeroFocal } from './cmsFocal';
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

const FRAME_MAX_HEIGHT = 420;

// Size of the visible frame: as wide as the dialog, not taller than FRAME_MAX_HEIGHT.
function cropFrame(stageWidth: number, crop: CropRect) {
  const ratio = crop.width / crop.height || 1;
  let width = stageWidth;
  let height = width / ratio;
  if (height > FRAME_MAX_HEIGHT) {
    height = FRAME_MAX_HEIGHT;
    width = height * ratio;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

export function CmsImageDialog() {
  const cms = useCms();
  const hotel = useHotel();
  const { content } = useHotelContent();
  const request = cms?.imageRequest;
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  // Ratio of the picture's place on the page (see cmsSlot.ts); the default frame.
  const [pageAspect, setPageAspect] = useState<number | undefined>(undefined);
  const [alt, setAlt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [appliedUrl, setAppliedUrl] = useState<string | null>(null);
  const [stageWidth, setStageWidth] = useState(0);
  // Address of the uncropped original of the picture in the dialog (null: new file, not stored yet).
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const drag = useRef<{ startX: number; startY: number; crop: CropRect; scale: number } | null>(null);

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
    setError(null);
    setImage(null);
    setFileName(null);
    setSourceUrl(null);
    const measured = slotAspect(request.section, request.path, cms?.focalPreview ?? 'desktop');
    const target = measured ?? imageHint(request.section, request.path).aspect;
    setPageAspect(measured);
    setAspect(target);
    // A picture that is already there opens with its original and last crop, ready to adjust.
    const section = (content?.sections[request.section] ?? {}) as Record<string, unknown>;
    const current = getPath(section, request.path);
    const stored = readMediaSource(section, request.path);
    const src = stored?.src || (typeof current === 'string' ? current.trim() : '');
    if (!src) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const response = await fetch(editableImageUrl(src));
        if (!response.ok) throw new Error(String(response.status));
        const loaded = await loadImage(await response.blob());
        if (cancelled) return;
        setImage(loaded);
        setFileName('Aktuelles Bild');
        setSourceUrl(src);
        // The frame always has the shape the picture has on the page, so it shows what
        // visitors see; the last crop is kept as far as that shape allows.
        if (stored?.crop) {
          const last = clampCrop(stored.crop, loaded.naturalWidth, loaded.naturalHeight);
          setCrop(target ? refitCrop(last, target, loaded.naturalWidth, loaded.naturalHeight) : last);
        } else {
          setCrop(fitRect(loaded.naturalWidth, loaded.naturalHeight, target));
        }
      } catch {
        if (!cancelled) setError('Das aktuelle Bild ließ sich nicht zum Bearbeiten laden. Eine neue Datei wählen geht immer.');
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // The picture is read once when the dialog opens, not on every change of the content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  // Mouse wheel / trackpad zooms like the buttons (set below, after the early return).
  const wheelZoom = useRef<(factor: number) => void>(() => {});
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      wheelZoom.current(event.deltaY < 0 ? 0.93 : 1.07);
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
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

  const hint = imageHint(request.section, request.path);

  function nudgeZoom(factor: number) {
    if (!image) return;
    setCrop(zoomRect(crop, image.naturalWidth, image.naturalHeight, factor, aspect));
  }

  async function pushUpload(source: HTMLImageElement, sourceCrop: CropRect, knownSource: string | null) {
    if (!hotel) {
      setError('Hotel noch nicht geladen. Bitte kurz warten und die Datei noch einmal wählen.');
      return;
    }
    setBusy(true);
    setError(null);
    setAppliedUrl(null);
    try {
      // The uncropped original goes to Bunny once, so the crop can change later.
      let original = knownSource;
      if (!original) {
        const full = { x: 0, y: 0, width: source.naturalWidth, height: source.naturalHeight };
        original = await uploadToBunny(await exportWebp(source, full, undefined, ORIGINAL_MAX_EDGE), hotel.id, alt ? `${alt} (Original)` : 'Original');
        setSourceUrl(original);
      }
      const file = await exportWebp(source, sourceCrop);
      const url = await uploadToBunny(file, hotel.id, alt);
      await waitForImage(url);
      // The crop now is what the page shows; an old drag/zoom position would shift it again.
      const focal = focalPathFor(request!.path);
      const extra: Record<string, unknown> = {};
      if (focal) {
        const section = (content?.sections[request!.section] ?? {}) as Record<string, unknown>;
        const current = readHeroFocal(getPath(section, focal.path));
        extra[focal.path] = { ...current, [focal.device]: { x: 50, y: 50, z: 1 } };
      }
      cms!.applyImage(request!.section, request!.path, url, { src: original, crop: sourceCrop }, extra);
      if (request!.altPath && alt) cms!.applyField(request!.section, request!.altPath, alt);
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
      setSourceUrl(null);
      await pushUpload(next, nextCrop, null);
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

  // The frame shows exactly what will be uploaded; the picture moves and scales inside it.
  const frame = image && stageWidth ? cropFrame(stageWidth - 24, crop) : null;
  const frameScale = frame ? frame.width / crop.width : 0;

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!image || !frameScale) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startY: event.clientY, crop, scale: frameScale };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !image) return;
    // Dragging moves the picture with the pointer, so the visible part goes the other way.
    const dx = (event.clientX - drag.current.startX) / drag.current.scale;
    const dy = (event.clientY - drag.current.startY) / drag.current.scale;
    setCrop({
      ...drag.current.crop,
      x: Math.min(Math.max(0, drag.current.crop.x - dx), image.naturalWidth - drag.current.crop.width),
      y: Math.min(Math.max(0, drag.current.crop.y - dy), image.naturalHeight - drag.current.crop.height),
    });
  }

  wheelZoom.current = nudgeZoom;

  async function upload() {
    if (!image) return;
    await pushUpload(image, crop, sourceUrl);
  }

  const zoomPercent = image ? Math.round((fitRect(image.naturalWidth, image.naturalHeight, aspect).width / crop.width) * 100) : 100;

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
          {pageAspect ? (
            <button
              type="button"
              className={`cms-chip${aspect === pageAspect ? ' is-on' : ''}`}
              title="Genau der Ausschnitt, den Besucher auf der Seite sehen"
              onClick={() => applyAspect(pageAspect)}
            >
              Wie auf der Seite
            </button>
          ) : null}
          {ASPECTS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`cms-chip${aspect === item.value && aspect !== pageAspect ? ' is-on' : ''}`}
              onClick={() => applyAspect(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {image ? (
          <div ref={stageRef} className="cms-crop">
            {frame ? (
              <div
                className="cms-crop__frame"
                style={{ width: frame.width, height: frame.height }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={() => {
                  drag.current = null;
                }}
              >
                <img
                  src={image.src}
                  alt=""
                  style={{
                    width: image.naturalWidth * frameScale,
                    height: image.naturalHeight * frameScale,
                    left: -crop.x * frameScale,
                    top: -crop.y * frameScale,
                  }}
                />
              </div>
            ) : null}
            <p className="cms-crop__hint">Ziehen verschiebt · Mausrad oder +/− zoomt · {zoomPercent} %</p>
          </div>
        ) : (
          <button type="button" className="cms-drop" onClick={() => inputRef.current?.click()}>
            JPG, PNG oder WebP hierher oder Datei wählen
          </button>
        )}
        {loading ? <p className="cms-muted">Aktuelles Bild wird geladen…</p> : null}
        {fileName ? (
          <p className="cms-muted">
            {fileName === 'Aktuelles Bild'
              ? 'Aktuelles Bild: verschieben, zoomen und „Ausschnitt übernehmen“ – oder eine neue Datei wählen.'
              : `Gewählt: ${fileName}`}
          </p>
        ) : null}
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
            {busy ? 'Lädt…' : appliedUrl ? 'Zuschnitt erneut übernehmen' : sourceUrl ? 'Ausschnitt übernehmen' : 'Hochladen und übernehmen'}
          </button>
          <button type="button" className="cms-btn cms-btn--ghost" onClick={() => cms.closeImage()}>
            {appliedUrl ? 'Fertig' : 'Abbrechen'}
          </button>
        </div>
      </div>
    </div>
  );
}
