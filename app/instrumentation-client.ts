export async function register() {
  if (process.env.NEXT_RUNTIME === "browser") {
    const { default: Sentry } = await import("@sentry/nextjs");
    const { Replay } = await import("@sentry/replay");

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        new Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    });
  }
}
