import { NextRequest, NextResponse } from 'next/server';
import { analyzeClinicalCase, ClinicalAnalysis } from '@/lib/clinical-engine';

// ============================================
// Types
// ============================================

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ============================================
// Category Scoping & Conversational System Prompt
// ============================================

function getCategoryInstructions(category?: string): string {
  switch (category) {
    case 'symptoms':
      return `\n## ACTIVE FOCUS: SYMPTOM ASSESSMENT & HEALTH GUIDANCE
- Focus your response on analyzing the user's specific symptoms, potential underlying causes according to standard clinical guidelines, and red-flag danger signs.
- If symptoms are serious or prolonged, explain which diagnostic lab tests might be needed and advise visiting a qualified doctor.
- When helpful, use a neat Markdown table comparing symptoms or potential conditions.
- NOTE: If the user has not described any symptoms yet, politely ask what symptoms they are experiencing instead of assuming a disease.`;

    case 'medicines':
      return `\n## ACTIVE FOCUS: MEDICINES & PHARMACOLOGY
- Focus your response on medication information: indications, generic vs. brand names (such as Square, Beximco, Incepta), safe OTC usages, and standard precautions.
- Emphasize never taking prescription antibiotics or steroids without a registered doctor's prescription.
- When listing medicines, use a clean Markdown table with columns for Brand Name, Generic, Uses, and Precautions.`;

    case 'prescriptions':
      return `\n## ACTIVE FOCUS: PRESCRIPTION EXPLANATION & DOSAGE
- Focus your response on explaining prescription instructions (e.g., 1+0+1, 1+1+1), food timings (before or after meals), and importance of completing the full course.
- Remind users to confirm any unclear handwriting with their doctor or pharmacist.`;

    case 'nutrition':
      return `\n## ACTIVE FOCUS: NUTRITION & DIETETICS
- Focus your response on healthy nutrition, balanced diet recommendations (suitable for Bangladesh: rice, lentils, fish, green vegetables), calorie management, and hydration.
- Use a clean Markdown table with food groups, recommended portions, and health benefits.`;

    case 'hospitals':
      return `\n## ACTIVE FOCUS: HOSPITALS & HEALTHCARE FACILITIES
- Focus your response on finding appropriate medical facilities, emergency departments, and specialists.
- Always highlight national hotlines: National Emergency **999**, Shastho Batayon **16263** (24/7 DGHS Doctor Hotline).`;

    case 'emergency':
      return `\n## ACTIVE FOCUS: MEDICAL EMERGENCY & FIRST AID
- Immediately assess if the situation is life-threatening (e.g., severe chest pain, shortness of breath, heavy bleeding, loss of consciousness).
- Output the emergency alert JSON block:
\`\`\`json:emergency_alert
{"type": "emergency", "condition": "Suspected Emergency", "severity": "critical", "message": "অবিলম্বে ৯৯৯ নম্বরে কল করুন বা নিকটস্থ জরুরি বিভাগে যান।", "callNumber": "999"}
\`\`\`
- Provide clear, calm first-aid steps.`;

    default:
      return '';
  }
}

function getSystemPrompt(
  language: string = 'bn', 
  patientContext?: any, 
  clinicalAnalysis?: ClinicalAnalysis,
  category?: string,
  backendDiagnosis?: any
): string {
  const langInstruction = language === 'bn' 
    ? 'Respond in natural, fluent, empathetic Bangla (বাংলা) language.' 
    : 'Respond in clear, natural, empathetic English.';

  let contextSnippet = '';
  if (patientContext && typeof patientContext === 'object') {
    const details = [];
    if (patientContext.name) details.push(`Name: ${patientContext.name}`);
    if (patientContext.age || patientContext.dob) details.push(`Age: ${patientContext.age || patientContext.dob}`);
    if (patientContext.gender) details.push(`Gender: ${patientContext.gender}`);
    if (patientContext.blood_group) details.push(`Blood Group: ${patientContext.blood_group}`);
    if (patientContext.allergies) details.push(`Allergies: ${patientContext.allergies}`);
    if (patientContext.medical_history) details.push(`Medical History: ${patientContext.medical_history}`);

    if (details.length > 0) {
      contextSnippet = `\n## PATIENT HEALTH CONTEXT\n${details.join(' | ')}\nTailor advice specifically to this patient's profile.\n`;
    }
  }

  let clinicalGroundingSnippet = '';
  // STRICT RULE: Only ground on disease diagnosis IF actual symptoms matched!
  if (backendDiagnosis && backendDiagnosis.has_clinical_match && backendDiagnosis.condition && (backendDiagnosis.primary_symptoms_matched || []).length > 0) {
    clinicalGroundingSnippet = `
## CLINICAL GROUNDING (DGHS CLINICAL GUIDELINES - SYMPTOMS MATCHED):
- Matched Symptoms: ${(backendDiagnosis.primary_symptoms_matched || []).join(', ')}
- Probable Condition: ${backendDiagnosis.condition}
- Category: ${backendDiagnosis.category || 'General Clinical'}
- Urgency: ${backendDiagnosis.triage_urgency || 'ROUTINE'}
- Protocol Reference: ${backendDiagnosis.clinical_protocol || 'DGHS & WHO Guidelines'}
- Clinical Advice: ${backendDiagnosis.advice || ''}
- Red Flags: ${(backendDiagnosis.red_flags || []).join(', ')}
`;
  } else if (clinicalAnalysis && clinicalAnalysis.hasSymptomMatch && clinicalAnalysis.detectedSymptoms.length > 0 && clinicalAnalysis.primaryMatches.length > 0) {
    const topMatches = clinicalAnalysis.primaryMatches.map(m => 
      `- **${m.disease.bengali_name} (${m.disease.name})**: ${m.matchScore}% Match | Triage: ${m.triageLevel} | Specialty: ${m.disease.speciality} | Diagnostic Tests: ${m.disease.diagnostic_tests.join(', ')}`
    ).join('\n');

    let otcSnippet = '';
    if (clinicalAnalysis.otcGuidance) {
      const otcMeds = clinicalAnalysis.otcGuidance.medicines.map(m => 
        `- [${m.brand_name}](${m.google_search_url}) (${m.generic_name}) by ${m.manufacturer}: ${m.instruction}`
      ).join('\n');
      otcSnippet = `\n### Verified OTC Guidance:\nCondition: ${clinicalAnalysis.otcGuidance.name_bn}\nAction: ${clinicalAnalysis.otcGuidance.recommended_action}\nMedicines:\n${otcMeds}\n`;
    }

    clinicalGroundingSnippet = `
## CLINICAL KNOWLEDGE GROUNDING (SYMPTOMS MATCHED):
Detected Symptoms: ${clinicalAnalysis.detectedSymptoms.join(', ')}
${topMatches ? `\n### Probable Conditions for Consideration:\n${topMatches}\n` : ''}${otcSnippet}
`;
  }

  const categorySnippet = getCategoryInstructions(category);

  return `You are **Oxpecker AI**, an intelligent, professional, and empathetic AI Doctor and Healthcare Assistant for Bangladesh.
You serve as an all-in-one AI Doctor covering all specialties (General Medicine, Cardiology, Neurology, Gynaecology, Pediatrics, Orthopaedics, Dermatology, ENT, Gastroenterology).

${langInstruction}
${contextSnippet}
${clinicalGroundingSnippet}
${categorySnippet}

## ABSOLUTE CORE PRINCIPLES:

1. **DISEASE DIAGNOSIS STRICTLY CONDITIONAL ON SYMPTOMS (রোগ তখনই বলবে যখন লক্ষণের সাথে ম্যাচ করে):**
   - You must ONLY diagnose or evaluate probable diseases/medical conditions IF the user has explicitly reported physical symptoms (e.g., জ্বর, কাশি, বুকে ব্যথা, পেটে ব্যথা, বমি, ডায়রিয়া ইত্যাদি) that clinically match.
   - If the user did NOT report physical symptoms — for example:
     * Asking about clinic/hospital services or facilities ("আপনারা কি সেবা দেন?", "কী কী টেস্ট হয়?")
     * Asking to book an appointment or visit a doctor ("ডাক্তারের সাথে দেখা করতে চাই", "অ্যাপয়েন্টমেন্ট কীভাবে নিব?")
     * General inquiries, leads, contact/helpline numbers, fees, opening hours ("কল সেন্টারের নাম্বার কত?", "ফি কত?")
     * Friendly chit-chat or general greetings ("হ্যালো", "কেমন আছেন?", "ধন্যবাদ")
     * Asking general knowledge questions without personal symptoms
     👉 **STRICTLY DO NOT MENTION, ASSUME, OR DIAGNOSE ANY DISEASE!**
     👉 Answer their question naturally, pleasantly, and helpfully like a professional healthcare representative and call center executive.

2. **BASIC TREATMENTS & SAFE OTC MEDICINES FOR COMMON EVERYDAY AILMENTS (প্রাথমিক চিকিৎসা ও ফার্স্ট-এইড):**
   When the user reports common, mild physical symptoms, immediately provide compassionate home remedies, first-aid instructions, and safe standard OTC medicine guidance:
   - **মাথা ব্যথা (Headache):** পর্যাপ্ত বিশ্রাম, শান্ত অন্ধকার ঘরে থাকা, চোখে বা কপালে ঠান্ডা পানির সেঁক, পর্যাপ্ত পানি পান। নিরাপদ ওষুধ: প্যারাসিটামল ৫০০ মিগ্রা (Napa / Ace) খাবারের পর ১টি; তীব্র ব্যথায় Ace Plus বা Napa Extra।
   - **হালকা জ্বর (Mild Fever):** স্বাভাবিক তাপমাত্রার পানি দিয়ে শরীর ও কপাল স্পঞ্জ করা, বিশ্রাম, প্রচুর পানি ও তরল খাবার। ওষুধ: প্যারাসিটামল ৫০০ মিগ্রা (Napa / Ace) ভরা পেটে ১টি ট্যাবলেট (দিনে সর্বোচ্চ ৩-৪ বার)।
   - **সর্দি ও কাশি (Cold & Cough):** গরম পানির ভাপ (স্টিম), আদা-লেবু-মধু চা, কুসুম গরম পানিতে লবণ দিয়ে গার্গল। নিরাপদ ওষুধ: অ্যান্টিহিস্টামিন যেমন Alatrol 10mg বা Fexo 120mg রাতে খাবারের পর ১টি।
   - **ছেঁড়া-কাটা ও ক্ষত (Cuts & Wounds):** পরিষ্কার জীবাণুমুক্ত পানি বা স্যাভলন দিয়ে ক্ষত পরিষ্কার করা, জীবাণুনাশক মলম পোভিডোন আয়োডিন ১০% (Povisep / Viodin) লাগানো এবং ব্যান্ডেজ করা।
   - **গ্যাস্ট্রিক ও বুক জ্বালা (Acidity / Gastric):** অতিরিক্ত তেল, মসলা ও ভাজাপোড়া পরিহার। ওষুধ: ওমিপ্রাজল ২০ মিগ্রা (Seclo / Omep) বা এসোমিপ্রাজল ২০ মিগ্রা (Sergel / Finix) সকালে ও রাতে খালি পেটে খাবারের ২০ মিনিট পূর্বে।
   - **বমি ও পাতলা পায়খানা (Vomiting & Diarrhea):** পানিশূন্যতা রোধে প্রতিবার পাতলা পায়খানার পর ১ গ্লাস (২৫০ মিলি) ওরস্যালাইন-এন (Orsaline-N) ধীরে ধীরে পান করা; বমি ভাব হলে ডমপেরিডন ১০ মিগ্রা (Omidon) খাবারের আগে ১টি।

3. **DATABASE DOCTOR & HOSPITAL SUGGESTIONS (ডাটাবেজ থেকে ডাক্তার ও হাসপাতাল সুপারিশ):**
   - Whenever an illness requires professional medical attention or the user asks for a specialist, doctor, or hospital, ALWAYS append the structured JSON block so our live database cards render directly in the UI:
\`\`\`json:doctor_recommendation
{
  "speciality": "Medicine",
  "reason": "লক্ষণগুলো নিবিড় পর্যবেক্ষণ ও সঠিক চিকিৎসার জন্য বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিন",
  "urgency": "routine"
}
\`\`\`
   *(Specialty values: "Medicine", "Cardiology", "Neurology", "Gynaecology & Obstetrics", "Dermatology", "ENT", "Orthopaedics", "Pediatrics", "Gastroenterology", "Ophthalmology")*
   
   - If emergency, admission, or hospital tests are indicated, append:
\`\`\`json:hospital_recommendation
{
  "speciality": "Emergency",
  "reason": "জরুরি সেবা ও প্রয়োজনীয় ডায়াগনস্টিক পরীক্ষার জন্য নিকটস্থ হাসপাতালে যোগাযোগ করুন"
}
\`\`\`
   - For simple greetings, chit-chat, or general call-center FAQs without health complaints, DO NOT append these recommendation blocks.

4. **NO ROBOTIC BANNERS:**
   - NEVER output robotic headers like "### 🩺 ক্লিনিক্যাল ডায়াগনসিস (Azure Oxpecker Clinical Engine - 150 Diseases)". Always talk naturally and empathetically as a caring human doctor.`;
}

// ============================================
// Multi-Provider Streaming Engine
// ============================================

async function streamFromOpenAIEndpoint(
  url: string,
  headers: Record<string, string>,
  body: any
): Promise<ReadableStream> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      ...body,
      stream: true,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Provider Error ${response.status}: ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') {
            if (trimmed === 'data: [DONE]') {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            }
            continue;
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {}
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

function streamConversationalText(text: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const chunks = text.match(/\S+\s*/g) || [text];
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        await new Promise(r => setTimeout(r, 18));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });
}

function buildIntelligentFallback(queryText: string, category?: string, clinicalAnalysis?: ClinicalAnalysis): string {
  const q = queryText.toLowerCase().trim();
  const isGreeting = /^(hi|hello|hey|হ্যালো|হাই|সালাম|আসসালামু|কেমন|আছেন|help|শুনুন)/i.test(q);

  if (isGreeting) {
    return `হ্যালো! আমি **Oxpecker AI** — আপনার ডিজিটাল স্বাস্থ্য ও কল সেন্টার সহকারী। 🩺

আজ আপনাকে কীভাবে সাহায্য করতে পারি?
- কোনো শারীরিক **লক্ষণ** থাকলে তা বিস্তারিত লিখে পরামর্শ নিতে পারেন।
- কোনো নির্দিষ্ট **ওষুধ** বা সেবনবিধি সম্পর্কে জানতে পারেন।
- **প্রেসক্রিপশন বা রিপোর্ট** ছবি তুলে আপলোড করতে পারেন।
- বিশেষজ্ঞ **ডাক্তার বা হাসপাতালের** সেবা ও যোগাযোগ নম্বর পেতে পারেন।

আপনার প্রশ্নটি লিখে জানান, আমি আপনাকে দ্রুত সঠিক সহায়তা করছি।`;
  }

  // Lead / Service / Call Center questions
  const isLeadOrService = /^(সেবা|সার্ভিস|সার্ভিসেস|লিড|অ্যাপয়েন্টমেন্ট|বুকিং|সিরিয়াল|ডাক্তার|ফি|খরচ|কল সেন্টার|নাম্বার|হেল্পলাইন|ঠিকানা|কোথায়|তথ্য|প্যাকেজ|service|lead|appointment|booking|fee|cost|call center|helpline|phone|contact|address)/i.test(q);

  if (isLeadOrService) {
    return `### 🏥 Oxpecker AI স্বাস্থ্যসেবা ও সহায়তা কেন্দ্র

Oxpecker AI প্ল্যাটফর্মে আপনাকে স্বাগতম। আমরা কৃত্রিম বুদ্ধিমত্তা ও চিকিৎসা নির্দেশিকার সমন্বয়ে ডিজিটাল স্বাস্থ্য সহায়তা প্রদান করে থাকি:

#### আমাদের প্রধান সেবাসমূহ:
- 🩺 **লক্ষণ মূল্যায়ন ও ট্রায়াজ:** রোগীর শারীরিক লক্ষণ অনুযায়ী প্রাথমিক সতর্কতা ও সঠিক বিভাগের পরামর্শ।
- 📄 **প্রেসক্রিপশন ও ল্যাব রিপোর্ট স্ক্যানার:** প্রেসক্রিপশন ও রিপোর্টের ছবি থেকে ওষুধ ও পরীক্ষার ব্যাখ্যা।
- 💊 **ওষুধ ও ফার্মাকোলজি গাইড:** নিবন্ধিত ব্র্যান্ড ও জেনেরিক ওষুধের সঠিক সেবনবিধি ও সতর্কতা।
- 🏥 **জরুরি যোগাযোগ ও ডাক্তার পরামর্শ:** জাতীয় জরুরি হটলাইন ও হাসপাতাল নির্দেশনা।

#### প্রয়োজনীয় হটলাইন নম্বরসমূহ:
- 📞 **স্বাস্থ্য বাতায়ন (স্বাস্থ্য অধিদপ্তর):** **১৬২৬৩** (২৪ ঘণ্টা অভিজ্ঞ ডাক্তারের সাথে সরাসরি কথা বলুন)
- 🚨 **জাতীয় জরুরি সেবা:** **৯৯৯** (জরুরি অ্যাম্বুলেন্স ও পুলিশ সহায়তা)

> 💬 আপনি কি কোনো নির্দিষ্ট বিশেষজ্ঞ ডাক্তারের অ্যাপয়েন্টমেন্ট অথবা কোনো সেবা সম্পর্কে জানতে চান? বিস্তারিত জানালে আমি আপনাকে সাহায্য করব।`;
  }

  // -------------------------------------------------------------
  // Common Everyday Ailments - Basic Treatment & Safe OTC Guidance
  // (মাথা ব্যথা, হালকা জ্বর, সর্দি-কাশি, ছেঁড়া-কাটা, গ্যাস্ট্রিক, বমি/পাতলা পায়খানা)
  // -------------------------------------------------------------
  if (q.includes('মাথা ব্যথা') || q.includes('মাথাব্যথা') || q.includes('headache')) {
    return `### 🩺 মাথাব্যথার প্রাথমিক ঘরোয়া যত্ন ও সাধারণ চিকিৎসা

মাথাব্যথা দূর করতে নিচের প্রাথমিক পদক্ষেপগুলো অনুসরণ করতে পারেন:

#### ১. ঘরোয়া যত্ন ও ফার্স্ট-এইড:
- শান্ত ও অন্ধকার ঘরে কিছুক্ষণ চোখ বন্ধ করে বিশ্রাম নিন।
- কপালে বা ঘাড়ে স্বাভাবিক ঠান্ডা পানির নরম তোয়ালে দিয়ে সেঁক দিন।
- পর্যাপ্ত পরিমাণে পানি পান করুন (ডিহাইড্রেশনের কারণে প্রায়ই মাথাব্যথা হয়)।
- মোবাইল, কম্পিউটার স্ক্রিন বা উজ্জ্বল আলো থেকে অন্তত ১-২ ঘণ্টা দূরে থাকুন।

#### ২. নিরাপদ প্রাথমিক ওষুধ (OTC Guidance):
- **ট্যাবলেট নাপা ৫০০ মিগ্রা (Napa 500mg) বা এইস (Ace 500mg):** খাবারের পর ১টি ট্যাবলেট খেতে পারেন।
- মাথাব্যথা খুব তীব্র হলে **Napa Extra** বা **Ace Plus** (প্যারাসিটামল + ক্যাফেইন) খাবারের পর ১টি।
- *সতর্কতা: খালি পেটে খাবেন না এবং দিনে ৪টির বেশি ট্যাবলেট সেবন করবেন না।*

\`\`\`json:doctor_recommendation
{
  "speciality": "Medicine",
  "reason": "মাথাব্যথা ৩ দিনের বেশি স্থায়ী হলে বা তীব্র হলে ডাক্তারের পরামর্শ নিন",
  "urgency": "routine"
}
\`\`\`

> ⚠️ **কখন দ্রুত ডাক্তার দেখাবেন:** মাথাব্যথার সাথে বমি, দৃষ্টি ঝাপসা হওয়া, ঘাড় শক্ত হওয়া বা খিঁচুনি হলে অবিলম্বে চিকিৎসকের শরণাপন্ন হোন।`;
  }

  if (q.includes('জ্বর') || q.includes('fever')) {
    return `### 🩺 হালকা জ্বরের প্রাথমিক চিকিৎসা ও পরিচর্যা

জ্বরের তাপমাত্রা নিয়ন্ত্রণে প্রাথমিক সতর্কতা ও যত্ন:

#### ১. ঘরোয়া যত্ন:
- স্বাভাবিক তাপমাত্রার পানি দিয়ে কপাল ও শরীর বারবার নরম কাপড় দিয়ে স্পঞ্জ করে মুছে দিন (বরফ পানি ব্যবহার করবেন না)।
- রোগীকে খোলামেলা, বাতাসযুক্ত ঘরে রাখুন এবং ভারী কম্বল বা চাদর এড়িয়ে চলুন।
- প্রচুর পানি, ওরস্যালাইন, ফলের রস ও পাতলা স্যুপ পান করান।

#### ২. নিরাপদ প্রাথমিক ওষুধ (OTC):
- **ট্যাবলেট নাপা ৫০০ মিগ্রা (Napa / Ace 500mg):** প্রাপ্তবয়স্কদের জন্য খাবারের পর ১টি ট্যাবলেট (দিনে ৩-৪ বার, প্রতি ৬ ঘণ্টা পর পর)।
- শিশুদের ক্ষেত্রে ওজন ও বয়স অনুযায়ী প্যারাসিটামল সিরাপ (যেমন Napa Syrup / Ace Syrup) সেব্য।

\`\`\`json:doctor_recommendation
{
  "speciality": "Medicine",
  "reason": "জ্বর ১০২ ডিগ্রির বেশি হলে বা ৩ দিনের বেশি স্থায়ী হলে রক্ত পরীক্ষা (CBC, Dengue NS1) ও ডাক্তার দেখানো আবশ্যক",
  "urgency": "soon"
}
\`\`\`

> ⚠️ **সতর্কতা:** ডাক্তারের পরামর্শ ব্যতীত কোনো অবস্থাতেই নিজে নিজে অ্যান্টিবায়োটিক শুরু করবেন না।`;
  }

  if (q.includes('ছেঁড়া') || q.includes('কাটা') || q.includes('ক্ষত') || q.includes('wound') || q.includes('cut')) {
    return `### 🩺 ছেঁড়া-কাটা ও ক্ষতের প্রাথমিক ফার্স্ট-এইড চিকিৎসা

আঘাত বা ধারালো কিছুতে কেটে গেলে সংক্রমণ রোধে দ্রুত করণীয়:

#### ১. রক্তপাত বন্ধ ও পরিষ্কারকরণ:
- রক্তপাত বন্ধ করতে পরিষ্কার সুতি কাপড় বা জীবাণুমুক্ত গজ দিয়ে ক্ষতের উপর ৫ মিনিট চেপে ধরে রাখুন।
- পরিষ্কার জীবাণুমুক্ত পানি দিয়ে আলতো করে ক্ষতস্থান ও আশেপাশের ধুলোবালি ধুয়ে নিন।

#### ২. অ্যান্টিসেপ্টিক ও ব্যান্ডেজ:
- ক্ষতস্থানে **পোভিডোন আয়োডিন ১০% মলম (Povisep Ointment / Viodin 10%)** বা **নেবানল (Nebanol Ointment)** আলতো করে লাগিয়ে দিন।
- এরপর একটি জীবাণুমুক্ত ব্যান্ড-এইড (Band-Aid) বা পাতলা গজ ব্যান্ডেজ দিয়ে ঢেকে রাখুন।

\`\`\`json:doctor_recommendation
{
  "speciality": "Surgery",
  "reason": "ক্ষত গভীর হলে সেলাই (Stitch) লাগতে পারে এবং টিটেনাস (টিটি) টিকা নিশ্চিত করা প্রয়োজন",
  "urgency": "soon"
}
\`\`\`

> ⚠️ **টিটেনাস সতর্কতা:** গত ৫ বছরে ধনুষ্টংকার বা টিটেনাস (Tetanus Toxoid - TT) টিকা নেওয়া না থাকলে এবং ক্ষতটি নোংরা বা জং ধরা লোহা দিয়ে হয়ে থাকলে ২৪ ঘণ্টার মধ্যে টিটেনাস টিকা নিন।`;
  }

  if (q.includes('গ্যাস') || q.includes('গ্যাস্ট্রিক') || q.includes('বুক জ্বালা') || q.includes('acidity') || q.includes('gastric')) {
    return `### 🩺 গ্যাস্ট্রিক ও বুক জ্বালাপোড়ার ঘরোয়া যত্ন ও ওষুধ

গ্যাস্ট্রিক ও বদহজম নিয়ন্ত্রণে প্রাথমিক পরামর্শ:

#### ১. ঘরোয়া নিয়মাবলি:
- অতিরিক্ত তেল, মসলাযুক্ত ও ভাজাপোড়া খাবার সম্পূর্ণ এড়িয়ে চলুন।
- খাবারের পর পরই শুয়ে না পড়ে অন্তত ২০-৩০ মিনিট সোজা থাকুন বা হালকা হাঁটাহাঁটি করুন।
- ধূমপান, চা, কফি ও কোমল পানীয় সাময়িকভাবে পরিহার করুন।

#### ২. প্রাথমিক ওষুধ:
- **ক্যাপসুল সেক্লো ২০ মিগ্রা (Seclo 20mg) বা ওমেপ (Omep 20mg):** সকালে ও রাতে খাবারের ২০-৩০ মিনিট আগে খালি পেটে সেব্য।
- তীব্র বুক জ্বালা ও টক ঢেকুরের তাৎক্ষণিক উপশমে: **Antacid Plus Suspension** (২ চা চামচ খাবারের ১ ঘণ্টা পর)।

\`\`\`json:doctor_recommendation
{
  "speciality": "Gastroenterology",
  "reason": "দীর্ঘমেয়াদী পেটে তীব্র ব্যথা বা বুক জ্বালায় গ্যাস্ট্রোএন্টারোলজি বিশেষজ্ঞের পরামর্শ নিন",
  "urgency": "routine"
}
\`\`\``;
  }

  if (q.includes('বমি') || q.includes('পাতলা পায়খানা') || q.includes('ডায়রিয়া') || q.includes('diarrhea') || q.includes('vomiting')) {
    return `### 🩺 বমি ও পাতলা পায়খানার জরুরি প্রাথমিক চিকিৎসা

পানিশূন্যতা রোধ করাই ডায়রিয়া ও বমির প্রধান চিকিৎসা:

#### ১. পানিশূন্যতা রোধ (সবচেয়ে গুরুত্বপূর্ণ):
- প্রতিবার পাতলা পায়খানা বা বমির পর **১ গ্লাস (২৫০ মিলি) ওরস্যালাইন-এন (Orsaline-N)** তৈরি করে ধীরে ধীরে চুমুক দিয়ে পান করুন।
- স্যালাইনের পাশাপাশি ডাবের পানি, ভাতের মাড় ও চিড়ার পানি পান করতে পারেন।

#### ২. প্রাথমিক ওষুধ:
- বমি ভাব থাকলে: **ট্যাবলেট ওমিডন ১০ মিগ্রা (Omidon 10mg / Domperidone):** খাবারের ১৫ মিনিট আগে ১টি।
- শিশুদের ক্ষেত্রে ডায়রিয়ায় জিংক সিরাপ (Soluzinc / Baby Zinc) ১০ দিন খাওয়ানো হয়।

\`\`\`json:doctor_recommendation
{
  "speciality": "Medicine",
  "reason": "তীব্র পানিশূন্যতা, চোখ গর্তে যাওয়া বা রক্ত আমাশয় দেখা দিলে হাসপাতালে স্যালাইন (IV) প্রয়োজন হতে পারে",
  "urgency": "urgent"
}
\`\`\`

> 🚨 **বিপদচিহ্ন:** প্রস্রাব বন্ধ হওয়া, প্রচণ্ড দুর্বলতা বা বমির কারণে কিছুই পেটে না থাকলে কালবিলম্ব না করে নিকটস্থ হাসপাতালে যান।`;
  }

  if (category === 'medicines') {
    return `### 💊 ওষুধ ও ফার্মাকোলজি নির্দেশনা

ওষুধ সেবনের ক্ষেত্রে সর্বদা রেজিস্টার্ড চিকিৎসকের প্রেসক্রিপশন ও সঠিক মাত্রা মেনে চলা উচিত:

| বিষয় | দিকনির্দেশনা |
| :--- | :--- |
| **ওষুধের নাম ও ডোজ** | চিকিৎসকের নির্দেশিত নির্দিষ্ট মাত্রা ও সময়ে সেবন করুন |
| **খাওয়ার নিয়ম** | গ্যাস্ট্রিকের ওষুধ সাধারণত খালি পেটে এবং ব্যথানাশক/অ্যান্টিবায়োটিক খাবারের পর সেব্য |
| **সতর্কতা** | চিকিৎসকের পরামর্শ ব্যতীত অ্যান্টিবায়োটিক শুরু বা বন্ধ করবেন না |

> 💬 নির্দিষ্ট কোনো ওষুধের নাম (যেমন Napa, Seclo, Ace, Fexo) বা ডোজ সম্পর্কে জানতে চাইলে নাম লিখে পাঠান।`;
  }

  if (category === 'prescriptions') {
    return `### 📄 প্রেসক্রিপশন ও সেবনবিধি নির্দেশিকা

প্রেসক্রিপশনের নির্দেশনা সঠিকভাবে মেনে চলা দ্রুত সুস্থতার জন্য অপরিহার্য:

| সংকেত | অর্থ | খাওয়ার সময় |
| :--- | :--- | :--- |
| **১ + ০ + ১** | সকালে ১টি, রাতে ১টি | খাবারের পরে পর্যাপ্ত পানিসহ |
| **১ + ১ + ১** | সকাল, দুপুর ও রাতে ১টি করে | প্রতি ৮ ঘণ্টা পর পর |
| **০ + ০ + ১** | শুধুমাত্র রাতে ১টি | ঘুমানোর পূর্বে |
| **খাবারের আগে** | খালি পেটে সেব্য | খাবারের কমপক্ষে ৩০ মিনিট পূর্বে |

> 📸 **প্রেসক্রিপশন স্ক্যান:** ক্যামেরা বা পেপারক্লিপ আইকনে ক্লিক করে সরাসরি প্রেসক্রিপশনের ছবি আপলোড করতে পারেন।`;
  }

  if (category === 'nutrition') {
    return `### 🥗 পুষ্টি ও সুষম খাদ্যতালিকা গাইড

সুস্থ থাকার জন্য প্রতিদিন সুষম পুষ্টি নিশ্চিত করা জরুরি:

| পুষ্টি উপাদান | দেশীয় খাদ্য উৎস | স্বাস্থ্য উপকারিতা |
| :--- | :--- | :--- |
| **শর্করা** | লাল চালের ভাত, লাল আটার রুটি | দীর্ঘস্থায়ী কর্মশক্তি বজায় রাখে |
| **আমিষ** | দেশি মাছ, ডিম, মসুর ডাল, মুরগির মাংস | টিস্যু গঠন ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি |
| **ভিটামিন ও ফাইবার** | তাজা শাকসবজি (লাল শাক, পেঁপে, লাউ), ফলমূল | হজমশক্তি বৃদ্ধি ও মেটাবলিজম স্বাভাবিক রাখা |
| **পানি ও তরল** | দৈনিক ২.৫ থেকে ৩ লিটার বিশুদ্ধ পানি | পানিশূন্যতা রোধ ও শরীর সতেজ রাখা |`;
  }

  if (category === 'hospitals') {
    return `### 🏥 হাসপাতাল ও জরুরি চিকিৎসা যোগাযোগ

জরুরি চিকিৎসা সহায়তা ও প্রাতিষ্ঠানিক সেবার জন্য নিচের নম্বরগুলোতে যোগাযোগ করতে পারেন:

- 🚨 **জাতীয় জরুরি সেবা:** **৯৯৯** (জরুরি অ্যাম্বুলেন্স সহায়তা)
- 📞 **স্বাস্থ্য বাতায়ন:** **১৬২৬৩** (স্বাস্থ্য অধিদপ্তরের সার্বক্ষণিক ডাক্তারের সেবা)
- 🏥 **সরকারি হাসপাতাল:** নিকটস্থ উপজেলা স্বাস্থ্য কমপ্লেক্স, জেলা সদর হাসপাতাল বা মেডিকেল কলেজ হাসপাতালের জরুরি বিভাগ সার্বক্ষণিক সেবা প্রদান করে।`;
  }

  // If patient actually reported symptoms and matches were found
  if (clinicalAnalysis && clinicalAnalysis.hasSymptomMatch && clinicalAnalysis.detectedSymptoms.length > 0 && clinicalAnalysis.primaryMatches.length > 0) {
    const top = clinicalAnalysis.primaryMatches[0];
    return `### 🩺 লক্ষণ পর্যালোচনা ও প্রাথমিক পরামর্শ

আপনার উল্লেখিত লক্ষণসমূহের প্রেক্ষিতে প্রাথমিক মূল্যায়ন নিচে তুলে ধরা হলো:

- **সম্ভাব্য বিষয়:** **${top.disease.bengali_name} (${top.disease.name})**
- **পরামর্শ:** ${top.disease.primary_advice_bn}
- **প্রয়োজনীয় ল্যাব টেস্ট:** ${top.disease.diagnostic_tests.join(', ')}

#### 📋 সাধারণ স্বাস্থ্যবিধি:
1. পর্যাপ্ত বিশ্রাম নিন এবং বিশুদ্ধ পানি ও পুষ্টিকর তরল পান করুন।
2. লক্ষণ তীব্র হলে বা দীর্ঘস্থায়ী হলে দ্রুত রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।

\`\`\`json:doctor_recommendation
{"speciality": "${top.disease.speciality}", "reason": "সঠিক রোগ নির্ণয় ও প্রেসক্রিপশন গ্রহণ", "urgency": "${top.triageLevel === 'Emergency' ? 'emergency' : 'normal'}"}
\`\`\`

> ⚠️ **সতর্কতা:** এই তথ্য প্রাথমিক সচেতনতার জন্য, সরাসরি চিকিৎসকের বিকল্প নয়।`;
  }

  // Non-symptom general response
  return `আপনার স্বাস্থ্যসেবা বা চিকিৎসা বিষয়ক জিজ্ঞাসার জন্য ধন্যবাদ। 

আপনার যদি কোনো শারীরিক সমস্যা বা লক্ষণ (যেমন: জ্বর, সর্দি, কাশি, মাথাব্যথা, পেটব্যথা ইত্যাদি) দেখা দিয়ে থাকে, তবে অনুগ্রহ করে বিস্তারিত লক্ষণ উল্লেখ করুন যাতে সঠিক পরামর্শ দেওয়া সম্ভব হয়।

নির্দিষ্ট কোনো ওষুধ, প্রেসক্রিপশন, পুষ্টি বা হাসপাতাল সম্পর্কিত তথ্য জানতেও সরাসরি প্রশ্ন করতে পারেন।`;
}

// ============================================
// POST /api/ai/chat
// ============================================

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      messages: userMessages, 
      category: explicitCategory, 
      mode, 
      language: requestedLanguage, 
      patientContext 
    } = body;

    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const validUserMessages = userMessages.filter(
      (m: any) => m && typeof m.content === 'string' && m.content.trim().length > 0
    );

    if (validUserMessages.length === 0) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    // Extract last user message and active category
    const lastUserMessage = validUserMessages.filter((m: ChatMessage) => m.role === 'user').pop();
    const queryText = lastUserMessage ? lastUserMessage.content : '';

    // Detect category from payload, promptText, or query prefixes
    let activeCategory = explicitCategory || (typeof mode === 'string' ? mode : mode?.id);
    if (!activeCategory) {
      const lowerQuery = queryText.toLowerCase();
      if (lowerQuery.includes('symptom') || lowerQuery.includes('লক্ষণ')) activeCategory = 'symptoms';
      else if (lowerQuery.includes('medicine') || lowerQuery.includes('ওষুধ')) activeCategory = 'medicines';
      else if (lowerQuery.includes('prescription') || lowerQuery.includes('প্রেসক্রিপশন')) activeCategory = 'prescriptions';
      else if (lowerQuery.includes('nutrition') || lowerQuery.includes('food') || lowerQuery.includes('পুষ্টি') || lowerQuery.includes('খাবার')) activeCategory = 'nutrition';
      else if (lowerQuery.includes('hospital') || lowerQuery.includes('হাসপাতাল')) activeCategory = 'hospitals';
      else if (lowerQuery.includes('emergency') || lowerQuery.includes('জরুরি')) activeCategory = 'emergency';
    }

    // Language detection
    const isBangla = requestedLanguage === 'bn' || /[\u0980-\u09FF]/.test(queryText);
    const language = isBangla ? 'bn' : 'en';

    // 1. Local clinical analysis for genuine patient symptom detection
    const clinicalAnalysis = analyzeClinicalCase(queryText, language, activeCategory);

    // 2. Query Azure backend clinical AI model ONLY IF patient actually described physical symptoms or emergency!
    let backendDiagnosis = null;
    if (clinicalAnalysis.detectedSymptoms.length > 0 || clinicalAnalysis.isEmergency) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oxpecker-api.azurewebsites.net';
        const cleanUrl = backendUrl.replace(/\/+$/, '');
        const diagRes = await fetch(`${cleanUrl}/api/v1/clinical-ai/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            symptoms: queryText,
            category: activeCategory 
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (diagRes.ok) {
          const diagData = await diagRes.json();
          if (diagData && diagData.diagnosis && diagData.diagnosis.has_clinical_match) {
            backendDiagnosis = diagData.diagnosis;
          }
        }
      } catch (e: any) {
        // Non-blocking clinical grounding fallback
      }
    }

    // 3. Construct system prompt
    const systemPrompt = getSystemPrompt(language, patientContext, clinicalAnalysis, activeCategory, backendDiagnosis);

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...validUserMessages.map((m: any) => ({
        role: m.role === 'bot' ? 'assistant' : m.role === 'model' ? 'assistant' : m.role,
        content: m.content.trim(),
      })),
    ];

    // ============================================
    // Provider Attempt 1: Microsoft Azure OpenAI (Student/Production Plan)
    // ============================================
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      try {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, '');
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

        const stream = await streamFromOpenAIEndpoint(
          url,
          { 'api-key': process.env.AZURE_OPENAI_API_KEY },
          {
            messages: fullMessages,
            temperature: 0.3,
            max_tokens: 3000,
          }
        );
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-AI-Provider': 'Azure-OpenAI',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] Azure OpenAI streaming error, trying next provider:', err.message || err);
      }
    }

    // ============================================
    // Provider Attempt 2: Direct OpenAI API
    // ============================================
    if (process.env.OPENAI_API_KEY) {
      try {
        const stream = await streamFromOpenAIEndpoint(
          'https://api.openai.com/v1/chat/completions',
          { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
          {
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: fullMessages,
            temperature: 0.3,
            max_tokens: 3000,
          }
        );
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-AI-Provider': 'OpenAI',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] OpenAI streaming error, trying Gemini:', err.message || err);
      }
    }

    // ============================================
    // Provider Attempt 3: Google Gemini (OpenAI-Compatible endpoint)
    // ============================================
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyBzMLxU5OTUJy0SPTtU4ZyQB73N3vlwccU';
    if (geminiKey) {
      try {
        const stream = await streamFromOpenAIEndpoint(
          'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
          { 'Authorization': `Bearer ${geminiKey}` },
          {
            model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
            messages: fullMessages,
            temperature: 0.3,
            max_tokens: 3000,
          }
        );
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-AI-Provider': 'Google-Gemini',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] Gemini streaming error, trying Groq:', err.message || err);
      }
    }

    // ============================================
    // Provider Attempt 4: Groq AI (Ultra-fast Llama-3 / Qwen)
    // ============================================
    const groqKey = process.env.GROQ_API_KEY || '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';
    if (groqKey) {
      try {
        const stream = await streamFromOpenAIEndpoint(
          'https://api.groq.com/openai/v1/chat/completions',
          { 'Authorization': `Bearer ${groqKey}` },
          {
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: fullMessages,
            temperature: 0.4,
            max_tokens: 3000,
          }
        );
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-AI-Provider': 'Groq-Llama3',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] Groq streaming error, falling back to clinical synthesizer:', err.message || err);
      }
    }

    // ============================================
    // Resilient Fallback: Conversational Synthesizer
    // (Never spits out rigid static disease tables or robotic headers)
    // ============================================
    const fallbackResponse = buildIntelligentFallback(queryText, activeCategory, clinicalAnalysis);
    const stream = streamConversationalText(fallbackResponse);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-AI-Provider': 'Oxpecker-Conversational-Engine',
      },
    });

  } catch (error: any) {
    console.error('[Oxpecker AI] Chat Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
