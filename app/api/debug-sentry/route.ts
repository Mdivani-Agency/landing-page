const TEST_ERROR_MESSAGE =
  "Sentry test error 20260901T153500Z landing-page";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  throw new Error(TEST_ERROR_MESSAGE);
}
