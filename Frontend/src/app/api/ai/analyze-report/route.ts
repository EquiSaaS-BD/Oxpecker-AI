import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Medical Report Analysis API
// Azure Computer Vision (Read OCR + Lab Parameters)
// Strict Non-Report Rejection & Anti-Hallucination
// ============================================

const LAB_MARKERS = [
  'cbc', 'hemoglobin', 'hb', 'wbc', 'rbc', 'platelet', 'esr', 'sugar', 'glucose',
  'creatinine', 'urea', 'bilirubin', 'sgpt', 'alt', 'sgot', 'ast', 'lipid', 'cholesterol',
  'triglycerides', 'hdl', 'ldl', 'urine', 'serum', 'test', 'result', 'reference', 'unit',
  'range', 'normal', 'pathology', 'laboratory', 'specimen', 'patient', 'investigation',
  'blood', 'thyroid', 'tsh', 'ft4', 'hba1c', 'calcium', 'vitamin', 'biochemistry'
];

const NON_REPORT_TAGS = new Set([
  'animal', 'cat', 'dog', 'pet', 'food', 'meal', 'car', 'vehicle', 'tree', 'flower', 'couch'
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

    let ocrLines: string[] = [];
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
          data.readResult?.blocks?.forEach((b: any) => {
            b.lines?.forEach((l: any) => {
              if (l.text) ocrLines.push(l.text);
            });
          });
        }
      } catch (err: any) {
        console.warn('[Oxpecker AI] Azure Vision analyze-report error:', err.message || err);
      }
    }

    const userPrompt = ((formData.get('prompt') as string) || '').trim();

    const fullTextLower = ocrLines.join(' ').toLowerCase();
    const matchedMarkers = LAB_MARKERS.filter(m => fullTextLower.includes(m));
    const isNonReportTag = tags.some(t => NON_REPORT_TAGS.has(t));

    // Strictly reject if no lab markers found or if non-report tags detected (Anti-Hallucination)
    if (matchedMarkers.length === 0 || isNonReportTag || ocrLines.length < 2) {
      const promptSnippet = userPrompt ? `> **আপনার প্রশ্ন/সমস্যা:** "${userPrompt}"\n\n` : '';
      return NextResponse.json({
        analysis: `### ❌ ল্যাব রিপোর্ট সনাক্ত করা যায়নি (No Lab Report Detected)\n\n` +
          promptSnippet +
          `আপলোডকৃত ছবিতে কোনো রক্ত পরীক্ষা, প্যাথলজি বা ডায়াগনস্টিক ল্যাব টেস্টের নির্ভরযোগ্য প্যারামিটার খুঁজে পাওয়া যায়নি${caption ? ` (চিহ্নিত বিষয়: "${caption}")` : ''}।\n\n` +
          `**সঠিক ল্যাব রিপোর্ট পরীক্ষার জন্য:**\n` +
          `- অনুগ্রহ করে সিবিসি (CBC), ব্লাড সুগার, লিপিড প্রোফাইল বা ইউরিন টেস্টের রিপোর্টের সম্পূর্ণ পাতার পরিষ্কার ছবি আপলোড করুন।\n` +
          `- নিশ্চিত করুন যে টেস্টের নাম, ফলাফল এবং রেফারেন্স রেঞ্জ স্পষ্টভাবে দৃশ্যমান রয়েছে।`
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
              content: 'You are Oxpecker AI Medical Report Analyzer. Extract and analyze laboratory test parameters accurately from the image. Do not invent false parameters.'
            }, {
              role: 'user',
              content: [
                { type: 'text', text: `Azure Computer Vision OCR:\n${ocrLines.join('\n')}\n\nAnalyze this medical laboratory test report in Bengali and English.` },
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
        console.warn('[Oxpecker AI] Azure OpenAI report vision call error:', err);
      }
    }

    // Clean, verified markdown report from Azure OCR
    const reportMarkdown = `### 📊 মেডিকেল ল্যাব রিপোর্ট বিশ্লেষণ (Microsoft Azure Computer Vision Read OCR)
- **চিহ্নিত প্যারামিটারসমূহ:** ${matchedMarkers.join(', ') || 'ল্যাব টেস্ট মান'}
- **মোট স্ক্যানকৃত লাইন:** ${ocrLines.length} টি

#### 🔍 রিপোর্ট থেকে অপটিক্যাল পাঠ (Transcript):
\`\`\`text
${ocrLines.join('\n')}
\`\`\`

### ক্লিনিক্যাল পরামর্শ
- আপনার ল্যাব টেস্টের ফলাফলগুলো সংশ্লিষ্ট বিশেষজ্ঞ চিকিৎসকের কাছে প্রদর্শন করে সঠিক চিকিৎসা ও ডোজ নিশ্চিত করুন।
- যেকোনো অস্বাভাবিক মান দেখা দিলে নিজে নিজে কোনো ওষুধ শুরু করবেন না।

> ⚠️ **সতর্কতা:** এই ল্যাব রিপোর্ট বিশ্লেষণটি Microsoft Azure Computer Vision OCR দ্বারা প্রস্তুতকৃত। চূড়ান্ত স্বাস্থ্য সিদ্ধান্তের পূর্বে নিবন্ধিত চিকিৎসকের পরামর্শ নেওয়া আবশ্যক।`;

    return NextResponse.json({ analysis: reportMarkdown });

  } catch (error: any) {
    console.error('[Oxpecker AI] Medical Report analysis error:', error);
    return NextResponse.json({ 
      analysis: `❌ **ল্যাব রিপোর্ট বিশ্লেষণে ত্রুটি:** ${error.message || 'অনুগ্রহ করে ফাইলটি পুনরায় আপলোড করুন।'}` 
    }, { status: 500 });
  }
}
