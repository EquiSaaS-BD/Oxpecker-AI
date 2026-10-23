import { supabase } from "@/lib/supabase";

export async function requestMedicalDocumentConsent(): Promise<string | null> {
  const accepted = window.confirm(
    "This medical image will be sent to the configured AI provider for analysis and saved privately to your account. If you are uploading for a patient, confirm that they have agreed to this processing and storage. Continue?"
  );
  if (!accepted) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("A verified account session is required to process and save medical documents.");
  }
  return data.session.access_token;
}
