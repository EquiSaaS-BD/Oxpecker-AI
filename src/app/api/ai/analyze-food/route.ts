import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Food & Nutrition Analysis API
// Identifies food from image, estimates nutrition
// ============================================

const FOOD_PROMPT = `You are Oxpecker AI's Nutrition Analyzer. Analyze this food image thoroughly.

Identify ALL food items visible and respond with this EXACT JSON format first:

\`\`\`json:nutrition_analysis
{
  "foods": [
    {
      "name": "Food item name",
      "portion": "estimated portion size",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0,
      "sugar": 0,
      "sodium": 0
    }
  ],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "totalFiber": 0,
  "healthScore": 0,
  "mealType": "breakfast | lunch | dinner | snack",
  "cuisineType": "e.g. Bangladeshi, Indian, etc."
}
\`\`\`

After the JSON block, provide a detailed markdown analysis:

### 🍽️ Food Identified
- List each food item with estimated portion

### 📊 Nutritional Breakdown
| Nutrient | Amount | Daily Value % |
|----------|--------|---------------|
| Calories | X kcal | X% |
| Protein | Xg | X% |
| Carbs | Xg | X% |
| Fat | Xg | X% |
| Fiber | Xg | X% |
| Sugar | Xg | X% |

### 💪 Health Score: X/10
- Brief explanation of why this score

### ✅ Positives
- Good nutritional aspects

### ⚠️ Concerns
- High sodium, sugar, etc.

### 💡 Dietary Advice
- How to make this meal healthier
- What to add or reduce
- Best time to eat this

### 🔄 Healthier Alternatives
- Suggest healthier substitutions

Use metric units (grams, kcal). Based on standard adult daily intake of 2000 kcal.
If this is NOT a food image, politely say so.`;

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
        temperature: 0.3,
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

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const result = await analyzeWithVision(base64, mimeType, FOOD_PROMPT);
    return NextResponse.json({ analysis: result });
  } catch (error: any) {
    console.error('[Oxpecker AI] Food analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
