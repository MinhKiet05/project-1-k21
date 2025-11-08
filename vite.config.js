import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          react: ['react', 'react-dom', 'react-router-dom'],
          
          // Authentication & Database
          supabase: ['@supabase/supabase-js'],
          clerk: ['@clerk/clerk-react'],
          
          // UI & Icons
          ui: ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons'],
          
          // Toast notifications
          notifications: ['react-toastify'],
          
          // Charts & Data visualization (if any)
          // charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
    // Optimize chunks size
    chunkSizeWarningLimit: 1000,
    
    // Enable source maps for better debugging
    sourcemap: false,
    
    // Minify for production
    minify: 'terser',
    
    // Optimize CSS
    cssMinify: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@supabase/supabase-js',
      '@clerk/clerk-react'
    ],
  },
})
