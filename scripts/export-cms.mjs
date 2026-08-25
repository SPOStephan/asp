#!/usr/bin/env node
/**
 * Portable CMS dump. Needs SUPABASE_URL (or VITE_SUPABASE_URL)
 * and SUPABASE_SERVICE_ROLE_KEY. Writes JSON under ./cms-export/.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  console.error('SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY setzen.');
  process.exit(1);
}

const tables = ['hotels', 'hotel_sections', 'hotel_images', 'hotel_faqs', 'hotel_pages', 'media', 'admins', 'admin_invites'];
const outDir = resolve(process.cwd(), 'cms-export');
await mkdir(outDir, { recursive: true });

for (const table of tables) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  if (!response.ok) {
    console.error(`${table}: ${response.status} ${await response.text()}`);
    process.exit(1);
  }
  const rows = await response.json();
  await writeFile(resolve(outDir, `${table}.json`), JSON.stringify(rows, null, 2));
  console.log(`${table}: ${rows.length} Zeilen`);
}

console.log(`Export nach ${outDir}`);
