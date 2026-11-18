import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: "es2022",
    outDir: "dist",
    // Phaser alone is ~1.2 MB minified; the app loads it from disk, so the 500 kB web default is noise.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
});
