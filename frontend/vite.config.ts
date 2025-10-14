import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    
    // Gzip compression for production
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 10kb
      algorithm: 'gzip',
      ext: '.gz',
    }),
    
    // Brotli compression for production
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    
    // Bundle analyzer (run with --analyze flag)
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
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
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'state-vendor': ['zustand'],
        },
      },
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
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