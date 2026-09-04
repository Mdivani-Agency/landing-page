import { BLOG_WRITE_MIN_TOKEN_BYTES } from "../../lib/blog-schema";

export type McpConfig = {
  baseUrl: string;
  token: string;
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const PRODUCTION_HOSTS = new Set(["mdivani.agency", "www.mdivani.agency"]);

export function isAllowedBlogApiHost(hostname: string): boolean {
  return LOCAL_HOSTS.has(hostname) || PRODUCTION_HOSTS.has(hostname);
}

export function resolveBlogApiBaseUrl(raw: string): string {
  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`BLOG_API_BASE_URL is not a valid URL: ${raw}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("BLOG_API_BASE_URL must be http or https.");
  }

  if (!isAllowedBlogApiHost(parsed.hostname)) {
    throw new Error(
      `BLOG_API_BASE_URL host is not allowed: ${parsed.hostname}. Use localhost or mdivani.agency.`,
    );
  }

  if (parsed.protocol === "http:" && !LOCAL_HOSTS.has(parsed.hostname)) {
    throw new Error("BLOG_API_BASE_URL must use https except on localhost.");
  }

  return parsed.origin;
}

export function loadConfig(
  env: Record<string, string | undefined> = process.env,
): McpConfig {
  return {
    baseUrl: resolveBlogApiBaseUrl(
      env.BLOG_API_BASE_URL ?? "http://localhost:3000",
    ),
    token: env.BLOG_WRITE_TOKEN?.trim() ?? "",
  };
}

export function isWriteTokenConfigured(token: string): boolean {
  return Buffer.byteLength(token, "utf8") >= BLOG_WRITE_MIN_TOKEN_BYTES;
}
