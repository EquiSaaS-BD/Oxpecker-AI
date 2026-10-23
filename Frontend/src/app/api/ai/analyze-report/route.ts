import { analyzeAndStoreMedicalImage } from '@/lib/medical-document-server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const REPORT_TRANSCRIPTION_PROMPT = `Read the uploaded medical report and transcribe visible test names, values, units, and the reference ranges printed by the lab. Do not diagnose the patient, infer missing values, invent reference ranges, or recommend treatment. If something is unreadable, return null and list it under uncertainFields. Tell the user that a qualified clinician must interpret the report in context.

Return this exact JSON block:
\`\`\`json:report_analysis
{
  "reportType": null,
  "reportDate": null,
  "laboratory": null,
  "parameters": [
    {
      "name": null,
      "value": null,
      "unit": null,
      "printedReferenceRange": null,
      "confidence": "low"
    }
  ],
  "uncertainFields": []
}
\`\`\`

If the image is not a medical report, say so and omit the JSON block.`;

export async function POST(request: Request) {
  return analyzeAndStoreMedicalImage(request, 'report', REPORT_TRANSCRIPTION_PROMPT);
}
