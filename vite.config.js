import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    // preprocessorOptions: {
    //   scss: {
    //   }
    // }
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/3Dmodel': {
        target: 'http://192.168.0.105:8888',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
