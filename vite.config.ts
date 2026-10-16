import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// The member portal (portal.html) answers on its own host (e.g. app.<group>.de); in
// production api/site.ts serves it, here the dev server does the same for app.* hosts.
function portalHost(): Plugin {
  const portalHost = (process.env.VITE_PORTAL_HOST || '').toLowerCase();
  return {
    name: 'portal-host',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase().split(':')[0];
        const isPortal = (portalHost && host === portalHost) || host.startsWith('app.');
        const accept = String(req.headers.accept || '');
        if (isPortal && req.method === 'GET' && accept.includes('text/html')) req.url = '/portal.html';
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), portalHost()],
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
  server: { allowedHosts: true },
  build: {
    rollupOptions: {
      input: { main: 'index.html', portal: 'portal.html' },
    },
  },
})
