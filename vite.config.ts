import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel may inherit unprefixed names from the hotel project.
// Vite only inlines VITE_* into the browser build.
if (!process.env.VITE_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL
}
if (!process.env.VITE_SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY) {
  process.env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
}

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
})
