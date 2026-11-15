import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  build: { sourcemap: false },
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "server" },
      spa: { enabled: true, prerender: { enabled: true, crawlLinks: false, routes: ["/"] } },
    }),
    viteReact(),
    tailwindcss(),
  ],
});
