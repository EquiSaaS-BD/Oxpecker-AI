import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Prescription Analysis API
// Accepts image upload, uses AI Vision to OCR
// and extract medicine details
// ============================================

const PRESCRIPTION_PROMPT = `You are Oxpecker AI's Prescription Analyzer. Analyze this prescription image thoroughly.

Extract ALL information and respond in this EXACT JSON format:

\`\`\`json:prescription_analysis
{
  "patientName": "extracted or N/A",
  "doctorName": "extracted or N/A",
  "date": "extracted or N/A",
  "medicines": [
    {
      "name": "Medicine Brand Name",
      "generic": "Generic name if identifiable",
      "strength": "e.g. 500mg",
      "dosage": "e.g. 1+0+1",
      "frequency": "e.g. Twice daily",
      "duration": "e.g. 7 days",
      "instructions": "e.g. After meal",
      "estimatedPrice": 0
    }
  ],
  "diagnosis": "extracted diagnosis if visible",
  "advice": "any advice written",
  "followUp": "follow-up date if mentioned",
  "totalEstimatedCost7Days": 0,
  "totalEstimatedCost15Days": 0,
  "totalEstimatedCost30Days": 0,
  "warnings": ["any drug interaction warnings"],
  "genericAlternatives": [
    {"original": "Brand", "alternative": "Cheaper Brand", "savings": "estimated %"}
  ]
}
\`\`\`

After the JSON block, provide a brief human-readable summary in markdown with:
- Medicine list with dosage schedule
- Important warnings or side effects
- Food interactions
- Pregnancy warnings if applicable
- Cost breakdown

If the image is not a prescription, say so politely.
Use BDT (৳) for all prices. Estimate realistic Bangladeshi medicine prices.`;

async function analyzeWithVision(imageBase64: string, mimeType: string, prompt: string) {
  // Try OpenAI first, then Google
  if (process.env.OPENAI_API_KEY) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }
  }

  // Fallback: Google Gemini
  if (process.env.GOOGLE_API_KEY) {
    const model = process.env.GOOGLE_MODEL || 'gemini-2.0-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
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

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const result = await analyzeWithVision(base64, mimeType, PRESCRIPTION_PROMPT);

    return NextResponse.json({ analysis: result });
  } catch (error: any) {
    console.error('[Oxpecker AI] Prescription analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
