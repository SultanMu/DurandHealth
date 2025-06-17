import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import disableHostCheck from "./vite-plugin-disable-host-check.js";
import apiMiddleware from "./api-middleware.js";
import path from 'path';

export default defineConfig({
  plugins: [react(), disableHostCheck(), apiMiddleware()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src'),
      "@shared": "/shared",
      "@assets": "/attached_assets",
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 5055,
      host: '0.0.0.0',
      port: 5055,
      protocol: 'ws',
      timeout: 5000,
      overlay: false
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  define: {
    global: 'globalThis',
  },
  preview: {
    port: 5000,
    strictPort: true,
  },
});
