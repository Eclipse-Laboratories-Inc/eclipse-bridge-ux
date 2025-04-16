import { NextRequest } from "next/server";

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

export async function onRequestError({ request, error }: { request: NextRequest; error: Error }) {
  const { captureRequestError } = await import("@sentry/nextjs");
  captureRequestError(error, request);
  return;
}
