import { BedDouble, CalendarDays, CreditCard, Gift, Home, UserRound } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PORTAL_NAME } from './config';
import { formatPoints } from './format';
import { usePortal } from './PortalData';
import { PortalErrorBoundary } from './PortalErrorBoundary';
import { PortalFooter } from './parts';
import { ForgotPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages/AuthPages';
import { HandoffPage } from './pages/HandoffPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { BookPage } from './pages/BookPage';
import { CardPage } from './pages/CardPage';
import { HomePage } from './pages/HomePage';
import { JoinPage } from './pages/JoinPage';
import { LandingPage } from './pages/LandingPage';
import { ProfilePage } from './pages/ProfilePage';
import { TripsPage } from './pages/TripsPage';

const TABS = [
  { to: '/', label: 'Übersicht', short: 'Start', icon: Home, end: true },
  { to: '/reisen', label: 'Reisen', short: 'Reisen', icon: CalendarDays },
  { to: '/vorteile', label: 'Vorteile & Prämien', short: 'Prämien', icon: Gift },
  { to: '/buchen', label: 'Buchen', short: 'Buchen', icon: BedDouble },
  { to: '/karte', label: 'Mitgliedskarte', short: 'Karte', icon: CreditCard },
];

export function useProgramName() {
  const { summary, info } = usePortal();
  return PORTAL_NAME || summary?.program.name || info?.name || 'Mein Konto';
}

// Every page starts at the top, as on a website. The effect must not return scrollTo's result:
// browser extensions that replace scrollTo may return a value, which React would call on cleanup.
function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell({ children }: { children: ReactNode }) {
  const name = useProgramName();
  const { summary } = usePortal();
  const { pathname } = useLocation();
  return (
    <div className="portal">
      <ScrollTop />
      <header className="portal-top">
        <div className="portal-top__inner">
          <NavLink to="/" className="portal-top__brand heading">{name}</NavLink>
          <nav className="portal-top__nav" aria-label="Bereiche">
            {TABS.filter((tab) => tab.to !== '/buchen').map((tab) => (
              <NavLink key={tab.to} to={tab.to} end={tab.end}>{tab.label}</NavLink>
            ))}
          </nav>
          <div className="portal-top__side">
            {summary ? <Link to="/vorteile" className="portal-top__points">{formatPoints(summary.balance)} <span>Punkte</span></Link> : null}
            <NavLink to="/profil" className="portal-top__me" aria-label="Profil"><UserRound size={18} strokeWidth={1.4} /></NavLink>
            <Link to="/buchen" className="portal-btn portal-btn--small portal-top__book">Buchen</Link>
          </div>
        </div>
      </header>
      <main className="portal-main"><PortalErrorBoundary resetKey={pathname}>{children}</PortalErrorBoundary></main>
      <PortalFooter name={name} settings={summary?.program.settings} />
      <nav className="portal-tabs" aria-label="Bereiche">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end}>
            <tab.icon size={21} strokeWidth={1.4} />
            <span>{tab.short}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function PortalApp() {
  const { ready, session, summary, error } = usePortal();
  const location = useLocation();

  if (!ready) return <div className="portal-loading" aria-busy="true" />;

  if (location.pathname === '/passwort-neu') return <ResetPasswordPage />;
  // Sign-in for the hotel websites and the hop to the booking engine (see src/member/handoff.ts).
  if (location.pathname === '/weiter') return <HandoffPage />;

  if (!session) {
    return (
      <>
        <ScrollTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/anmelden" element={<LoginPage />} />
          <Route path="/registrieren" element={<RegisterPage />} />
          <Route path="/passwort-vergessen" element={<ForgotPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </>
    );
  }

  // Logged in, but not yet a member (e.g. right after confirming the e-mail address).
  if (!summary) return error ? <div className="portal-auth"><p className="portal-error">{error}</p></div> : <JoinPage />;

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reisen" element={<TripsPage />} />
        <Route path="/vorteile" element={<BenefitsPage />} />
        <Route path="/buchen" element={<BookPage />} />
        <Route path="/karte" element={<CardPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
