import { analyzeAndStoreMedicalImage } from '@/lib/medical-document-server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PRESCRIPTION_TRANSCRIPTION_PROMPT = `IMAGE VALIDATION FIRST: You are a clinical OCR engine for photographed or scanned prescriptions and medicine labels (supporting English, Bengali, and mixed Bengali-English). Before anything else, classify the image and start your reply with exactly one marker line: either \`IMAGE_CLASSIFICATION: medical\` or \`IMAGE_CLASSIFICATION: non_medical\`.

If the image is NOT a prescription, medicine label, or medicine packaging (for example: food, scenery, people, screenshots, random objects, or a photo too blurry/dark to read), reply ONLY with the marker \`IMAGE_CLASSIFICATION: non_medical\` plus one short polite sentence in both Bangla and English telling the user to upload a clear prescription photo. Do NOT output any JSON block, do NOT invent medicine names, doses, or prices, and do NOT attempt a partial analysis of a non-medical image.

For a valid prescription or medicine label, transcribe only visible text; never diagnose, recommend treatment, infer a generic from a brand if not written, complete a missing dose, or invent a price.
Judge image readability honestly. If blurred, dark, skewed, cropped, or partially unreadable, set affected fields to null and state why in imageQuality.reasons — never guess a value that you cannot read.
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
