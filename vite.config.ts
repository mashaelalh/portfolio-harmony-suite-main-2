/// <reference types="vitest" />
import { defineConfig, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import postcssImport from 'postcss-import';
import tailwindcssNesting from 'tailwindcss/nesting';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",  // This will allow connections from both localhost and IP address
    port: 3000,
    https: {
      key: fs.readFileSync('./certs/localhost-key.pem'),
      cert: fs.readFileSync('./certs/localhost.pem'),
    },
    strictPort: true, // Ensure the server only uses the specified port
    historyApiFallback: true, // Critical for client-side routing
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Vitest configuration integrated directly
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Path to setup file
    // You might want to configure CSS handling if your components import CSS directly
    // css: true,
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    // Add this to handle frappe-gantt CSS
    postcss: {
      plugins: [
        postcssImport(),
        tailwindcssNesting(),
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
}));