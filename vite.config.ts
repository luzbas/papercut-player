import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the build works from any GitHub Pages path (username.github.io/<repo>/).
export default defineConfig({
  plugins: [react()],
  base: './',
})
