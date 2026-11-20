"use client";

import { ClientErrorFallback } from "@/components/shared/ClientErrorFallback";

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ClientErrorFallback error={error} reset={reset} showHomeButton />;
}
