import { useMemo, useState, type FormEvent } from 'react';
import { CmsGlyph } from '../../cms/CmsGlyph';
import { uploadToBunny } from '../../cms/cmsUpload';
import { useIconLibrary } from '../../context/IconLibraryContext';
import { matchesIconQuery } from '../../lib/cmsIconLibrary';

export function AdminIconsPage() {
  const { icons, addIcon, loading } = useIconLibrary();
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const visible = useMemo(() => icons.filter((icon) => matchesIconQuery(icon, query)), [icons, query]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      let svgText: string | undefined;
      let imageUrl: string | undefined;
      if (file) {
        if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) svgText = await file.text();
        else imageUrl = await uploadToBunny(file, '', name || description || file.name);
      }
      const result = await addIcon({
        name,
        description,
        tags: tags.split(/[, ]+/).map((tag) => tag.trim()).filter(Boolean),
        svgText,
        imageUrl,
      });
      if (result.error) setError(result.error);
      else {
        setNote(`„${result.icon?.name}“ liegt in der gemeinsamen Bibliothek.`);
        setName('');
        setDescription('');
        setTags('');
        setFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Icon konnte nicht angelegt werden.');
    }
    setBusy(false);
  }

  return (
    <>
      <h2>Icon-Bibliothek</h2>
      <p className="lead">
        Wir nutzen die Strich-Icons von Lucide — keine selbst gezeichnete Hausschrift. Fehlt eines, beschreibt ihr es
        oder ladet eine Skizze / einen Screenshot hoch. Daraus wird ein passendes Icon erzeugt und hier für alle Hotels
        abgelegt. Farben stellt ihr im Editor pro Icon ein.
      </p>
      <input
        className="admin-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Icons suchen…"
      />
      {loading ? <p className="admin-muted">Bibliothek wird geladen…</p> : null}
      <div className="admin-icon-grid">
        {visible.map((icon) => (
          <article key={icon.name} className="admin-icon-card">
            <CmsGlyph name={icon.name} size={28} />
            <strong>{icon.name}</strong>
            <span>{icon.kind === 'lucide' ? 'Lucide' : icon.kind === 'svg' ? 'Eigenes SVG' : 'Skizze'}</span>
            {icon.description ? <p>{icon.description}</p> : null}
          </article>
        ))}
      </div>
      <form className="admin-card admin-form" onSubmit={(event) => void onCreate(event)}>
        <h3>Neues Icon anlegen</h3>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Hundewiese" />
        </label>
        <label>
          Beschreibung
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Hund mit Leine, gleicher Strich wie Lucide"
          />
        </label>
        <label>
          Tags
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="hund, outdoor" />
        </label>
        <label>
          Skizze, Screenshot oder SVG
          <input type="file" accept="image/*,.svg" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        {note ? <p className="admin-note">{note}</p> : null}
        <button type="submit" className="admin-btn" disabled={busy || (!name && !description && !file)}>
          In die Bibliothek
        </button>
      </form>
    </>
  );
}
