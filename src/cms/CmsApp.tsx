import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '../admin/AdminAuth';
import '../admin/admin.css';
import { AdminLoginPage } from '../admin/pages/AdminLoginPage';
import { useHotel } from '../context/HotelContext';
import { supabase } from '../lib/supabase';
import { Footer } from '../components/Footer';
import { MobileChromeDock } from '../components/MobileChromeDock';
import { Navbar } from '../components/Navbar';
import { BlogPage } from '../pages/BlogPage';
import { BlogPostPage } from '../pages/BlogPostPage';
import { CulinaryPage } from '../pages/CulinaryPage';
import { FAQPage } from '../pages/FAQPage';
import { GenericHotelPage } from '../pages/GenericHotelPage';
import { LegalPage } from '../pages/LegalPage';
import { HomePage } from '../pages/HomePage';
import { ImpressionsPage } from '../pages/ImpressionsPage';
import { OfferDetailPage } from '../pages/OfferDetailPage';
import { OffersPage } from '../pages/OffersPage';
import { RoomsCardsPage } from '../pages/RoomsCardsPage';
import { WellnessPage } from '../pages/WellnessPage';
import { WellnessTopicPage } from '../pages/WellnessTopicPage';
import { OccasionPage } from '../pages/OccasionPage';
import { OccasionsPage } from '../pages/OccasionsPage';
import { cmsFrameDevice, isCmsFrame, isCmsFrameSearch, toCmsFrameHref } from './cmsFrame';
import { CmsEditor } from './CmsEditor';
import { CmsErrorBoundary } from './CmsErrorBoundary';
import { CmsImageDialog } from './CmsImageDialog';
import { CmsInlineEdit } from './CmsInlineEdit';
import { CmsPreviewFrame } from './CmsPreviewFrame';
import { CmsProvider, useCms } from './CmsContext';
import { CmsViewportBar } from './CmsViewportBar';
import './cms.css';

function CmsStage() {
  const cms = useCms();
  const phone = cms?.focalPreview === 'mobile';
  return (
    <div className="cms-stage">
      <Navbar />
      <Routes>
        <Route path="/cms" element={<HomePage />} />
        <Route path="/cms/zimmer" element={<RoomsCardsPage />} />
        <Route path="/cms/wellness/:topicId" element={<WellnessTopicPage />} />
        <Route path="/cms/anlaesse" element={<OccasionsPage />} />
        <Route path="/cms/anlaesse/:occasionId" element={<OccasionPage />} />
        <Route path="/cms/wellness" element={<WellnessPage />} />
        <Route path="/cms/kulinarik" element={<CulinaryPage />} />
        <Route path="/cms/angebote/:offerId" element={<OfferDetailPage />} />
        <Route path="/cms/angebote" element={<OffersPage />} />
        <Route path="/cms/blog/:postSlug" element={<BlogPostPage />} />
        <Route path="/cms/blog" element={<BlogPage />} />
        <Route path="/cms/impressionen" element={<ImpressionsPage />} />
        <Route path="/cms/faqs" element={<FAQPage />} />
        <Route path="/cms/impressum" element={<LegalPage pageKey="impressum" />} />
        <Route path="/cms/datenschutz" element={<LegalPage pageKey="datenschutz" />} />
        <Route path="/cms/agb" element={<LegalPage pageKey="agb" />} />
        <Route path="/cms/seite/:slug" element={<GenericHotelPage />} />
        <Route
          path="*"
          element={<Navigate to={isCmsFrame() ? toCmsFrameHref('/cms', cmsFrameDevice()) : '/cms'} replace />}
        />
      </Routes>
      <Footer />
      {phone ? <MobileChromeDock /> : null}
    </div>
  );
}

// Signed in is not enough: the person must be allowed to edit this hotel.
function useHotelAccess(enabled: boolean) {
  const hotel = useHotel();
  const [state, setState] = useState<'checking' | 'yes' | 'no'>('checking');
  useEffect(() => {
    if (!enabled || !hotel) return;
    let cancelled = false;
    void supabase.rpc('can_edit_hotel', { hotel: hotel.id }).then(({ data, error }) => {
      if (cancelled) return;
      // Before migration 025 the function does not exist yet: every admin may edit, as before.
      setState(error || data === true ? 'yes' : 'no');
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, hotel]);
  return state;
}

function CmsGate() {
  const { loading, admin, signOut } = useAdminAuth();
  const access = useHotelAccess(Boolean(admin));
  if (loading || (admin && access === 'checking')) {
    return (
      <div className="cms-login">
        <p>Editor wird geladen…</p>
      </div>
    );
  }
  if (!admin) {
    return (
      <div className="cms-login">
        <AdminLoginPage />
      </div>
    );
  }
  if (access === 'no') {
    return (
      <div className="cms-login">
        <p>Mit diesem Konto kannst du dieses Hotel nicht bearbeiten.</p>
        <button type="button" className="cms-btn cms-btn--ghost" onClick={() => void signOut()}>
          Mit anderem Konto anmelden
        </button>
      </div>
    );
  }
  return (
    <CmsProvider>
      <CmsErrorBoundary>
        {isCmsFrame() ? <CmsFrameShell /> : <CmsShell />}
      </CmsErrorBoundary>
    </CmsProvider>
  );
}

function CmsFrameGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const device = useCms()?.focalPreview ?? cmsFrameDevice();

  useEffect(() => {
    if (window.parent === window) return;
    if (isCmsFrameSearch(location.search)) return;
    navigate(toCmsFrameHref(location.pathname, device, location.search, location.hash), { replace: true });
  }, [device, location.hash, location.pathname, location.search, navigate]);

  return children;
}

function CmsFrameShell() {
  return (
    <CmsFrameGuard>
      <CmsStage />
      <CmsInlineEdit />
    </CmsFrameGuard>
  );
}

function CmsShell() {
  return (
    <div className="cms-shell">
      <CmsViewportBar />
      <CmsPreviewFrame />
      <CmsEditor />
      <CmsInlineEdit />
      <CmsImageDialog />
    </div>
  );
}

export function CmsApp() {
  return (
    <AdminAuthProvider>
      <CmsGate />
    </AdminAuthProvider>
  );
}
