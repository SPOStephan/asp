import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PORTAL_NAME, PORTAL_URL } from '../config';
import { sized, hideBroken } from '../format';
import { usePortal } from '../PortalData';
import { portal } from '../portalClient';

// Links in e-mails lead to the web portal; inside the store apps there is no web address.
function returnUrl() {
  return /^https?:$/.test(window.location.protocol) && !('Capacitor' in window) ? window.location.origin : PORTAL_URL || window.location.origin;
}

function translate(message: string) {
  if (/invalid login credentials/i.test(message)) return 'E-Mail-Adresse oder Passwort stimmen nicht.';
  if (/email not confirmed/i.test(message)) return 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse – den Link haben wir Ihnen geschickt.';
  if (/already registered|already been registered/i.test(message)) return 'Für diese E-Mail-Adresse gibt es schon ein Konto. Bitte melden Sie sich an.';
  if (/password should be at least|weak password/i.test(message)) return 'Das Passwort ist zu kurz: bitte mindestens 8 Zeichen.';
  if (/signups not allowed/i.test(message)) return 'Die Registrierung ist gerade nicht möglich. Bitte versuchen Sie es später noch einmal.';
  return message;
}

export function AuthFrame({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  const { hotels } = usePortal();
  const picture = hotels.find((hotel) => hotel.image)?.image ?? '';
  return (
    <div className="portal-auth">
      <div className="portal-auth__picture" aria-hidden="true">
        {picture ? <img src={sized(picture, 1600)} alt="" onError={hideBroken} /> : null}
      </div>
      <section className="portal-auth__panel">
        <p className="portal-eyebrow">{PORTAL_NAME || 'Mein Konto'}</p>
        <h1 className="heading portal-auth__title">{title}</h1>
        {intro ? <p className="portal-auth__intro">{intro}</p> : null}
        {children}
      </section>
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signError } = await portal.auth.signInWithPassword({ email: email.trim(), password });
    if (signError) setError(translate(signError.message));
    setBusy(false);
  }

  return (
    <AuthFrame title="Willkommen zurück" intro="Ihre Reisen, Punkte und Vorteile in allen Hotels der Gruppe – an einem Ort.">
      <form className="portal-form" onSubmit={submit}>
        <label>E-Mail-Adresse<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Passwort<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error ? <p className="portal-error" role="alert">{error}</p> : null}
        <button type="submit" className="portal-btn" disabled={busy}>{busy ? 'Anmelden …' : 'Anmelden'}</button>
      </form>
      <p className="portal-auth__links">
        <Link to="/passwort-vergessen">Passwort vergessen?</Link>
        <span>Noch kein Mitglied? <Link to="/registrieren">Jetzt kostenlos registrieren</Link></span>
      </p>
    </AuthFrame>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { join } = usePortal();
  const [form, setForm] = useState({ first: '', last: '', email: '', password: '', marketing: false, terms: false });
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.password.length < 8) return setError('Das Passwort ist zu kurz: bitte mindestens 8 Zeichen.');
    setBusy(true);
    setError(null);
    const { data, error: signError } = await portal.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: returnUrl(),
        data: { first_name: form.first.trim(), last_name: form.last.trim(), marketing: form.marketing },
      },
    });
    if (signError) {
      setError(translate(signError.message));
      setBusy(false);
      return;
    }
    if (data.session) {
      const joinError = await join(form.first.trim(), form.last.trim(), form.marketing);
      if (joinError) setError(joinError);
      else navigate('/');
    } else {
      setSent(true);
    }
    setBusy(false);
  }

  if (sent) {
    return (
      <AuthFrame title="Fast geschafft" intro={`Wir haben Ihnen eine E-Mail an ${form.email} geschickt. Bitte bestätigen Sie den Link darin – danach sind Sie angemeldet.`}>
        <p className="portal-auth__links"><Link to="/">Zur Anmeldung</Link></p>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Mitglied werden" intro="Kostenlos: Punkte für jeden Aufenthalt, exklusive Vorteile und Ihre Buchungen immer dabei.">
      <form className="portal-form" onSubmit={submit}>
        <div className="portal-form__row">
          <label>Vorname<input autoComplete="given-name" required value={form.first} onChange={(event) => set({ first: event.target.value })} /></label>
          <label>Nachname<input autoComplete="family-name" required value={form.last} onChange={(event) => set({ last: event.target.value })} /></label>
        </div>
        <label>E-Mail-Adresse<input type="email" autoComplete="email" required value={form.email} onChange={(event) => set({ email: event.target.value })} /></label>
        <label>Passwort (mind. 8 Zeichen)<input type="password" autoComplete="new-password" required value={form.password} onChange={(event) => set({ password: event.target.value })} /></label>
        <label className="portal-check">
          <input type="checkbox" checked={form.marketing} onChange={(event) => set({ marketing: event.target.checked })} />
          <span>Ich möchte Angebote und Neuigkeiten per E-Mail erhalten (jederzeit abbestellbar).</span>
        </label>
        <label className="portal-check">
          <input type="checkbox" required checked={form.terms} onChange={(event) => set({ terms: event.target.checked })} />
          <span>Ich akzeptiere die Teilnahmebedingungen und habe die Datenschutzhinweise gelesen.</span>
        </label>
        {error ? <p className="portal-error" role="alert">{error}</p> : null}
        <button type="submit" className="portal-btn" disabled={busy}>{busy ? 'Einen Moment …' : 'Kostenlos registrieren'}</button>
      </form>
      <p className="portal-auth__links"><span>Schon Mitglied? <Link to="/">Anmelden</Link></span></p>
    </AuthFrame>
  );
}

export function ForgotPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const { error: resetError } = await portal.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${returnUrl()}/passwort-neu` });
    if (resetError) setError(translate(resetError.message));
    else setSent(true);
  }

  return (
    <AuthFrame title="Passwort vergessen" intro={sent ? 'Wenn es ein Konto mit dieser Adresse gibt, haben wir Ihnen einen Link zum Zurücksetzen geschickt.' : 'Wir schicken Ihnen einen Link, mit dem Sie ein neues Passwort festlegen.'}>
      {!sent ? (
        <form className="portal-form" onSubmit={submit}>
          <label>E-Mail-Adresse<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          {error ? <p className="portal-error" role="alert">{error}</p> : null}
          <button type="submit" className="portal-btn">Link anfordern</button>
        </form>
      ) : null}
      <p className="portal-auth__links"><Link to="/">Zur Anmeldung</Link></p>
    </AuthFrame>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setError('Das Passwort ist zu kurz: bitte mindestens 8 Zeichen.');
    const { error: updateError } = await portal.auth.updateUser({ password });
    if (updateError) setError(translate(updateError.message));
    else navigate('/');
  }

  return (
    <AuthFrame title="Neues Passwort" intro="Legen Sie ein neues Passwort für Ihr Konto fest.">
      <form className="portal-form" onSubmit={submit}>
        <label>Neues Passwort (mind. 8 Zeichen)<input type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error ? <p className="portal-error" role="alert">{error}</p> : null}
        <button type="submit" className="portal-btn">Speichern</button>
      </form>
    </AuthFrame>
  );
}
