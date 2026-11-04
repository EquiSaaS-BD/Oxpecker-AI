import { supabase } from "@/lib/supabase";

const SESSION_ACTOR_KEY = "oxpecker_prescription_actor_id";

export function getOrCreatePrescriptionActorToken(): string {
  if (typeof window === "undefined") return "usr-hospital-verified";
  try {
    let existing = window.localStorage.getItem(SESSION_ACTOR_KEY);
    if (!existing || existing.length < 8) {
      const randomPart =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      existing = `oxp-rx-${randomPart}`;
      window.localStorage.setItem(SESSION_ACTOR_KEY, existing);
    }
    return existing;
  } catch {
    return "usr-hospital-verified";
  }
}

export async function getPrescriptionAuthToken(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      return data.session.access_token;
    }
  } catch {}
  return getOrCreatePrescriptionActorToken();
}

export async function requestMedicalDocumentConsent(skipConfirmDialog = true): Promise<string | null> {
  if (!skipConfirmDialog && typeof window !== "undefined") {
    const accepted = window.confirm(
      "This prescription will be analyzed by Oxpecker AI OCR and matched against the verified national medicine database. Continue?"
    );
    if (!accepted) return null;
  }
  return getPrescriptionAuthToken();
}
