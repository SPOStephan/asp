import { Routes, Route, useLocation } from 'react-router-dom';
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
import { WellnessPage } from './pages/WellnessPage';
import { FAQPage } from './pages/FAQPage';
import { FAQ } from './components/FAQ';
import { useHotelContent } from './context/HotelContext';
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
      <Newsletter />
    </main>
  );
}

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { loading, error } = useHotelContent();

  useEffect(() => {
    document.body.classList.toggle('has-fixed-bar', !isHome);
    return () => document.body.classList.remove('has-fixed-bar');
  }, [isHome]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wellness" element={<WellnessPage />} />
        <Route path="/faqs" element={<FAQPage />} />
      </Routes>
      <Footer />
      {!isHome && <FixedAvailabilityBar />}
    </>
  );
}

export default App;
