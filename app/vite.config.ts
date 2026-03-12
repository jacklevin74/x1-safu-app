import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          wallet: ['@solana/wallet-adapter-react', '@solana/wallet-adapter-wallets', '@solana/wallet-adapter-react-ui'],
        }
      }
    }
  },
  define: {
    'process.env': {},
    'global': 'globalThis',
  },
})