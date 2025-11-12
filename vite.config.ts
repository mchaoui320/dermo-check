import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '', // important pour Vercel, mais marche aussi en local
  server: {
    port: 5173,
  },
})
