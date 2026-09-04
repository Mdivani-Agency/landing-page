import { BLOG_WRITE_RATE_WINDOW_MS } from "../../../lib/blog-schema";

export type MappedApiError = {
  status: number;
  message: string;
  errors?: Record<string, string>;
  retryAfterMs?: number;
};

type ErrorBody = {
  errors?: Record<string, string>;
  slug?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readErrorBody(data: unknown): ErrorBody {
  if (!isRecord(data)) {
    return {};
  }

  const errors =
    isRecord(data.errors) &&
    Object.values(data.errors).every((value) => typeof value === "string")
      ? (data.errors as Record<string, string>)
      : undefined;

  return {
    errors,
    slug: typeof data.slug === "string" ? data.slug : undefined,
  };
}

export function parseRetryAfterMs(
  header: string | null,
  now = Date.now(),
): number | undefined {
  if (!header) {
    return undefined;
  }

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }

  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    return Math.max(0, date - now);
  }

  return undefined;
}

export function mapApiError(
  status: number,
  data: unknown,
  retryAfterHeader: string | null = null,
): MappedApiError {
  const body = readErrorBody(data);

  if (status === 400) {
    return {
      status,
      message: formatFieldErrors(body.errors) ?? "The post failed validation.",
      errors: body.errors,
    };
  }

  if (status === 409) {
    const slug = body.slug ? ` (${body.slug})` : "";
    return {
      status,
      message: `A post with that slug already exists${slug}. Call blog_update_post to change it, or choose a different title.`,
      errors: body.errors,
    };
  }

  if (status === 429) {
    const retryAfterMs =
      parseRetryAfterMs(retryAfterHeader) ?? BLOG_WRITE_RATE_WINDOW_MS;
    const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return {
      status,
      message: `Rate limited. Wait ${seconds} seconds before retrying. Do not retry in a tight loop.`,
      errors: body.errors,
      retryAfterMs,
    };
  }

  if (status === 401) {
    return {
      status,
      message:
        "The write API rejected the token. Check BLOG_WRITE_TOKEN and BLOG_API_BASE_URL — this is a configuration problem, not a retryable write error.",
      errors: body.errors,
    };
  }

  if (status === 404) {
    return {
      status,
      message: body.errors?.slug ?? "Post not found.",
      errors: body.errors,
    };
  }

  if (status === 500) {
    return {
      status,
      message:
        body.errors?.form ??
        "The write API is not configured or persistence failed. Report this to the user rather than retrying.",
      errors: body.errors,
    };
  }

  return {
    status,
    message: `Write API returned HTTP ${status}.`,
    errors: body.errors,
  };
}

export function formatFieldErrors(
  errors: Record<string, string> | undefined,
): string | undefined {
  if (!errors || Object.keys(errors).length === 0) {
    return undefined;
  }

  return Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join("\n");
}
