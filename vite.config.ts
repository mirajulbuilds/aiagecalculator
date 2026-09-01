import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router') ||
              id.includes('/react-router-dom/') ||
              id.includes('/scheduler/')
            )
              return 'react-vendor';
            if (id.includes('/lucide-react/')) return 'icons';
            if (id.includes('/framer-motion/')) return 'animations';
            if (id.includes('/@supabase/') || id.includes('/supabase-js/')) return 'supabase';
            if (id.includes('/@radix-ui/')) return 'ui-primitives';
          }
        },
      },
    },
  },
}));
