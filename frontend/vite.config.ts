import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Force rebuild with correct VITE_API_URL - Oct 18, 2025
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
  ],
  
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      // Shim the removed date-fns v2 formatter helper so the legacy adapter keeps working on v4.
      { find: "date-fns/_lib/format/longFormatters", replacement: path.resolve(__dirname, "./src/utils/dateFnsLongFormatters.ts") },
    ],
  },
  
  server: {
    host: true,
    port: 5173
  },
  
  // Build optimizations
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks(id) {
          // Design tokens in main chunk to avoid undefined errors
          if (id.includes('design-tokens')) {
            return 'index'
          }
          // Vendor chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-vendor'
          }
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs-2')) {
            return 'chart-vendor'
          }
          if (id.includes('node_modules/zustand')) {
            return 'state-vendor'
          }
        },
      },
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Minification
    minify: 'esbuild',
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'axios',
      'lucide-react',
    ],
  },
})