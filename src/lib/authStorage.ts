const COOKIE_DOMAIN = '.lohbeckhotels.de';
const CHUNK = 2800;

function onLohbeckHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'lohbeckhotels.de' || host.endsWith('.lohbeckhotels.de');
}

function readCookie(name: string) {
  const parts = document.cookie.split('; ');
  const row = parts.find((part) => part.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 400) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Domain=${COOKIE_DOMAIN}; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Path=/; Domain=${COOKIE_DOMAIN}; SameSite=Lax; Max-Age=0`;
}

function cookieStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  return {
    getItem(key) {
      const count = Number(readCookie(`${key}.n`) || '0');
      if (!count) return readCookie(key);
      let value = '';
      for (let index = 0; index < count; index += 1) {
        value += readCookie(`${key}.${index}`) ?? '';
      }
      return value || null;
    },
    setItem(key, value) {
      this.removeItem(key);
      if (value.length <= CHUNK) {
        writeCookie(key, value);
        return;
      }
      const count = Math.ceil(value.length / CHUNK);
      writeCookie(`${key}.n`, String(count));
      for (let index = 0; index < count; index += 1) {
        writeCookie(`${key}.${index}`, value.slice(index * CHUNK, (index + 1) * CHUNK));
      }
    },
    removeItem(key) {
      clearCookie(key);
      const count = Number(readCookie(`${key}.n`) || '0');
      clearCookie(`${key}.n`);
      for (let index = 0; index < Math.max(count, 8); index += 1) {
        clearCookie(`${key}.${index}`);
      }
    },
  };
}

export function authStorage() {
  if (typeof window === 'undefined') return undefined;
  if (!onLohbeckHost()) return window.localStorage;

  const cookies = cookieStorage();
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key?.startsWith('sb-') || !key.includes('auth-token')) continue;
      const value = window.localStorage.getItem(key);
      if (value && !cookies.getItem(key)) cookies.setItem(key, value);
    }
  } catch {
    // ignore
  }
  return cookies;
}
