import { Navigate, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Welcome } from './components/Welcome';
import { Discover } from './components/Discover';
import { DirectBooking } from './components/DirectBooking';
import { Offers } from './components/Offers';
import { Wellness } from './components/Wellness';
import { Culinary } from './components/Culinary';
import { Generations } from './components/Generations';
import { Awards } from './components/Awards';
import { Highlights } from './components/Highlights';
import { Facts } from './components/Facts';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { FixedAvailabilityBar } from './components/FixedAvailabilityBar';
import { MobileChromeDock } from './components/MobileChromeDock';
import { WellnessPage } from './pages/WellnessPage';
import { WellnessTopicPage } from './pages/WellnessTopicPage';
import { FAQPage } from './pages/FAQPage';
import { OffersPage } from './pages/OffersPage';
import { OfferDetailPage } from './pages/OfferDetailPage';
import { RoomsCardsPage } from './pages/RoomsCardsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { CulinaryPage } from './pages/CulinaryPage';
import { FontsPage } from './pages/FontsPage';
import { MobileMenuLab } from './pages/MobileMenuLab';
import { MobileChromeLab } from './pages/MobileChromeLab';
import { MobileChromeLab2 } from './pages/MobileChromeLab2';
import { MobileChromeLab3 } from './pages/MobileChromeLab3';
import { MobileChromeLab4 } from './pages/MobileChromeLab4';
import { TypePreviewHomeNote } from './pages/TypePreviewHome';
import { FAQ } from './components/FAQ';
import { HomeBlog } from './components/HomeBlog';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { ImpressionsPage } from './pages/ImpressionsPage';
import { useHotelContent } from './context/HotelContext';
import { usePhoneChrome } from './lib/phoneChrome';
import { LoadingScreen, ErrorScreen } from './components/Loading';
import { useEffect } from 'react';

function HomePage() {
  return (
    <main>
      <Hero />
      <Welcome />
      <Discover />
      <DirectBooking />
      <Offers />
      <Wellness />
      <Highlights />
      <Culinary />
      <Generations />
      <Awards />
      <Facts />
      <FAQ />
      <HomeBlog />
      <Newsletter />
    </main>
  );
}

function RoomCompareRedirect() {
  const { roomId } = useParams();
  return <Navigate to={roomId ? `/zimmer/${roomId}` : '/zimmer'} replace />;
}

function App() {
  const location = useLocation();
  const isTypePreview = location.pathname === '/vorschau';
  const isHome = location.pathname === '/' || isTypePreview;
  const isFontLab = location.pathname === '/schriften';
  const isMenuLab = location.pathname === '/menue-mobil';
  const isChromeLab = location.pathname.startsWith('/mobil-leiste');
  const isPhone = usePhoneChrome();
  const showDock = isPhone && !isFontLab && !isMenuLab && !isChromeLab;
  const showFixedBar = !isHome && !isFontLab && !isMenuLab && !isChromeLab && !isPhone;
  const { loading, error } = useHotelContent();

  useEffect(() => {
    document.body.classList.toggle('has-fixed-bar', showFixedBar);
    document.body.classList.toggle('has-mobile-dock', showDock);
    return () => {
      document.body.classList.remove('has-fixed-bar');
      document.body.classList.remove('has-mobile-dock');
    };
  }, [showFixedBar, showDock]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div className={isTypePreview ? 'type-preview' : undefined}>
      <Navbar />
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
      <Footer />
      {isTypePreview && <TypePreviewHomeNote />}
      {showFixedBar ? <FixedAvailabilityBar /> : null}
      {showDock ? <MobileChromeDock /> : null}
    </div>
  );
}

export default App;
