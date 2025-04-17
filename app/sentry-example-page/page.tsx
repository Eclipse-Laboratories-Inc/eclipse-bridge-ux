"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  useEffect(() => {
    // Test error tracking
    try {
      throw new Error("This is a test error for Sentry");
    } catch (error) {
      Sentry.captureException(error);
    }
  }, []);

  return (
    <div>
      <h1>Sentry Test Page</h1>
      <p>This page is used to test Sentry error tracking.</p>
      <p>Check your Sentry dashboard to see the test error.</p>
    </div>
  );
}
