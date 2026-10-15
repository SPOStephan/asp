import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build of the member portal alone, for the iOS/Android apps (Capacitor packs dist-app).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-app',
    emptyOutDir: true,
    rollupOptions: { input: { portal: 'portal.html' } },
  },
})
