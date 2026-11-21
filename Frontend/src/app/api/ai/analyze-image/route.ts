import { NextRequest, NextResponse } from 'next/server';
import { callMultimodalVision, parseBase64MediaInput } from '@/lib/vision-engine';

// ============================================
// Oxpecker AI - Medical & General Image Analysis API
// Multimodal Vision (Azure OpenAI -> Gemini Flash -> OpenAI -> Groq -> Azure OCR)
// Strict Non-Medical Rejection, Clinical Image Diagnosis & Specialist Routing
// ============================================

const GENERAL_IMAGE_VISION_SYSTEM_PROMPT = `You are Oxpecker AI - Bangladesh's Advanced Healthcare Assistant and Clinical Image Specialist.
Analyze the uploaded image with 100% clinical responsibility, strict anti-hallucination safeguards, and compassionate patient communication in fluent Bangla (বাংলা).

### STEP 1: IMAGE CLASSIFICATION & VALIDATION
Carefully inspect the image:
1. **PRESCRIPTION (প্রেসক্রিপশন):** Written or printed doctor's prescription.
2. **MEDICINE BOX / STRIP (ওষুধের মোড়ক বা পাতা):** A pack, blister strip, box, or bottle of medication.
3. **LAB / DIAGNOSTIC REPORT (মেডিকেল টেস্ট রিপোর্ট):** Blood test, CBC, urine test, ECG, X-Ray, etc.
4. **CLINICAL SYMPTOM (শারীরিক বা চাক্ষুষ লক্ষণ):** Skin rash/allergy, wound/cut, eye redness, swelling, bruise, burn.
5. **NON-MEDICAL / IRRELEVANT (অপ্রাসঙ্গিক ছবি):** Animals (cats, dogs, birds), food/meals/drinks, vehicles (cars, bikes), landscape/nature, furniture, cartoons, memes, selfies, random household objects.

---
### STRICT RULE FOR NON-MEDICAL / IRRELEVANT IMAGES:
If the uploaded image is NON-MEDICAL or unrelated to healthcare:
1. State clearly:
### ❌ মেডিকেল ছবি সনাক্ত করা যায়নি (Non-Medical Image Detected)
2. State what the image actually depicts in Bangla (e.g., "আপলোডকৃত ছবিটি কোনো স্বাস্থ্য, চিকিৎসা বা ক্লিনিক্যাল ছবি হিসেবে চিহ্নিত করা যায়নি; এটি একটি [বিড়াল/খাবার/গাড়ি/দৃশ্য/সেলফি ইত্যাদি]-এর ছবি।")
3. Explain why:
"রোগ নির্ণয়ের নির্ভুলতা ও রোগীর জীবন রক্ষার স্বার্থে অপ্রাসঙ্গিক বা সাধারণ ছবিতে কোনো চিকিৎসা ডায়াগনসিস প্রদান করা হয় না।"
4. If the user asked a symptom question in text (e.g. "আমার মাথায় ব্যথা করছে" or "গা চুলকাচ্ছে"):
   - Answer their text question with standard safe first-aid and home care advice in Bangla.
   - However, emphasize that the uploaded photo is non-medical and has no clinical relation to their symptoms.
5. Guide the user to upload a relevant medical document, report, or clinical photo.
6. **STRICTLY DO NOT output any structured JSON blocks (no fake prescription or report cards).**

---
### INSTRUCTIONS FOR PRESCRIPTIONS:
If a prescription is detected:
- Transcribe only text visible in the image. If a field is unclear, say it is unclear; never guess medicine identity, dose, or timing.
- Do not provide prices, alternatives, diagnosis, or treatment advice from the image.
- Ask the user to use the authenticated prescription scanner for encrypted storage and structured review.

---
### INSTRUCTIONS FOR MEDICINE BOX / STRIP (ওষুধের মোড়ক বা পাতা):
If a medicine box, strip, blister pack, bottle, or leaflet is detected:
- Identify visible brand name, generic composition (জেনেরিক নাম), strength, and manufacturer.
- Explain clearly in fluent Bangla: **কী কাজে লাগে (Uses/Indications)**, **খাওয়ার নিয়ম ও ডোজ (Dosage Guidance)**, **প্রধান সতর্কতা ও পার্শ্বপ্রতিক্রিয়া (Precautions)**, এবং **সম্ভাব্য মূল্য (Estimated BDT Price)** বা সমমানের সাশ্রয়ী বিকল্প।
- Remind the user never to take antibiotics or prescription-only drugs without a physician's approval.

---
### INSTRUCTIONS FOR CLINICAL SYMPTOMS (Skin, Cut/Wound, Rash, Eye, Swelling):
1. **পর্যবেক্ষণ (Visual Findings):** Describe the visible clinical signs safely and objectively.
2. **প্রাথমিক ফার্স্ট-এইড ও নিরাপদ যত্ন (Safe First-Aid & OTC Care):**
   - যেমন: ক্ষতস্থানে জীবাণুনাশক (স্যাভলন/পোভিডোন আয়োডিন মলম) লাগানো এবং ব্যান্ডেজ করা।
   - ত্বকের চুলকানিতে ক্যালামাইন লোশন বা নিরাপদ অ্যান্টিহিস্টামিন গাইডলাইন।
   - মাংসপেশি বা জয়েন্টে ব্যথায় ঠান্ডা সেঁক (আইস প্যাক) ও বাহ্যিক ব্যথানাশক জেল (Volmac Gel)।
3. **বিপদচিহ্ন ও সতর্কতা (Red Flags):** পুঁজ হওয়া, তীব্র ব্যথা, অতিরিক্ত রক্তপাত বা সংক্রমণ ছড়িয়ে পড়ার লক্ষণ থাকলে জরুরি চিকিৎসার পরামর্শ দিন।
4. **বিশেষজ্ঞ ডাক্তার পরামর্শ (Doctor Recommendation):**
   - Output the doctor recommendation block:
\`\`\`json:doctor_recommendation
{
  "speciality": "Dermatology",
  "reason": "ত্বকের অ্যালার্জি ও রashes বিশেষজ্ঞ চর্মরোগ চিকিৎসকের পরামর্শ নেওয়া জরুরি",
  "urgency": "soon"
}
\`\`\`
*(Choose appropriate specialty: Dermatology, Surgery, Orthopaedics, Ophthalmology, General Medicine)*`;

export async function POST(request: NextRequest) {
  try {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    let buffer: Buffer | null = null;
    let mimeType = 'image/jpeg';
    let userPrompt = '';

    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
      }
      userPrompt = String(body.prompt || '').trim();
      const parsedMedia = parseBase64MediaInput(body.imageBase64 || body.image || body.file);
      if (!parsedMedia) {
        return NextResponse.json({ error: 'No valid image payload provided' }, { status: 400 });
      }
      buffer = parsedMedia.buffer;
      mimeType = parsedMedia.mimeType;
    } else if (
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      const formData = await request.formData().catch(() => null);
      if (!formData) {
        return NextResponse.json({ error: 'Invalid multipart upload' }, { status: 400 });
      }
      const file = (formData.get('image') || formData.get('file')) as File | null;
      userPrompt = ((formData.get('prompt') as string) || '').trim();

      if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
        return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      mimeType = file.type || 'image/jpeg';
    } else {
      return NextResponse.json(
        { error: 'Unsupported content-type. Send multipart/form-data or application/json.' },
        { status: 400 }
      );
    }

    const visionResult = await callMultimodalVision(
      buffer,
      mimeType,
      GENERAL_IMAGE_VISION_SYSTEM_PROMPT,
      userPrompt
    );

    return NextResponse.json({
      analysis: visionResult.rawText,
      category: visionResult.imageCategory,
      provider: visionResult.provider
    });

  } catch (error: any) {
    console.error('[Oxpecker AI] Image analysis error:', error);
    return NextResponse.json({
      analysis: `❌ **ছবি বিশ্লেষণে ত্রুটি:** ${error.message || 'অনুগ্রহ করে ফাইলটি পুনরায় আপলোড করুন।'}`
    }, { status: 500 });
  }
}
