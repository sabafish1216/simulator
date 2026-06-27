import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages project site: https://sabafish1216.github.io/simulator/
  base: mode === 'production' ? '/simulator/' : '/',
  plugins: [react()],
}))
