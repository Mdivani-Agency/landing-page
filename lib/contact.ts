export const PROJECT_TYPES = [
  "New product (greenfield)",
  "AI feature for an existing product",
  "Cloud architecture / consulting",
  "Something else",
] as const;

export const BUDGETS = [
  "$10k–$25k",
  "$25k–$50k",
  "$50k+",
  "Not sure yet",
] as const;

export const TIMELINES = [
  "ASAP",
  "1–3 months",
  "3–6 months",
  "Just exploring",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type Budget = (typeof BUDGETS)[number];
export type Timeline = (typeof TIMELINES)[number];

export type ContactField =
  | "name"
  | "email"
  | "company"
  | "projectType"
  | "budget"
  | "timeline"
  | "description"
  | "link"
  | "form";

export type ContactErrors = Partial<Record<ContactField, string>>;

export type ValidatedContact = {
  name: string;
  email: string;
  company?: string;
  projectType: ProjectType;
  budget?: Budget;
  timeline: Timeline;
  description: string;
  link?: string;
};

export type ContactValidationResult =
  | { ok: true; value: ValidatedContact }
  | { ok: false; errors: ContactErrors };

// Pragmatic, not RFC-complete: requires a single @, no whitespace, and a
// final label of at least two letters so addresses like "a@b.c" fail here
// as a field error instead of later at Resend as a generic 500.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const LINE_BREAK_PATTERN = /[\r\n]/;
const MAX_BODY_BYTES = 10 * 1024;

export const CONTACT_MAX_BODY_BYTES = MAX_BODY_BYTES;

export function isHoneypotFilled(website: unknown): boolean {
  if (website == null) {
    return false;
  }

  if (typeof website === "string") {
    return website.trim() !== "";
  }

  return true;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function isOneOf<T extends string>(
  value: string,
  options: readonly T[],
): value is T {
  return (options as readonly string[]).includes(value);
}

function readRequiredString(
  value: unknown,
  errors: ContactErrors,
  field: ContactField,
  message: string,
): string | undefined {
  if (typeof value !== "string") {
    errors[field] = message;
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    errors[field] = message;
    return undefined;
  }

  return trimmed;
}

function readOptionalString(
  value: unknown,
  errors: ContactErrors,
  field: ContactField,
  message: string,
): string | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "string") {
    errors[field] = message;
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function validateLink(link: string, errors: ContactErrors): string | undefined {
  if (link.length > 500) {
    errors.link = "Enter a valid http(s) URL.";
    return undefined;
  }

  try {
    const parsed = new URL(link);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      errors.link = "Enter a valid http(s) URL.";
      return undefined;
    }
  } catch {
    errors.link = "Enter a valid http(s) URL.";
    return undefined;
  }

  return link;
}

export function validateContactPayload(data: unknown): ContactValidationResult {
  if (!isPlainObject(data)) {
    return { ok: false, errors: { form: "Send a JSON object." } };
  }

  const errors: ContactErrors = {};

  const name = readRequiredString(
    data.name,
    errors,
    "name",
    "Enter your name (2–100 characters).",
  );

  if (
    name !== undefined &&
    (name.length < 2 || name.length > 100 || LINE_BREAK_PATTERN.test(name))
  ) {
    errors.name = "Enter your name (2–100 characters).";
  }

  const email = readRequiredString(
    data.email,
    errors,
    "email",
    "Enter a valid email address.",
  );

  if (
    email !== undefined &&
    (email.length > 200 || !EMAIL_PATTERN.test(email))
  ) {
    errors.email = "Enter a valid email address.";
  }

  const company = readOptionalString(
    data.company,
    errors,
    "company",
    "Company must be 200 characters or fewer.",
  );

  if (
    company !== undefined &&
    (company.length > 200 || LINE_BREAK_PATTERN.test(company))
  ) {
    errors.company = "Company must be 200 characters or fewer.";
  }

  const projectTypeRaw = readRequiredString(
    data.projectType,
    errors,
    "projectType",
    "Select a project type.",
  );
  const projectType =
    projectTypeRaw !== undefined && isOneOf(projectTypeRaw, PROJECT_TYPES)
      ? projectTypeRaw
      : undefined;

  if (projectTypeRaw !== undefined && projectType === undefined) {
    errors.projectType = "Select a project type.";
  }

  const budgetRaw = readOptionalString(
    data.budget,
    errors,
    "budget",
    "Select a valid budget range.",
  );
  const budget =
    budgetRaw !== undefined && isOneOf(budgetRaw, BUDGETS)
      ? budgetRaw
      : undefined;

  if (budgetRaw !== undefined && budget === undefined) {
    errors.budget = "Select a valid budget range.";
  }

  const timelineRaw = readRequiredString(
    data.timeline,
    errors,
    "timeline",
    "Select a timeline.",
  );
  const timeline =
    timelineRaw !== undefined && isOneOf(timelineRaw, TIMELINES)
      ? timelineRaw
      : undefined;

  if (timelineRaw !== undefined && timeline === undefined) {
    errors.timeline = "Select a timeline.";
  }

  const description = readRequiredString(
    data.description,
    errors,
    "description",
    "Describe the project (30–2000 characters).",
  );

  if (
    description !== undefined &&
    (description.length < 30 || description.length > 2000)
  ) {
    errors.description = "Describe the project (30–2000 characters).";
  }

  const linkRaw = readOptionalString(
    data.link,
    errors,
    "link",
    "Enter a valid http(s) URL.",
  );
  const link = linkRaw !== undefined ? validateLink(linkRaw, errors) : undefined;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name: name as string,
      email: email as string,
      ...(company ? { company } : {}),
      projectType: projectType as ProjectType,
      ...(budget ? { budget } : {}),
      timeline: timeline as Timeline,
      description: description as string,
      ...(link ? { link } : {}),
    },
  };
}

export function formatContactEmail(value: ValidatedContact): {
  subject: string;
  text: string;
} {
  // Validation already rejects CR/LF in name; collapsing here keeps the
  // subject a single line even if that ever changes.
  const subjectName = value.name.replace(/\s+/g, " ").trim();

  // Description is the only multi-line field, so it goes last as a block —
  // its lines cannot be mistaken for one of the labeled fields above.
  const lines = [
    `Name: ${value.name}`,
    `Email: ${value.email}`,
    `Company: ${value.company ?? "—"}`,
    `Project type: ${value.projectType}`,
    `Budget: ${value.budget ?? "—"}`,
    `Timeline: ${value.timeline}`,
    `Link: ${value.link ?? "—"}`,
    "Description:",
    value.description,
  ];

  return {
    subject: `New inquiry from ${subjectName} — ${value.projectType}`,
    text: lines.join("\n"),
  };
}

export type ContactEnv =
  | {
      ok: true;
      apiKey: string;
      fromEmail: string;
      toEmail: string;
    }
  | { ok: false; missing: string[] };

export function readContactEnv(
  env: Record<string, string | undefined> = process.env,
): ContactEnv {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const fromEmail = env.CONTACT_FROM_EMAIL?.trim() ?? "";
  const toEmail = env.CONTACT_TO_EMAIL?.trim() ?? "";
  const missing: string[] = [];

  if (!apiKey) {
    missing.push("RESEND_API_KEY");
  }

  if (!fromEmail) {
    missing.push("CONTACT_FROM_EMAIL");
  }

  if (!toEmail) {
    missing.push("CONTACT_TO_EMAIL");
  }

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return { ok: true, apiKey, fromEmail, toEmail };
}

export function isJsonContentType(contentType: string | null): boolean {
  if (!contentType) {
    return false;
  }

  // Compare the media type only; a substring match would accept values like
  // "text/plain; application/json", which browsers may send without a CORS
  // preflight. Parameters such as charset stay allowed.
  const mediaType = contentType.split(";")[0]?.trim().toLowerCase();
  return mediaType === "application/json";
}

export function declaredContentLengthExceedsLimit(
  contentLength: string | null,
  maxBytes: number = MAX_BODY_BYTES,
): boolean {
  if (!contentLength) {
    return false;
  }

  const parsed = Number(contentLength);
  return Number.isFinite(parsed) && parsed > maxBytes;
}

/**
 * Reads the request body while counting bytes, so an oversized body is
 * rejected as soon as the limit is crossed instead of after it has been
 * buffered in full (a missing or understated Content-Length header cannot
 * bypass the cap). Returns null when the limit is exceeded.
 */
export async function readBodyWithinLimit(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number = MAX_BODY_BYTES,
): Promise<string | null> {
  if (!body) {
    return "";
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel();
        return null;
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(combined);
}
