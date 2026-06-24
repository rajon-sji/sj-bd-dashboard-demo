import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { triageDevApiPlugin } from "./vite-plugin-triage-dev-api";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Server-side triage code reads process.env (dev API plugin + scripts).
  if (mode === "development") {
    for (const [key, value] of Object.entries(env)) {
      if (value) process.env[key] = value;
    }
  }

  // Vite only auto-exposes VITE_* — map Supabase integration vars too (Vercel sets NEXT_PUBLIC_*).
  const supabaseUrl =
    env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    "";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && triageDevApiPlugin(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseKey),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
        env.VITE_SUPABASE_PROJECT_ID ||
          supabaseUrl.replace("https://", "").replace(".supabase.co", "")
      ),
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        env.VITE_API_BASE_URL ||
          (supabaseUrl ? `${supabaseUrl}/functions/v1` : "")
      ),
    },
  };
});
