"use client";

import { ClientErrorFallback } from "@/components/shared/ClientErrorFallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn" translate="no">
      <body style={{ margin: 0, backgroundColor: "#f8fafc" }}>
        <ClientErrorFallback error={error} reset={reset} />
      </body>
    </html>
  );
}
