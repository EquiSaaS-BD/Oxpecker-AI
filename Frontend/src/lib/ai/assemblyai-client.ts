// Browser-side streaming Speech-to-Text client using AssemblyAI Universal-3.5 Pro
// with seamless automatic fallback to Web Speech API.

import { useState, useRef, useEffect, useCallback } from 'react';

export interface AssemblyAISpeechOptions {
  domain?: string; // e.g. 'medical-v1' for clinical dictation
  prompt?: string;
  sampleRate?: number;
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onStateChange?: (state: 'idle' | 'connecting' | 'listening' | 'fallback') => void;
}

export class AssemblyAISpeechClient {
  private options: AssemblyAISpeechOptions;
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isRunning: boolean = false;
  private fallbackRecognition: any = null;
  private isUsingFallback: boolean = false;

  constructor(options: AssemblyAISpeechOptions) {
    this.options = options;
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isUsingFallback = false;
    this.options.onStateChange?.('connecting');

    try {
      // 1. Fetch short-lived token from secure server route
      const tokenRes = await fetch('/api/ai/assemblyai-token', { cache: 'no-store' });
      if (!tokenRes.ok) {
        throw new Error(`Token minting failed with status ${tokenRes.status}`);
      }
      const tokenData = await tokenRes.json();
      if (!tokenData.token) {
        throw new Error(tokenData.error || 'No token received from AssemblyAI route');
      }

      // 2. Request microphone stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // 3. Connect to AssemblyAI Streaming WebSocket
      const wsUrl = new URL('wss://streaming.assemblyai.com/v3/ws');
      wsUrl.searchParams.set('sample_rate', '16000');
      wsUrl.searchParams.set('speech_model', 'universal-3-5-pro');
      wsUrl.searchParams.set('mode', 'balanced');
      wsUrl.searchParams.set('token', tokenData.token);
      if (this.options.domain) {
        wsUrl.searchParams.set('domain', this.options.domain);
      }
      if (this.options.prompt) {
        wsUrl.searchParams.set('prompt', this.options.prompt);
      }

      this.ws = new WebSocket(wsUrl.toString());

      this.ws.onopen = () => {
        this.options.onStateChange?.('listening');
        this.startAudioStreaming();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'Turn' && data.transcript) {
            this.options.onTranscript(data.transcript, Boolean(data.end_of_turn));
          } else if (data.type === 'Termination') {
            this.stopAudioContext();
          }
        } catch (e) {
          console.error('[AssemblyAI] Parse error:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[AssemblyAI] WebSocket error encountered, switching to fallback:', err);
        this.activateFallback();
      };

      this.ws.onclose = (event) => {
        // If closed abnormally and still supposed to be running, fallback
        if (this.isRunning && !this.isUsingFallback && event.code !== 1000) {
          console.warn('[AssemblyAI] Socket closed unexpectedly code:', event.code);
          this.activateFallback();
        }
      };

    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'SecurityError') {
        console.warn('[AssemblyAI] Microphone permission was denied:', err);
        this.options.onError?.(new Error('Microphone permission was denied. Please allow microphone access in your browser settings.'));
        this.stop();
        return;
      }
      console.warn('[AssemblyAI] Initial connection failed, engaging Web Speech fallback:', err);
      this.activateFallback();
    }
  }

  private startAudioStreaming(): void {
    if (!this.mediaStream) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass({ sampleRate: 16000 });
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);

    // Using ScriptProcessorNode to buffer and downsample/convert Float32 to Int16 PCM
    const bufferSize = 4096;
    this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isRunning || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(inputData.length);

      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      this.ws.send(pcm16.buffer);
    };

    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  private activateFallback(): void {
    this.isUsingFallback = true;
    this.stopAudioContext();
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }

    this.options.onStateChange?.('fallback');

    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.options.onError?.(new Error('Speech recognition not supported in this browser.'));
      this.isRunning = false;
      this.options.onStateChange?.('idle');
      return;
    }

    try {
      this.fallbackRecognition = new SpeechRecognition();
      this.fallbackRecognition.continuous = true;
      this.fallbackRecognition.interimResults = true;
      this.fallbackRecognition.lang = 'bn-BD';

      this.fallbackRecognition.onresult = (event: any) => {
        let finalT = '';
        let interimT = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalT += t;
          } else {
            interimT += t;
          }
        }
        if (finalT) {
          this.options.onTranscript(finalT, true);
        } else if (interimT) {
          this.options.onTranscript(interimT, false);
        }
      };

      this.fallbackRecognition.onerror = (err: any) => {
        console.error('[WebSpeech Fallback] Error:', err);
        if (err.error === 'not-allowed') {
          this.options.onError?.(new Error('Microphone permission was denied. Please allow microphone access in your browser settings.'));
        }
        if (err.error !== 'no-speech') {
          this.stop();
        }
      };

      this.fallbackRecognition.onend = () => {
        if (this.isRunning && this.isUsingFallback) {
          try { this.fallbackRecognition.start(); } catch {}
        }
      };

      this.fallbackRecognition.start();
    } catch (e) {
      console.error('[WebSpeech Fallback] Failed to start:', e);
      this.options.onError?.(e);
      this.stop();
    }
  }

  private stopAudioContext(): void {
    if (this.processor) {
      try { this.processor.disconnect(); } catch {}
      this.processor = null;
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  public stop(): void {
    this.isRunning = false;

    // Gracefully terminate AssemblyAI session if active
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'Terminate' }));
        setTimeout(() => {
          if (this.ws) {
            this.ws.close();
            this.ws = null;
          }
        }, 300);
      } catch {
        this.ws.close();
        this.ws = null;
      }
    }

    if (this.fallbackRecognition) {
      try { this.fallbackRecognition.stop(); } catch {}
      this.fallbackRecognition = null;
    }

    this.stopAudioContext();
    this.options.onStateChange?.('idle');
  }
}

/**
 * React hook for real-time speech transcription powered by AssemblyAI Universal-3.5 Pro
 * with automatic fallback to Web Speech API.
 */
export function useAssemblyAISpeech(hookOptions?: {
  domain?: string;
  prompt?: string;
  onTranscript?: (text: string, isFinal: boolean) => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<'idle' | 'connecting' | 'listening' | 'fallback'>('idle');
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const clientRef = useRef<AssemblyAISpeechClient | null>(null);

  const onTranscriptRef = useRef(hookOptions?.onTranscript);
  useEffect(() => {
    onTranscriptRef.current = hookOptions?.onTranscript;
  }, [hookOptions?.onTranscript]);

  const startListening = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.stop();
    }

    setTranscript('');
    setIsListening(true);

    const client = new AssemblyAISpeechClient({
      domain: hookOptions?.domain,
      prompt: hookOptions?.prompt,
      onTranscript: (text, isFinal) => {
        setTranscript(text);
        if (onTranscriptRef.current) {
          onTranscriptRef.current(text, isFinal);
        }
      },
      onStateChange: (newState) => {
        setState(newState);
        if (newState === 'fallback') {
          setIsUsingFallback(true);
        } else if (newState === 'idle') {
          setIsListening(false);
        }
      },
      onError: (err) => {
        console.error('[AssemblyAISpeech] Error:', err);
      },
    });

    clientRef.current = client;
    client.start();
  }, [hookOptions?.domain, hookOptions?.prompt]);

  const stopListening = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.stop();
      clientRef.current = null;
    }
    setIsListening(false);
    setState('idle');
  }, []);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    state,
    isUsingFallback,
    startListening,
    stopListening,
  };
}

