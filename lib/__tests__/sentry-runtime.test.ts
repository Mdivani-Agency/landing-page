import { describe, expect, it } from "vitest";
import { isSentryRuntimeEnabled } from "@/lib/sentry-runtime";

describe("isSentryRuntimeEnabled", () => {
  it("is off for local and unset environments", () => {
    expect(isSentryRuntimeEnabled({})).toBe(false);
    expect(isSentryRuntimeEnabled({ NODE_ENV: "development" })).toBe(false);
    expect(isSentryRuntimeEnabled({ NODE_ENV: "production" })).toBe(false);
    expect(
      isSentryRuntimeEnabled({ NEXT_PUBLIC_VERCEL_ENV: "development" }),
    ).toBe(false);
  });

  it("is on for Vercel preview and production", () => {
    expect(
      isSentryRuntimeEnabled({ NEXT_PUBLIC_VERCEL_ENV: "production" }),
    ).toBe(true);
    expect(isSentryRuntimeEnabled({ VERCEL_ENV: "preview" })).toBe(true);
  });
});
