import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Medical Image Analysis API
// Analyzes skin, X-ray, MRI, CT, ECG, etc.
// ============================================

const IMAGE_PROMPT = `You are Oxpecker AI's Medical Image Analyzer. Analyze this medical image carefully.

IMPORTANT DISCLAIMER: You are NOT providing a diagnosis. This is for informational purposes only.

First, identify the type of image:
- Skin condition photo
- X-Ray
- MRI/CT Scan
- ECG/EKG
- Ultrasound
- Eye/Ear/Mouth/Tongue photo
- Wound/Injury photo
- Other medical image

Then respond with this JSON format:

\`\`\`json:image_analysis
{
  "imageType": "type identified",
  "bodyPart": "which body part",
  "observations": ["list of observations"],
  "possibleFindings": [
    {
      "finding": "Possible condition name",
      "confidence": "low | moderate | high",
      "severity": "mild | moderate | severe"
    }
  ],
  "riskLevel": "green | yellow | red",
  "recommendedSpecialist": "Dermatologist / Radiologist / etc.",
  "urgency": "routine | soon | urgent | emergency"
}
\`\`\`

If a doctor visit is recommended, you MUST also output this block so the system can show local doctors:

\`\`\`json:doctor_recommendation
{"speciality": "Dermatology", "reason": "Brief reason for recommendation", "urgency": "normal|urgent|emergency"}
\`\`\`

Then provide detailed markdown:

### Image Analysis
- Type of image identified
- Body part/area

### Observations
- Detailed description of what is visible
- Color, texture, size, pattern observations

### Possible Findings
For each possible finding:
- What it could be
- Confidence level
- Severity assessment
- Why this is suspected

### Recommended Next Steps
1. Which specialist to visit
2. What tests may be needed
3. First aid or immediate care if applicable

### Risk Level: [Green/Yellow/Red]
- Explanation of risk assessment

### Important Notice
> **This analysis is AI-generated and is NOT a medical diagnosis.** It is intended for informational purposes only. Please consult a qualified healthcare professional for proper diagnosis and treatment. If you notice worsening symptoms, seek immediate medical attention.

If this is NOT a medical image, politely say: "I can only analyze medical-related images. Please upload a relevant medical image for analysis."`;

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

  // MOCK FALLBACK (If no API keys are present)
  return `### Image Analysis (Mock Mode)
- **Type:** Wound / Injury Photo
- **Body Part:** Arm/Leg

### Observations
- Visible redness and swelling around the affected area.
- No severe bleeding, but signs of mild inflammation.

### Possible Findings
- **Mild Infection / Inflammation** (Confidence: Moderate, Severity: Mild)

### Recommended Next Steps
1. Clean the area with an antiseptic.
2. Visit a Dermatologist for a checkup.

### Risk Level: Yellow
- Requires monitoring and a standard medical consultation.

\`\`\`json:doctor_recommendation
{"speciality": "Dermatology", "reason": "To inspect the wound and prescribe antibiotics if necessary.", "urgency": "soon"}
\`\`\`
`;
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

    const result = await analyzeWithVision(base64, mimeType, IMAGE_PROMPT);
    return NextResponse.json({ analysis: result });
  } catch (error: any) {
    console.error('[Oxpecker AI] Image analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
