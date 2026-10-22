import { NextRequest, NextResponse } from 'next/server';
import { callMultimodalVision } from '@/lib/vision-engine';

// ============================================
// Oxpecker AI - Food & Nutrition Analysis API
// Multimodal Vision (Azure OpenAI -> Gemini Flash -> OpenAI -> Groq -> Azure OCR)
// Strict Non-Food Rejection & Calorie/Macro Extraction
// ============================================

const FOOD_VISION_SYSTEM_PROMPT = `You are Oxpecker AI - Bangladesh's Advanced Healthcare Assistant and Clinical Nutrition Specialist.
Analyze the uploaded food image to calculate nutrition and calories with realistic Bangladeshi dietary context.

### STEP 1: VALIDATION & CLASSIFICATION
1. Is this a real food dish, meal, ingredient, or drink?
2. Or is it NON-FOOD (animals, pets, vehicles, furniture, documents, people, scenery, random objects)?

---
### STRICT RULE FOR NON-FOOD IMAGES:
If the image is NOT food:
1. State clearly:
### ❌ খাবারের ছবি সনাক্ত করা যায়নি (No Food Item Detected)
2. State what the image actually depicts in Bangla.
3. Explain that food calorie calculation is only possible on authentic food items.
4. If user asked a question, answer generally in Bangla, but clarify that the photo contains no food.
5. **DO NOT output any \`\`\`json:nutrition_analysis\`\`\` block!**

---
### INSTRUCTIONS FOR VALID FOOD ITEMS:
1. Identify all food items, portions, and estimated weights.
2. Estimate total calories, protein (g), carbohydrates (g), fat (g), and fiber (g).
3. Assign a Health Score from 1 to 10 (10 being most wholesome/healthy).
4. Output the structured JSON block:
\`\`\`json:nutrition_analysis
{
  "mealType": "Lunch / Breakfast / Dinner / Snack",
  "cuisineType": "Bangladeshi / Asian / Fast Food",
  "healthScore": 8,
  "foods": [
    { "name": "Brown Rice / সাদা ভাত", "portion": "১ কাপ (১৫০ গ্রাম)", "calories": 195 },
    { "name": "Lentil Soup / মসুর ডাল", "portion": "১ বাটি (১০০ গ্রাম)", "calories": 116 },
    { "name": "Rui Fish Curry / রুই মাছ ভুনা", "portion": "১ টুকরা (৮০ গ্রাম)", "calories": 140 }
  ],
  "totalCalories": 451,
  "totalProtein": 26,
  "totalCarbs": 62,
  "totalFat": 11,
  "totalFiber": 5
}
\`\`\`

5. Below the JSON block, explain dietary benefits, balance, and nutrition advice in fluent Bangla.`;

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
      FOOD_VISION_SYSTEM_PROMPT,
      userPrompt
    );

    return NextResponse.json({
      analysis: visionResult.rawText,
      category: visionResult.imageCategory,
      provider: visionResult.provider
    });

  } catch (error: any) {
    console.error('[Oxpecker AI] Food analysis error:', error);
    return NextResponse.json({
      analysis: `❌ **খাবার বিশ্লেষণে ত্রুটি:** ${error.message || 'অনুগ্রহ করে ফাইলটি পুনরায় আপলোড করুন।'}`
    }, { status: 500 });
  }
}
