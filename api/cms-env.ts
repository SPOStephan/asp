import {
  BUNNY_CDN_KEYS,
  BUNNY_KEY_KEYS,
  BUNNY_STORAGE_HOST_KEYS,
  BUNNY_ZONE_KEYS,
  SUPABASE_ANON_KEYS,
  SUPABASE_URL_KEYS,
  firstPresent,
} from './env';

type EnvMap = Record<string, string | undefined>;

function runtimeEnv(): EnvMap {
  return (globalThis as { process?: { env?: EnvMap } }).process?.env ?? {};
}

export const config = { runtime: 'edge' };

export default function handler() {
  const env = runtimeEnv();
  const bunnyish = Object.keys(env)
    .filter((key) => /bunny|cdn|storage_zone|pull.?zone/i.test(key))
    .sort();

  return Response.json({
    supabaseUrl: firstPresent(...SUPABASE_URL_KEYS),
    supabaseAnon: firstPresent(...SUPABASE_ANON_KEYS),
    bunnyZone: firstPresent(...BUNNY_ZONE_KEYS),
    bunnyKey: firstPresent(...BUNNY_KEY_KEYS),
    bunnyCdn: firstPresent(...BUNNY_CDN_KEYS),
    bunnyStorageHost: firstPresent(...BUNNY_STORAGE_HOST_KEYS),
    bunnyishKeyNames: bunnyish,
  });
}
