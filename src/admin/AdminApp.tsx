import { useEffect } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { supabaseConfigError } from '../lib/supabase';
import { AdminAuthProvider, useAdminAuth } from './AdminAuth';
import { AdminAdminsPage } from './pages/AdminAdminsPage';
import { AdminHotelFormPage } from './pages/AdminHotelFormPage';
import { AdminHotelsPage } from './pages/AdminHotelsPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminMediaPage } from './pages/AdminMediaPage';
import './admin.css';

function AdminGate() {
  const { loading, admin, error, signOut } = useAdminAuth();

  if (loading) {
    return (
      <div className="admin-app">
        <div className="admin-login">
          <p className="admin-muted">Admin wird geladen…</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="admin-app">
        <AdminLoginPage />
      </div>
    );
  }

  return (
    <div className="admin-app">
      <div className="admin-shell">
        <aside className="admin-nav">
          <h1>Lohbeck CMS</h1>
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'is-on' : undefined)}>
            Hotels
          </NavLink>
          <NavLink to="/admin/media" className={({ isActive }) => (isActive ? 'is-on' : undefined)}>
            Medien
          </NavLink>
          <NavLink to="/admin/admins" className={({ isActive }) => (isActive ? 'is-on' : undefined)}>
            Admins
          </NavLink>
          <p className="admin-nav__who">{admin.email}</p>
          <button type="button" onClick={() => void signOut()}>
            Abmelden
          </button>
        </aside>
        <main className="admin-main">
          {error ? <p className="admin-error">{error}</p> : null}
          <Routes>
            <Route path="/admin" element={<AdminHotelsPage />} />
            <Route path="/admin/hotels/new" element={<AdminHotelFormPage />} />
            <Route path="/admin/hotels/:id" element={<AdminHotelFormPage />} />
            <Route path="/admin/media" element={<AdminMediaPage />} />
            <Route path="/admin/admins" element={<AdminAdminsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export function AdminApp() {
  useEffect(() => {
    document.title = 'Lohbeck CMS';
  }, []);

  if (supabaseConfigError) {
    return (
      <div className="admin-app">
        <div className="admin-login">
          <div className="admin-card">
            <h1>Lohbeck CMS</h1>
            <p className="admin-error">{supabaseConfigError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}
