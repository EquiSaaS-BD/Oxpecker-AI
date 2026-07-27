import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Medical Report Analysis API
// Analyzes blood reports, lab results, etc.
// ============================================

const REPORT_PROMPT = `You are Oxpecker AI's Medical Report Analyzer. Analyze this medical/lab report image carefully.

Extract ALL values and respond with this EXACT JSON format first:

\`\`\`json:report_analysis
{
  "reportType": "CBC / Blood Chemistry / Lipid Profile / Thyroid / etc.",
  "patientName": "extracted or N/A",
  "date": "extracted or N/A",
  "lab": "lab name or N/A",
  "parameters": [
    {
      "name": "Parameter Name (e.g., Hemoglobin)",
      "value": "extracted value",
      "unit": "g/dL, mg/dL, etc.",
      "normalRange": "normal range",
      "status": "normal | low | high | critical",
      "riskLevel": "green | yellow | red"
    }
  ],
  "summary": "Brief overall summary",
  "abnormalCount": 0,
  "criticalCount": 0,
  "recommendedSpecialist": "if needed",
  "urgency": "routine | soon | urgent"
}
\`\`\`

After the JSON block, provide a detailed markdown explanation:

### 📊 Report Summary
- Overall health assessment

### ⚠️ Abnormal Values
- List each abnormal parameter with explanation in simple language
- What it means for the patient
- Possible causes

### ✅ Normal Values
- Brief confirmation of normal parameters

### 🩺 Recommendations
- Specialist to visit if needed
- Lifestyle changes
- Follow-up tests recommended
- Dietary suggestions

### 📈 Risk Assessment
- 🟢 Low Risk / 🟡 Moderate Risk / 🔴 High Risk

Use simple, patient-friendly language. Explain medical terms.
Always include: "This analysis is informational. Please consult your doctor for proper diagnosis."`;

async function analyzeWithVision(imageBase64: string, mimeType: string, prompt: string) {
  if (process.env.OPENAI_API_KEY) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        }],
        max_tokens: 4096,
        temperature: 0.2,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }
  }

  if (process.env.GOOGLE_API_KEY) {
    const model = process.env.GOOGLE_MODEL || 'gemini-2.0-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ]}],
          generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  }

  throw new Error('No AI provider with vision capability configured');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const result = await analyzeWithVision(base64, mimeType, REPORT_PROMPT);
    return NextResponse.json({ analysis: result });
  } catch (error: any) {
    console.error('[Oxpecker AI] Report analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
