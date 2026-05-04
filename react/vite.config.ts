import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Forced restart to detect new dependencies like sonner
export default defineConfig({
  plugins: [react()],
})
