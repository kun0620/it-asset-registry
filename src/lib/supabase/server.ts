import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Must be called fresh inside each Server Component / Server Action / Route
 * Handler — it binds to that request's cookies, so a module-level singleton
 * (like the pre-auth src/lib/supabase.ts) would leak sessions across users.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render — middleware refreshes
            // the session on the next request, so this is safe to ignore.
          }
        },
      },
    },
  );
}
