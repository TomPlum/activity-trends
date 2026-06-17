import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Server Supabase client for React Server Components / route handlers. The app
 * has no auth (public read-only) so cookie writes are no-ops, but we still wire
 * the cookie store through for @supabase/ssr compatibility.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No auth — nothing to persist.
        },
      },
    },
  );
}
