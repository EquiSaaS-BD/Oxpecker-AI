export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { warmMedicinesDatabase } = await import("@/lib/medicine-index");
      setImmediate(() => {
        try {
          warmMedicinesDatabase();
        } catch {}
      });
    } catch {}
  }
}
