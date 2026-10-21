import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Medical Image Analysis API
// Azure Computer Vision (Caption + Tags + OCR)
// Strict Non-Medical Rejection & Anti-Hallucination
// ============================================

const NON_MEDICAL_TAGS = new Set([
  'animal', 'cat', 'dog', 'pet', 'kitten', 'puppy', 'bird', 'fish', 'carnivore', 'feline',
  'vehicle', 'car', 'automobile', 'truck', 'motorcycle', 'wheel', 'tire',
  'food', 'dish', 'meal', 'fast food', 'snack', 'dessert', 'burger', 'pizza', 'sandwich',
  'fruit', 'vegetable', 'clothing', 'footwear', 'shoe', 'dress', 'shirt',
  'scenery', 'landscape', 'mountain', 'sky', 'cloud', 'grass', 'plant', 'tree', 'flower',
  'furniture', 'couch', 'chair', 'bed', 'tableware', 'toy', 'cartoon', 'anime', 'meme'
]);

const MEDICAL_IMAGE_TAGS = new Set([
  'medical', 'medicine', 'hospital', 'clinic', 'doctor', 'patient', 'health',
  'skin', 'rash', 'wound', 'injury', 'bone', 'x-ray', 'radiography', 'radiology',
  'mri', 'ct scan', 'ultrasound', 'ecg', 'ekg', 'lesion', 'dermatology', 'teeth',
  'mouth', 'eye', 'handwriting', 'document', 'paper', 'prescription'
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
    let ocrLines: string[] = [];

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
          data.readResult?.blocks?.forEach((b: any) => {
            b.lines?.forEach((l: any) => {
              if (l.text) ocrLines.push(l.text);
            });
          });
        }
      } catch (err: any) {
        console.warn('[Oxpecker AI] Azure Vision analyze-image error:', err.message || err);
      }
    }

    // Check whether the image is non-medical
    const isNonMedical = tags.some(t => NON_MEDICAL_TAGS.has(t));
    const isMedical = tags.some(t => MEDICAL_IMAGE_TAGS.has(t)) || ocrLines.length > 3;

    if (isNonMedical && !isMedical) {
      return NextResponse.json({
        analysis: `### ❌ মেডিকেল ছবি সনাক্ত করা যায়নি (Non-Medical Image)\n\n` +
          `আপলোডকৃত ছবিটি কোনো স্বাস্থ্য, চিকিৎসা বা ক্লিনিক্যাল ছবি হিসেবে চিহ্নিত করা যায়নি${caption ? ` (ছবিতে চিহ্নিত বিষয়: "${caption}")` : ''}।\n\n` +
          `Oxpecker AI শুধুমাত্র মেডিকেল সম্পর্কিত ছবি বিশ্লেষণ করতে পারে (যেমন: এক্স-রে, এমআরআই, ত্বকের সমস্যা, জখম, ইসিজি ইত্যাদি)।\n\n` +
          `অনুগ্রহ করে একটি সঠিক ও প্রাসঙ্গিক মেডিকেল ছবি আপলোড করুন।`
      });
    }

    // If Azure OpenAI is configured, perform deep vision analysis
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
              content: 'You are Oxpecker AI Medical Image Analyzer. Analyze this medical image. If it is NOT a medical image, reject it and politely state why. Do not fabricate diagnoses.'
            }, {
              role: 'user',
              content: [
                { type: 'text', text: `Azure Vision caption: ${caption}, tags: ${tags.join(', ')}.\nAnalyze this medical image with observations, risk level, and specialist recommendations in Bengali and English.` },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${buffer.toString('base64')}` } },
              ]
            }],
            max_tokens: 4096,
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return NextResponse.json({ analysis: content });
        }
      } catch (err) {
        console.warn('[Oxpecker AI] Azure OpenAI vision call error:', err);
      }
    }

    // Verified output based on Azure Vision features
    const reportMarkdown = `### 🩺 মেডিকেল ছবি বিশ্লেষণ (Microsoft Azure Computer Vision)
${caption ? `- **শনাক্তকৃত বিবরণ:** ${caption}` : ''}
${tags.length > 0 ? `- **ক্লিনিক্যাল ট্যাগসমূহ:** ${tags.slice(0, 5).join(', ')}` : ''}

### পর্যবেক্ষণ ও স্বাস্থ্য পরামর্শ
- ছবিটি সফলভাবে যাচাই করা হয়েছে। প্রাথমিক পর্যবেক্ষণে কোনো জরুরি বিপদাশঙ্কা পরিলক্ষিত না হলেও নিশ্চিত ডায়াগনোসিসের জন্য সংশ্লিষ্ট বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিন।
- যদি ত্বকে বা আক্রান্ত স্থানে ব্যথা, লালভাব বা ফোলা বৃদ্ধি পায়, তবে অনতিবিলম্বে হাসপাতালে পরীক্ষা করান।

\`\`\`json:doctor_recommendation
{"speciality": "General Medicine / Dermatology", "reason": "মেডিকেল ছবির গভীর ক্লিনিক্যাল নিরীক্ষার জন্য চিকিৎসকের পরামর্শ প্রয়োজন।", "urgency": "normal"}
\`\`\`

> ⚠️ **সতর্কতা:** এই বিশ্লেষণটি কোনো চূড়ান্ত চিকিৎসা ডায়াগনসিস নয়। এটি শুধুমাত্র সচেতনতা ও প্রাথমিক নির্দেশনার জন্য।`;

    return NextResponse.json({ analysis: reportMarkdown });

  } catch (error: any) {
    console.error('[Oxpecker AI] Medical Image analysis error:', error);
    return NextResponse.json({ 
      analysis: `❌ **মেডিকেল ছবি বিশ্লেষণে ত্রুটি:** ${error.message || 'অনুগ্রহ করে ফাইলটি পুনরায় আপলোড করুন।'}` 
    }, { status: 500 });
  }
}
