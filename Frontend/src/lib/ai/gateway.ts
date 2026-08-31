/**
 * @module gateway
 * @description Multi-provider AI gateway for Oxpecker AI.
 * Routes requests to the highest-priority available provider and
 * automatically falls back on failure or rate-limiting.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single chat message shared across all providers. */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Shape of a successful chat response returned by any provider. */
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

/** Health-check result for a single provider. */
export interface HealthCheckResult {
  ok: boolean;
  latency: number;
  error?: string;
}

/**
 * Any object that conforms to the provider interface used by the gateway.
 * All three providers (OpenAI, Google, DeepSeek) satisfy this contract.
 */
export interface AIProvider {
  /** Human-readable provider identifier (e.g. "openai", "google", "deepseek"). */
  readonly name: string;
  /** Non-streaming chat completion. */
  chat(messages: ChatMessage[]): Promise<ChatCompletionResponse>;
  /** Streaming chat completion. */
  chatStream(messages: ChatMessage[]): Promise<ReadableStream<string>>;
  /** Connectivity / liveness check. */
  healthCheck(): Promise<HealthCheckResult>;
}

/** Configuration for a single provider slot within the gateway. */
export interface ProviderConfig {
  /** Unique display name for this provider slot. */
  name: string;
  /** The provider instance. */
  provider: AIProvider;
  /** Lower number = higher priority. Providers are tried in ascending order. */
  priority: number;
  /** Whether this provider slot is currently enabled. */
  isEnabled: boolean;
}

/** Options for a gateway chat / chatStream call. */
export interface GatewayChatOptions {
  /** Override the provider order - use only this specific provider. */
  preferredProvider?: string;
  /** Maximum number of providers to attempt before giving up. @default Infinity */
  maxRetries?: number;
}

/** Aggregated health status across all providers. */
export interface GatewayHealthStatus {
  providers: Array<{
    name: string;
    isEnabled: boolean;
    health: HealthCheckResult;
    usageCount: number;
  }>;
  /** At least one provider is healthy. */
  healthy: boolean;
}

/** Detailed error thrown when all providers fail. */
export class AllProvidersFailedError extends Error {
  /** Errors from each attempted provider, keyed by name. */
  readonly providerErrors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    const summary = Object.entries(errors)
      .map(([name, msg]) => `  • ${name}: ${msg}`)
      .join('\n');
    super(`[AIGateway] All providers failed:\n${summary}`);
    this.name = 'AllProvidersFailedError';
    this.providerErrors = errors;
  }
}

// ---------------------------------------------------------------------------
// Gateway
// ---------------------------------------------------------------------------

/**
 * Multi-provider AI gateway with automatic failover and usage tracking.
 *
 * @example
 * ```ts
 * const gateway = new AIGateway([
 *   { name: 'openai',   provider: openaiProvider,   priority: 1, isEnabled: true },
 *   { name: 'google',   provider: googleProvider,   priority: 2, isEnabled: true },
 *   { name: 'deepseek', provider: deepseekProvider, priority: 3, isEnabled: true },
 * ]);
 *
 * const reply = await gateway.chat([
 *   { role: 'system', content: systemPrompt },
 *   { role: 'user',   content: 'What causes migraines?' },
 * ]);
 * ```
 */
export class AIGateway {
  private readonly providers: ProviderConfig[];
  private readonly usageCounts: Map<string, number> = new Map();

  /**
   * Create a new AI gateway.
   *
   * @param configs - Array of provider configurations.
   *                  They will be sorted internally by `priority` (ascending).
   */
  constructor(configs: ProviderConfig[]) {
    if (!configs.length) {
      throw new Error('[AIGateway] At least one provider config is required.');
    }
    // Sort by priority (ascending - lower number = higher priority).
    this.providers = [...configs].sort((a, b) => a.priority - b.priority);

    for (const cfg of this.providers) {
      this.usageCounts.set(cfg.name, 0);
    }
  }

  // -----------------------------------------------------------------------
  // Public methods
  // -----------------------------------------------------------------------

  /**
   * Send a non-streaming chat request with automatic failover.
   *
   * The gateway tries providers in priority order (lowest number first).
   * If a provider throws (e.g. rate-limit, network error), the next
   * enabled provider is attempted. Throws {@link AllProvidersFailedError}
   * if every provider fails.
   *
   * @param messages - Array of chat messages.
   * @param options  - Optional gateway-level options.
   * @returns The first successful provider's response.
   */
  async chat(
    messages: ChatMessage[],
    options?: GatewayChatOptions,
  ): Promise<ChatCompletionResponse> {
    const ordered = this.resolveProviderOrder(options);
    const maxRetries = options?.maxRetries ?? ordered.length;
    const errors: Record<string, string> = {};

    for (let i = 0; i < Math.min(maxRetries, ordered.length); i++) {
      const cfg = ordered[i];
      try {
        const response = await cfg.provider.chat(messages);
        this.incrementUsage(cfg.name);
        return response;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors[cfg.name] = msg;
        console.warn(`[AIGateway] Provider "${cfg.name}" failed: ${msg}. Falling back…`);
      }
    }

    throw new AllProvidersFailedError(errors);
  }

  /**
   * Send a streaming chat request with automatic failover.
   *
   * Works identically to {@link chat} but returns a `ReadableStream<string>`.
   *
   * @param messages - Array of chat messages.
   * @param options  - Optional gateway-level options.
   * @returns A `ReadableStream<string>` from the first successful provider.
   */
  async chatStream(
    messages: ChatMessage[],
    options?: GatewayChatOptions,
  ): Promise<ReadableStream<string>> {
    const ordered = this.resolveProviderOrder(options);
    const maxRetries = options?.maxRetries ?? ordered.length;
    const errors: Record<string, string> = {};

    for (let i = 0; i < Math.min(maxRetries, ordered.length); i++) {
      const cfg = ordered[i];
      try {
        const stream = await cfg.provider.chatStream(messages);
        this.incrementUsage(cfg.name);
        return stream;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors[cfg.name] = msg;
        console.warn(`[AIGateway] Provider "${cfg.name}" streaming failed: ${msg}. Falling back…`);
      }
    }

    throw new AllProvidersFailedError(errors);
  }

  /**
   * Run health checks on all configured providers in parallel.
   *
   * @returns Aggregated health status with per-provider details.
   */
  async getHealthStatus(): Promise<GatewayHealthStatus> {
    const results = await Promise.all(
      this.providers.map(async (cfg) => {
        let health: HealthCheckResult;
        try {
          health = await cfg.provider.healthCheck();
        } catch (error) {
          health = {
            ok: false,
            latency: -1,
            error: error instanceof Error ? error.message : String(error),
          };
        }

        return {
          name: cfg.name,
          isEnabled: cfg.isEnabled,
          health,
          usageCount: this.usageCounts.get(cfg.name) ?? 0,
        };
      }),
    );

    return {
      providers: results,
      healthy: results.some((r) => r.isEnabled && r.health.ok),
    };
  }

  /**
   * Get the current usage count for each provider.
   *
   * @returns A map of provider name → number of successful calls routed.
   */
  getUsageCounts(): Record<string, number> {
    return Object.fromEntries(this.usageCounts);
  }

  /**
   * Enable or disable a provider by name at runtime.
   *
   * @param name    - The provider name to update.
   * @param enabled - Whether the provider should be enabled.
   * @returns `true` if the provider was found and updated; `false` otherwise.
   */
  setProviderEnabled(name: string, enabled: boolean): boolean {
    const cfg = this.providers.find((p) => p.name === name);
    if (!cfg) return false;
    cfg.isEnabled = enabled;
    return true;
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  /**
   * Return the ordered list of provider configs to try, respecting
   * `preferredProvider` and filtering out disabled providers.
   */
  private resolveProviderOrder(options?: GatewayChatOptions): ProviderConfig[] {
    const enabled = this.providers.filter((p) => p.isEnabled);

    if (options?.preferredProvider) {
      const preferred = enabled.find((p) => p.name === options.preferredProvider);
      if (preferred) {
        // Put the preferred provider first, then the rest.
        return [preferred, ...enabled.filter((p) => p.name !== options.preferredProvider)];
      }
      console.warn(
        `[AIGateway] Preferred provider "${options.preferredProvider}" not found or disabled. Using default order.`,
      );
    }

    return enabled;
  }

  /** Increment the usage counter for a provider. */
  private incrementUsage(name: string): void {
    this.usageCounts.set(name, (this.usageCounts.get(name) ?? 0) + 1);
  }
}
