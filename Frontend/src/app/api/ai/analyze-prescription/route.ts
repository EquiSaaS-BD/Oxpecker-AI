import { analyzeAndStoreMedicalImage } from '@/lib/medical-document-server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PRESCRIPTION_TRANSCRIPTION_PROMPT = `You are a clinical OCR engine for photographed or scanned prescriptions and medicine labels (supporting English, Bengali, and mixed Bengali-English).
Transcribe only visible text; never diagnose, recommend treatment, infer a generic from a brand if not written, complete a missing dose, or invent a price.
Judge image readability first. If blurred, dark, skewed, cropped, or unreadable, set affected fields to null and state why in imageQuality.reasons.
Preserve brand names, strengths (e.g., 500 mg, 20 mg, 60 ml), dosage forms (e.g., Tablet, Capsule, Syrup, Suspension, Injection, Cream, Drops, Inhaler), frequencies (e.g., 1+1+1, 1+0+1, 0+0+1, BD, TDS, OD, ১+০+১), durations (e.g., 5 days, 7 days, 1 month, ৫ দিন), and instructions (e.g., after meal, খাবারের পরে).
For each confidence field choose exactly one of: "clear", "uncertain", or "illegible".

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
      "manufacturer": null,
      "packageSize": null,
      "dose": null,
      "frequency": null,
      "duration": null,
      "quantity": null,
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
  "rawOcrText": null,
  "uncertainFields": [],
  "manualReviewRequired": true
}
\`\`\`

Do not include prices, substitutes, diagnoses, or medical advice. If the image is not a prescription or medicine label, say so and omit the JSON block. When any field is not visible, return null instead of guessing.`;

export async function POST(request: Request) {
  return analyzeAndStoreMedicalImage(request, 'prescription', PRESCRIPTION_TRANSCRIPTION_PROMPT);
}
