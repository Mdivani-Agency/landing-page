import { BLOG_WRITE_MIN_TOKEN_BYTES } from "../../lib/blog-schema";

export type McpConfig = {
  baseUrl: string;
  token: string;
};

export function loadConfig(
  env: Record<string, string | undefined> = process.env,
): McpConfig {
  const baseUrl = (env.BLOG_API_BASE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  return {
    baseUrl,
    token: env.BLOG_WRITE_TOKEN?.trim() ?? "",
  };
}

export function isWriteTokenConfigured(token: string): boolean {
  return Buffer.byteLength(token, "utf8") >= BLOG_WRITE_MIN_TOKEN_BYTES;
}
