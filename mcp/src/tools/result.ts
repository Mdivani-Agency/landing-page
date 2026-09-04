import { isWriteTokenConfigured } from "../config";
import type { BlogApiFailure, BlogApiSuccess } from "../http/client";
import type { ToolContext, ToolResult } from "../types";

export function textResult(data: unknown, isError = false): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
    isError,
  };
}

export function requireToken(ctx: ToolContext): ToolResult | null {
  if (isWriteTokenConfigured(ctx.token)) {
    return null;
  }

  return textResult(
    {
      ok: false,
      base_url: ctx.baseUrl,
      error:
        "BLOG_WRITE_TOKEN is missing or shorter than 32 bytes. This is a configuration problem — set the environment variable and restart the MCP server. Do not retry.",
    },
    true,
  );
}

export function failureResult(
  result: BlogApiFailure,
): ToolResult {
  return textResult(
    {
      ok: false,
      base_url: result.baseUrl,
      status: result.status,
      error: result.message,
      errors: result.errors,
      retry_after_ms: result.retryAfterMs,
    },
    true,
  );
}

export function writeSuccessResult(result: BlogApiSuccess): ToolResult {
  const data = isRecord(result.data) ? result.data : { data: result.data };

  return textResult({
    ok: true,
    base_url: result.baseUrl,
    ...data,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
