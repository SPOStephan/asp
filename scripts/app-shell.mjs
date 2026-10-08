import { renameSync } from 'node:fs';

// Vercel would serve dist/index.html for "/" before any rewrite, which skips the
// server-rendered page. api/site.ts reads the shell under this name instead.
renameSync(new URL('../dist/index.html', import.meta.url), new URL('../dist/app-shell.html', import.meta.url));
