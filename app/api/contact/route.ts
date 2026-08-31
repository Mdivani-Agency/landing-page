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
import { checkContactRateLimit, getClientIp } from "@/lib/rate-limit";

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

  if (!env.ok) {
    console.error("contact: missing env", env.missing.join(", "));
    return sendFailed();
  }

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
      return sendFailed();
    }
  } catch (error) {
    console.error("contact: resend failed", error);
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
