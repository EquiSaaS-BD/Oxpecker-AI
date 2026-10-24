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
- Explain only medicine facts supported by verified information in the conversation or trusted clinical context.
- Never invent a Bangladeshi brand, strength, price, indication, dosage, interaction, or contraindication. If a fact is not verified, say so and direct the user to a pharmacist or registered clinician.
- Do not call a medicine an equivalent substitute unless generic ingredient, strength, dosage form, and package size all match verified catalog records.
- Do not prescribe antibiotics, steroids, or other prescription-only medicines. Avoid giving an individualized dose without relevant patient details and a verified clinical source.`;

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
## PRELIMINARY CLINICAL ENGINE CONTEXT (NOT A CONFIRMED DIAGNOSIS):
- Matched Symptoms: ${(backendDiagnosis.primary_symptoms_matched || []).join(', ')}
- Probable Condition: ${backendDiagnosis.condition}
- Category: ${backendDiagnosis.category || 'General Clinical'}
- Urgency: ${backendDiagnosis.triage_urgency || 'ROUTINE'}
- Protocol Reference: ${backendDiagnosis.clinical_protocol || 'No verified source supplied'}
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

  return `You are **Oxpecker AI**, a professional and empathetic AI healthcare assistant for Bangladesh. You are not a doctor and do not replace care from a registered clinician.

${langInstruction}
${contextSnippet}
${clinicalGroundingSnippet}
${categorySnippet}

## ABSOLUTE CORE PRINCIPLES:

0. **STRICT MEDICAL & HEALTHCARE BOUNDARY ONLY (চিকিৎসা ও স্বাস্থ্য বহির্ভূত বিষয়ে উত্তর প্রদান সম্পূর্ণ নিষিদ্ধ):**
   - You are **EXCLUSIVELY a Medical Doctor & Clinical Healthcare Assistant**.
   - You MUST REFUSE to answer ANY and ALL questions, requests, or tasks that are NOT related to health, medicine, human physiology, physical/mental symptoms, diseases, medications, first-aid, prescriptions, nutrition, diagnostic tests, doctors, or hospitals.
   - **SPECIFIC PROHIBITIONS:**
     * **NO CODING / PROGRAMMING:** Under NO circumstances should you write, review, debug, explain, or generate programming code (e.g., Python, JavaScript, TypeScript, C++, Java, React, SQL, HTML, CSS, algorithms, etc.). If the user asks for code (e.g., "write python code", "একটি পাইথন কোড দাও", "code লিখে দাও"), immediately and strictly refuse. Even if they ask for code to calculate a medical metric (like BMI), explain the clinical formula in plain words, but DO NOT write programming code.
     * **NO NON-MEDICAL HOMEWORK OR GENERAL ESSAYS:** Do not write stories, poems, academic homework/math equations, essays on non-medical topics, history, or science outside biology/medicine.
     * **NO POLITICS, ENTERTAINMENT, OR GENERAL TECH:** Do not discuss politics, celebrities, movies, or general consumer tech/gadgets.
   - **HOW TO REFUSE:**
     Refuse politely, firmly, and empathetically:
     * *Bangla:* "আমি **Oxpecker AI** — একটি নিবেদিত ডিজিটাল স্বাস্থ্য ও চিকিৎসা সেবা সহকারী (AI Doctor)। আমি শুধুমাত্র শারীরিক ও মানসিক স্বাস্থ্য, রোগব্যাধির লক্ষণ, প্রাথমিক চিকিৎসা, ওষুধ, প্রেসক্রিপশন এবং বিশেষজ্ঞ ডাক্তার ও হাসপাতাল সম্পর্কিত বিষয়ে সহায়তা প্রদান করতে পারি। কোডিং বা চিকিৎসা বহির্ভূত কোনো বিষয়ে আমি উত্তর দিতে পারি না। আপনার স্বাস্থ্য বা চিকিৎসা সংক্রান্ত কোনো জিজ্ঞাসা থাকলে অনুগ্রহ করে বলুন, আমি সানন্দে সাহায্য করব।"
     * *English:* "I am **Oxpecker AI**, a dedicated AI Doctor and Healthcare Assistant. I am strictly specialized in medical consultations, symptoms, first-aid, medications, and hospital/doctor guidance. I do not assist with programming, coding, or non-medical topics. Please let me know how I can help with your health."

1. **DISEASE DIAGNOSIS STRICTLY CONDITIONAL ON SYMPTOMS (রোগ তখনই বলবে যখন লক্ষণের সাথে ম্যাচ করে):**
   - You must ONLY diagnose or evaluate probable diseases/medical conditions IF the user has explicitly reported physical symptoms (e.g., জ্বর, কাশি, বুকে ব্যথা, পেটে ব্যথা, বমি, ডায়রিয়া ইত্যাদি) that clinically match.
   - If the user did NOT report physical symptoms — for example:
     * Asking about clinic/hospital services or facilities ("আপনারা কি সেবা দেন?", "কী কী টেস্ট হয়?")
     * Asking to book an appointment or visit a doctor ("ডাক্তারের সাথে দেখা করতে চাই", "অ্যাপয়েন্টমেন্ট কীভাবে নিব?")
     * General inquiries, leads, contact/helpline numbers, fees, opening hours ("কল সেন্টারের নাম্বার কত?", "ফি কত?")
     * Friendly chit-chat or general greetings ("হ্যালো", "কেমন আছেন?", "ধন্যবাদ")
     👉 **STRICTLY DO NOT MENTION, ASSUME, OR DIAGNOSE ANY DISEASE!**
     👉 Answer their question naturally, pleasantly, and helpfully like a professional healthcare representative and call center executive.

2. **EVIDENCE-BASED HEALTH AND MEDICINE ANSWERS:**
   - Do not rely on memorized examples or fixed symptom-to-drug recipes. Do not make up medicine brands, doses, treatment durations, prices, or claims that a medicine is safe for this patient.
   - Use only facts explicitly supplied by a verified source in the request/context. Do not describe the local rule-based clinical engine as a DGHS/WHO guideline or its match score as a disease probability.
   - For medication questions without verified product/label data, explain what is unknown and recommend checking the package leaflet or asking a registered pharmacist/clinician. Ask about age, pregnancy, allergies, relevant conditions, and other medicines before discussing individualized risk.
   - For price questions, state that prices are not live-verified unless a source and update date are supplied; do not estimate or claim current savings.
   - Distinguish general information from diagnosis. Give concise red flags and emergency steps when indicated; never delay emergency care to ask follow-up questions.

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

function buildIntelligentFallback(
  queryText: string, 
  category?: string, 
  clinicalAnalysis?: ClinicalAnalysis,
  patientContext?: any
): string {
  const q = queryText.toLowerCase().trim();
  const rawQuery = queryText.trim();
  
  // Patient Profile Personalization
  let patientGreeting = "";
  let patientDossier = "";
  if (patientContext && typeof patientContext === 'object') {
    const pName = patientContext.name || patientContext.full_name;
    if (pName) {
      patientGreeting = `প্রিয় **${pName}**, `;
    }
    const details = [];
    if (patientContext.blood_group) details.push(`রক্তের গ্রুপ: ${patientContext.blood_group}`);
    if (patientContext.allergies && patientContext.allergies !== "None" && patientContext.allergies !== "None reported") {
      details.push(`পরিচিত এলার্জি: ${patientContext.allergies}`);
    }
    if (patientContext.medical_history && patientContext.medical_history !== "None" && patientContext.medical_history !== "None reported") {
      details.push(`মেডিকেল হিস্ট্রি: ${patientContext.medical_history}`);
    }
    if (details.length > 0) {
      patientDossier = `\n> 👤 **রোগীর স্বাস্থ্য প্রোফাইল:** ${details.join(' | ')}\n`;
    }
  }

  // 0. Detect Non-Medical requests (Coding, Software, Homework, Non-health Tech)
  const isNonMedical = /(code|coding|python|javascript|typescript|html|css|react|java|c\+\+|algorithm|function|program|bug|developer|software|script|কোড|প্রোগ্রামিং|জাভাস্ক্রিপ্ট|পাইথন|ম্যাথ|অংক)/i.test(q);
  if (isNonMedical) {
    return `### 🩺 Oxpecker AI — বিশেষায়িত ডিজিটাল স্বাস্থ্যসেবা

${patientGreeting ? `${patientGreeting}` : ''}আমি **Oxpecker AI** — একটি বিশেষায়িত ডিজিটাল স্বাস্থ্য ও চিকিৎসা সেবা সহকারী (AI Doctor)।

⚠️ **গুরুত্বপূর্ণ নোটিশ:** আমি শুধুমাত্র স্বাস্থ্য, শারীরিক/মানসিক লক্ষণ, প্রাথমিক চিকিৎসা ও ফার্স্ট-এইড, প্রেসক্রিপশন ও ওষুধ, এবং বিশেষজ্ঞ ডাক্তার বা হাসপাতাল সম্পর্কিত বিষয়ে পরামর্শ দিতে পারি। 

কোডিং, প্রোগ্রামিং বা স্বাস্থ্যবহির্ভূত কোনো বিষয়ে আমি উত্তর দিতে পারি না।

> 💬 আপনার শারীরিক কোনো সমস্যা, রোগব্যাধির লক্ষণ, ওষুধ বা চিকিৎসা সম্পর্কিত কোনো জিজ্ঞাসা থাকলে অনুগ্রহ করে জানান, আমি সানন্দে সাহায্য করব।`;
  }

  // Detect Greetings
  const isGreeting = /^(hi|hello|hey|হ্যালো|হাই|সালাম|আসসালামু|কেমন আছেন|kemon achen|kemon আছেন|help|শুনুন)/i.test(q);
  if (isGreeting) {
    return `${patientGreeting}হ্যালো! আমি **Oxpecker AI** — আপনার ডিজিটাল স্বাস্থ্য ও ক্লিনিক্যাল পরামর্শক। 🩺

${patientDossier}
আজ আপনার স্বাস্থ্যের ব্যাপারে কীভাবে সাহায্য করতে পারি?
- 💬 আপনার শারীরিক যে কোনো **লক্ষণ বা অনুভূতি** বিস্তারিত লিখুন (যেমন: জ্বর, গা গরম লাগা, মাথাব্যথা, পেটব্যথা, ক্লান্তি)।
- 💊 কোনো নির্দিষ্ট **ওষুধ** বা প্রেসক্রিপশনের সেবনবিধি সম্পর্কে জানতে পারেন।
- 📸 **প্রেসক্রিপশন বা টেস্ট রিপোর্ট** ছবি তুলে আপলোড করে বিশ্লেষণ করতে পারেন।
- 🏥 বিশেষজ্ঞ **ডাক্তার বা হাসপাতালের** সেবা ও জরুরি হটলাইন জানতে পারেন।

আপনার শারীরিক সমস্যা বা প্রশ্নটি লিখুন, আমি এখনই সাহায্য করছি।`;
  }

  // Detect Services, Appointments, Leads, Hotlines
  const isLeadOrService = /^(সেবা|সার্ভিস|সার্ভিসেস|লিড|অ্যাপয়েন্টমেন্ট|বুকিং|সিরিয়াল|ডাক্তার|ফি|খরচ|কল সেন্টার|নাম্বার|হেল্পলাইন|ঠিকানা|কোথায়|তথ্য|প্যাকেজ|service|lead|appointment|booking|fee|cost|call center|helpline|phone|contact|address)/i.test(q);
  if (isLeadOrService) {
    return `### 🏥 Oxpecker AI স্বাস্থ্যসেবা ও সহায়তা কেন্দ্র

${patientGreeting ? `${patientGreeting}Oxpecker AI প্ল্যাটফর্মে আপনাকে স্বাগতম।` : "Oxpecker AI প্ল্যাটফর্মে আপনাকে স্বাগতম।"}

${patientDossier}
#### আমাদের প্রধান সেবাসমূহ:
- 🩺 **লক্ষণ মূল্যায়ন ও ট্রায়াজ:** রোগীর শারীরিক লক্ষণ অনুযায়ী প্রাথমিক সতর্কতা ও সঠিক বিভাগের পরামর্শ।
- 📄 **প্রেসক্রিপশন ও ল্যাব রিপোর্ট স্ক্যানার:** প্রেসক্রিপশন ও রিপোর্টের ছবি থেকে ওষুধ ও পরীক্ষার ব্যাখ্যা।
- 💊 **ওষুধ ও ফার্মাকোলজি গাইড:** নিবন্ধিত ব্র্যান্ড ও জেনেরিক ওষুধের সঠিক সেবনবিধি ও সতর্কতা।
- 🏥 **জরুরি যোগাযোগ ও ডাক্তার পরামর্শ:** জাতীয় জরুরি হটলাইন ও হাসপাতাল নির্দেশনা।

#### প্রয়োজনীয় হটলাইন নম্বরসমূহ:
- 📞 **স্বাস্থ্য বাতায়ন (স্বাস্থ্য অধিদপ্তর):** **১৬২৬৩** (২৪ ঘণ্টা অভিজ্ঞ ডাক্তারের সাথে সরাসরি কথা বলুন)
- 🚨 **জাতীয় জরুরি সেবা:** **৯৯৯** (জরুরি অ্যাম্বুলেন্স ও পুলিশ সহায়তা)

> 💬 আপনি কি কোনো নির্দিষ্ট বিশেষজ্ঞ ডাক্তারের অ্যাপয়েন্টমেন্ট অথবা কোনো সেবা সম্পর্কে জানতে চান? বিস্তারিত জানালে আমি আপনাকে সহায়তা করছি।`;
  }

  // -------------------------------------------------------------------------
  // Dynamic Symptom Engine (Bangla + English + Banglish Transliterations)
  // -------------------------------------------------------------------------

  // 1. Fever / Feverish Feeling (জ্বর, জ্বর জ্বর ভাব, গা গরম, jor, fever, feverish)
  const isFever = /(জ্বর|গা গরম|jor|fever|feverish|tapmatra|temp|temperature|gorom lagche|gorom)/i.test(q);
  if (isFever) {
    const isFeverishOnly = q.includes('অনুভব') || q.includes('ভাব') || q.includes('lagche') || q.includes('feel') || q.includes('অনূভব');
    return `### 🩺 ${isFeverishOnly ? 'জ্বর জ্বর অনুভব হওয়া ও গা গরম লাগার প্রাথমিক পরামর্শ' : 'জ্বর ও শারীরিক অস্বস্তির প্রাথমিক চিকিৎসা ও গাইডলাইন'}

${patientGreeting}আপনার প্রশ্ন **"${rawQuery}"**-এর প্রেক্ষিতে চিকিৎসা নির্দেশনা তুলে ধরা হলো:

${patientDossier}
#### ১. লক্ষণ ও প্রাথমিক অবস্থা বিশ্লেষণ:
- ${isFeverishOnly ? 'শরীরে "জ্বর জ্বর অনুভব হওয়া" (Malaise / Low-grade feverish feeling) সাধারণত শারীরিক ক্লান্তি, অতিরিক্ত পরিশ্রম, পানিশূন্যতা বা কোনো সাধারণ ভাইরাল সংক্রমণের প্রাথমিক ধাপ নির্দেশ করে।' : 'জ্বর মূলত শরীরের রোগ প্রতিরোধ ব্যবস্থার একটি স্বাভাবিক প্রতিক্রিয়া, যা কোনো সংক্রমণ বা প্রদাহের বিরুদ্ধে লড়াই করার সময় দেখা দেয়।'}
- **প্রথম করণীয়:** অবিলম্বে একটি থার্মোমিটার দিয়ে বগল বা জিহ্বার নিচে শরীরের সঠিক তাপমাত্রা পরিমাপ করুন।
  - **৯৮.৪°F - ৯৯°F:** স্বাভাবিক গা গরম বা ক্লান্তি।
  - **১০০°F বা তার বেশি:** মৃদু থেকে মাঝারি জ্বর।

#### ২. জরুরি প্রাথমিক ঘরোয়া যত্ন:
- **বিশ্রাম ও হাইড্রেশন:** প্রচুর বিশুদ্ধ পানি, খাবার স্যালাইন (Orsaline-N), ডাবের পানি বা কুসুম গরম লেবু-আদা চা পান করুন।
- **স্পঞ্জিং:** শরীরের তাপমাত্রা বেশি হলে স্বাভাবিক তাপমাত্রার পানি দিয়ে কপাল, ঘাড় ও হাত-পা নরম সুতি কাপড় দিয়ে মুছে দিন (কখনোই বরফ পানি ব্যবহার করবেন না)।
- ভারী বা মোটা কাপড় এড়িয়ে খোলামেলা ও আরামদায়ক সুতি পোশাক পরিধান করুন।

#### ৩. ওষুধ বিষয়ক সতর্কতা (Safe OTC Guidance):
- তাপমাত্রা ১০০°F এর বেশি হলে এবং শরীরে অস্বস্তি বা ব্যথা থাকলে একজন প্রাপ্তবয়স্ক ব্যক্তি চিকিৎসকের সাধারণ নির্দেশনায় **প্যারাসিটামল ৫০০ মিগ্রা (যেমন: Napa / Ace 500mg)** খাবারের পর ১টি ট্যাবলেট সেবন করতে পারেন (দিনে সর্বোচ্চ ৩-৪ বার, প্রতি ৬ ঘণ্টা পর পর)।
- ⚠️ **অ্যান্টিবায়োটিক সতর্কতা:** চিকিৎসকের সুনির্দিষ্ট পরামর্শ ও প্রেসক্রিপশন ব্যতীত নিজে নিজে কোনো অবস্থাতেই অ্যান্টিবায়োটিক সেবন করবেন না।

\`\`\`json:doctor_recommendation
{
  "speciality": "Medicine",
  "reason": "জ্বর জ্বর ভাব ৩ দিনের বেশি স্থায়ী হলে বা তাপমাত্রা ১০১ ডিগ্রির বেশি হলে মেডিসিন বিশেষজ্ঞের পরামর্শ নিন",
  "urgency": "${isFeverishOnly ? 'routine' : 'soon'}"
}
\`\`\`

> 🚨 **কখন জরুরি ভিত্তিতে ডাক্তার দেখাবেন (Red Flags):** জ্বরের সাথে তীব্র কাঁপুনি, প্রচণ্ড মাথাব্যথা, চোখের পেছনে ব্যথা, ত্বকে লালচে ছোপ/র‌্যাশ, বা তীব্র বমি দেখা দিলে কালবিলম্ব না করে রক্ত পরীক্ষা (CBC, Dengue NS1) করিয়ে ডাক্তারের পরামর্শ নিন।`;
  }

  // 2. Headache / Dizziness (মাথাব্যথা, মাথা ঘোরা, matha betha, headache, matha ghora)
  const isHeadache = /(মাথা ব্যথা|মাথাব্যথা|মাথা ঘোরা|মাথা ঝিমঝিম|headache|matha betha|matha ghora|dizziness)/i.test(q);
  if (isHeadache) {
    return `### 🩺 মাথাব্যথার প্রাথমিক মূল্যায়ন ও ঘরোয়া যত্ন

${patientGreeting}আপনার উল্লেখিত সমস্যা **"${rawQuery}"**-এর প্রেক্ষিতে পরামর্শ:

${patientDossier}
#### ১. সম্ভাব্য কারণ ও প্রাথমিক পর্যালোচনা:
- মাথাব্যথা সাধারণত অতিরিক্ত মানসিক চাপ, ঘুমের ঘাটতি, চোখের ওপর চাপ (স্ক্রিন টাইম), সাইনাস ইনফেকশন বা ডিহাইড্রেশনের (পানিশূন্যতা) কারণে বেশি হয়ে থাকে।

#### ২. তাৎক্ষণিক ঘরোয়া যত্ন:
- একটি শান্ত ও অন্ধকার ঘরে অন্তত ৩০ থেকে ৪৫ মিনিট চোখ বন্ধ করে শুয়ে বিশ্রাম নিন।
- কপালে ও ঘাড়ে স্বাভাবিক ঠান্ডা পানির ভেজা কাপড় দিয়ে হালকা সেঁক দিন।
- অন্তত ১-২ গ্লাস স্বাভাবিক পানি বা ইলেকট্রোলাইট পান করুন।
- মোবাইল, ল্যাপটপ স্ক্রিন ও উচ্চ শব্দ থেকে সাময়িক বিরতি নিন।

#### ৩. প্রাথমিক ওষুধ নির্দেশিকা:
- প্রয়োজনবোধে ভরা পেটে **ট্যাবলেট প্যারাসিটামল ৫০০ মিগ্রা (Napa / Ace)** ১টি সেবন করতে পারেন। খালি পেটে কোনো ব্যথানাশক ওষুধ খাবেন না।

\`\`\`json:doctor_recommendation
{
  "speciality": "Neurology",
  "reason": "মাথাব্যথা নিয়মিত হলে, দৃষ্টি ঝাপসা হলে বা তীব্র মাইগ্রেনের লক্ষণ থাকলে বিশেষজ্ঞ দেখান",
  "urgency": "routine"
}
\`\`\`

> 🚨 **সতর্কতা:** মাথাব্যথার সাথে বমি, ঘাড় শক্ত হওয়া বা চোখে দেখতে সমস্যা হলে দ্রুত নিকটস্থ হাসপাতালে যোগাযোগ করুন।`;
  }

  // 3. Cough, Cold & Sore Throat (কাশি, সর্দি, ঠান্ডা, kashi, shordi, cold, cough, gola betha)
  const isColdCough = /(কাশি|কফ|সর্দি|ঠান্ডা|গলা ব্যথা|kashi|cough|shordi|cold|thanda|gola betha|sore throat)/i.test(q);
  if (isColdCough) {
    return `### 🩺 সর্দি, কাশি ও গলা ব্যথার কার্যকর প্রাথমিক চিকিৎসা

${patientGreeting}আপনার উল্লেখিত লক্ষণ **"${rawQuery}"**-এর প্রেক্ষিতে পরামর্শ:

${patientDossier}
#### ১. ঘরোয়া যত্ন ও আরামদায়ক সমাধান:
- **লবণ পানির গার্গল:** দিনে ৩-৪ বার কুসুম গরম পানিতে আধা চা চামচ লবণ মিশিয়ে ভালো করে কুলকুচি ও গার্গল করুন।
- **গরম পানির ভাপ (Steam Inhalation):** ফুটন্ত গরম পানির ভাপ দিনে ২ বার নাক ও মুখ দিয়ে টেনে নিলে বন্ধ নাক ও শ্বাসনালী পরিষ্কার হয়।
- **ভেষজ চা:** তুলসী পাতা, আদা, লবঙ্গ ও মধু দিয়ে বানানো গরম চা গলার অস্বস্তি দ্রুত উপশম করে।

#### ২. প্রাথমিক ওষুধ নির্দেশিকা:
- সর্দির কারণে নাক বন্ধ বা ঘন ঘন হাঁচি হলে একটি সাধারণ অ্যান্টিহিস্টামিন যেমন **ট্যাবলেট এলাট্রল ১০ মিগ্রা (Alatrol 10mg) বা ফেক্সো ১২০ মিগ্রা (Fexo 120mg)** রাতে খাবারের পর ১টি সেবন করা যেতে পারে।

\`\`\`json:doctor_recommendation
{
  "speciality": "ENT",
  "reason": "কাশি ৭ দিনের বেশি স্থায়ী হলে বা কাশির সাথে রক্ত/শ্বাসকষ্ট হলে ইএনটি বা বক্ষব্যাধি বিশেষজ্ঞ দেখান",
  "urgency": "routine"
}
\`\`\``;
  }

  // 4. Stomach Ache, Acidity, Gastric (পেটব্যথা, গ্যাস, বদহজম, pet betha, gastric, acidity, gas)
  const isStomach = /(পেট ব্যথা|পেটব্যথা|গ্যাস|গ্যাস্ট্রিক|বুক জ্বালা|বদহজম|pet betha|stomach|gastric|acidity|heartburn)/i.test(q);
  if (isStomach) {
    return `### 🩺 পেটের সমস্যা ও গ্যাস্ট্রিকের প্রাথমিক চিকিৎসা

${patientGreeting}আপনার প্রশ্ন **"${rawQuery}"**-এর প্রেক্ষিতে করণীয়:

${patientDossier}
#### ১. খাদ্যাভ্যাস ও জীবনযাত্রা:
- তৈলাক্ত, অতিরিক্ত মসলাযুক্ত, ভাজাপোড়া ও ঝাল খাবার খাওয়া সম্পূর্ণ পরিহার করুন।
- খাবারের পর পরই শুয়ে না পড়ে অন্তত ২০-৩০ মিনিট সোজা থাকুন।
- চা, কফি, কোমল পানীয় ও ধূমপান থেকে বিরত থাকুন।

#### ২. প্রাথমিক ওষুধ নির্দেশিকা:
- বুক জ্বালাপোড়া ও গ্যাসের জন্য **ক্যাপসুল সেক্লো ২০ মিগ্রা (Seclo 20mg) বা সার্জেল ২০ মিগ্রা (Sergel 20mg)** সকালে ও রাতে খাবারের ২০-৩০ মিনিট আগে খালি পেটে সেব্য।
- তাৎক্ষণিক উপশমের জন্য **Antacid Plus Suspension** (২ চা চামচ খাবারের ১ ঘণ্টা পর) খাওয়া যেতে পারে।

\`\`\`json:doctor_recommendation
{
  "speciality": "Gastroenterology",
  "reason": "পেটে তীব্র বা দীর্ঘমেয়াদী ব্যথা থাকলে পরিপাকতন্ত্র বিশেষজ্ঞের পরামর্শ নিন",
  "urgency": "routine"
}
\`\`\``;
  }

  // 5. Diarrhea, Vomiting (বমি, পাতলা পায়খানা, bomi, diarrhea, vomiting, patla paykhana)
  const isDiarrhea = /(বমি|পাতলা পায়খানা|ডায়রিয়া|আমশয়|bomi|diarrhea|vomiting|loose motion)/i.test(q);
  if (isDiarrhea) {
    return `### 🩺 বমি ও পাতলা পায়খানার জরুরি প্রাথমিক চিকিৎসা

${patientGreeting}আপনার উল্লেখিত সমস্যা **"${rawQuery}"**-এর প্রেক্ষিতে জরুরি নির্দেশনা:

${patientDossier}
#### ১. প্রধান লক্ষ্য: পানিশূন্যতা রোধ
- প্রতিবার পাতলা পায়খানা বা বমির পর অবশ্যই **১ গ্লাস (২৫০ মিলি) প্রস্তুতকৃত খাবার স্যালাইন (Orsaline-N)** অল্প অল্প করে চুমুক দিয়ে পান করুন।
- স্যালাইনের পাশাপাশি ডাবের পানি, ভাতের মাড় ও চিড়ার পানি গ্রহণ করুন।

#### ২. ওষুধ নির্দেশিকা:
- বমি ভাব থাকলে খাবারের ১৫ মিনিট আগে **ট্যাবলেট ডমপেরিডন ১০ মিগ্রা (Omidon 10mg)** ১টি সেব্য।

\`\`\`json:doctor_recommendation
{
  "speciality": "Medicine",
  "reason": "তীব্র পানিশূন্যতা, চোখ বসে যাওয়া বা দিনে ৬-৮ বারের বেশি পাতলা পায়খানা হলে দ্রুত চিকিৎসকের শরণাপন্ন হোন",
  "urgency": "urgent"
}
\`\`\`

> 🚨 **বিপদচিহ্ন:** প্রস্রাবের পরিমাণ কমে যাওয়া, মাত্রাতিরিক্ত দুর্বলতা বা পায়খানার সাথে রক্ত গেলে জরুরি ভিত্তিতে হাসপাতালে যান।`;
  }

  // Category based guidance
  if (category === 'medicines') {
    return `### 💊 ওষুধ ও ফার্মাকোলজি নির্দেশনা

${patientGreeting}ওষুধ সেবনের ক্ষেত্রে সর্বদা রেজিস্টার্ড চিকিৎসকের প্রেসক্রিপশন ও সঠিক মাত্রা মেনে চলা উচিত:

${patientDossier}
| বিষয় | দিকনির্দেশনা |
| :--- | :--- |
| **ওষুধের নাম ও ডোজ** | চিকিৎসকের নির্দেশিত নির্দিষ্ট মাত্রা ও সময়ে সেবন করুন |
| **খাওয়ার নিয়ম** | গ্যাস্ট্রিকের ওষুধ সাধারণত খালি পেটে এবং ব্যথানাশক/অ্যান্টিবায়োটিক খাবারের পর সেব্য |
| **সতর্কতা** | চিকিৎসকের পরামর্শ ব্যতীত অ্যান্টিবায়োটিক শুরু বা বন্ধ করবেন না |

> 💬 নির্দিষ্ট কোনো ওষুধের নাম (যেমন Napa, Seclo, Ace, Fexo) বা ডোজ সম্পর্কে জানতে চাইলে নাম লিখে পাঠান।`;
  }

  if (category === 'prescriptions') {
    return `### 📄 প্রেসক্রিপশন ও সেবনবিধি নির্দেশিকা

${patientGreeting}প্রেসক্রিপশনের নির্দেশনা সঠিকভাবে মেনে চলা দ্রুত সুস্থতার জন্য অপরিহার্য:

${patientDossier}
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

${patientGreeting}সুস্থ থাকার জন্য প্রতিদিন সুষম পুষ্টি নিশ্চিত করা জরুরি:

${patientDossier}
| পুষ্টি উপাদান | দেশীয় খাদ্য উৎস | স্বাস্থ্য উপকারিতা |
| :--- | :--- | :--- |
| **শর্করা** | লাল চালের ভাত, লাল আটার রুটি | দীর্ঘস্থায়ী কর্মশক্তি বজায় রাখে |
| **আমিষ** | দেশি মাছ, ডিম, মসুর ডাল, মুরগির মাংস | টিস্যু গঠন ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি |
| **ভিটামিন ও ফাইবার** | তাজা শাকসবজি (লাল শাক, পেঁপে, লাউ), ফলমূল | হজমশক্তি বৃদ্ধি ও মেটাবলিজম স্বাভাবিক রাখা |
| **পানি ও তরল** | দৈনিক ২.৫ থেকে ৩ লিটার বিশুদ্ধ পানি | পানিশূন্যতা রোধ ও শরীর সতেজ রাখা |`;
  }

  if (category === 'hospitals') {
    return `### 🏥 হাসপাতাল ও জরুরি চিকিৎসা যোগাযোগ

${patientGreeting}জরুরি চিকিৎসা সহায়তা ও প্রাতিষ্ঠানিক সেবার জন্য নিচের নম্বরগুলোতে যোগাযোগ করতে পারেন:

${patientDossier}
- 🚨 **জাতীয় জরুরি সেবা:** **৯৯৯** (জরুরি অ্যাম্বুলেন্স সহায়তা)
- 📞 **স্বাস্থ্য বাতায়ন:** **১৬২৬৩** (স্বাস্থ্য অধিদপ্তরের সার্বক্ষণিক ডাক্তারের সেবা)
- 🏥 **সরকারি হাসপাতাল:** নিকটস্থ উপজেলা স্বাস্থ্য কমপ্লেক্স, জেলা সদর হাসপাতাল বা মেডিকেল কলেজ হাসপাতালের জরুরি বিভাগ সার্বক্ষণিক সেবা প্রদান করে।`;
  }

  // If patient actually reported symptoms and matches were found
  if (clinicalAnalysis && clinicalAnalysis.hasSymptomMatch && clinicalAnalysis.primaryMatches.length > 0) {
    const top = clinicalAnalysis.primaryMatches[0];
    return `### 🩺 লক্ষণ পর্যালোচনা ও ক্লিনিক্যাল ট্রায়াজ গাইড

${patientGreeting}আপনার বার্তা **"${rawQuery}"** পর্যালোচনা করে প্রাথমিক মূল্যায়ন তৈরি করা হলো:

${patientDossier}
- **সম্ভাব্য অবস্থা:** **${top.disease.bengali_name} (${top.disease.name})**
- **ক্লিনিক্যাল পরামর্শ:** ${top.disease.primary_advice_bn}
- **প্রস্তাবিত ডায়াগনস্টিক পরীক্ষা:** ${top.disease.diagnostic_tests.join(', ')}

#### 📋 করণীয় প্রাথমিক যত্ন:
1. পর্যাপ্ত বিশ্রাম নিশ্চিত করুন এবং প্রচুর তরল ও পুষ্টিকর খাবার গ্রহণ করুন।
2. লক্ষণগুলো নিবিড়ভাবে পর্যবেক্ষণ করুন এবং তীব্র হলে রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।

\`\`\`json:doctor_recommendation
{"speciality": "${top.disease.speciality}", "reason": "লক্ষণগুলো নিবিড় পর্যবেক্ষণ ও সঠিক ব্যবস্থাপনার জন্য", "urgency": "${top.triageLevel === 'Emergency' ? 'emergency' : 'routine'}"}
\`\`\`

> ⚠️ **চিকিৎসা পরামর্শ:** এটি একটি প্রাথমিক ডিজিটাল স্বাস্থ্য পরামর্শ, জরুরি বা জটিল অবস্থায় সরাসরি ডাক্তারের কাছে যাওয়া আবশ্যক।`;
  }

  // 7. General Dynamic Response tailored to user's text
  return `### 🩺 Oxpecker AI ক্লিনিক্যাল স্বাস্থ্যসেবা

${patientGreeting}আপনার বার্তা: **"${rawQuery}"**

${patientDossier}
আপনার উল্লেখিত বিষয়টি আমরা গুরুত্বের সাথে গ্রহণ করেছি। আপনার জন্য পরামর্শ:
1. **সুনির্দিষ্ট লক্ষণ উল্লেখ:** আপনার কোনো শারীরিক অস্বস্তি (যেমন জ্বর, কাশি, ব্যথা, দুর্বলতা) অনুভূত হলে অনুগ্রহ করে বিস্তারিত জানান, যাতে লক্ষণ অনুযায়ী সঠিক নির্দেশনা ও ওটিসি ঘরোয়া পরামর্শ দেওয়া সম্ভব হয়।
2. **ওষুধ বা রিপোর্ট:** কোনো ওষুধ সম্পর্কে জানতে চাইলে তার নাম অথবা প্রেসক্রিপশন থাকলে ক্যামেরায় ছবি তুলে আপলোড করতে পারেন।
3. **জরুরি অবস্থা:** কোনো জরুরি শারীরিক সংকটে অবিলম্বে জাতীয় জরুরি সেবা **৯৯৯** অথবা স্বাস্থ্য বাতায়ন **১৬২৬৩** নম্বরে কল করার পরামর্শ দেওয়া হচ্ছে।

> 💬 আপনার শারীরিক অবস্থার আরও কোনো বিবরণ থাকলে এখানে লিখে জানান, আমি আপনাকে সহায়তা করছি।`;
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
    // Provider Attempt 1: Microsoft Azure OpenAI (Native Azure Subscription)
    // ============================================
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      try {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, '');
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5-mini';
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';
        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

        const azurePayload: Record<string, any> = {
          messages: fullMessages,
          max_completion_tokens: 2500,
        };

        if (deployment.includes('gpt-5') || deployment.includes('o1') || deployment.includes('o3') || deployment.includes('o4')) {
          azurePayload.reasoning_effort = 'low';
        } else {
          azurePayload.temperature = 0.3;
        }

        const stream = await streamFromOpenAIEndpoint(
          url,
          { 'api-key': process.env.AZURE_OPENAI_API_KEY },
          azurePayload
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
        console.warn('[Oxpecker AI] Azure OpenAI streaming error, trying OpenAI:', err.message || err);
      }
    }

    // ============================================
    // Provider Attempt 2: Direct OpenAI API (GPT-4o / GPT-4o-mini)
    // ============================================
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey.trim().length > 10 && !openaiKey.includes('dummy')) {
      try {
        const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
        const stream = await streamFromOpenAIEndpoint(
          `${baseUrl}/chat/completions`,
          { 'Authorization': `Bearer ${openaiKey.trim()}` },
          {
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: fullMessages,
            temperature: 0.35,
            max_tokens: 3000,
          }
        );
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-AI-Provider': 'OpenAI-GPT4o',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] OpenAI streaming error, trying Groq:', err.message || err);
      }
    }

    // ============================================
    // Provider Attempt 3: Groq AI (Ultra-fast Llama-3.3 / Qwen)
    // ============================================
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && groqKey.startsWith('gsk_') && !groqKey.includes('QMaZdoqj5rKrodGXauFDWGdyb3FY')) {
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
        console.warn('[Oxpecker AI] Groq streaming error, trying Gemini:', err.message || err);
      }
    }

    // ============================================
    // Provider Attempt 4: Google Gemini (OpenAI-Compatible endpoint)
    // ============================================
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey && geminiKey.startsWith('AIzaSy') && !geminiKey.includes('BzMLxU5OTUJy0SPTtU4ZyQB73N3vlwccU')) {
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
        console.warn('[Oxpecker AI] Gemini streaming error, falling back to clinical synthesizer:', err.message || err);
      }
    }

    return NextResponse.json(
      { error: 'AI providers are unavailable right now. Please retry shortly or contact a healthcare professional for urgent concerns.' },
      { status: 503, headers: { 'X-AI-Provider': 'unavailable' } }
    );

  } catch (error: any) {
    console.error('[Oxpecker AI] Chat Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
