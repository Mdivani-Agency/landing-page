import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import {
  declaredContentLengthExceedsLimit,
  formatContactEmail,
  isHoneypotFilled,
  isJsonContentType,
  readBodyWithinLimit,
  readContactEnv,
  validateContactPayload,
} from "@/lib/contact";
import { insertInquiry, toInquiryInsert } from "@/lib/inquiries";
import { checkContactRateLimit, getClientIp } from "@/lib/rate-limit";
import { readSupabaseAdminEnv } from "@/lib/supabase";

const GENERIC_SEND_ERROR =
  "Something went wrong. Please try again or email us directly.";
const RATE_LIMIT_ERROR =
  "Too many requests. Please wait a minute and try again.";

function json(status: number, body: unknown) {
  return Response.json(body, { status });
}

function badRequest(errors: Record<string, string>) {
  return json(400, { ok: false, errors });
}

function sendFailed() {
  return json(500, { ok: false, errors: { form: GENERIC_SEND_ERROR } });
}

function reportContactException(
  error: unknown,
  extra?: { statusCode?: number },
) {
  const exception =
    error instanceof Error
      ? error
      : new Error(
          typeof error === "object" &&
            error != null &&
            "message" in error &&
            typeof error.message === "string" &&
            error.message
            ? error.message
            : "resend failed",
        );

  Sentry.captureException(exception, {
    tags: { area: "contact" },
    extra:
      typeof extra?.statusCode === "number"
        ? { statusCode: extra.statusCode }
        : undefined,
  });
}

export async function POST(request: Request) {
  const rate = await checkContactRateLimit(getClientIp(request.headers));

  if (!rate.allowed) {
    return Response.json(
      { ok: false, errors: { form: RATE_LIMIT_ERROR } },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  if (!isJsonContentType(request.headers.get("content-type"))) {
    return badRequest({ form: "Send a JSON body." });
  }

  if (declaredContentLengthExceedsLimit(request.headers.get("content-length"))) {
    return badRequest({ form: "Request is too large." });
  }

  const bodyText = await readBodyWithinLimit(request.body);

  if (bodyText === null) {
    return badRequest({ form: "Request is too large." });
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(bodyText) as unknown;
  } catch {
    return badRequest({ form: "Send a JSON body." });
  }

  if (
    parsed != null &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    isHoneypotFilled((parsed as { website?: unknown }).website)
  ) {
    return json(200, { ok: true });
  }

  const validated = validateContactPayload(parsed);

  if (!validated.ok) {
    return json(400, { ok: false, errors: validated.errors });
  }

  const env = readContactEnv();
  const supabaseEnv = readSupabaseAdminEnv();

  if (!env.ok) {
    console.error("contact: missing env", env.missing.join(", "));
    reportContactException(
      new Error(`contact: missing env ${env.missing.join(", ")}`),
    );
  }

  if (!supabaseEnv.ok) {
    console.error("contact: missing env", supabaseEnv.missing.join(", "));
    reportContactException(
      new Error(`contact: missing env ${supabaseEnv.missing.join(", ")}`),
    );
  }

  // Persist and email are independent. Either channel succeeding is enough
  // for the visitor: a missing `inquiries` table must not drop the Resend
  // lead, and a Resend outage must not look like a failed submit after the
  // row is already stored.
  let persisted = false;
  if (supabaseEnv.ok) {
    try {
      await insertInquiry(toInquiryInsert(validated.value));
      persisted = true;
    } catch (error) {
      reportContactException(error);
    }
  }

  let emailed = false;
  if (env.ok) {
    const { subject, text } = formatContactEmail(validated.value);

    try {
      const resend = new Resend(env.apiKey);
      const { error } = await resend.emails.send({
        from: `Mdivani Website <${env.fromEmail}>`,
        to: env.toEmail,
        replyTo: validated.value.email,
        subject,
        text,
      });

      if (error) {
        console.error("contact: resend failed", error);
        reportContactException(error, {
          statusCode:
            "statusCode" in error && typeof error.statusCode === "number"
              ? error.statusCode
              : undefined,
        });
      } else {
        emailed = true;
      }
    } catch (error) {
      console.error("contact: resend failed", error);
      reportContactException(error);
    }
  }

  if (!persisted && !emailed) {
    return sendFailed();
  }

  return json(200, { ok: true });
}

export function GET() {
  return new Response(null, {
    status: 405,
    headers: { Allow: "POST" },
  });
}
