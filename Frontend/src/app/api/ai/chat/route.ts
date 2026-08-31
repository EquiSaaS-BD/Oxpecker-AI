import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Types
// ============================================

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ProviderConfig {
  name: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  priority: number;
  isEnabled: boolean;
}

// ============================================
// Oxpecker AI System Prompt
// ============================================

function getSystemPrompt(language: string = 'en', patientContext?: any): string {
  const langInstruction = language === 'bn' 
    ? 'Respond in Bangla (বাংলা) language.' 
    : language === 'hi' 
      ? 'Respond in Hindi language.'
      : language === 'ar'
        ? 'Respond in Arabic language.'
        : 'Respond in English.';

  let contextSnippet = '';
  if (patientContext && typeof patientContext === 'object') {
    const details = [];
    if (patientContext.name) details.push(`Name: ${patientContext.name}`);
    if (patientContext.age || patientContext.date_of_birth || patientContext.dob) details.push(`DOB/Age: ${patientContext.age || patientContext.date_of_birth || patientContext.dob}`);
    if (patientContext.gender) details.push(`Gender: ${patientContext.gender}`);
    if (patientContext.blood_group || patientContext.bloodGroup) details.push(`Blood Group: ${patientContext.blood_group || patientContext.bloodGroup}`);
    if (patientContext.phone) details.push(`Mobile: ${patientContext.phone}`);
    if (patientContext.allergies) details.push(`Allergies: ${patientContext.allergies}`);
    if (patientContext.medical_history) details.push(`Medical History: ${patientContext.medical_history}`);

    if (details.length > 0) {
      contextSnippet = `\n## PATIENT HEALTH MEMORY & CONTEXT\n${details.join(' | ')}\nTailor all advice, dosages, and dietary warnings specifically to this patient's profile, age, and medical context.\n`;
    }
  }

  return `You are **Oxpecker AI**, an enterprise-grade AI-powered Medical Assistant designed by Oxpecker AI.

${langInstruction}
${contextSnippet}

## CORE CONVERSATIONAL RULES & STYLE
1. **Greetings & Friendly Conversation**:
   - When the user sends greetings (e.g. "Hi", "Hello", "আসসালামু আলাইকুম", "কেমন আছেন?"), respond warmly in simple human tone and naturally ask how you can help with their health today (e.g., "ওয়ালাইকুম আসসালাম! আমি Oxpecker AI। আজ আপনাকে স্বাস্থ্যবিষয়ক কীভাবে সাহায্য করতে পারি? আপনার কি কোনো শারীরিক সমস্যা বা ওষুধ/হাসপাতাল বিষয়ে প্রশ্ন আছে?").

2. **Strict Health Domain Boundary**:
   - You ONLY answer healthcare, medical, disease, symptom, prescription, lab report, doctor, hospital, and nutrition queries.
   - For non-health / irrational questions (e.g. coding, math, politics, sports, entertainment), politely respond:
     "আমি Oxpecker AI - একটি স্পেশালাইজড মেডিকেল অ্যাসিস্ট্যান্ট। আমি শুধুমাত্র স্বাস্থ্য, শারীরিক লক্ষণ, ওষুধ ও চিকিৎসা সংক্রান্ত বিষয়ে সাহায্য করতে পারি। আপনার কোনো স্বাস্থ্যবিষয়ক প্রশ্ন থাকলে জানাতে পারেন।"

3. **Short, Compact & Beautiful Formatting (ChatGPT Style)**:
   - Keep answers short, compact, well-structured, crisp, and clean. Avoid walls of long text.
   - Use headings (\`###\`), bullet points, and **bold** keywords.
   - Whenever presenting comparisons, dosages, side effects, or test parameters, ALWAYS output **Markdown Tables** (\`| Header 1 | Header 2 |\`) for clean table rendering!

4. **Human Native Tone (No AI Slop / Emojis / Sparkles)**:
   - Write in natural, simple, human tone.
   - NEVER use sparkles (), NEVER use em-dashes (,), and NEVER use unnecessary decorative emojis.
   - Do NOT sound like a generic AI bot ("As an AI model...").

## CLINICAL FOLLOW-UP TRIAGING
- If the patient describes vague or incomplete symptoms, ask 2 brief, targeted clinical follow-up questions (e.g. onset, severity 1-10, triggers) to increase triaging accuracy.
- Output risk severity labels (Low Risk, Moderate Risk, High Risk).

## EMERGENCY DETECTION
If you detect any of these in user messages: heart attack, stroke, chest pain, difficulty breathing, heavy bleeding, seizure, loss of consciousness, severe allergic reaction, poisoning, high fever in infants - immediately output an emergency alert in this format:

\`\`\`json:emergency_alert
{"type": "emergency", "condition": "suspected condition", "severity": "critical", "message": "brief urgent instruction", "callNumber": "999"}
\`\`\`

Then provide first-aid guidance and strongly advise calling emergency services immediately.

## DOCTOR RECOMMENDATION
When users describe symptoms that need a specialist, recommend doctor(s) with this format:

\`\`\`json:doctor_recommendation
{"speciality": "Cardiology", "reason": "Brief reason for recommendation", "urgency": "normal|urgent|emergency"}
\`\`\``;
}

// ============================================
// Provider Configurations (from env)
// ============================================

function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  // Priority 1: Google Gemini API
  if (process.env.GOOGLE_API_KEY) {
    providers.push({
      name: 'google',
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GOOGLE_MODEL || 'gemini-3.6-flash',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      priority: 1,
      isEnabled: true,
    });
  }

  // Priority 2: Groq AI API
  if (process.env.GROQ_API_KEY) {
    providers.push({
      name: 'groq',
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'qwen/qwen3.6-27b',
      baseUrl: 'https://api.groq.com/openai/v1',
      priority: 2,
      isEnabled: true,
    });
  }

  // Priority 3: OpenAI API
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      baseUrl: 'https://api.openai.com/v1',
      priority: 3,
      isEnabled: true,
    });
  }

  // Priority 4: DeepSeek API
  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({
      name: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com/v1',
      priority: 4,
      isEnabled: true,
    });
  }

  // Priority 5: Zhipu GLM API
  if (process.env.ZHIPU_API_KEY) {
    providers.push({
      name: 'zhipu',
      apiKey: process.env.ZHIPU_API_KEY,
      model: process.env.ZHIPU_MODEL || 'glm-4',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      priority: 5,
      isEnabled: true,
    });
  }

  // Priority 6: Anthropic API
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      name: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      baseUrl: 'https://api.anthropic.com/v1',
      priority: 6,
      isEnabled: true,
    });
  }

  // If no providers configured, use Mock Mode so the UI doesn't crash for users without API keys
  if (providers.length === 0) {
    providers.push({
      name: 'mock_ai',
      apiKey: 'demo',
      model: 'mock-model',
      baseUrl: 'demo',
      priority: 99,
      isEnabled: true,
    });
  }

  return providers.sort((a, b) => a.priority - b.priority);
}

// ============================================
// Provider API Calls (Streaming)
// ============================================

async function callOpenAIStream(provider: ProviderConfig, messages: ChatMessage[]): Promise<ReadableStream> {
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    signal: AbortSignal.timeout(12000),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Error ${response.status}: ${error}`);
  }

  return transformOpenAIStream(response.body!);
}

async function callZhipuStream(provider: ProviderConfig, messages: ChatMessage[]): Promise<ReadableStream> {
  // Zhipu AI (GLM) is OpenAI compatible
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    signal: AbortSignal.timeout(12000),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zhipu GLM Error ${response.status}: ${error}`);
  }

  return transformOpenAIStream(response.body!);
}

async function callDeepSeekStream(provider: ProviderConfig, messages: ChatMessage[]): Promise<ReadableStream> {
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    signal: AbortSignal.timeout(12000),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek Error ${response.status}: ${error}`);
  }

  // DeepSeek uses OpenAI-compatible format
  return transformOpenAIStream(response.body!);
}

async function callGoogleStream(provider: ProviderConfig, messages: ChatMessage[]): Promise<ReadableStream> {
  // Convert OpenAI format to Gemini format
  const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const response = await fetch(
    `${provider.baseUrl}/models/${provider.model}:streamGenerateContent?alt=sse&key=${provider.apiKey}`,
    {
      method: 'POST',
      signal: AbortSignal.timeout(12000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Error ${response.status}: ${error}`);
  }

  return transformGoogleStream(response.body!);
}

async function callAnthropicStream(provider: ProviderConfig, messages: ChatMessage[]): Promise<ReadableStream> {
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const nonSystemMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role, content: m.content }));

  const response = await fetch(`${provider.baseUrl}/messages`, {
    method: 'POST',
    signal: AbortSignal.timeout(12000),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: 4096,
      system: systemMessage,
      messages: nonSystemMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic Error ${response.status}: ${error}`);
  }

  return transformAnthropicStream(response.body!);
}

// ============================================
// Stream Transformers (normalize to SSE text/event-stream)
// ============================================

function transformOpenAIStream(body: ReadableStream): ReadableStream {
  const reader = body.getReader();
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
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

function transformGoogleStream(body: ReadableStream): ReadableStream {
  const reader = body.getReader();
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
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
              if (content) {
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
              }
            } catch {
              // Skip
            }
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

function transformAnthropicStream(body: ReadableStream): ReadableStream {
  const reader = body.getReader();
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
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              if (json.type === 'content_block_delta') {
                const content = json.delta?.text;
                if (content) {
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              }
              if (json.type === 'message_stop') {
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              }
            } catch {
              // Skip
            }
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

async function callMockStream(messages: ChatMessage[], language: string = 'en'): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
  const isBangla = language === 'bn' || /[\u0980-\u09FF]/.test(lastUserMsg);

  let mockText = "Hello! I am Oxpecker AI. How can I assist with your health today? If you are experiencing any physical discomfort or need guidance on medicines, doctors, or hospitals, please let me know.";

  if (isBangla) {
    if (lastUserMsg.includes("hello") || lastUserMsg.includes("hi") || lastUserMsg.includes("হ্যালো") || lastUserMsg.includes("হাই") || lastUserMsg.includes("আসসালামু") || lastUserMsg.includes("কেমন")) {
      mockText = "ওয়ালাইকুম আসসালাম! আমি Oxpecker AI মেডিকেল অ্যাসিস্ট্যান্ট। আজ আপনাকে স্বাস্থ্যবিষয়ক কীভাবে সাহায্য করতে পারি? আপনার কি কোনো শারীরিক সমস্যা বা ওষুধ/হাসপাতাল বিষয়ে কিছু জানার আছে?";
    } else {
      mockText = "আপনার স্বাস্থ্যবিষয়ক প্রশ্নটি পেয়েছি। সঠিক পরামর্শের জন্য অনুগ্রহ করে লক্ষণের বিবরণ (কতদিন ধরে সমস্যা, তীব্রতা কতটুকু) জানান। প্রয়োজনে নিকটস্থ অভিজ্ঞ চিকিৎসকের পরামর্শ নিন। জরুরি অবস্থায় অবিলম্বে ৯৯৯ নম্বরে যোগাযোগ করুন।";
    }
  }

  return new ReadableStream({
    async start(controller) {
      const words = mockText.split(" ");
      for (const word of words) {
        const chunk = `data: ${JSON.stringify({ content: word + " " })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

// ============================================
// AI Gateway with Failover
// ============================================

async function callProviderStream(provider: ProviderConfig, messages: ChatMessage[], language: string = 'en'): Promise<ReadableStream> {
  switch (provider.name) {
    case 'groq':
    case 'openai':
      return callOpenAIStream(provider, messages);
    case 'google':
      return callGoogleStream(provider, messages);
    case 'deepseek':
      return callDeepSeekStream(provider, messages);
    case 'anthropic':
      return callAnthropicStream(provider, messages);
    case 'zhipu':
      return callZhipuStream(provider, messages);
    case 'mock_ai':
      return callMockStream(messages, language);
    default:
      throw new Error(`Unknown provider: ${provider.name}`);
  }
}

async function getStreamWithFailover(messages: ChatMessage[], language: string = 'en'): Promise<{ stream: ReadableStream; provider: string }> {
  const providers = getProviders();

  if (providers.length === 0) {
    throw new Error('No AI providers configured. Please add at least one API key to .env.local');
  }

  const errors: string[] = [];

  for (const provider of providers) {
    if (!provider.isEnabled) continue;
    
    try {
      console.log(`[Oxpecker AI] Trying provider: ${provider.name} (${provider.model})`);
      const stream = await callProviderStream(provider, messages, language);
      console.log(`[Oxpecker AI] Success with provider: ${provider.name}`);
      return { stream, provider: provider.name };
    } catch (error: any) {
      console.error(`[Oxpecker AI] Provider ${provider.name} failed:`, error.message);
      errors.push(`${provider.name}: ${error.message}`);
      // Continue to next provider (failover)
    }
  }

  // If all providers fail, return a mock fallback stream instead of crashing
  console.error(`[Oxpecker AI] All providers failed. Falling back to mock response.\n${errors.join('\n')}`);
  
  const isBangla = language === 'bn' || messages.some(m => /[\u0980-\u09FF]/.test(m.content));
  const mockText = isBangla
    ? "ধন্যবাদ। আমি Oxpecker AI মেডিকেল অ্যাসিস্ট্যান্ট। আপনার স্বাস্থ্যবিষয়ক লক্ষণ বা প্রশ্নটি বিস্তারিত লিখে জানান (যেমন কতদিন ধরে সমস্যা, তীব্রতা কেমন), যাতে সঠিকভাবে সহায়তা করতে পারি। জরুরি প্রয়োজনে অবিলম্বে ৯৯৯ নম্বরে কল করুন।"
    : "Hello! I am Oxpecker AI, your AI Medical Assistant. Please describe your health concerns or questions in detail so I can assist you appropriately. In case of an emergency, please call 999 immediately.";
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = mockText.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = `data: ${JSON.stringify({ content: words[i] + ' ' })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        await new Promise(r => setTimeout(r, 30));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });
  
  return { stream, provider: 'mock_fallback' };
}

// ============================================
// Language Detection
// ============================================

function detectLanguage(text: string): string {
  // Simple heuristic: check for Bengali, Hindi, Arabic characters
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  return 'en';
}

// ============================================
// POST /api/ai/chat
// ============================================

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages: userMessages, mode, language: requestedLanguage, patientContext } = body;

    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Filter out empty or whitespace-only messages to prevent Gemini/OpenAI 400 errors
    const validUserMessages = userMessages.filter(
      (m: any) => m && typeof m.content === 'string' && m.content.trim().length > 0
    );

    if (validUserMessages.length === 0) {
      return NextResponse.json(
        { error: 'Valid messages array with non-empty text content is required' },
        { status: 400 }
      );
    }

    // Auto-detect language from the latest user message
    const lastUserMessage = validUserMessages.filter((m: ChatMessage) => m.role === 'user').pop();
    const detectedLanguage = lastUserMessage 
      ? detectLanguage(lastUserMessage.content) 
      : 'en';
    const language = requestedLanguage || detectedLanguage;

    // Build the full message array with system prompt & patient health memory context
    const systemPrompt = getSystemPrompt(language, patientContext);
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...validUserMessages.map((m: any) => ({
        role: m.role === 'bot' ? 'assistant' : m.role === 'model' ? 'assistant' : m.role,
        content: m.content.trim(),
      })),
    ];

    // Get streaming response with automatic failover
    const { stream, provider } = await getStreamWithFailover(fullMessages, language);

    // Return the stream as SSE
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-AI-Provider': provider,
      },
    });

  } catch (error: any) {
    console.error('[Oxpecker AI] Chat Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
