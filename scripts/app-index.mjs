import { renameSync } from 'node:fs';

// Capacitor opens index.html; the portal build is called portal.html.
renameSync(new URL('../dist-app/portal.html', import.meta.url), new URL('../dist-app/index.html', import.meta.url));
