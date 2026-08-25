export function isAdminHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'admin.lohbeckhotels.de' || host.startsWith('admin.');
}

export function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function isAdminShell(pathname: string) {
  return isAdminHost() || isAdminPath(pathname);
}
