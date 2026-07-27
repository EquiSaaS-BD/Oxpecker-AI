/**
 * @module providers/openai
 * @description OpenAI Chat Completions provider for Oxpecker AI.
 * Uses raw `fetch()` — no external SDK dependency.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single chat message in the OpenAI format. */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Configuration for the OpenAI provider. */
export interface OpenAIProviderConfig {
  /** OpenAI API key. */
  apiKey: string;
  /** Model identifier. @default "gpt-4o-mini" */
  model?: string;
  /** Base URL for the API. @default "https://api.openai.com" */
  baseUrl?: string;
  /** Request timeout in milliseconds. @default 30_000 */
  timeout?: number;
  /** Maximum tokens for the response. */
  maxTokens?: number;
  /** Sampling temperature (0-2). @default 0.7 */
  temperature?: number;
}

/** Shape of a successful chat completion response. */
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
// Provider
// ---------------------------------------------------------------------------

/**
 * Lightweight OpenAI Chat Completions provider built on `fetch()`.
 *
 * @example
 * ```ts
 * const openai = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! });
 * const reply = await openai.chat([{ role: 'user', content: 'Hello' }]);
 * console.log(reply.content);
 * ```
 */
export class OpenAIProvider {
  readonly name = 'openai';

  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxTokens?: number;
  private readonly temperature: number;

  constructor(config: OpenAIProviderConfig) {
    if (!config.apiKey) {
      throw new Error('[OpenAIProvider] apiKey is required.');
    }

    this.apiKey = config.apiKey;
    this.model = config.model ?? 'gpt-4o-mini';
    this.baseUrl = (config.baseUrl ?? 'https://api.openai.com').replace(/\/+$/, '');
    this.timeout = config.timeout ?? 30_000;
    this.maxTokens = config.maxTokens;
    this.temperature = config.temperature ?? 0.7;
  }

  // -----------------------------------------------------------------------
  // Public methods
  // -----------------------------------------------------------------------

  /**
   * Send a non-streaming chat completion request.
   *
   * @param messages - Array of chat messages.
   * @returns The assistant's response along with usage metadata.
   * @throws {Error} On network failure, timeout, or API error.
   */
  async chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    const body = this.buildRequestBody(messages, false);
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/v1/chat/completions`,
      body,
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `[OpenAIProvider] API error ${response.status}: ${errorBody}`,
      );
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content ?? '',
      finishReason: choice?.finish_reason ?? null,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : null,
      model: data.model ?? this.model,
      provider: this.name,
    };
  }

  /**
   * Send a streaming chat completion request.
   *
   * @param messages - Array of chat messages.
   * @returns A `ReadableStream<string>` that yields content deltas as they arrive.
   * @throws {Error} On network failure, timeout, or API error.
   */
  async chatStream(messages: ChatMessage[]): Promise<ReadableStream<string>> {
    const body = this.buildRequestBody(messages, true);
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/v1/chat/completions`,
      body,
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `[OpenAIProvider] Streaming API error ${response.status}: ${errorBody}`,
      );
    }

    if (!response.body) {
      throw new Error('[OpenAIProvider] Response body is null — streaming not supported by the runtime.');
    }

    return this.parseSSEStream(response.body);
  }

  /**
   * Ping the OpenAI API to verify connectivity and measure latency.
   *
   * @returns Health-check result with ok status and latency in ms.
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/v1/models`,
        null,
        'GET',
      );
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

  /** Build the JSON request body for Chat Completions. */
  private buildRequestBody(
    messages: ChatMessage[],
    stream: boolean,
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: this.temperature,
      stream,
    };

    if (this.maxTokens !== undefined) {
      body.max_tokens = this.maxTokens;
    }

    if (stream) {
      body.stream_options = { include_usage: true };
    }

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: controller.signal,
      };

      if (body && method === 'POST') {
        init.body = JSON.stringify(body);
      }

      return await fetch(url, init);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`[OpenAIProvider] Request timed out after ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Parse an SSE byte-stream from OpenAI into a `ReadableStream<string>`
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
          // Keep the last (possibly incomplete) line in the buffer.
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
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(delta);
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
