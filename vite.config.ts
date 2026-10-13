// Shared Vite preset: TanStack Start, React, Tailwind CSS, path aliases and the
// Cloudflare (nitro) build target are configured inside defineConfig.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
