import { describe, expect, it } from "vitest";
import {
  BUDGETS,
  CONTACT_MAX_BODY_BYTES,
  PROJECT_TYPES,
  TIMELINES,
  exceedsContactBodyLimit,
  formatContactEmail,
  isHoneypotFilled,
  isJsonContentType,
  readContactEnv,
  validateContactPayload,
} from "@/lib/contact";

const validPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  projectType: PROJECT_TYPES[0],
  budget: BUDGETS[1],
  timeline: TIMELINES[1],
  description:
    "We want to build an AI-assisted product for founders starting from an idea.",
  link: "https://example.com",
};

describe("validateContactPayload", () => {
  it("accepts a complete valid payload and trims strings", () => {
    const result = validateContactPayload({
      ...validPayload,
      name: "  Ada Lovelace  ",
      email: "  ada@example.com  ",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        company: "Analytical Engines",
        projectType: PROJECT_TYPES[0],
        budget: BUDGETS[1],
        timeline: TIMELINES[1],
        description: validPayload.description,
        link: "https://example.com",
      },
    });
  });

  it("omits empty optional fields", () => {
    const result = validateContactPayload({
      ...validPayload,
      company: "   ",
      budget: "",
      link: "",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.company).toBeUndefined();
      expect(result.value.budget).toBeUndefined();
      expect(result.value.link).toBeUndefined();
    }
  });

  it("rejects a missing name", () => {
    const result = validateContactPayload({ ...validPayload, name: "" });

    expect(result).toEqual({
      ok: false,
      errors: { name: "Enter your name (2–100 characters)." },
    });
  });

  it("rejects a bad email", () => {
    const result = validateContactPayload({
      ...validPayload,
      email: "not-an-email",
    });

    expect(result).toEqual({
      ok: false,
      errors: { email: "Enter a valid email address." },
    });
  });

  it("rejects an unknown project type", () => {
    const result = validateContactPayload({
      ...validPayload,
      projectType: "Website redesign",
    });

    expect(result).toEqual({
      ok: false,
      errors: { projectType: "Select a project type." },
    });
  });

  it("rejects a description that is too short", () => {
    const result = validateContactPayload({
      ...validPayload,
      description: "Too short",
    });

    expect(result).toEqual({
      ok: false,
      errors: { description: "Describe the project (30–2000 characters)." },
    });
  });

  it("rejects a non-http URL", () => {
    const result = validateContactPayload({
      ...validPayload,
      link: "ftp://example.com/file",
    });

    expect(result).toEqual({
      ok: false,
      errors: { link: "Enter a valid http(s) URL." },
    });
  });

  it("rejects a non-object body", () => {
    expect(validateContactPayload(null)).toEqual({
      ok: false,
      errors: { form: "Send a JSON object." },
    });
  });
});

describe("isHoneypotFilled", () => {
  it("treats missing or blank website as empty", () => {
    expect(isHoneypotFilled(undefined)).toBe(false);
    expect(isHoneypotFilled("")).toBe(false);
    expect(isHoneypotFilled("   ")).toBe(false);
  });

  it("treats any filled website value as a bot", () => {
    expect(isHoneypotFilled("https://spam.test")).toBe(true);
    expect(isHoneypotFilled(1)).toBe(true);
  });
});

describe("formatContactEmail", () => {
  it("builds a fixed-order plain-text body and subject", () => {
    const result = validateContactPayload(validPayload);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(formatContactEmail(result.value)).toEqual({
      subject: `New inquiry from Ada Lovelace — ${PROJECT_TYPES[0]}`,
      text: [
        "Name: Ada Lovelace",
        "Email: ada@example.com",
        "Company: Analytical Engines",
        `Project type: ${PROJECT_TYPES[0]}`,
        `Budget: ${BUDGETS[1]}`,
        `Timeline: ${TIMELINES[1]}`,
        `Description: ${validPayload.description}`,
        "Link: https://example.com",
      ].join("\n"),
    });
  });
});

describe("readContactEnv", () => {
  it("reports each missing variable", () => {
    expect(readContactEnv({})).toEqual({
      ok: false,
      missing: ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"],
    });
  });

  it("returns trimmed values when all variables are set", () => {
    expect(
      readContactEnv({
        RESEND_API_KEY: " re_test ",
        CONTACT_FROM_EMAIL: " noreply@mdivani.org ",
        CONTACT_TO_EMAIL: " giorgi@mdivani.agency ",
      }),
    ).toEqual({
      ok: true,
      apiKey: "re_test",
      fromEmail: "noreply@mdivani.org",
      toEmail: "giorgi@mdivani.agency",
    });
  });
});

describe("request guards", () => {
  it("accepts JSON content types with a charset", () => {
    expect(isJsonContentType("application/json; charset=utf-8")).toBe(true);
    expect(isJsonContentType("text/plain")).toBe(false);
    expect(isJsonContentType(null)).toBe(false);
  });

  it("rejects bodies over the 10 KB limit", () => {
    const oversized = "x".repeat(CONTACT_MAX_BODY_BYTES + 1);

    expect(exceedsContactBodyLimit(String(oversized.length), oversized)).toBe(
      true,
    );
    expect(exceedsContactBodyLimit("100", "ok")).toBe(false);
  });
});
