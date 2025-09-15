"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  children: React.ReactNode;   // child components to wrap this with error boundary
  fallback?: React.ReactNode;   // optional fallback
};

type State = {
  hasError: boolean;   // error ?
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {   // catch runtime errors
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);   // logs error
  }

  render() {   // renders: error? fallback: children
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || "An unexpected error occurred."}
            </AlertDescription>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </Alert>
        )
      );
    }

    return this.props.children;
  }
}
