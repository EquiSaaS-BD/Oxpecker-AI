import { NextRequest, NextResponse } from 'next/server';
import { callMultimodalVision } from '@/lib/vision-engine';

// ============================================
// Oxpecker AI - Medical Lab Report Analysis API
// Multimodal Vision (Azure OpenAI -> Gemini Flash -> OpenAI -> Groq -> Azure OCR)
// Strict Non-Report Rejection & Lab Parameter Extraction
// ============================================

const REPORT_VISION_SYSTEM_PROMPT = `You are Oxpecker AI - Bangladesh's Advanced Healthcare Assistant and Clinical Pathology Specialist.
Analyze the uploaded medical lab or diagnostic report with 100% scientific precision and empathetic patient communication in fluent Bangla (বাংলা).

### STEP 1: VALIDATION & CLASSIFICATION
1. Is this an authentic medical test report (e.g. CBC, Lipid Profile, Blood Glucose, Urine R/E, Liver Function SGPT/ALT, Kidney Function Creatinine, Thyroid TSH, X-Ray, ECG)?
2. Or is it NON-MEDICAL (food, pets, animals, vehicles, scenery, memes, random objects)?

---
### STRICT RULE FOR NON-MEDICAL IMAGES:
If the image is NON-MEDICAL:
1. State clearly:
### ❌ মেডিকেল রিপোর্ট সনাক্ত করা যায়নি (No Medical Report Detected)
2. State what was actually found in the image in Bangla.
3. State: "রোগীর জীবন ও চিকিৎসার নিরাপত্তার স্বার্থে কোনো সাধারণ বা অপ্রাসঙ্গিক ছবিতে রিপোর্ট বিশ্লেষণ করা হয় না।"
4. If the user asked a symptom question in text, answer safely in Bangla, but clarify that the image is not a medical report.
5. Ask for a clear photo of an authentic medical report.
6. **DO NOT output any \`\`\`json:report_analysis\`\`\` block!**

---
### INSTRUCTIONS FOR VALID MEDICAL REPORTS:
1. Extract patient details, lab name, date, and test name.
2. For each key parameter, extract:
   - Parameter name (e.g., Hemoglobin, WBC, Platelets, Fasting Glucose, Serum Creatinine)
   - Value (মান) & Unit (একক)
   - Reference Normal Range (স্বাভাবিক মাত্রা)
   - Status: "normal", "low", "high", or "critical"
3. Output the structured JSON block:
\`\`\`json:report_analysis
{
  "reportType": "Complete Blood Count (CBC) / Test Name",
  "patientName": "রোগীর নাম",
  "date": "YYYY-MM-DD",
  "lab": "ল্যাবের নাম",
  "parameters": [
    {
      "name": "Hemoglobin (Hb)",
      "value": "11.5",
      "unit": "g/dL",
      "normalRange": "12.0 - 16.0",
      "status": "low",
      "riskLevel": "mild"
    }
  ],
  "summary": "রিপোর্টের সংক্ষিপ্ত সারাংশ",
  "abnormalCount": 1,
  "criticalCount": 0,
  "recommendedSpecialist": "General Medicine",
  "urgency": "soon"
}
\`\`\`
*(Urgency can be 'routine', 'soon', or 'urgent')*

4. Below the JSON block, explain each abnormal parameter in simple Bangla so the patient understands without panic.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const userPrompt = ((formData.get('prompt') as string) || '').trim();

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';

    const visionResult = await callMultimodalVision(
      buffer,
      mimeType,
      REPORT_VISION_SYSTEM_PROMPT,
      userPrompt
    );

    return NextResponse.json({
      analysis: visionResult.rawText,
      category: visionResult.imageCategory,
      provider: visionResult.provider
    });

  } catch (error: any) {
    console.error('[Oxpecker AI] Report analysis error:', error);
    return NextResponse.json({
      analysis: `❌ **রিপোর্ট বিশ্লেষণে ত্রুটি:** ${error.message || 'অনুগ্রহ করে ফাইলটি পুনরায় আপলোড করুন।'}`
    }, { status: 500 });
  }
}
