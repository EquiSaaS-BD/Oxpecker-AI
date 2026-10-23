import { analyzeAndStoreMedicalImage } from '@/lib/medical-document-server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PRESCRIPTION_TRANSCRIPTION_PROMPT = `Transcribe the visible prescription only. Do not diagnose, infer missing text, recommend medicines, invent dosage, or estimate any prices. Preserve illegible fields as null and list uncertain text in "uncertainFields". Return Bangla-friendly explanations only after a structured JSON block. A pharmacist or prescribing clinician must confirm unclear handwriting.

Return this exact JSON block:
\`\`\`json:prescription_analysis
{
  "prescriptionDate": null,
  "patientName": null,
  "medicines": [
    {
      "brandName": null,
      "genericName": null,
      "strength": null,
      "dosageForm": null,
      "packageSize": null,
      "instructionsTranscribed": null,
      "confidence": "low"
    }
  ],
  "uncertainFields": []
}
\`\`\`

Do not include prices or generic alternatives. Those are calculated only from the local dated catalog after exact matching of generic, strength, dosage form and package size. If the image is not a prescription, say so and omit the JSON block.`;

export async function POST(request: Request) {
  return analyzeAndStoreMedicalImage(request, 'prescription', PRESCRIPTION_TRANSCRIPTION_PROMPT);
}
