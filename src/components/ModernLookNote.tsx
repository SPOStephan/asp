import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const FONT_STYLESHEET = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300..700&display=swap';

// Shown on /modern only: which version this is, the way to the current start page – and the
// sans of the draft, loaded just for this page.
export function ModernLookNote() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_STYLESHEET;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  return (
    <aside className="modern-note" aria-label="Vergleichsansicht">
      <span>Moderne Variante (Entwurf 6)</span>
      <Link to="/">Aktuelle Startseite</Link>
    </aside>
  );
}
