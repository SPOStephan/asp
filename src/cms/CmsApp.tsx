import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '../admin/AdminAuth';
import '../admin/admin.css';
import { AdminLoginPage } from '../admin/pages/AdminLoginPage';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { HomePage } from '../pages/HomePage';
import { RoomsCardsPage } from '../pages/RoomsCardsPage';
import { CmsEditor } from './CmsEditor';
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
      <div className="cms-shell">
        <div className="cms-stage">
          <Navbar />
          <Routes>
            <Route path="/cms" element={<HomePage />} />
            <Route path="/cms/zimmer" element={<RoomsCardsPage />} />
            <Route path="*" element={<Navigate to="/cms" replace />} />
          </Routes>
          <Footer />
        </div>
        <CmsEditor />
      </div>
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
