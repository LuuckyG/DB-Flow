import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to all interfaces so the dev server is reachable from outside the
    // container (required for Docker). This has no effect in normal local dev.
    host: '0.0.0.0',
    port: 5173,
  },
})
