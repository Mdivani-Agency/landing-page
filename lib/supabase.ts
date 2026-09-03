import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseEnv =
  | { ok: true; url: string; key: string }
  | { ok: false; missing: string[] };

type SupabaseKeyName = "SUPABASE_PUBLISHABLE_KEY" | "SUPABASE_SECRET_KEY";

function readEnv(
  keyName: SupabaseKeyName,
  env: Record<string, string | undefined>,
): SupabaseEnv {
  const url = env.SUPABASE_URL?.trim() ?? "";
  const key = env[keyName]?.trim() ?? "";
  const missing: string[] = [];

  if (!url) {
    missing.push("SUPABASE_URL");
  }

  if (!key) {
    missing.push(keyName);
  }

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return { ok: true, url, key };
}

export function readSupabaseEnv(
  env: Record<string, string | undefined> = process.env,
): SupabaseEnv {
  return readEnv("SUPABASE_PUBLISHABLE_KEY", env);
}

export function readSupabaseAdminEnv(
  env: Record<string, string | undefined> = process.env,
): SupabaseEnv {
  return readEnv("SUPABASE_SECRET_KEY", env);
}

// Nothing here signs a user in, so the client should not keep or refresh a
// session between requests.
const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
} as const;

/**
 * Client for reads. The publishable key resolves to the `anon` role, so row
 * level security decides what comes back.
 */
export function createSupabaseReadClient(
  url: string,
  publishableKey: string,
): SupabaseClient {
  return createClient(url, publishableKey, clientOptions);
}

/**
 * Client for writes. The secret key bypasses row level security entirely, so
 * this must only ever run server-side, behind its own authorization check.
 */
export function createSupabaseAdminClient(
  url: string,
  secretKey: string,
): SupabaseClient {
  return createClient(url, secretKey, clientOptions);
}
