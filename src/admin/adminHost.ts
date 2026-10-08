import { ADMIN_HOST } from '../config/product';
export function isAdminHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (Boolean(ADMIN_HOST) && host === ADMIN_HOST) || host.startsWith('admin.');
}

export function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function isAdminShell(pathname: string) {
  return isAdminHost() || isAdminPath(pathname);
}
