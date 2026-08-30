import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PROJECT_TYPES, TIMELINES } from "@/lib/contact";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

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
    send.mockResolvedValue({ data: { id: "email_1" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_FROM_EMAIL", "noreply@mdivani.org");
    vi.stubEnv("CONTACT_TO_EMAIL", "giorgi@mdivani.agency");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends a valid inquiry through Resend", async () => {
    const { POST } = await importRoute();
    const response = await POST(postRequest(validPayload));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith({
      from: "Mdivani Website <noreply@mdivani.org>",
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
  });

  it("returns 200 and does not send when the honeypot is filled", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest({ ...validPayload, website: "https://spam.test" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects non-JSON content types", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(validPayload, { "Content-Type": "text/plain" }),
    );

    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
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
    expect(send).not.toHaveBeenCalled();
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
