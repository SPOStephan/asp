import { Link } from 'react-router-dom';

// Shown on /modern only: which version this is, and the way to the current start page.
export function ModernLookNote() {
  return (
    <aside className="modern-note" aria-label="Vergleichsansicht">
      <span>Moderne Variante (Entwurf)</span>
      <Link to="/">Aktuelle Startseite</Link>
    </aside>
  );
}
