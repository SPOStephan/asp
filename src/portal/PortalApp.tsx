import { CalendarDays, CreditCard, Gift, Home, UserRound, BedDouble } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PORTAL_NAME } from './config';
import { usePortal } from './PortalData';
import { ForgotPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages/AuthPages';
import { BenefitsPage } from './pages/BenefitsPage';
import { BookPage } from './pages/BookPage';
import { CardPage } from './pages/CardPage';
import { HomePage } from './pages/HomePage';
import { JoinPage } from './pages/JoinPage';
import { ProfilePage } from './pages/ProfilePage';
import { TripsPage } from './pages/TripsPage';

const TABS = [
  { to: '/', label: 'Start', icon: Home, end: true },
  { to: '/reisen', label: 'Reisen', icon: CalendarDays },
  { to: '/vorteile', label: 'Vorteile', icon: Gift },
  { to: '/buchen', label: 'Buchen', icon: BedDouble },
  { to: '/karte', label: 'Karte', icon: CreditCard },
];

export function useProgramName() {
  const { summary } = usePortal();
  return PORTAL_NAME || summary?.program.name || 'Mein Konto';
}

function Shell({ children }: { children: ReactNode }) {
  const name = useProgramName();
  return (
    <div className="portal">
      <header className="portal-top">
        <NavLink to="/" className="portal-top__brand heading">{name}</NavLink>
        <nav className="portal-top__nav" aria-label="Bereiche">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end}>{tab.label}</NavLink>
          ))}
        </nav>
        <NavLink to="/profil" className="portal-top__me" aria-label="Profil">
          <UserRound size={20} strokeWidth={1.6} />
        </NavLink>
      </header>
      <main className="portal-main">{children}</main>
      <nav className="portal-tabs" aria-label="Bereiche">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end}>
            <tab.icon size={21} strokeWidth={1.5} />
            <span>{tab.label}</span>
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

  if (!session) {
    return (
      <Routes>
        <Route path="/registrieren" element={<RegisterPage />} />
        <Route path="/passwort-vergessen" element={<ForgotPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
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
