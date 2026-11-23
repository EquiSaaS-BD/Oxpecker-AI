import { analyzeAndStoreMedicalImage } from '@/lib/medical-document-server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const REPORT_TRANSCRIPTION_PROMPT = `IMAGE VALIDATION FIRST: Classify the image before doing anything else. Start your reply with exactly one marker line: either \`IMAGE_CLASSIFICATION: medical\` or \`IMAGE_CLASSIFICATION: non_medical\`.

If the image is not a medical report / lab document (for example: food, scenery, people, screenshots, random objects, or an unreadable photo where no lab values are visible), reply ONLY with the marker \`IMAGE_CLASSIFICATION: non_medical\` plus one short polite sentence in both Bangla and English telling the user to upload a clear medical report. Do NOT output any JSON block, do NOT invent any test names or values, and do NOT attempt a partial analysis of a non-medical image.

For valid medical reports: Read the uploaded medical report and transcribe visible test names, values, units, and the reference ranges printed by the lab. Do not diagnose the patient, infer missing values, invent reference ranges, or recommend treatment. If something is unreadable, return null and list it under uncertainFields. Tell the user that a qualified clinician must interpret the report in context.

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

If any value is not clearly visible, return null for it. If the image is not a medical report, say so and omit the JSON block.`;

export async function POST(request: Request) {
  return analyzeAndStoreMedicalImage(request, 'report', REPORT_TRANSCRIPTION_PROMPT);
}
