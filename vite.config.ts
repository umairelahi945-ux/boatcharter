// Shared Vite preset: TanStack Start, React, Tailwind CSS and path aliases are
// configured inside defineConfig; Nitro targets Hostinger's Node.js runtime.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Browser-safe backend connection values (publishable key only). Used as a
// fallback when the published build does not receive them from `.env`.
const PUBLIC_BACKEND = {
  VITE_SUPABASE_URL: "https://rahqywkiherchcvqiftg.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_ijcurJx-NvMff_5PX3gRjA_Dbrytco4",
  VITE_SUPABASE_PROJECT_ID: "rahqywkiherchcvqiftg",
};

const define: Record<string, string> = {};
for (const [key, value] of Object.entries(PUBLIC_BACKEND)) {
  if (!process.env[key]) define[`import.meta.env.${key}`] = JSON.stringify(value);
}

export default defineConfig({
  vite: { define },
  nitro: {
    preset: "node-server",
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
