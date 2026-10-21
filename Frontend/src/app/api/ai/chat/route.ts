import { NextRequest, NextResponse } from 'next/server';
import { analyzeClinicalCase, ClinicalAnalysis } from '@/lib/clinical-engine';

// ============================================
// Types
// ============================================

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AzureProviderConfig {
  name: string;
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
}

// ============================================
// Category Scoping & System Prompt
// ============================================

function getCategoryInstructions(category?: string): string {
  switch (category) {
    case 'symptoms':
      return `\n## ACTIVE CATEGORY SCOPE: SYMPTOMS ASSESSMENT & TRIAGE
- Focus your response STRICTLY on patient symptom analysis, probable diseases from DGHS protocols, triage urgency (ROUTINE, URGENT, EMERGENCY), and recommended diagnostic tests.
- Provide a clean Markdown Table comparing possible conditions, match scores, and triage risks.
- Highlight urgent red flags (e.g., shortness of breath, continuous vomiting, bleeding).`;

    case 'medicines':
      return `\n## ACTIVE CATEGORY SCOPE: MEDICINES & PHARMACOLOGY
- Focus your response STRICTLY on medications: brand names vs generic equivalents, safe OTC dosages, manufacturer information (Square, Beximco, Incepta), indications, side effects, and drug cautions.
- Provide a clean Markdown Table of relevant medicines with generic names, dosage instructions, and clickable search links.
- Remind the patient to never take prescription antibiotics or steroids without a licensed doctor's advice.`;

    case 'prescriptions':
      return `\n## ACTIVE CATEGORY SCOPE: PRESCRIPTION GUIDANCE
- Focus your response STRICTLY on interpreting prescriptions, medicine schedules (1+0+1, 1+1+1, 0+0+1), meal timings (before/after meals), duration of course, and questions to ask the pharmacist.
- Provide a dosage schedule table.
- Warn against discontinuing antibiotics before completing the full course.`;

    case 'nutrition':
      return `\n## ACTIVE CATEGORY SCOPE: NUTRITION, DIET & CALORIES
- Focus your response STRICTLY on dietary recommendations, balanced Bangladeshi meals (চাল, ডাল, মাছ, শাকসবজি), hydration, calorie counts, and dietary adjustments for diabetes or high blood pressure.
- Provide a clean Markdown Table with food groups, recommended portions, and health benefits.`;

    case 'hospitals':
      return `\n## ACTIVE CATEGORY SCOPE: HOSPITALS & HEALTHCARE FACILITIES
- Focus your response STRICTLY on hospital care, emergency departments, ICU/CCU facilities, specialist doctors, and national medical hotlines.
- Clearly state: National Emergency 999, Shastho Batayon 16263 (24/7 DGHS Doctor Hotline).
- Guide the user on when to visit an Upazila Health Complex, District Sadar Hospital, or Medical College Hospital.`;

    case 'emergency':
      return `\n## ACTIVE CATEGORY SCOPE: MEDICAL EMERGENCY & FIRST AID
- IMMEDIATELY assess if this is life-threatening (chest pain, stroke, severe bleeding, unconsciousness, poisoning).
- Output the emergency alert JSON block:
\`\`\`json:emergency_alert
{"type": "emergency", "condition": "Suspected Emergency", "severity": "critical", "message": "অবিলম্বে ৯৯৯ নম্বরে কল করুন বা নিকটস্থ জরুরি বিভাগে যান।", "callNumber": "999"}
\`\`\`
- Provide calm, step-by-step immediate first aid instructions.`;

    default:
      return '';
  }
}

function getSystemPrompt(
  language: string = 'en', 
  patientContext?: any, 
  clinicalAnalysis?: ClinicalAnalysis,
  category?: string,
  backendDiagnosis?: any
): string {
  const langInstruction = language === 'bn' 
    ? 'Respond in natural, fluent Bangla (বাংলা) language.' 
    : 'Respond in English.';

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
  if (backendDiagnosis && backendDiagnosis.condition) {
    clinicalGroundingSnippet = `
## AZURE CLINICAL AI ENGINE (9,600+ VERIFIED BANGLADESH CASES & DGHS PROTOCOLS)
Evaluated Condition: ${backendDiagnosis.condition}
Diagnostic Category: ${backendDiagnosis.category || 'General Clinical'}
Triage Urgency: ${backendDiagnosis.triage_urgency || 'ROUTINE'}
Clinical Reference: ${backendDiagnosis.clinical_protocol || 'WHO & DGHS Guidelines'}
Matched Symptoms: ${(backendDiagnosis.primary_symptoms_matched || []).join(', ')}
Clinical Advice: ${backendDiagnosis.advice || ''}
Red Flags: ${(backendDiagnosis.red_flags || []).join(', ')}

MANDATORY RULES:
1. Ground your diagnosis and advice directly on this DGHS verified clinical evaluation.
2. Structure your response with a Markdown Table for symptoms and recommendations.
3. NEVER make up unverified medications; suggest only approved first-aid or advise seeing a specialist doctor.
`;
  } else if (clinicalAnalysis && clinicalAnalysis.isHealthQuery) {
    const topMatches = clinicalAnalysis.primaryMatches.map(m => 
      `- **${m.disease.bengali_name} (${m.disease.name})**: ${m.matchScore}% Match | Triage: ${m.triageLevel} | Specialty: ${m.disease.speciality} | Diagnostic Tests: ${m.disease.diagnostic_tests.join(', ')}`
    ).join('\n');

    let otcSnippet = '';
    if (clinicalAnalysis.otcGuidance) {
      const otcMeds = clinicalAnalysis.otcGuidance.medicines.map(m => 
        `- [${m.brand_name}](${m.google_search_url}) (${m.generic_name}) by ${m.manufacturer}: ${m.instruction}`
      ).join('\n');
      otcSnippet = `\n### Verified OTC Guidance:\nCondition: ${clinicalAnalysis.otcGuidance.name_bn}\nAction: ${clinicalAnalysis.otcGuidance.recommended_action}\nMedicines:\n${otcSnippet}\n`;
    }

    clinicalGroundingSnippet = `
## CLINICAL ENGINE GROUNDING (150 BANGLADESH DISEASES - DGHS PROTOCOLS)
Detected Symptoms: ${clinicalAnalysis.detectedSymptoms.join(', ') || 'General Query'}
${topMatches ? `\n### Probable Conditions:\n${topMatches}\n` : ''}${otcSnippet}
`;
  }

  const categorySnippet = getCategoryInstructions(category);

  return `You are **Oxpecker AI**, an enterprise-grade AI Medical Assistant built on Microsoft Azure and DGHS Bangladesh Clinical Guidelines.

${langInstruction}
${contextSnippet}
${clinicalGroundingSnippet}
${categorySnippet}

## RESPONSE FORMATTING RULES
1. Ground answers strictly on verified facts. Do not hallucinate false medical advice.
2. Structure answers with clean **Markdown Tables** (\`| Header 1 | Header 2 |\`) for comparisons, dosages, tests, or symptoms.
3. Keep answers crisp, empathetic, structured, and easy to read.
4. Always conclude with the specialist doctor recommendation block:
\`\`\`json:doctor_recommendation
{"speciality": "Specialty Name", "reason": "Reason for doctor visit", "urgency": "normal|urgent|emergency"}
\`\`\`
5. Always provide the clinical disclaimer at the end in Bengali.`;
}

// ============================================
// Streaming Providers (Azure OpenAI & Native Clinical Stream)
// ============================================

async function callAzureOpenAIStream(config: AzureProviderConfig, messages: ChatMessage[]): Promise<ReadableStream> {
  const url = `${config.endpoint}/openai/deployments/${config.deployment}/chat/completions?api-version=${config.apiVersion}`;
  
  const response = await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      messages,
      stream: true,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure OpenAI Error ${response.status}: ${errorText}`);
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

function callClinicalEngineStream(reportText: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const words = reportText.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = `data: ${JSON.stringify({ content: words[i] + ' ' })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        await new Promise(r => setTimeout(r, 16));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });
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

    // 1. Connect directly to custom 9,600-case Clinical AI Model on Azure Backend
    let backendDiagnosis = null;
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
        signal: AbortSignal.timeout(10000),
      });

      if (diagRes.ok) {
        const diagData = await diagRes.json();
        if (diagData && diagData.diagnosis) {
          backendDiagnosis = diagData.diagnosis;
        }
      }
    } catch (e: any) {
      console.warn('[Oxpecker AI] Azure backend clinical engine call skipped/fallback:', e.message || e);
    }

    // 2. Perform local deterministic clinical match across 150 diseases & OTC catalog
    const clinicalAnalysis = analyzeClinicalCase(queryText, language, activeCategory);

    // 3. Check for Azure OpenAI Service configuration
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      try {
        const azureConfig: AzureProviderConfig = {
          name: 'azure-openai',
          endpoint: process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, ''),
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini',
          apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
        };

        const systemPrompt = getSystemPrompt(language, patientContext, clinicalAnalysis, activeCategory, backendDiagnosis);
        const fullMessages: ChatMessage[] = [
          { role: 'system', content: systemPrompt },
          ...validUserMessages.map((m: any) => ({
            role: m.role === 'bot' ? 'assistant' : m.role === 'model' ? 'assistant' : m.role,
            content: m.content.trim(),
          })),
        ];

        const stream = await callAzureOpenAIStream(azureConfig, fullMessages);
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-AI-Provider': 'Azure-OpenAI',
          },
        });
      } catch (err: any) {
        console.warn('[Oxpecker AI] Azure OpenAI streaming error, falling back to Clinical Engine:', err.message);
      }
    }

    // 4. Fallback to Native Oxpecker Clinical Engine (150 Diseases + 9,600 Dataset Grounded)
    let finalReport = clinicalAnalysis.formattedMarkdownReport;

    // If backend returned extra specific diagnostic details, merge them
    if (backendDiagnosis && backendDiagnosis.condition && !finalReport.includes(backendDiagnosis.condition)) {
      finalReport = `### 🩺 ক্লিনিক্যাল ডায়াগনসিস (Azure Oxpecker Clinical Engine - 150 Diseases)
- **সম্ভাব্য রোগ:** **${backendDiagnosis.condition}**
- **ঝুঁকির মাত্রা (Triage):** **${backendDiagnosis.triage_urgency}**
- **গাইডলাইন রেফারেন্স:** ${backendDiagnosis.clinical_protocol}

${backendDiagnosis.advice ? `> **ক্লিনিক্যাল পরামর্শ:** ${backendDiagnosis.advice}\n\n` : ''}` + finalReport;
    }

    const stream = callClinicalEngineStream(finalReport);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-AI-Provider': 'Oxpecker-Clinical-Engine-DGHS-150',
      },
    });

  } catch (error: any) {
    console.error('[Oxpecker AI] Chat Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
