import { describe, expect, it } from "vitest";
import { readSupabaseAdminEnv, readSupabaseEnv } from "@/lib/supabase";

const url = "https://example.supabase.co";

describe("readSupabaseEnv", () => {
  it("returns the url and publishable key when both are set", () => {
    const env = readSupabaseEnv({
      SUPABASE_URL: url,
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });

    expect(env).toEqual({
      ok: true,
      url,
      key: "sb_publishable_example",
    });
  });

  it("reports every missing variable", () => {
    const env = readSupabaseEnv({});

    expect(env).toEqual({
      ok: false,
      missing: ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"],
    });
  });

  it("treats whitespace-only values as missing", () => {
    const env = readSupabaseEnv({
      SUPABASE_URL: "  ",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });

    expect(env).toEqual({ ok: false, missing: ["SUPABASE_URL"] });
  });

  it("does not fall back to the secret key", () => {
    const env = readSupabaseEnv({
      SUPABASE_URL: url,
      SUPABASE_SECRET_KEY: "sb_secret_example",
    });

    expect(env).toEqual({ ok: false, missing: ["SUPABASE_PUBLISHABLE_KEY"] });
  });
});

describe("readSupabaseAdminEnv", () => {
  it("returns the url and secret key when both are set", () => {
    const env = readSupabaseAdminEnv({
      SUPABASE_URL: url,
      SUPABASE_SECRET_KEY: "sb_secret_example",
    });

    expect(env).toEqual({ ok: true, url, key: "sb_secret_example" });
  });

  it("does not fall back to the publishable key", () => {
    const env = readSupabaseAdminEnv({
      SUPABASE_URL: url,
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });

    expect(env).toEqual({ ok: false, missing: ["SUPABASE_SECRET_KEY"] });
  });
});
