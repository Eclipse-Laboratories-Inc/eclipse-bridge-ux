export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { default: Sentry } = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
  }
}

export function onRequestError({ request, error }: { request: Request; error: Error }) {
  const { captureRequestError } = require("@sentry/nextjs");
  return captureRequestError({ request, error });
}
