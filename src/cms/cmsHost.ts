export function isCmsPath(pathname: string) {
  return pathname === '/cms' || pathname.startsWith('/cms/');
}

export function cmsPublicPath(pathname: string) {
  if (pathname === '/cms') return '/';
  if (pathname.startsWith('/cms/')) return pathname.slice(4) || '/';
  return pathname;
}
