import { mapApiError, type MappedApiError } from "./errors";

export type BlogApiConfig = {
  baseUrl: string;
  token: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export type BlogApiSuccess = {
  ok: true;
  status: number;
  data: unknown;
  baseUrl: string;
};

export type BlogApiFailure = MappedApiError & {
  ok: false;
  baseUrl: string;
};

export type BlogApiResult = BlogApiSuccess | BlogApiFailure;

export type BlogApiRequest = (
  method: string,
  path: string,
  body?: unknown,
) => Promise<BlogApiResult>;

const DEFAULT_TIMEOUT_MS = 30_000;

export function createBlogApiClient(config: BlogApiConfig): BlogApiRequest {
  const fetchImpl = config.fetchImpl ?? fetch;
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return async function request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<BlogApiResult> {
    const url = `${config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/json",
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;

    try {
      response = await fetchImpl(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
        // The write token must not follow a cross-origin 3xx.
        redirect: "error",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Network request failed.";
      return {
        ok: false,
        status: 0,
        baseUrl: config.baseUrl,
        message: `Could not reach ${config.baseUrl}: ${message}. Check BLOG_API_BASE_URL. This is a configuration problem, not a retryable write error.`,
      };
    }

    let data: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = { errors: { form: text } };
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        baseUrl: config.baseUrl,
        ...mapApiError(
          response.status,
          data,
          response.headers.get("retry-after"),
        ),
      };
    }

    return {
      ok: true,
      status: response.status,
      data,
      baseUrl: config.baseUrl,
    };
  };
}
