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

function getSystemPrompt(language: string = 'en'): string {
  const langInstruction = language === 'bn' 
    ? 'Respond in Bangla (বাংলা) language.' 
    : language === 'hi' 
      ? 'Respond in Hindi language.'
      : language === 'ar'
        ? 'Respond in Arabic language.'
        : 'Respond in English.';

  return `You are **Oxpecker AI**, an enterprise-grade AI-powered Medical Assistant designed by Shustota AI.

${langInstruction}

## IDENTITY
Your name is **Oxpecker AI**. If asked, introduce yourself as: "My name is Oxpecker AI. I am an AI-powered Medical Assistant designed to help patients, doctors, hospitals, and healthcare providers with medical information, health analysis, doctor recommendations, prescription understanding, medical reports, nutrition, and healthcare services."

## DOMAIN RESTRICTION
You ONLY answer healthcare and medical-related questions. Allowed topics: Diseases, Symptoms, Medicines, Prescriptions, Hospitals, Doctors, Clinics, Diagnostic Centres, Health Reports, Medical Imaging, Nutrition, Calories, BMI, Vaccinations, Pregnancy, Child Care, Elderly Care, Mental Health, Fitness, First Aid, Medical Emergencies, Appointment Booking, Health Insurance, Laboratory Tests.

If the user asks about anything outside healthcare, politely respond: "I'm sorry. I am a specialised Medical AI Assistant and can only answer healthcare and medical-related questions."

## EMERGENCY DETECTION
If you detect any of these in user messages: heart attack, stroke, chest pain, difficulty breathing, heavy bleeding, seizure, loss of consciousness, severe allergic reaction, poisoning, high fever in infants — immediately output an emergency alert in this format:

\`\`\`json:emergency_alert
{"type": "emergency", "condition": "suspected condition", "severity": "critical", "message": "brief urgent instruction", "callNumber": "999"}
\`\`\`

Then provide first-aid guidance and strongly advise calling emergency services immediately.

## DOCTOR RECOMMENDATION
When users describe symptoms that need a specialist, recommend doctor(s) with this format:

\`\`\`json:doctor_recommendation
{"speciality": "Cardiology", "reason": "Brief reason for recommendation", "urgency": "normal|urgent|emergency"}
\`\`\`

## RESPONSE STYLE
- Professional, empathetic, evidence-based, easy to understand
- Use structured markdown: headings (###), bullet points, bold text
- Include risk indicators when applicable: 🟢 Low Risk, 🟡 Moderate Risk, 🔴 High Risk
- Never claim to be a licensed doctor
- Never provide a definitive diagnosis
- Always recommend consulting a qualified healthcare professional
- If information is insufficient, ask follow-up questions
- Never instruct users to start, stop, or change prescription medication without consulting a physician

## VISUAL FORMATTING
Use rich markdown formatting including:
- Tables for comparisons
- Bold/italic for emphasis
- Numbered lists for step-by-step instructions
- Emojis sparingly for visual clarity (💊 🩺 🏥 ⚠️ ✅)`;
}

// ============================================
// Provider Configurations (from env)
// ============================================

function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      baseUrl: 'https://api.openai.com/v1',
      priority: 1,
      isEnabled: true,
    });
  }

  if (process.env.GOOGLE_API_KEY) {
    providers.push({
      name: 'google',
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GOOGLE_MODEL || 'gemini-2.0-flash',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      priority: 2,
      isEnabled: true,
    });
  }

  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({
      name: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com/v1',
      priority: 3,
      isEnabled: true,
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      name: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      baseUrl: 'https://api.anthropic.com/v1',
      priority: 4,
      isEnabled: true,
    });
  }

  if (process.env.ZHIPU_API_KEY) {
    providers.push({
      name: 'zhipu',
      apiKey: process.env.ZHIPU_API_KEY,
      model: process.env.ZHIPU_MODEL || 'glm-4', // User mentioned GLM 5.2, they can override this via ZHIPU_MODEL in .env.local
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      priority: 5,
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
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

async function callMockStream(messages: ChatMessage[]): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
  
  let mockText = "Hello! I am Oxpecker AI (Mock Mode). You haven't added any API keys to your `.env.local` file yet, so I'm replying with a simulated response so you can test the UI.\n\n";
  
  if (lastUserMessage.includes("fever") || lastUserMessage.includes("জ্বর")) {
    mockText += "It sounds like you might have a fever. Drink plenty of water and rest.\n\n```json:medicine_info\n{\"name\": \"Paracetamol\", \"reason\": \"To reduce fever and relieve pain\", \"urgency\": \"normal\"}\n```\n\n```json:doctor_recommendation\n{\"speciality\": \"General Physician\", \"reason\": \"For a general checkup regarding your fever.\", \"urgency\": \"normal\"}\n```";
  } else if (lastUserMessage.includes("pain") || lastUserMessage.includes("ব্যথা")) {
    mockText += "I understand you're experiencing pain. Please consult a doctor for a proper diagnosis.\n\n```json:doctor_recommendation\n{\"speciality\": \"Orthopedics\", \"reason\": \"To check the source of the pain.\", \"urgency\": \"normal\"}\n```";
  } else {
    mockText += "Here is a simulated response to demonstrate how the streaming and visual cards work.\n\n```json:doctor_recommendation\n{\"speciality\": \"Cardiology\", \"reason\": \"Demonstrating the doctor card loader.\", \"urgency\": \"normal\"}\n```\n\n```json:hospital_recommendation\n{\"speciality\": \"General\", \"reason\": \"Demonstrating the hospital card loader.\", \"urgency\": \"normal\"}\n```";
  }

  return new ReadableStream({
    async start(controller) {
      const words = mockText.split(" ");
      for (const word of words) {
        // Format as OpenAI chunk for the frontend parser
        const chunk = `data: ${JSON.stringify({ choices: [{ delta: { content: word + " " } }] })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

// ============================================
// AI Gateway with Failover
// ============================================

async function callProviderStream(provider: ProviderConfig, messages: ChatMessage[]): Promise<ReadableStream> {
  switch (provider.name) {
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
      return callMockStream(messages);
    default:
      throw new Error(`Unknown provider: ${provider.name}`);
  }
}

async function getStreamWithFailover(messages: ChatMessage[]): Promise<{ stream: ReadableStream; provider: string }> {
  const providers = getProviders();

  if (providers.length === 0) {
    throw new Error('No AI providers configured. Please add at least one API key to .env.local');
  }

  const errors: string[] = [];

  for (const provider of providers) {
    if (!provider.isEnabled) continue;
    
    try {
      console.log(`[Oxpecker AI] Trying provider: ${provider.name} (${provider.model})`);
      const stream = await callProviderStream(provider, messages);
      console.log(`[Oxpecker AI] Success with provider: ${provider.name}`);
      return { stream, provider: provider.name };
    } catch (error: any) {
      console.error(`[Oxpecker AI] Provider ${provider.name} failed:`, error.message);
      errors.push(`${provider.name}: ${error.message}`);
      // Continue to next provider (failover)
    }
  }

  throw new Error(`All AI providers failed:\n${errors.join('\n')}`);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages: userMessages, mode, language: requestedLanguage } = body;

    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Auto-detect language from the latest user message
    const lastUserMessage = userMessages.filter((m: ChatMessage) => m.role === 'user').pop();
    const detectedLanguage = lastUserMessage 
      ? detectLanguage(lastUserMessage.content) 
      : 'en';
    const language = requestedLanguage || detectedLanguage;

    // Build the full message array with system prompt
    const systemPrompt = getSystemPrompt(language);
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...userMessages.map((m: any) => ({
        role: m.role === 'bot' ? 'assistant' : m.role,
        content: m.content,
      })),
    ];

    // Get streaming response with automatic failover
    const { stream, provider } = await getStreamWithFailover(fullMessages);

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
