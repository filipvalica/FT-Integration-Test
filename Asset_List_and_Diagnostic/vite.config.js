import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 8000,
    strictPort: true,
    // Allow connections from any origin (needed for FieldTwin proxy)
    cors: true,
  },
})
