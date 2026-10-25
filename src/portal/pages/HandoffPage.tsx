import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { allowedBookingTarget, handoffTarget, withMemberCode } from '../../member/handoff';
import { usePortal } from '../PortalData';
import { hotelSiteUrl } from '../hotelSite';
import { AuthFrame, LoginForm, RETURN_KEY } from './AuthPages';
import { JoinPage } from './JoinPage';

// /weiter?to=…           sign in (if needed), then back to the hotel website, signed in there too
// /weiter?buchen=1&to=…  on to the booking engine, with the member rate code for signed-in members
export function HandoffPage() {
  const { ready, session, summary, hotels, error } = usePortal();
  const params = new URLSearchParams(window.location.search);
  const booking = params.get('buchen') === '1';
  const raw = params.get('to') ?? '';
  const [problem, setProblem] = useState<string | null>(null);
  const [waited, setWaited] = useState(false);
  const started = useRef(false);
  const target = handoffTarget(raw);
  const hotel = target ? hotels.find((item) => (item.domains ?? []).includes(target.hostname.toLowerCase())) : undefined;

  // A guest who registers instead of signing in comes back to this website afterwards.
  useEffect(() => {
    if (!booking && target) sessionStorage.setItem(RETURN_KEY, target.toString());
  }, [booking, target]);

  // Hotels and the member's data come in after a moment; never keep a booking waiting long.
  useEffect(() => {
    const timer = window.setTimeout(() => setWaited(true), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!booking || started.current || !ready) return;
    const known = hotels.length > 0;
    const settled = !session || summary || error;
    if (!(known && settled) && !waited) return;
    started.current = true;
    const allowed = allowedBookingTarget(raw, hotels);
    if (!allowed) {
      setProblem('Diese Buchungsadresse kennen wir nicht.');
      return;
    }
    const settings = summary?.program.settings;
    window.location.replace(withMemberCode(allowed, settings?.member_rate_code, settings?.member_rate_param));
  }, [booking, ready, hotels, session, summary, error, waited, raw]);

  useEffect(() => {
    if (booking || started.current || !ready || !session || !summary || !target) return;
    started.current = true;
    sessionStorage.removeItem(RETURN_KEY);
    hotelSiteUrl(target.toString())
      .then((url) => window.location.replace(url))
      .catch((failure: Error) => setProblem(failure.message));
  }, [booking, ready, session, summary, target]);

  if (!ready) return <div className="portal-loading" aria-busy="true" />;

  if (problem || !target) {
    return (
      <AuthFrame title="Das hat nicht geklappt" intro={problem ?? 'Diese Adresse kennen wir nicht.'}>
        <p className="portal-auth__links">
          {target && !booking ? <a href={target.toString()}>Zurück zur Website</a> : null}
          <Link to="/">Zum Mitgliederkonto</Link>
        </p>
      </AuthFrame>
    );
  }

  if (booking || (session && summary)) {
    return (
      <div className="portal-handoff" aria-busy="true">
        <p className="heading">{booking ? 'Einen Moment – wir öffnen die Buchung …' : `Einen Moment – zurück zu ${hotel?.name ?? 'Ihrem Hotel'} …`}</p>
      </div>
    );
  }

  // Signed in, but not a member yet: the membership is created first, then it goes on.
  if (session && !summary) return error ? <AuthFrame title="Das hat nicht geklappt" intro={error} /> : <JoinPage />;

  return (
    <AuthFrame
      title="Anmelden"
      intro={`Melden Sie sich mit Ihrem Mitgliedskonto an – danach geht es direkt zurück${hotel ? ` zu ${hotel.name}` : ''}, und Sie sind dort ebenfalls angemeldet.`}
    >
      <LoginForm />
      <p className="portal-auth__links"><a href={target.toString()}>Ohne Anmeldung zurück</a></p>
    </AuthFrame>
  );
}
