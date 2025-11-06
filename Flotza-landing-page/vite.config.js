import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: false, // Disable hot module replacement to stop WebSocket errors
    watch: {
      usePolling: true, // Use polling instead of WebSockets
      interval: 1000 // Check for changes every second
    }
  },
})
