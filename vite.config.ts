import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const path = (file: string) => fileURLToPath(new URL(file, import.meta.url))

// Relative base so the build works from any GitHub Pages path (username.github.io/<repo>/).
// Two pages: the player (/) and its iPhone Duo layout in the fold simulator (/duo/).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rolldownOptions: {
      input: { main: path('./index.html'), duo: path('./duo/index.html') },
    },
  },
})
