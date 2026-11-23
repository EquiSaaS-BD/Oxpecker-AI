/**
 * @module providers/azure
 * @description Azure OpenAI Chat Completions provider for Oxpecker AI.
 * Uses native fetch() against Azure OpenAI endpoints with stream support.
 */

import type { ChatMessage, ChatCompletionResponse, HealthCheckResult, AIProvider } from '../gateway';

export interface AzureProviderConfig {
  apiKey: string;
  endpoint: string;
  deployment?: string;
  apiVersion?: string;
  timeout?: number;
  temperature?: number;
  maxTokens?: number;
}

export class AzureOpenAIProvider implements AIProvider {
  readonly name = 'azure';
  private config: Required<AzureProviderConfig>;

  constructor(config: AzureProviderConfig) {
    this.config = {
      apiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
      endpoint: (config.endpoint || process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/+$/, ''),
      deployment: config.deployment || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini',
      apiVersion: config.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
      timeout: config.timeout ?? 30_000,
      temperature: config.temperature ?? 0.3,
      maxTokens: config.maxTokens ?? 4096,
    };
  }

  private getCompletionsUrl(): string {
    return `${this.config.endpoint}/openai/deployments/${this.config.deployment}/chat/completions?api-version=${this.config.apiVersion}`;
  }

  /**
   * GPT-5 / o-series reasoning models reject `max_tokens` and custom
   * `temperature`; they require `max_completion_tokens` instead.
   */
  private isReasoningModel(): boolean {
    return /(^|[^a-z0-9])(gpt-5|o1|o3|o4)([^a-z0-9]|$)/i.test(this.config.deployment || '');
  }

  /**
   * Build the chat-completions body. `reasoning` forces the GPT-5 style
   * (max_completion_tokens, no temperature).
   */
  private buildChatBody(messages: ChatMessage[], reasoning: boolean, stream = false): Record<string, unknown> {
    const body: Record<string, unknown> = stream
      ? { messages, stream: true }
      : { messages };
    if (reasoning) {
      // Reasoning models need a larger token budget since reasoning tokens
      // count against max_completion_tokens before any visible text.
      body.max_completion_tokens = Math.max(this.config.maxTokens, 2000);
    } else {
      body.temperature = this.config.temperature;
      body.max_tokens = this.config.maxTokens;
    }
    if (stream) body.stream = true;
    return body;
  }

  async chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeout);

    const parseResponse = (json: any): ChatCompletionResponse => {
      const choice = json.choices?.[0];
      return {
        content: choice?.message?.content ?? '',
        finishReason: choice?.finish_reason ?? null,
        usage: json.usage
          ? {
              promptTokens: json.usage.prompt_tokens,
              completionTokens: json.usage.completion_tokens,
              totalTokens: json.usage.total_tokens,
            }
          : null,
        model: json.model ?? this.config.deployment,
        provider: this.name,
      };
    };

    try {
      let body = this.buildChatBody(messages, this.isReasoningModel());
      let res = await fetch(this.getCompletionsUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      // Compatibility retry: classic Chat Completions body sent to a
      // reasoning model (or vice versa). Detect the API's parameter complaint
      // and retry once with the alternate body style.
      if (!res.ok && res.status === 400) {
        const errorText = await res.text().catch(() => '');
        if (/max_completion_tokens|unsupported parameter/i.test(errorText)) {
          body = this.buildChatBody(messages, !this.isReasoningModel());
          res = await fetch(this.getCompletionsUrl(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': this.config.apiKey,
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
        }
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`[Azure OpenAI] HTTP ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      return parseResponse(json);
    } finally {
      clearTimeout(timer);
    }
  }

  async chatStream(messages: ChatMessage[]): Promise<ReadableStream<string>> {
    const res = await fetch(this.getCompletionsUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey,
      },
      body: JSON.stringify(this.buildChatBody(messages, this.isReasoningModel(), true)),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`[Azure OpenAI] HTTP ${res.status}: ${errorText}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    return new ReadableStream<string>({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const text = parsed.choices?.[0]?.delta?.content;
                if (text) controller.enqueue(text);
              } catch {}
            }
          }
        } catch (err) {
          controller.error(err);
        }
      },
    });
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      if (!this.config.apiKey || !this.config.endpoint) {
        return { ok: false, latency: -1, error: 'Azure OpenAI credentials not configured' };
      }
      await this.chat([{ role: 'user', content: 'ping' }]);
      return { ok: true, latency: Date.now() - start };
    } catch (err: any) {
      return { ok: false, latency: Date.now() - start, error: err.message };
    }
  }
}
