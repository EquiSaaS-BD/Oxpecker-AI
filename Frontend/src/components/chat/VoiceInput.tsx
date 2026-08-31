"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  onToggle: () => void;
}

import { AssemblyAISpeechClient } from "@/lib/ai/assemblyai-client";
import { toast } from "sonner";

/**
 * Hook for Speech-to-Text using AssemblyAI Universal-3.5 Pro streaming
 * with automatic fallback to Web Speech API when quota/limits are reached.
 */
export function useSpeechToText(options?: { domain?: string; prompt?: string }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const clientRef = useRef<AssemblyAISpeechClient | null>(null);

  const startListening = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.stop();
    }
    setTranscript("");
    setIsListening(true);

    const client = new AssemblyAISpeechClient({
      domain: options?.domain,
      prompt: options?.prompt || "Medical consultation and symptoms description in English and Bengali.",
      onTranscript: (text: string, isFinal: boolean) => {
        if (isFinal && text.trim()) {
          setTranscript(text.trim() + " ");
        }
      },
      onStateChange: (state) => {
        if (state === "listening") {
          setIsListening(true);
        } else if (state === "fallback") {
          setIsUsingFallback(true);
          setIsListening(true);
        } else if (state === "idle") {
          setIsListening(false);
        }
      },
      onError: (err) => {
        console.error("[useSpeechToText] Error:", err);
        setIsListening(false);
        toast.error(err.message || "Microphone access error");
      },
    });

    clientRef.current = client;
    client.start();
  }, [options?.domain, options?.prompt]);

  const stopListening = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.stop();
      clientRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasMedia = !!(navigator?.mediaDevices?.getUserMedia);
      const hasSpeech = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      setIsSupported(hasMedia || hasSpeech);
    }
    return () => {
      if (clientRef.current) {
        clientRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    isUsingFallback,
    startListening,
    stopListening,
    toggleListening,
    setTranscript,
  };
}

/**
 * Hook for Text-to-Speech using Web Speech API
 */
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);
    }
  }, []);

  const speak = useCallback((text: string, lang: string = 'bn-BD') => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean markdown formatting from text
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/#{1,6}\s/g, '') // Remove headings
      .replace(/\p{Extended_Pictographic}/gu, '') // Remove emojis
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
      .replace(/\n{2,}/g, '. ') // Replace double newlines with period
      .trim();

    if (!cleanText) return;

    // Split long text into chunks (speech synthesis has limits)
    const chunks = cleanText.match(/[^.!?।]+[.!?।]+/g) || [cleanText];

    let currentChunk = 0;

    const speakChunk = () => {
      if (currentChunk >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentChunk].trim());
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.pitch = 1;

      utterance.onend = () => {
        currentChunk++;
        speakChunk();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    setIsSpeaking(true);
    speakChunk();
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, isSupported, speak, stop };
}

/**
 * Voice Waveform Visualizer Component
 */
export function VoiceWaveform({ isActive }: { isActive: boolean }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center gap-[3px] h-6"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: [8, 20, 12, 24, 8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
              className="w-[3px] bg-rose-500 rounded-full"
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Mic Button Component for ChatInput
 */
export function VoiceMicButton({
  isListening,
  onToggle,
  isSupported,
}: {
  isListening: boolean;
  onToggle: () => void;
  isSupported: boolean;
}) {
  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
        isListening
          ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
      title={isListening ? "Stop listening" : "Voice input"}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
}

/**
 * Speaker Button for TTS on bot messages
 */
export function SpeakButton({
  text,
  isSpeaking,
  onSpeak,
  onStop,
}: {
  text: string;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onStop: () => void;
}) {
  return (
    <button
      onClick={() => isSpeaking ? onStop() : onSpeak(text)}
      className={`p-1.5 rounded-lg transition-colors ${
        isSpeaking
          ? "text-primary bg-primary/10"
          : "text-slate-600 hover:text-slate-500 hover:bg-slate-50"
      }`}
      title={isSpeaking ? "Stop speaking" : "Read aloud"}
    >
      <Volume2 size={14} />
    </button>
  );
}
