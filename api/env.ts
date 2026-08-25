type EnvMap = Record<string, string | undefined>;

function runtimeEnv(): EnvMap {
  const fromProcess = (globalThis as { process?: { env?: EnvMap } }).process?.env;
  return fromProcess ?? {};
}

export function readEnv(...names: string[]) {
  const env = runtimeEnv();
  for (const name of names) {
    const value = env[name];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export function firstPresent(...names: string[]) {
  const env = runtimeEnv();
  return names.find((name) => typeof env[name] === 'string' && env[name]!.trim()) ?? null;
}

export const SUPABASE_URL_KEYS = ['VITE_SUPABASE_URL', 'SUPABASE_URL'] as const;
export const SUPABASE_ANON_KEYS = ['VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'] as const;
export const BUNNY_ZONE_KEYS = [
  'BUNNY_STORAGE_ZONE',
  'BUNNY_ZONE',
  'BUNNY_ZONE_NAME',
  'BUNNY_STORAGE_ZONE_NAME',
  'BUNNYNET_STORAGE_ZONE',
] as const;
export const BUNNY_KEY_KEYS = [
  'BUNNY_STORAGE_API_KEY',
  'BUNNY_API_KEY',
  'BUNNY_ACCESS_KEY',
  'BUNNY_STORAGE_PASSWORD',
  'BUNNY_STORAGE_KEY',
  'BUNNY_PASSWORD',
  'BUNNYNET_API_KEY',
] as const;
export const BUNNY_CDN_KEYS = [
  'BUNNY_CDN_URL',
  'BUNNY_CDN_HOSTNAME',
  'BUNNY_CDN_HOST',
  'BUNNY_PULL_ZONE_URL',
  'BUNNY_PULLZONE_URL',
  'BUNNY_PULL_ZONE',
  'BUNNY_HOSTNAME',
  'BUNNY_CDN',
] as const;
export const BUNNY_STORAGE_HOST_KEYS = ['BUNNY_STORAGE_HOST', 'BUNNY_STORAGE_ENDPOINT', 'BUNNY_STORAGE_HOSTNAME'] as const;
