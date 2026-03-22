import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts', 'echarts-for-react'],
          reactVendor: ['react', 'react-dom'],
          queryVendor: ['@tanstack/react-query'],
        },
      },
    },
  },
})
