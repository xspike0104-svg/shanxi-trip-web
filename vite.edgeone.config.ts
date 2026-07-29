import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "edgeone-app",
  publicDir: "../public",
  plugins: [react()],
  build: {
    outDir: "../edgeone-dist",
    emptyOutDir: true,
  },
});
