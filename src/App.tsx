import { useEffect, type ReactNode } from 'react';
import { Navigate, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { AdminApp } from './admin/AdminApp';
import { isAdminHost, isAdminPath } from './admin/adminHost';
import { CmsApp } from './cms/CmsApp';
import { isCmsPath } from './cms/cmsHost';
import { FAQPage } from './pages/FAQPage';
import { Footer } from './components/Footer';
import { FixedAvailabilityBar } from './components/FixedAvailabilityBar';
import { LoadingScreen, ErrorScreen } from './components/Loading';
import { MobileChromeDock } from './components/MobileChromeDock';
import { Navbar } from './components/Navbar';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { CulinaryPage } from './pages/CulinaryPage';
import { FontsPage } from './pages/FontsPage';
import { HomePage } from './pages/HomePage';
import { ImpressionsPage } from './pages/ImpressionsPage';
import { MobileChromeLab } from './pages/MobileChromeLab';
import { MobileChromeLab2 } from './pages/MobileChromeLab2';
import { MobileChromeLab3 } from './pages/MobileChromeLab3';
import { MobileChromeLab4 } from './pages/MobileChromeLab4';
import { MobileMenuLab } from './pages/MobileMenuLab';
import { OfferDetailPage } from './pages/OfferDetailPage';
import { OffersPage } from './pages/OffersPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { RoomsCardsPage } from './pages/RoomsCardsPage';
import { TypePreviewHomeNote } from './pages/TypePreviewHome';
import { WellnessPage } from './pages/WellnessPage';
import { WellnessTopicPage } from './pages/WellnessTopicPage';
import { useHotelContent } from './context/HotelContext';
import { pageKeyFromPath } from './lib/musterPages';
import { usePhoneChrome } from './lib/phoneChrome';

function RoomCompareRedirect() {
  const { roomId } = useParams();
  return <Navigate to={roomId ? `/zimmer/${roomId}` : '/zimmer'} replace />;
}

function PageGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isPageEnabled } = useHotelContent();
  const key = pageKeyFromPath(location.pathname);
  if (key && !isPageEnabled(key)) {
    return (
      <main className="cms-missing">
        <h1>Seite nicht freigeschaltet</h1>
        <p>Dieses Muster ist für das Hotel aus.</p>
      </main>
    );
  }
  return children;
}

function App() {
  const location = useLocation();
  const adminShell = isAdminHost() || isAdminPath(location.pathname);
  const cmsShell = isCmsPath(location.pathname);
  const isTypePreview = location.pathname === '/vorschau';
  const isHome = location.pathname === '/' || isTypePreview;
  const isFontLab = location.pathname === '/schriften';
  const isMenuLab = location.pathname === '/menue-mobil';
  const isChromeLab = location.pathname.startsWith('/mobil-leiste');
  const isPhone = usePhoneChrome();
  const showDock = !adminShell && !cmsShell && isPhone && !isFontLab && !isMenuLab && !isChromeLab;
  const showFixedBar = !adminShell && !cmsShell && !isHome && !isFontLab && !isMenuLab && !isChromeLab && !isPhone;
  const { loading, error } = useHotelContent();

  useEffect(() => {
    document.body.classList.toggle('is-phone', !adminShell && !cmsShell && isPhone);
    document.body.classList.toggle('has-fixed-bar', showFixedBar);
    document.body.classList.toggle('has-mobile-dock', showDock);
    return () => {
      document.body.classList.remove('is-phone');
      document.body.classList.remove('has-fixed-bar');
      document.body.classList.remove('has-mobile-dock');
    };
  }, [adminShell, cmsShell, isPhone, showFixedBar, showDock]);

  if (isAdminHost() && location.pathname === '/') {
    return <Navigate to="/admin" replace />;
  }
  if (adminShell) {
    return <AdminApp />;
  }
  if (cmsShell) {
    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen message={error} />;
    return <CmsApp />;
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div className={isTypePreview ? 'type-preview' : undefined}>
      <Navbar />
      <PageGate>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vorschau" element={<HomePage />} />
          <Route path="/wellness" element={<WellnessPage />} />
          <Route path="/wellness/:topicId" element={<WellnessTopicPage />} />
          <Route path="/angebote" element={<OffersPage />} />
          <Route path="/angebote/:offerId" element={<OfferDetailPage />} />
          <Route path="/zimmer" element={<RoomsCardsPage />} />
          <Route path="/zimmer-b" element={<Navigate to="/zimmer" replace />} />
          <Route path="/zimmer/:roomId" element={<RoomDetailPage />} />
          <Route path="/zimmer-vergleich/:roomId" element={<RoomCompareRedirect />} />
          <Route path="/kulinarik" element={<CulinaryPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:postSlug" element={<BlogPostPage />} />
          <Route path="/impressionen" element={<ImpressionsPage />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/schriften" element={<FontsPage />} />
          <Route path="/menue-mobil" element={<MobileMenuLab />} />
          <Route path="/mobil-leiste" element={<MobileChromeLab />} />
          <Route path="/mobil-leiste2" element={<MobileChromeLab2 />} />
          <Route path="/mobil-leiste3" element={<MobileChromeLab3 />} />
          <Route path="/mobil-leiste4" element={<MobileChromeLab4 />} />
        </Routes>
      </PageGate>
      <Footer />
      {isTypePreview && <TypePreviewHomeNote />}
      {showFixedBar ? <FixedAvailabilityBar /> : null}
      {showDock ? <MobileChromeDock /> : null}
    </div>
  );
}

export default App;
