import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['1ec0-114-130-121-22.ngrok-free.app', 'http://localhost:3000'],
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
      },
    },
    fs: {
      allow: ['..']
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-socket': ['socket.io-client'],
          'vendor-ui': ['@mui/joy', 'antd'],
          'vendor-utils': ['axios', 'crypto-js', 'emoji-picker-react']
        }
      }
    }
  }
})
