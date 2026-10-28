import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // serve website/assets/ too, so menu photos like /basque-cheesecake.png load here as on the site
  publicDir: path.resolve(__dirname, '../assets'),
  resolve: {
    alias: {
      // lets components import the shared assets/ folder without relative ../../ chains
      '@assets': path.resolve(__dirname, '../assets'),
    },
  },
})
