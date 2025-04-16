import * as Sentry from "@sentry/nextjs";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Sorry, something went wrong.</h1>;
    }

    return this.props.children;
  }
}
