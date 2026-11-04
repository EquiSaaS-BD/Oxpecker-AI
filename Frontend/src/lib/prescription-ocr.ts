export type PrescriptionFieldConfidence = "clear" | "uncertain" | "illegible";

export interface PrescriptionMedicineTranscription {
  id?: string;
  brandName: string | null;
  genericName: string | null;
  strength: string | null;
  dosageForm: string | null;
  manufacturer?: string | null;
  packageSize: string | null;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  quantity?: number | null;
  route: string | null;
  instructionsTranscribed: string | null;
  selectedDatabaseMedicineId?: string | null;
  evidence?: string | null;
  confidence: PrescriptionFieldConfidence;
  fieldConfidence: Record<string, PrescriptionFieldConfidence>;
}

export interface PrescriptionTranscription {
  imageQuality: {
    status: "clear" | "partially_readable" | "unreadable";
    reasons: string[];
  };
  prescriptionDate: string | null;
  patientName: string | null;
  doctorName: string | null;
  medicines: PrescriptionMedicineTranscription[];
  uncertainFields: string[];
  rawOcrText?: string | null;
  manualReviewRequired: true;
  userReview?: { verifiedAgainstImage: boolean; reviewedAt?: string };
}

const FIELDS = [
  "brandName",
  "genericName",
  "strength",
  "dosageForm",
  "manufacturer",
  "packageSize",
  "dose",
  "frequency",
  "duration",
  "route",
  "instructionsTranscribed",
] as const;

function cleanText(value: unknown, maxLength = 500): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || /^(null|unknown|not provided|illegible|none|n\/a)$/i.test(text)) return null;
  return text.slice(0, maxLength);
}

function cleanConfidence(value: unknown): PrescriptionFieldConfidence {
  if (value === "clear" || value === "uncertain" || value === "illegible") return value;
  return "uncertain";
}

export function parsePrescriptionTranscription(text: string): PrescriptionTranscription | null {
  if (!text || typeof text !== "string") return null;
  const block =
    text.match(/```json:prescription_analysis\s*([\s\S]*?)```/i)?.[1] ??
    text.match(/```json\s*([\s\S]*?)```/i)?.[1] ??
    (text.trim().startsWith("{") ? text.trim() : null);
  if (!block) return null;
  try {
    const parsed = JSON.parse(block.trim());
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.medicines)) return null;
    const imageQualityStatus = parsed.imageQuality?.status;
    const imageQuality: PrescriptionTranscription["imageQuality"] = {
      status:
        imageQualityStatus === "clear" || imageQualityStatus === "unreadable"
          ? imageQualityStatus
          : "partially_readable",
      reasons: Array.isArray(parsed.imageQuality?.reasons)
        ? parsed.imageQuality.reasons
            .map(cleanText)
            .filter((reason: string | null): reason is string => Boolean(reason))
            .slice(0, 20)
        : [],
    };
    const medicines: PrescriptionMedicineTranscription[] = parsed.medicines.slice(0, 40).map((medicine: any, idx: number) => {
      const normalizedFields = Object.fromEntries(
        FIELDS.map((field) => [field, cleanText(medicine?.[field])])
      ) as Pick<PrescriptionMedicineTranscription, (typeof FIELDS)[number]>;
      const fieldConfidence = Object.fromEntries(
        FIELDS.map((field) => [field, cleanConfidence(medicine?.fieldConfidence?.[field])])
      ) as Record<string, PrescriptionFieldConfidence>;
      const parsedQuantity =
        typeof medicine?.quantity === "number" && Number.isFinite(medicine.quantity) && medicine.quantity > 0
          ? Math.ceil(medicine.quantity)
          : null;
      return {
        id: cleanText(medicine?.id, 64) || `med-item-${idx + 1}`,
        ...normalizedFields,
        quantity: parsedQuantity,
        selectedDatabaseMedicineId: cleanText(medicine?.selectedDatabaseMedicineId, 64),
        confidence: cleanConfidence(medicine?.confidence),
        fieldConfidence,
        evidence: cleanText(medicine?.evidence),
      };
    });
    const uncertainFields = Array.isArray(parsed.uncertainFields)
      ? parsed.uncertainFields
          .map(cleanText)
          .filter((field: string | null): field is string => Boolean(field))
          .slice(0, 50)
      : [];
    return {
      imageQuality,
      prescriptionDate: cleanText(parsed.prescriptionDate),
      patientName: cleanText(parsed.patientName),
      doctorName: cleanText(parsed.doctorName),
      medicines,
      uncertainFields,
      rawOcrText: cleanText(parsed.rawOcrText, 12000),
      manualReviewRequired: true,
      userReview:
        parsed.userReview?.verifiedAgainstImage === true
          ? {
              verifiedAgainstImage: true,
              reviewedAt: cleanText(parsed.userReview.reviewedAt) || undefined,
            }
          : undefined,
    };
  } catch {
    return null;
  }
}
