import { useState, type FormEvent } from 'react';
import { usePortal } from '../PortalData';
import { AuthFrame } from './AuthPages';

// First login after confirming the e-mail address: the membership is created here.
export function JoinPage() {
  const { session, join, signOut } = usePortal();
  const meta = (session?.user.user_metadata ?? {}) as { first_name?: string; last_name?: string; marketing?: boolean };
  const [first, setFirst] = useState(meta.first_name ?? '');
  const [last, setLast] = useState(meta.last_name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(await join(first.trim(), last.trim(), meta.marketing === true));
    setBusy(false);
  }

  return (
    <AuthFrame title="Willkommen" intro="Noch ein Schritt: Mit Ihrer Mitgliedschaft sammeln Sie ab sofort Punkte für jeden Aufenthalt.">
      <form className="portal-form" onSubmit={submit}>
        <div className="portal-form__row">
          <label>Vorname<input required value={first} onChange={(event) => setFirst(event.target.value)} /></label>
          <label>Nachname<input required value={last} onChange={(event) => setLast(event.target.value)} /></label>
        </div>
        {error ? <p className="portal-error" role="alert">{error}</p> : null}
        <button type="submit" className="portal-btn" disabled={busy}>Mitgliedschaft starten</button>
      </form>
      <p className="portal-auth__links"><button type="button" className="portal-link" onClick={() => void signOut()}>Abmelden</button></p>
    </AuthFrame>
  );
}
