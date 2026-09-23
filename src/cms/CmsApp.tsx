import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '../admin/AdminAuth';
import '../admin/admin.css';
import { AdminLoginPage } from '../admin/pages/AdminLoginPage';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { BlogPage } from '../pages/BlogPage';
import { CulinaryPage } from '../pages/CulinaryPage';
import { FAQPage } from '../pages/FAQPage';
import { HomePage } from '../pages/HomePage';
import { ImpressionsPage } from '../pages/ImpressionsPage';
import { OffersPage } from '../pages/OffersPage';
import { RoomsCardsPage } from '../pages/RoomsCardsPage';
import { WellnessPage } from '../pages/WellnessPage';
import { CmsEditor } from './CmsEditor';
import { CmsErrorBoundary } from './CmsErrorBoundary';
import { CmsImageDialog } from './CmsImageDialog';
import { CmsInlineEdit } from './CmsInlineEdit';
import { CmsProvider } from './CmsContext';
import './cms.css';

function CmsGate() {
  const { loading, admin } = useAdminAuth();
  if (loading) {
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
  return (
    <CmsProvider>
      <CmsErrorBoundary>
      <div className="cms-shell">
        <div className="cms-stage">
          <Navbar />
          <Routes>
            <Route path="/cms" element={<HomePage />} />
            <Route path="/cms/zimmer" element={<RoomsCardsPage />} />
            <Route path="/cms/wellness" element={<WellnessPage />} />
            <Route path="/cms/kulinarik" element={<CulinaryPage />} />
            <Route path="/cms/angebote" element={<OffersPage />} />
            <Route path="/cms/blog" element={<BlogPage />} />
            <Route path="/cms/impressionen" element={<ImpressionsPage />} />
            <Route path="/cms/faqs" element={<FAQPage />} />
            <Route path="*" element={<Navigate to="/cms" replace />} />
          </Routes>
          <Footer />
        </div>
        <CmsEditor />
        <CmsInlineEdit />
        <CmsImageDialog />
      </div>
      </CmsErrorBoundary>
    </CmsProvider>
  );
}

export function CmsApp() {
  return (
    <AdminAuthProvider>
      <CmsGate />
    </AdminAuthProvider>
  );
}
