import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';

type MediaRow = {
  id: string;
  bunny_url: string;
  bunny_path: string;
  alt_text: string | null;
  created_at: string;
};

export function AdminMediaPage() {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [hotelId, setHotelId] = useState('');
  const [alt, setAlt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hotels, setHotels] = useState<Array<{ id: string; name: string }>>([]);

  async function reload() {
    const { data, error: queryError } = await supabase
      .from('media')
      .select('id, bunny_url, bunny_path, alt_text, created_at')
      .order('created_at', { ascending: false })
      .limit(80);
    if (queryError) setError(queryError.message);
    else setItems((data ?? []) as MediaRow[]);
  }

  useEffect(() => {
    void reload();
    void supabase
      .from('hotels')
      .select('id, name')
      .order('name')
      .then(({ data }) => setHotels((data ?? []) as Array<{ id: string; name: string }>));
  }, []);

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const body = new FormData();
    body.append('file', file);
    body.append('alt', alt);
    if (hotelId) body.append('hotelId', hotelId);
    const response = await fetch('/api/bunny-upload', {
      method: 'POST',
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      body,
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) setError(json.error || 'Upload fehlgeschlagen. Bunny-Zugang fehlt noch?');
    else {
      setFile(null);
      setAlt('');
      await reload();
    }
    setBusy(false);
  }

  return (
    <>
      <h2>Medien</h2>
      <p className="lead">
        Ab dem ersten Upload geht jedes Bild nach Bunny. Supabase speichert nur Pfad, URL, Alt und später den Zuschnitt.
      </p>
      <form className="admin-form" onSubmit={(event) => void upload(event)}>
        <label>
          Hotel (optional)
          <select value={hotelId} onChange={(event) => setHotelId(event.target.value)}>
            <option value="">Kein Hotel / gemeinsam</option>
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Datei
          <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required />
        </label>
        <label>
          Alt-Text
          <input value={alt} onChange={(event) => setAlt(event.target.value)} />
        </label>
        <div className="admin-actions">
          <button type="submit" className="admin-btn admin-btn--gold" disabled={busy || !file}>
            {busy ? 'Lädt…' : 'Nach Bunny hochladen'}
          </button>
        </div>
      </form>
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-media-grid">
        {items.map((item) => (
          <figure key={item.id} className="admin-media-card">
            <img src={item.bunny_url} alt={item.alt_text ?? ''} />
            <figcaption>
              {item.alt_text || item.bunny_path}
              <br />
              <span className="admin-muted">{item.bunny_url}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
