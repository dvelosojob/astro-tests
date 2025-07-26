// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import node from "@astrojs/node";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    build: {
      rollupOptions: {
        external: [
          /test\.(ts|js|tsx|jsx)$/,
          /\.(test|spec)\.(ts|js|tsx|jsx)$/,
          /\.astro\.spec\.(ts|tsx)$/,
          /vitest/,
          /\/__tests__\//,
        ],
      },
    },
  },
  integrations: [react()],
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  srcDir: "src",
  site: "https://www.example.com",
  base: "/",
  trailingSlash: "ignore",
});
