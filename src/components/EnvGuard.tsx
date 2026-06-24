import type { ReactNode } from "react";

import { isSupabaseConfigured } from "@/integrations/supabase/client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

export function EnvGuard({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">
            Configuration needed
          </h1>
          <p className="text-sm text-muted-foreground">
            Supabase env vars were missing at build time. In Vercel, connect
            your Supabase integration or set{" "}
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then
            redeploy.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
