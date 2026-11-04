import { NextRequest, NextResponse } from 'next/server';
import { analyzeClinicalCase, ClinicalAnalysis } from '@/lib/clinical-engine';
import { executeMedicalRAGWithLiveResearch, MedicalRAGResult } from '@/lib/medical-rag';

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
      return `\n## ACTIVE FOCUS: SYMPTOM ASSESSMENT & CLINICAL TRIAGE
- Analyze the user's specific symptoms, potential underlying causes according to DGHS Bangladesh & WHO guidelines, and red-flag danger signs.
- Always include a clean Markdown table comparing probable conditions, match indicators, triage urgency, and recommended diagnostic lab tests.
- If the user has not described any symptoms yet, politely ask what symptoms they are experiencing.`;

    case 'medicines':
      return `\n## ACTIVE FOCUS: MEDICINES, PHARMACOLOGY & DGDA PRICE COMPARISON
- Use the verified DGDA brand records and MedEx generic monographs supplied in the RAG context to give exact, authoritative answers on active ingredients, strengths, dosage forms, manufacturers, DGDA retail prices (৳), indications, dosage, drug interactions, contraindications, and side effects.
- Always include a Markdown comparison table of the queried medicine and its verified same-generic Bangladeshi alternatives with clickable links \`[Brand Name](/medicines/id)\` and exact prices!
- Remind the user that prescription medicines (especially antibiotics and steroids) require a registered doctor's prescription.`;

    case 'prescriptions':
      return `\n## ACTIVE FOCUS: PRESCRIPTION EXPLANATION & DOSAGE TIMING
- Explain prescription instructions (e.g., 1+0+1, 1+1+1), food timings (before or after meals), drug-drug interaction precautions, and the importance of completing the full course in a structured Markdown table.`;

    case 'nutrition':
      return `\n## ACTIVE FOCUS: THERAPEUTIC NUTRITION & BANGLADESHI DIETETICS
- Provide evidence-based Bangladeshi dietary plans (BADAS diabetic plate method, DASH hypertension diet, renal low-potassium diet, fatty liver diet).
- Always present a clean Markdown meal-plan table with meal times, allowed local foods, and foods to avoid.`;

    case 'hospitals':
      return `\n## ACTIVE FOCUS: HOSPITALS, SPECIALISTS & EMERGENCY HOTLINES
- Guide the user to appropriate medical departments, diagnostic centers, and specialist doctors.
- Always highlight national hotlines: National Emergency **999**, Shastho Batayon **16263** (24/7 DGHS Doctor Hotline).`;

    case 'emergency':
      return `\n## ACTIVE FOCUS: MEDICAL EMERGENCY & LIFE-SAVING FIRST AID
- Immediately assess if the situation is life-threatening (chest pain, stroke, snakebite, choking, severe bleeding, unconsciousness).
- Output the emergency alert JSON block:
\`\`\`json:emergency_alert
{"type": "emergency", "condition": "Suspected Medical Emergency", "severity": "critical", "message": "অবিলম্বে ৯৯৯ নম্বরে কল করুন বা নিকটস্থ হাসপাতালের জরুরি বিভাগে যান।", "callNumber": "999"}
\`\`\`
- Provide clear, numbered, evidence-based first-aid steps immediately.`;

    default:
      return '';
  }
}

function getSystemPrompt(
  language: string = 'bn',
  patientContext?: any,
  clinicalAnalysis?: ClinicalAnalysis,
  category?: string,
  backendDiagnosis?: any,
  ragResult?: MedicalRAGResult
): string {
  const langInstruction =
    language === 'bn'
      ? 'Respond in natural, fluent, authoritative yet empathetic Bangla (বাংলা) language.'
      : 'Respond in clear, natural, authoritative yet empathetic English.';

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
      contextSnippet = `\n## PATIENT HEALTH CONTEXT\n${details.join(' | ')}\nTailor clinical advice and contraindication checks specifically to this patient's profile.\n`;
    }
  }

  let clinicalGroundingSnippet = '';
  if (
    backendDiagnosis &&
    backendDiagnosis.has_clinical_match &&
    backendDiagnosis.condition &&
    (backendDiagnosis.primary_symptoms_matched || []).length > 0
  ) {
    clinicalGroundingSnippet = `
## PRELIMINARY CLINICAL ENGINE CONTEXT:
- Matched Symptoms: ${(backendDiagnosis.primary_symptoms_matched || []).join(', ')}
- Probable Condition: ${backendDiagnosis.condition}
- Category: ${backendDiagnosis.category || 'General Clinical'}
- Urgency: ${backendDiagnosis.triage_urgency || 'ROUTINE'}
- Protocol Reference: ${backendDiagnosis.clinical_protocol || 'DGHS / WHO Standard Treatment Guideline'}
- Clinical Advice: ${backendDiagnosis.advice || ''}
- Red Flags: ${(backendDiagnosis.red_flags || []).join(', ')}
`;
  } else if (
    clinicalAnalysis &&
    clinicalAnalysis.hasSymptomMatch &&
    clinicalAnalysis.detectedSymptoms.length > 0 &&
    clinicalAnalysis.primaryMatches.length > 0
  ) {
    const topMatches = clinicalAnalysis.primaryMatches
      .map(
        (m) =>
          `- **${m.disease.bengali_name} (${m.disease.name})**: ${m.matchScore}% Match | Triage: ${m.triageLevel} | Specialty: ${m.disease.speciality} | Diagnostic Tests: ${m.disease.diagnostic_tests.join(', ')}`
      )
      .join('\n');

    clinicalGroundingSnippet = `
## CLINICAL SYMPTOM TRIAGE GROUNDING:
Detected Symptoms: ${clinicalAnalysis.detectedSymptoms.join(', ')}
${topMatches ? `\n### Probable Conditions for Consideration:\n${topMatches}\n` : ''}
`;
  }

  const categorySnippet = getCategoryInstructions(category);
  const ragSnippet = ragResult ? `\n${ragResult.groundingContextText}\n` : '';

  return `You are **Oxpecker AI**, Bangladesh's premier Retrieval-Augmented Generation (RAG) Clinical & Pharmacology AI Assistant. You provide sharp, to-the-point, evidence-based medical, pharmacological, diagnostic, and nutritional guidance grounded in verified DGDA, MedEx, DGHS Bangladesh, icddr,b, BADAS, WHO, and PubMed resources.

${langInstruction}
${contextSnippet}
${clinicalGroundingSnippet}
${categorySnippet}
${ragSnippet}

## MANDATORY HIGH-PRECISION RAG & INTERACTIVE OUTPUT RULES:
1. **USE RETRIEVED RAG DATA DIRECTLY & CONFIDENTLY:**
   - When \`VERIFIED MULTI-SOURCE MEDICAL RAG EVIDENCE\` provides medicine brands, generic compositions, strengths, manufacturers, DGDA retail prices (\`৳\`), alternatives, lab reference ranges, or clinical monographs, **USE THEM DIRECTLY**!
   - NEVER say "I cannot check live prices" or "I cannot confirm the active ingredient without seeing the box" when the RAG context above already gives the exact DGDA price and composition (e.g., Napa Extra = Paracetamol 500mg + Caffeine 65mg, Beximco Pharmaceuticals Ltd., ৳ 2.50/unit).
   - Keep your answer **to-the-point, structured, clinically rigorous, and actionable** — avoid vague filler paragraphs!

2. **MANDATORY MARKDOWN TABLES (ইন্টারেক্টিভ টেবিল):**
   - For ANY question about medicines/alternatives, symptoms/diseases, lab test normal ranges, pediatric weight-based doses, or diet charts, ALWAYS include a properly formatted GFM Markdown table with a blank line before and after the table:

| কলাম ১ | কলাম ২ | কলাম ৩ | কলাম ৪ |
| :--- | :--- | :--- | :--- |
| তথ্য ১ | তথ্য ২ | তথ্য ৩ | তথ্য ৪ |

3. **MANDATORY CLICKABLE HYPERLINKS (ক্লিকেবল লিংক):**
   - Every time you mention a matched medicine brand from the RAG context (both in prose and inside Markdown tables), format it as a clickable link using its exact URL: e.g., \`[Napa Extra](/medicines/10457)\`, \`[Ace Plus](/medicines/369)\`, \`[3-C](/medicines/7696)\`, \`[Sergel](/medicines/14908)\`.
   - When referencing doctors or specialties, link as \`[বিশেষজ্ঞ ডাক্তার খুঁজুন](/doctors?speciality=Medicine)\`.
   - When referencing hospitals, link as \`[নিকটস্থ হাসপাতাল ও জরুরি সেবা](/hospitals)\`.
   - When citing PubMed literature from the RAG context, link as \`[PubMed Study](https://pubmed.ncbi.nlm.nih.gov/...)\`.

4. **INLINE IMAGES & PACKAGING / CHEMICAL STRUCTURES (ছবি প্রদর্শন):**
   - If the RAG context provides an official packaging image or chemical structure SVG (\`![...](https://...)\`), include that exact Markdown image tag in your response so the user sees the visual image directly in the chat!

5. **EMBEDDED YOUTUBE CLINICAL VIDEOS (ইউটিউব ভিডিও প্লেয়ার):**
   - If the RAG context provides a verified educational video tag \`[YOUTUBE:videoId]\` (or if the user asks for a video/tutorial), place \`[YOUTUBE:videoId]\` on its own line so the interactive HD YouTube player renders inline!

6. **STRICT MEDICAL BOUNDARY:**
   - You ONLY answer questions related to health, medicine, pharmacology, symptoms, lab reports, prescriptions, nutrition, first-aid, doctors, and hospitals.
   - Politely refuse programming/coding, math homework, politics, or non-medical requests.
   - Do not diagnose diseases if the user only sends a greeting ("হ্যালো", "কেমন আছেন") or asks about general platform services/hotlines.`;
}

// ============================================
// Post-Stream Interactive RAG Enrichment
// ============================================

function buildPostStreamEnrichment(streamedText: string, ragResult?: MedicalRAGResult): string {
  if (!ragResult) return '';
  const qLower = ragResult.query.toLowerCase();

  // Do not append clinical blocks to non-medical refusals or simple greetings
  const isGreeting = /^(hi|hello|hey|হ্যালো|হাই|সালাম|আসসালামু|কেমন আছেন|kemon achen|thanks|ধন্যবাদ)$/i.test(qLower.trim());
  const isCodingRefusal = streamedText.includes('কোডিং বা চিকিৎসা বহির্ভূত') || streamedText.includes('do not assist with programming');
  if (isGreeting || isCodingRefusal || !ragResult.isHealthQuery) {
    return '';
  }

  let appendix = '\n\n';

  // 1. Ensure Featured Medicine Packaging / Chemical Structure Image is rendered if available and not already in text
  if (
    ragResult.featuredImage &&
    !streamedText.includes(ragResult.featuredImage.url) &&
    !streamedText.includes('![')
  ) {
    appendix += `![${ragResult.featuredImage.caption}](${ragResult.featuredImage.url})\n\n`;
  }

  // 2. Ensure Verified Educational YouTube Video is embedded if matched and not already in text
  if (
    ragResult.educationalVideo &&
    !streamedText.includes('[YOUTUBE:') &&
    !streamedText.includes(ragResult.educationalVideo.youtubeId)
  ) {
    appendix += `[YOUTUBE:${ragResult.educationalVideo.youtubeId}]\n\n`;
  }

  // 3. Ensure Interactive Medicine Recommendation Cards render when brand medicines were matched
  if (
    ragResult.matchedBrandMedicines.length > 0 &&
    !streamedText.includes('json:medicine_recommendation')
  ) {
    const primary = ragResult.matchedBrandMedicines[0];
    appendix += `\`\`\`json:medicine_recommendation\n${JSON.stringify({
      generic: primary.name,
      name: primary.name,
      condition: `${primary.name} (${primary.generic} ${primary.strength || ''}) — ডোজ, সতর্কতা ও সমমানের বিকল্প ব্র্যান্ড`,
    })}\n\`\`\`\n\n`;
  }

  // 4. Ensure Doctor Recommendation Card renders when symptoms/diseases/labs were matched
  if (
    (ragResult.matchedDiseases.length > 0 || ragResult.matchedLabPanels.length > 0 || ragResult.isEmergency) &&
    !streamedText.includes('json:doctor_recommendation') &&
    !streamedText.includes('"speciality"')
  ) {
    appendix += `\`\`\`json:doctor_recommendation\n${JSON.stringify({
      speciality: ragResult.recommendedSpecialty,
      reason: 'লক্ষণ ও ক্লিনিক্যাল রিপোর্ট পর্যালোচনার জন্য বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিন',
      urgency: ragResult.triageUrgency,
    })}\n\`\`\`\n\n`;
  }

  // 5. Append Verified RAG Sources Citation Block
  if (ragResult.ragSources.length > 0 && !streamedText.includes('json:rag_sources')) {
    appendix += `\`\`\`json:rag_sources\n${JSON.stringify(ragResult.ragSources)}\n\`\`\`\n\n`;
  }

  // 6. Append Interactive Follow-Up Suggestion Chips
  if (ragResult.followUpSuggestions.length > 0 && !streamedText.includes('json:follow_ups')) {
    appendix += `\`\`\`json:follow_ups\n${JSON.stringify(ragResult.followUpSuggestions)}\n\`\`\`\n`;
  }

  return appendix.trim() ? `\n\n${appendix.trim()}\n` : '';
}

// ============================================
// Multi-Provider Streaming Engine
// ============================================

async function streamFromOpenAIEndpoint(
  url: string,
  headers: Record<string, string>,
  body: any,
  ragResult?: MedicalRAGResult
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
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Provider Error ${response.status}: ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulatedContent = '';
  let finalized = false;

  const finalizeStream = (controller: ReadableStreamDefaultController) => {
    if (finalized) return;
    finalized = true;
    const enrichment = buildPostStreamEnrichment(accumulatedContent, ragResult);
    if (enrichment) {
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify({ content: enrichment })}\n\n`)
      );
    }
    controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
    controller.close();
  };

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          finalizeStream(controller);
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === 'data: [DONE]') {
            finalizeStream(controller);
            return;
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                accumulatedContent += content;
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
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
        await new Promise((r) => setTimeout(r, 14));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

// ============================================
// POST /api/ai/chat
// ============================================

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages: userMessages,
      category: explicitCategory,
      mode,
      language: requestedLanguage,
      patientContext,
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

    const lastUserMessage = validUserMessages.filter((m: ChatMessage) => m.role === 'user').pop();
    const queryText = lastUserMessage ? lastUserMessage.content : '';

    let activeCategory = explicitCategory || (typeof mode === 'string' ? mode : mode?.id);
    if (!activeCategory) {
      const lowerQuery = queryText.toLowerCase();
      if (lowerQuery.includes('symptom') || lowerQuery.includes('লক্ষণ')) activeCategory = 'symptoms';
      else if (lowerQuery.includes('medicine') || lowerQuery.includes('ওষুধ') || lowerQuery.includes('ডোজ') || lowerQuery.includes('দাম')) activeCategory = 'medicines';
      else if (lowerQuery.includes('prescription') || lowerQuery.includes('প্রেসক্রিপশন')) activeCategory = 'prescriptions';
      else if (lowerQuery.includes('nutrition') || lowerQuery.includes('food') || lowerQuery.includes('পুষ্টি') || lowerQuery.includes('খাবার') || lowerQuery.includes('ডায়েট')) activeCategory = 'nutrition';
      else if (lowerQuery.includes('hospital') || lowerQuery.includes('হাসপাতাল')) activeCategory = 'hospitals';
      else if (lowerQuery.includes('emergency') || lowerQuery.includes('জরুরি')) activeCategory = 'emergency';
    }

    const isBangla = requestedLanguage === 'bn' || /[\u0980-\u09FF]/.test(queryText);
    const language = isBangla ? 'bn' : 'en';

    // 1. Local clinical analysis for symptom triage
    const clinicalAnalysis = analyzeClinicalCase(queryText, language, activeCategory);

    // 2. Multi-Source Hybrid Medical RAG Pipeline (Local 21,714 Medicines + 1,711 Monographs + Clinical Corpus + Live MedEx/PubMed/YouTube Research)
    const ragResult = await executeMedicalRAGWithLiveResearch(queryText, language, activeCategory);

    // 3. Query Azure backend clinical AI model if symptoms/emergency detected
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
            category: activeCategory,
          }),
          signal: AbortSignal.timeout(3500),
        });

        if (diagRes.ok) {
          const diagData = await diagRes.json();
          if (diagData && diagData.diagnosis && diagData.diagnosis.has_clinical_match) {
            backendDiagnosis = diagData.diagnosis;
          }
        }
      } catch {}
    }

    // 4. Construct RAG-Grounded System Prompt
    const systemPrompt = getSystemPrompt(
      language,
      patientContext,
      clinicalAnalysis,
      activeCategory,
      backendDiagnosis,
      ragResult
    );

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...validUserMessages.map((m: any) => ({
        role: m.role === 'bot' ? 'assistant' : m.role === 'model' ? 'assistant' : m.role,
        content: m.content.trim(),
      })),
    ];

    // ============================================
    // Provider Attempt 0: Nebius Token Factory (NVIDIA Nemotron 70B)
    // ============================================
    const nebiusKey = process.env.NEBIUS_API_KEY;
    if (nebiusKey && nebiusKey.trim().length > 5) {
      try {
        const nebiusBaseUrl = (process.env.NEBIUS_BASE_URL || 'https://api.tokenfactory.nebius.com/v1').replace(/\/+$/, '');
        const nebiusModel = process.env.NEBIUS_MODEL || 'nvidia/Llama-3.1-Nemotron-70B-Instruct-HF';
        const stream = await streamFromOpenAIEndpoint(
          `${nebiusBaseUrl}/chat/completions`,
          { Authorization: `Bearer ${nebiusKey.trim()}` },
          {
            model: nebiusModel,
            messages: fullMessages,
            temperature: 0.25,
            max_tokens: 3000,
          },
          ragResult
        );
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-AI-Provider': 'Nebius-NVIDIA-Nemotron-70B-RAG',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] Nebius streaming error, falling back to Azure:', err.message || err);
      }
    }

    // ============================================
    // Provider Attempt 1: Microsoft Azure OpenAI
    // ============================================
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      try {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, '');
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5-mini';
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';
        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

        const azurePayload: Record<string, any> = {
          messages: fullMessages,
          max_completion_tokens: 3000,
        };

        if (
          deployment.includes('gpt-5') ||
          deployment.includes('o1') ||
          deployment.includes('o3') ||
          deployment.includes('o4')
        ) {
          azurePayload.reasoning_effort = 'low';
        } else {
          azurePayload.temperature = 0.25;
        }

        const stream = await streamFromOpenAIEndpoint(
          url,
          { 'api-key': process.env.AZURE_OPENAI_API_KEY },
          azurePayload,
          ragResult
        );
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-AI-Provider': 'Azure-OpenAI-RAG',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] Azure OpenAI streaming error, trying OpenAI:', err.message || err);
      }
    }

    // ============================================
    // Provider Attempt 2: Direct OpenAI API
    // ============================================
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey.trim().length > 10 && !openaiKey.includes('dummy')) {
      try {
        const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
        const stream = await streamFromOpenAIEndpoint(
          `${baseUrl}/chat/completions`,
          { Authorization: `Bearer ${openaiKey.trim()}` },
          {
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: fullMessages,
            temperature: 0.25,
            max_tokens: 3000,
          },
          ragResult
        );
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-AI-Provider': 'OpenAI-GPT4o-RAG',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] OpenAI streaming error, trying Groq:', err.message || err);
      }
    }

    // ============================================
    // Provider Attempt 3: Groq AI
    // ============================================
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && groqKey.startsWith('gsk_') && !groqKey.includes('QMaZdoqj5rKrodGXauFDWGdyb3FY')) {
      try {
        const stream = await streamFromOpenAIEndpoint(
          'https://api.groq.com/openai/v1/chat/completions',
          { Authorization: `Bearer ${groqKey}` },
          {
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: fullMessages,
            temperature: 0.3,
            max_tokens: 3000,
          },
          ragResult
        );
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-AI-Provider': 'Groq-Llama3-RAG',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] Groq streaming error, trying Gemini:', err.message || err);
      }
    }

    // ============================================
    // Provider Attempt 4: Google Gemini
    // ============================================
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey && geminiKey.startsWith('AIzaSy') && !geminiKey.includes('BzMLxU5OTUJy0SPTtU4ZyQB73N3vlwccU')) {
      try {
        const stream = await streamFromOpenAIEndpoint(
          'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
          { Authorization: `Bearer ${geminiKey}` },
          {
            model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
            messages: fullMessages,
            temperature: 0.25,
            max_tokens: 3000,
          },
          ragResult
        );
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-AI-Provider': 'Google-Gemini-RAG',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] Gemini streaming error, falling back to RAG synthesizer:', err.message || err);
      }
    }

    // Final High-Grade RAG Synthesized Fallback
    if (ragResult && ragResult.synthesizedResponse) {
      const stream = streamConversationalText(ragResult.synthesizedResponse);
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-AI-Provider': 'Oxpecker-Medical-RAG-Engine',
        },
      });
    }

    return NextResponse.json(
      { error: 'AI providers are unavailable right now. Please retry shortly.' },
      { status: 503, headers: { 'X-AI-Provider': 'unavailable' } }
    );
  } catch (error: any) {
    console.error('[Oxpecker AI] Chat Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
