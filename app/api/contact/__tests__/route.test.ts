import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BUDGETS,
  CONTACT_MAX_BODY_BYTES,
  PROJECT_TYPES,
  TIMELINES,
} from "@/lib/contact";
import { CONTACT_RATE_LIMIT_MAX_REQUESTS } from "@/lib/rate-limit";

const { send, captureException, insertInquiry } = vi.hoisted(() => ({
  send: vi.fn(),
  captureException: vi.fn(),
  insertInquiry: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

vi.mock("@sentry/nextjs", () => ({
  captureException,
}));

vi.mock("@/lib/inquiries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/inquiries")>();
  return { ...actual, insertInquiry };
});

const validPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  projectType: PROJECT_TYPES[0],
  timeline: TIMELINES[1],
  description:
    "We want to build an AI-assisted product for founders starting from an idea.",
};

function postRequest(
  body: unknown,
  headers: HeadersInit = { "Content-Type": "application/json" },
) {
  const serialized = typeof body === "string" ? body : JSON.stringify(body);

  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers,
    body: serialized,
  });
}

async function importRoute() {
  return import("@/app/api/contact/route");
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules();
    send.mockReset();
    captureException.mockReset();
    insertInquiry.mockReset();
    send.mockResolvedValue({ data: { id: "email_1" }, error: null });
    insertInquiry.mockResolvedValue({ id: "inq_1" });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_FROM_EMAIL", "noreply@sales.mdivani.agency");
    vi.stubEnv("CONTACT_TO_EMAIL", "giorgi@mdivani.agency");
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("persists a valid inquiry then sends it through Resend", async () => {
    const order: string[] = [];
    insertInquiry.mockImplementation(async () => {
      order.push("insert");
      return { id: "inq_1" };
    });
    send.mockImplementation(async () => {
      order.push("send");
      return { data: { id: "email_1" }, error: null };
    });

    const { POST } = await importRoute();
    const response = await POST(
      postRequest({
        ...validPayload,
        company: "Analytical Engines",
        budget: BUDGETS[0],
        link: "https://example.com",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(order).toEqual(["insert", "send"]);
    expect(insertInquiry).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: "Analytical Engines",
      project_type: PROJECT_TYPES[0],
      budget: BUDGETS[0],
      timeline: TIMELINES[1],
      description: validPayload.description,
      link: "https://example.com",
    });
    expect(send).toHaveBeenCalledWith({
      from: "Mdivani Website <noreply@sales.mdivani.agency>",
      to: "giorgi@mdivani.agency",
      replyTo: "ada@example.com",
      subject: `New inquiry from Ada Lovelace — ${PROJECT_TYPES[0]}`,
      text: expect.stringContaining("Name: Ada Lovelace"),
    });
  });

  it("returns per-field errors for invalid payloads", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest({ ...validPayload, email: "bad", description: "short" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      errors: {
        email: "Enter a valid email address.",
        description: "Describe the project (30–2000 characters).",
      },
    });
    expect(send).not.toHaveBeenCalled();
    expect(insertInquiry).not.toHaveBeenCalled();
  });

  it("returns 200 and does not send when the honeypot is filled", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest({ ...validPayload, website: "https://spam.test" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
    expect(insertInquiry).not.toHaveBeenCalled();
  });

  it("rejects non-JSON content types", async () => {
    const { POST } = await importRoute();

    for (const contentType of ["text/plain", "text/plain; application/json"]) {
      const response = await POST(
        postRequest(validPayload, { "Content-Type": contentType }),
      );

      expect(response.status).toBe(400);
    }

    expect(send).not.toHaveBeenCalled();
    expect(insertInquiry).not.toHaveBeenCalled();
  });

  it("rejects an oversized body even without a Content-Length header", async () => {
    const { POST } = await importRoute();
    const oversized = {
      ...validPayload,
      description: "x".repeat(CONTACT_MAX_BODY_BYTES + 1),
    };
    const request = postRequest(oversized);

    expect(request.headers.get("content-length")).toBeNull();

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      errors: { form: "Request is too large." },
    });
    expect(send).not.toHaveBeenCalled();
    expect(insertInquiry).not.toHaveBeenCalled();
  });

  it("returns 429 once a client exceeds the rate limit", async () => {
    const { POST } = await importRoute();
    const headers = {
      "Content-Type": "application/json",
      "x-forwarded-for": "203.0.113.7",
    };

    for (let i = 0; i < CONTACT_RATE_LIMIT_MAX_REQUESTS; i += 1) {
      const response = await POST(postRequest(validPayload, headers));
      expect(response.status).toBe(200);
    }

    const blocked = await POST(postRequest(validPayload, headers));

    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
    await expect(blocked.json()).resolves.toEqual({
      ok: false,
      errors: { form: "Too many requests. Please wait a minute and try again." },
    });
    expect(send).toHaveBeenCalledTimes(CONTACT_RATE_LIMIT_MAX_REQUESTS);
    expect(insertInquiry).toHaveBeenCalledTimes(CONTACT_RATE_LIMIT_MAX_REQUESTS);
  });

  it("returns a generic 500 when env vars are missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await importRoute();
    const response = await POST(postRequest(validPayload));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      errors: {
        form: "Something went wrong. Please try again or email us directly.",
      },
    });
    expect(error).toHaveBeenCalledWith("contact: missing env", "RESEND_API_KEY");
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "contact: missing env RESEND_API_KEY",
      }),
      expect.objectContaining({
        tags: { area: "contact" },
      }),
    );
    expect(send).not.toHaveBeenCalled();
    expect(insertInquiry).not.toHaveBeenCalled();
  });

  it("returns a generic 500 when Supabase env vars are missing", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await importRoute();
    const response = await POST(postRequest(validPayload));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      errors: {
        form: "Something went wrong. Please try again or email us directly.",
      },
    });
    expect(error).toHaveBeenCalledWith(
      "contact: missing env",
      "SUPABASE_SECRET_KEY",
    );
    expect(insertInquiry).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("returns a generic 500 when the inquiry insert fails and does not email", async () => {
    insertInquiry.mockRejectedValue(new Error("contact: inquiry insert failed"));
    const { POST } = await importRoute();
    const response = await POST(postRequest(validPayload));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      errors: {
        form: "Something went wrong. Please try again or email us directly.",
      },
    });
    expect(JSON.stringify(body)).not.toContain("inquiry insert failed");
    expect(send).not.toHaveBeenCalled();
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "contact: inquiry insert failed",
      }),
      expect.objectContaining({
        tags: { area: "contact" },
      }),
    );
  });

  it("returns a generic 500 when Resend fails", async () => {
    send.mockResolvedValue({ data: null, error: { message: "secret" } });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await importRoute();
    const response = await POST(postRequest(validPayload));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      errors: {
        form: "Something went wrong. Please try again or email us directly.",
      },
    });
    expect(JSON.stringify(body)).not.toContain("secret");
    expect(error).toHaveBeenCalledWith("contact: resend failed", {
      message: "secret",
    });
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Error",
        message: "secret",
      }),
      expect.objectContaining({
        tags: { area: "contact" },
      }),
    );
    expect(captureException.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(insertInquiry).toHaveBeenCalledTimes(1);
  });

  it("includes the Resend status code when reporting a send error", async () => {
    send.mockResolvedValue({
      data: null,
      error: { message: "rate limited", statusCode: 429 },
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await importRoute();
    const response = await POST(postRequest(validPayload));

    expect(response.status).toBe(500);
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "rate limited" }),
      expect.objectContaining({
        tags: { area: "contact" },
        extra: { statusCode: 429 },
      }),
    );
  });
});

describe("GET /api/contact", () => {
  it("returns 405", async () => {
    const { GET } = await importRoute();
    const response = GET();

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });
});
