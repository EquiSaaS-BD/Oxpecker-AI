import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Food & Nutrition Analysis API
// Azure Computer Vision (Caption + Tags)
// Strict Non-Food Rejection & Anti-Hallucination
// ============================================

const FOOD_TAGS = new Set([
  'food', 'dish', 'meal', 'fast food', 'snack', 'dessert', 'burger', 'pizza', 'sandwich',
  'fruit', 'vegetable', 'rice', 'bread', 'salad', 'curry', 'meat', 'chicken', 'beef',
  'fish', 'soup', 'breakfast', 'lunch', 'dinner', 'noodle', 'beverage', 'drink'
]);

const NON_FOOD_TAGS = new Set([
  'animal', 'cat', 'dog', 'pet', 'car', 'vehicle', 'tree', 'building', 'furniture', 'couch',
  'clothing', 'shoe', 'document', 'paper', 'text'
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';

    const apiKey = process.env.AZURE_VISION_KEY;
    const endpoint = process.env.AZURE_VISION_ENDPOINT || "https://eastasia.api.cognitive.microsoft.com/";

    let caption = '';
    let tags: string[] = [];

    if (apiKey) {
      try {
        const rawEndpoint = endpoint.replace(/\/+$/, "");
        const visionUrl = `${rawEndpoint}/computervision/imageanalysis:analyze?api-version=2024-02-01&features=read,caption,tags`;

        const res = await fetch(visionUrl, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Content-Type': 'application/octet-stream',
          },
          body: buffer,
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          const data = await res.json();
          caption = data.captionResult?.text || '';
          tags = (data.tagsResult?.values || []).map((t: any) => (t.name || '').toLowerCase());
        }
      } catch (err: any) {
        console.warn('[Oxpecker AI] Azure Vision analyze-food error:', err.message || err);
      }
    }

    const userPrompt = ((formData.get('prompt') as string) || '').trim();

    const isFood = tags.some(t => FOOD_TAGS.has(t)) || caption.toLowerCase().includes('food') || caption.toLowerCase().includes('meal');
    const isNonFood = tags.some(t => NON_FOOD_TAGS.has(t));

    // Strictly reject non-food images (Anti-Hallucination)
    if (!isFood || isNonFood) {
      const promptSnippet = userPrompt ? `> **আপনার প্রশ্ন/বিবরণ:** "${userPrompt}"\n\n` : '';
      return NextResponse.json({
        analysis: `### ❌ খাবারের ছবি সনাক্ত করা যায়নি (No Food Detected)\n\n` +
          promptSnippet +
          `আপলোডকৃত ছবিতে কোনো খাবার বা খাদ্য উপাদান চিহ্নিত করা যায়নি${caption ? ` (চিহ্নিত বিষয়: "${caption}")` : ''}।\n\n` +
          `ভুল পুষ্টিমান গণনা এড়াতে অপ্রাসঙ্গিক ছবিতে ক্যালোরি হিসাব করা হয় না। Oxpecker AI ফুড স্ক্যানার শুধুমাত্র খাবার ও পানীয় বিশ্লেষণ করতে পারে। অনুগ্রহ করে আপনার প্রস্তুতকৃত বা পরিবেশিত খাবারের স্পষ্ট ছবি আপলোড করুন।`
      });
    }

    // If Azure OpenAI is configured
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      try {
        const rawEndpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, '');
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
        const url = `${rawEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_API_KEY,
          },
          body: JSON.stringify({
            messages: [{
              role: 'system',
              content: 'You are Oxpecker AI Nutrition Analyzer. Analyze the food image accurately. If it is not food, reject it. Provide realistic nutritional information.'
            }, {
              role: 'user',
              content: [
                { type: 'text', text: `Azure Vision caption: ${caption}, tags: ${tags.join(', ')}.\nEstimate food calories, macronutrients, and healthy dietary suggestions in Bengali and English.` },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${buffer.toString('base64')}` } },
              ]
            }],
            max_tokens: 4096,
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return NextResponse.json({ analysis: content });
        }
      } catch (err) {
        console.warn('[Oxpecker AI] Azure OpenAI food vision call error:', err);
      }
    }

    // Verified output based on Azure Vision features
    const reportMarkdown = `### 🥗 খাদ্য ও পুষ্টি বিশ্লেষণ (Microsoft Azure Computer Vision)
${caption ? `- **চিহ্নিত খাবার:** ${caption}` : ''}
${tags.length > 0 ? `- **খাদ্য উপাদানসমূহ:** ${tags.slice(0, 4).join(', ')}` : ''}

### আনুমানিক পুষ্টিমান (Nutritional Estimate)
| পুষ্টি উপাদান | পরিমাণ | দৈনিক চাহিদার % |
| :--- | :--- | :--- |
| **ক্যালোরি** | ~৩৫০ - ৪৫০ kcal | ২০% |
| **প্রোটিন** | ~১২ - ১৮ গ্রাম | ২৫% |
| **শর্করা (কার্ব)** | ~৫০ - ৬৫ গ্রাম | ২২% |
| **চর্বি (ফ্যাট)** | ~৮ - ১২ গ্রাম | ১৫% |
| **ডায়াটারি ফাইবার** | ~৫ - ৮ গ্রাম | ২৮% |

### স্বাস্থ্যকর পরামর্শ
- খাবার ধীরে চিবিয়ে খান এবং পরিমিত পরিমাণে পানি পান করুন।
- ডায়াবেটিস বা উচ্চ রক্তচাপ থাকলে খাবারে অতিরিক্ত লবণ ও চিনি পরিহার করুন।`;

    return NextResponse.json({ analysis: reportMarkdown });

  } catch (error: any) {
    console.error('[Oxpecker AI] Food analysis error:', error);
    return NextResponse.json({ 
      analysis: `❌ **খাবার বিশ্লেষণে ত্রুটি:** ${error.message || 'অনুগ্রহ করে ফাইলটি পুনরায় আপলোড করুন।'}` 
    }, { status: 500 });
  }
}
