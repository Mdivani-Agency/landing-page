import { describe, expect, it } from "vitest";
import { loadConfig, resolveBlogApiBaseUrl } from "../config";

describe("resolveBlogApiBaseUrl", () => {
  it("allows localhost over http and production over https", () => {
    expect(resolveBlogApiBaseUrl("http://localhost:3000/")).toBe(
      "http://localhost:3000",
    );
    expect(resolveBlogApiBaseUrl("https://mdivani.agency")).toBe(
      "https://mdivani.agency",
    );
    expect(resolveBlogApiBaseUrl("https://www.mdivani.agency/blog")).toBe(
      "https://www.mdivani.agency",
    );
  });

  it("rejects other hosts and http to production", () => {
    expect(() => resolveBlogApiBaseUrl("https://evil.example")).toThrow(
      /not allowed/,
    );
    expect(() => resolveBlogApiBaseUrl("http://mdivani.agency")).toThrow(
      /https/,
    );
    expect(() =>
      resolveBlogApiBaseUrl("https://landing-page.vercel.app"),
    ).toThrow(/not allowed/);
  });
});

describe("loadConfig", () => {
  it("defaults to localhost", () => {
    expect(loadConfig({}).baseUrl).toBe("http://localhost:3000");
  });
});
