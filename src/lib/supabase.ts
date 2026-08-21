import { createClient } from "@supabase/supabase-js";

// Server-side only. The keys are deliberately not NEXT_PUBLIC_ prefixed so they
// can never be inlined into a client bundle — RLS is currently disabled on both
// tables, so the anon key must not reach the browser.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);
