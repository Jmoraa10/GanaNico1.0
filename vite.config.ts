import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // 👈 esto abre el navegador automáticamente
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            '@headlessui/react',
            'framer-motion',
            'lucide-react',
            'html2canvas',
            'dompurify'
          ],
          'services': [
            './src/services/fincaService',
            './src/services/ventaService',
            './src/services/authService'
          ],
          'components': [
            './src/components/HistorialMovimientos',
            './src/components/MovimientoGanadoDialog',
            './src/components/AlertaFaltantes'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
