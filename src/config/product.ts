// Everything that differs between installations of the product lives here and is
// set per deployment through environment variables, never in the code.
//   VITE_PRODUCT_NAME        name of the product in the admin area
//   VITE_PLATFORM_DOMAIN     shared domain the hotels get subdomains on (e.g. hotels.example.com)
//   VITE_ADMIN_HOST          host of the admin area (default: any "admin." host)
//   VITE_AUTH_COOKIE_DOMAIN  cookie domain that shares the login across subdomains (e.g. .hotels.example.com)
//   VITE_REFERENCE_HOTEL     slug of the hotel shown for unknown domains and previews

function read(name: string): string {
  const fromVite = (import.meta as { env?: Record<string, string | undefined> }).env?.[name];
  const fromNode = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  return (fromVite || fromNode || '').trim();
}

export const PRODUCT_NAME = read('VITE_PRODUCT_NAME') || 'Hotel CMS';
export const PLATFORM_DOMAIN = read('VITE_PLATFORM_DOMAIN').replace(/^\.+/, '').toLowerCase();
export const ADMIN_HOST = read('VITE_ADMIN_HOST').toLowerCase();
export const AUTH_COOKIE_DOMAIN = read('VITE_AUTH_COOKIE_DOMAIN').toLowerCase();
export const REFERENCE_HOTEL_SLUG = read('VITE_REFERENCE_HOTEL');

export function onPlatformDomain(host: string, domain = PLATFORM_DOMAIN) {
  const value = host.toLowerCase();
  return Boolean(domain) && (value === domain || value.endsWith(`.${domain}`));
}
