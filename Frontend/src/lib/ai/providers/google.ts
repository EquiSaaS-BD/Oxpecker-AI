/**
 * @module providers/google
 * @description Google Gemini API provider for Oxpecker AI.
 * Uses raw `fetch()` against the Gemini REST API — no external SDK dependency.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single chat message in the common format used across providers. */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Configuration for the Google Gemini provider. */
export interface GoogleProviderConfig {
  /** Google AI / Gemini API key. */
  apiKey: string;
  /** Model identifier. @default "gemini-2.0-flash" */
  model?: string;
  /** Base URL for the Generative Language API. @default "https://generativelanguage.googleapis.com" */
  baseUrl?: string;
  /** Request timeout in milliseconds. @default 30_000 */
  timeout?: number;
  /** Maximum output tokens. */
  maxOutputTokens?: number;
  /** Sampling temperature (0-2). @default 0.7 */
  temperature?: number;
}

/** Shape of a successful chat response. */
export interface ChatCompletionResponse {
  content: string;
  finishReason: string | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
  model: string;
  provider: string;
}

/** Result of a health-check ping. */
export interface HealthCheckResult {
  ok: boolean;
  latency: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Gemini content part. */
interface GeminiPart {
  text: string;
}

/** Gemini content block. */
interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

/**
 * Convert the common `ChatMessage[]` format to Gemini's `contents` array,
 * extracting any system message into a separate `systemInstruction`.
 */
function convertToGeminiFormat(messages: ChatMessage[]): {
  contents: GeminiContent[];
  systemInstruction?: { parts: GeminiPart[] };
} {
  let systemInstruction: { parts: GeminiPart[] } | undefined;
  const contents: GeminiContent[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      // Gemini supports a single system instruction; concat if multiple.
      if (systemInstruction) {
        systemInstruction.parts.push({ text: msg.content });
      } else {
        systemInstruction = { parts: [{ text: msg.content }] };
      }
      continue;
    }

    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  return { contents, systemInstruction };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Lightweight Google Gemini provider built on `fetch()`.
 *
 * @example
 * ```ts
 * const gemini = new GoogleProvider({ apiKey: process.env.GOOGLE_AI_KEY! });
 * const reply = await gemini.chat([{ role: 'user', content: 'Hello' }]);
 * console.log(reply.content);
 * ```
 */
export class GoogleProvider {
  readonly name = 'google';

  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxOutputTokens?: number;
  private readonly temperature: number;

  constructor(config: GoogleProviderConfig) {
    if (!config.apiKey) {
      throw new Error('[GoogleProvider] apiKey is required.');
    }

    this.apiKey = config.apiKey;
    this.model = config.model ?? 'gemini-2.0-flash';
    this.baseUrl = (config.baseUrl ?? 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
    this.timeout = config.timeout ?? 30_000;
    this.maxOutputTokens = config.maxOutputTokens;
    this.temperature = config.temperature ?? 0.7;
  }

  // -----------------------------------------------------------------------
  // Public methods
  // -----------------------------------------------------------------------

  /**
   * Send a non-streaming request to Gemini's `generateContent` endpoint.
   *
   * @param messages - Array of chat messages (system/user/assistant).
   * @returns The assistant's response along with usage metadata.
   * @throws {Error} On network failure, timeout, or API error.
   */
  async chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    const { contents, systemInstruction } = convertToGeminiFormat(messages);
    const body = this.buildRequestBody(contents, systemInstruction);

    const url = `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await this.fetchWithTimeout(url, body);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `[GoogleProvider] API error ${response.status}: ${errorBody}`,
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const content =
      candidate?.content?.parts?.map((p: GeminiPart) => p.text).join('') ?? '';

    return {
      content,
      finishReason: candidate?.finishReason ?? null,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount ?? 0,
            completionTokens: data.usageMetadata.candidatesTokenCount ?? 0,
            totalTokens: data.usageMetadata.totalTokenCount ?? 0,
          }
        : null,
      model: this.model,
      provider: this.name,
    };
  }

  /**
   * Send a streaming request to Gemini's `streamGenerateContent` endpoint.
   *
   * @param messages - Array of chat messages.
   * @returns A `ReadableStream<string>` that yields content deltas.
   * @throws {Error} On network failure, timeout, or API error.
   */
  async chatStream(messages: ChatMessage[]): Promise<ReadableStream<string>> {
    const { contents, systemInstruction } = convertToGeminiFormat(messages);
    const body = this.buildRequestBody(contents, systemInstruction);

    const url = `${this.baseUrl}/v1beta/models/${this.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;
    const response = await this.fetchWithTimeout(url, body);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `[GoogleProvider] Streaming API error ${response.status}: ${errorBody}`,
      );
    }

    if (!response.body) {
      throw new Error('[GoogleProvider] Response body is null — streaming not supported by the runtime.');
    }

    return this.parseSSEStream(response.body);
  }

  /**
   * Ping the Gemini API to verify connectivity and measure latency.
   *
   * @returns Health-check result with ok status and latency in ms.
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();

    try {
      const url = `${this.baseUrl}/v1beta/models/${this.model}?key=${this.apiKey}`;
      const response = await this.fetchWithTimeout(url, null, 'GET');
      const latency = Date.now() - start;

      return { ok: response.ok, latency };
    } catch (error) {
      return {
        ok: false,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  /** Build the JSON request body for Gemini. */
  private buildRequestBody(
    contents: GeminiContent[],
    systemInstruction?: { parts: GeminiPart[] },
  ): Record<string, unknown> {
    const body: Record<string, unknown> = { contents };

    if (systemInstruction) {
      body.systemInstruction = systemInstruction;
    }

    const generationConfig: Record<string, unknown> = {
      temperature: this.temperature,
    };
    if (this.maxOutputTokens !== undefined) {
      generationConfig.maxOutputTokens = this.maxOutputTokens;
    }
    body.generationConfig = generationConfig;

    return body;
  }

  /** Execute a fetch with an `AbortController` timeout. */
  private async fetchWithTimeout(
    url: string,
    body: Record<string, unknown> | null,
    method: 'GET' | 'POST' = 'POST',
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const init: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      };

      if (body && method === 'POST') {
        init.body = JSON.stringify(body);
      }

      return await fetch(url, init);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`[GoogleProvider] Request timed out after ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Parse a Gemini SSE byte-stream into a `ReadableStream<string>`
   * that emits content deltas.
   */
  private parseSSEStream(body: ReadableStream<Uint8Array>): ReadableStream<string> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    return new ReadableStream<string>({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(payload);
              const parts = parsed.candidates?.[0]?.content?.parts;
              if (parts) {
                for (const part of parts) {
                  if (part.text) {
                    controller.enqueue(part.text);
                  }
                }
              }
            } catch {
              // Skip malformed JSON lines.
            }
          }
        }
      },
      cancel() {
        reader.cancel();
      },
    });
  }
}
