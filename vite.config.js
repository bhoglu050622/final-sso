import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Changed to root path for standard Vercel deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
