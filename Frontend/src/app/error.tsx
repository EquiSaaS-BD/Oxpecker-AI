"use client";

import { ClientErrorFallback } from "@/components/shared/ClientErrorFallback";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ClientErrorFallback error={error} reset={reset} />;
}
