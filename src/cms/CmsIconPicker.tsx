import { useState, type FormEvent } from 'react';
import { CmsGlyph } from './CmsGlyph';
import { useHotel } from '../context/HotelContext';
import { useIconLibrary } from '../context/IconLibraryContext';
import { matchesIconQuery } from '../lib/cmsIconLibrary';
import { uploadToBunny } from './cmsUpload';

export function CmsIconPicker({
  value,
  onChange,
  color,
  onColorChange,
}: {
  value: string;
  onChange: (name: string) => void;
  color?: string;
  onColorChange?: (color: string) => void;
}) {
  const hotel = useHotel();
  const { icons, addIcon } = useIconLibrary();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const visible = icons.filter((icon) => matchesIconQuery(icon, query));

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let svgText: string | undefined;
      let imageUrl: string | undefined;
      if (file) {
        if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
          svgText = await file.text();
        } else {
          imageUrl = await uploadToBunny(file, hotel?.id ?? '', name || description || file.name);
        }
      }
      const result = await addIcon({ name, description, svgText, imageUrl });
      if (result.error) setError(result.error);
      else if (result.icon) {
        onChange(result.icon.name);
        setOpen(false);
        setName('');
        setDescription('');
        setFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Icon konnte nicht angelegt werden.');
    }
    setBusy(false);
  }

  return (
    <div className="cms-icon-picker">
      {onColorChange ? (
        <label className="cms-icon-color">
          Farbe
          <input type="color" value={color || '#957640'} onChange={(event) => onColorChange(event.target.value)} />
          <input value={color || ''} onChange={(event) => onColorChange(event.target.value)} placeholder="#957640" />
        </label>
      ) : null}
      <input
        className="cms-icon-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Icon suchen…"
      />
      <div className="cms-icons">
        {visible.map((icon) => (
          <button
            key={icon.name}
            type="button"
            className={`cms-icons__btn${value === icon.name ? ' is-on' : ''}`}
            onClick={() => onChange(icon.name)}
            title={icon.description || icon.name}
          >
            <CmsGlyph name={icon.name} size={22} />
            <span>{icon.name}</span>
          </button>
        ))}
      </div>
      <button type="button" className="cms-btn cms-btn--ghost" onClick={() => setOpen((current) => !current)}>
        Neues Icon anlegen
      </button>
      {open ? (
        <form className="cms-icon-request" onSubmit={(event) => void onCreate(event)}>
          <p className="cms-muted">
            Beschreibung oder Skizze / Screenshot. Wir legen das Icon im Lucide-Strichstil in der gemeinsamen Bibliothek
            ab.
          </p>
          <label className="cms-field">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Hundewiese" />
          </label>
          <label className="cms-field">
            Beschreibung
            <textarea
              className="cms-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Hund mit Leine, gleicher Strich wie die anderen Icons"
            />
          </label>
          <label className="cms-field">
            Skizze oder Screenshot
            <input type="file" accept="image/*,.svg" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </label>
          {error ? <p className="cms-error">{error}</p> : null}
          <button type="submit" className="cms-btn" disabled={busy || (!name && !description && !file)}>
            {busy ? 'Legt an…' : 'In die Bibliothek'}
          </button>
        </form>
      ) : null}
    </div>
  );
}
