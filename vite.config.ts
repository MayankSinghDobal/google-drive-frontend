import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allow serving files from one level up from the project root
      allow: ['..']
    }
  },
  optimizeDeps: {
    // Force pre-bundling to avoid the rename issue
    force: true
  },
  // Alternative: disable dependency pre-bundling entirely for development
  // optimizeDeps: {
  //   disabled: true
  // }
})