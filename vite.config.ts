import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/Dashboard-vue/', // <= igual ao nome do repo!
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
