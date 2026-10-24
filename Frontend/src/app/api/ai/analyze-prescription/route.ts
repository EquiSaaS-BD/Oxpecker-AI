import { analyzeAndStoreMedicalImage } from '@/lib/medical-document-server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PRESCRIPTION_TRANSCRIPTION_PROMPT = `You are OCR for a photographed prescription. Transcribe only visible text; do not diagnose, recommend treatment, infer a generic from a brand, complete a common dose, or estimate a price. Judge readability first. If blurred, dark, skewed, cropped or unreadable, set affected fields to null and state why. Never guess medicine names or instructions. Preserve Bengali/English and abbreviations as written. For each confidence field choose exactly one of clear, uncertain, or illegible; do not return the pipe-separated options literally. Confidence is a qualitative visual estimate, not calibrated. A clinician or pharmacist must verify every field before use.

Return this exact JSON block:
\`\`\`json:prescription_analysis
{
  "imageQuality": { "status": "clear | partially_readable | unreadable", "reasons": [] },
  "prescriptionDate": null,
  "patientName": null,
  "doctorName": null,
  "medicines": [
    {
      "brandName": null,
      "genericName": null,
      "strength": null,
      "dosageForm": null,
      "packageSize": null,
      "dose": null,
      "frequency": null,
      "duration": null,
      "route": null,
      "instructionsTranscribed": null,
      "confidence": "clear | uncertain | illegible",
      "fieldConfidence": {
        "brandName": "clear | uncertain | illegible",
        "genericName": "clear | uncertain | illegible",
        "strength": "clear | uncertain | illegible",
        "dosageForm": "clear | uncertain | illegible",
        "packageSize": "clear | uncertain | illegible",
        "dose": "clear | uncertain | illegible",
        "frequency": "clear | uncertain | illegible",
        "duration": "clear | uncertain | illegible",
        "route": "clear | uncertain | illegible",
        "instructionsTranscribed": "clear | uncertain | illegible"
      },
      "evidence": null
    }
  ],
  "uncertainFields": [],
  "manualReviewRequired": true
}
\`\`\`

Do not include prices, alternatives, diagnoses or medical advice. Any confidence is a qualitative visual estimate, not a calibrated probability. If the image is not a prescription, say so and omit the JSON block. When a field is unknown, return null instead of a plausible guess.`;

export async function POST(request: Request) {
  return analyzeAndStoreMedicalImage(request, 'prescription', PRESCRIPTION_TRANSCRIPTION_PROMPT);
}
