import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import disableHostCheck from "./vite-plugin-disable-host-check.js";
import apiMiddleware from "./api-middleware.js";

export default defineConfig({
  plugins: [react(), disableHostCheck(), apiMiddleware()],
  resolve: {
    alias: {
      "@": "/src",
      "@shared": "/shared",
      "@assets": "/attached_assets",
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: false,
    hmr: {
      port: 5000,
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
});
