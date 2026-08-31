"use client";

import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { ChatInput, ChatMode } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ArrowRight, AlertTriangle, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { detectEmergency } from "@/lib/ai/emergency-detector";
import PerspectiveGrid3D from "@/components/shared/PerspectiveGrid3D";
import { useChatHistory, Message } from "@/context/ChatHistoryContext";

type EmergencyAlert = {
  type: string;
  condition: string;
  severity: string;
  message: string;
  callNumber: string;
};

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q");
  const autoSentRef = useRef(false);

  const { activeThreadId, getActiveThread, addMessageToThread, createNewThread, updateMessageInThread, updateThreadTitle, isLoaded } = useChatHistory();
  
  // Create a thread if none exists on mount, but ONLY after localStorage is loaded
  useEffect(() => {
    if (isLoaded && !activeThreadId) {
      createNewThread("New Chat");
    }
  }, [isLoaded, activeThreadId, createNewThread]);

  const activeThread = getActiveThread();
  const messages = useMemo(() => activeThread?.messages || [], [activeThread?.messages]);

  const [isTyping, setIsTyping] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ChatMode | null>(null);
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlert | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Parse emergency alerts from AI response
  const parseStructuredBlocks = useCallback((content: string) => {
    const emergencyMatch = content.match(/```json:emergency_alert\s*\n?([\s\S]*?)```/);
    if (emergencyMatch) {
      try {
        const alert = JSON.parse(emergencyMatch[1]);
        setEmergencyAlert(alert);
      } catch { /* ignore parse errors */ }
    }
  }, []);

  const handleSend = async (text?: string, customMode?: ChatMode | null) => {
    const activeMode = customMode || selectedMode;
    const userMsgContent = (text || "").trim();
    if (!userMsgContent && !activeMode) return;

    let apiContent = userMsgContent;
    let displayContent = userMsgContent;

    if (activeMode) {
      const additionalText = userMsgContent ? `\n\n${userMsgContent}` : "";
      const basePrompt = activeMode.promptText ? `\n\n${activeMode.promptText}` : "";
      apiContent = `[Action: ${activeMode.title}]${basePrompt}${additionalText}`;
      
      displayContent = `|MODE:${activeMode.title}|${userMsgContent}`;
      setSelectedMode(null);
    }

    // Determine thread ID and title for Sidebar
    const threadTitleToUse = activeMode?.title || (userMsgContent.length > 25 ? userMsgContent.substring(0, 25) + "..." : userMsgContent);
    const threadIdToUse = activeThreadId || createNewThread(threadTitleToUse);
    if (activeMode?.title) {
      updateThreadTitle(threadIdToUse, activeMode.title);
    }

    // Filter existing messages for non-empty text content
    const existingMessages = (activeThread?.messages || [])
      .filter(m => m.content && m.content.trim().length > 0);

    // Add user message to UI
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: displayContent };
    addMessageToThread(threadIdToUse, userMsg);
    setIsTyping(true);
    setEmergencyAlert(null);

    // Client-side instant emergency detection
    const emergencyResult = detectEmergency(apiContent);
    if (emergencyResult) {
      setEmergencyAlert({
        type: 'emergency',
        condition: emergencyResult.condition,
        severity: emergencyResult.severity,
        message: emergencyResult.message,
        callNumber: emergencyResult.callNumber,
      });
    }

    // Update thread title if this is the first message
    if (existingMessages.length === 0) {
      updateThreadTitle(threadIdToUse, threadTitleToUse);
    }

    // Create placeholder bot message for streaming
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = { id: botMsgId, role: "bot", content: "" };
    addMessageToThread(threadIdToUse, botMsg);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      let pContext: any = null;
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("oxpecker_user");
        if (stored) {
          try { pContext = JSON.parse(stored); } catch {}
        }
      }

      const apiMessages = [
        ...existingMessages.map(m => ({
          role: m.role === "bot" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
        { role: "user" as const, content: apiContent }
      ];

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: apiMessages,
          patientContext: pContext
        }),
        signal: abortControllerRef.current.signal 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.content) {
                fullContent += data.content;
                updateMessageInThread(threadIdToUse, botMsgId, fullContent);
              }
            } catch {}
          }
        }
      }

      parseStructuredBlocks(fullContent);

    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("[Oxpecker AI] Stream error:", error);
      const friendlyError = error.message && !error.message.includes("fetch") 
        ? error.message 
        : "সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
      updateMessageInThread(
        threadIdToUse, 
        botMsgId, 
        `**Error:** ${friendlyError}`
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;

  // Auto-send query passed via URL parameter e.g. /chat?q=হ্যালো
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && !autoSentRef.current) {
      autoSentRef.current = true;
      handleSendRef.current(initialQuery.trim());
    }
  }, [initialQuery]);

  const handleWelcomeSelect = (modeItem: any) => {
    const modeObj: ChatMode = { 
      icon: modeItem.icon, 
      title: modeItem.title, 
      color: modeItem.color, 
      bg: modeItem.bg,
      promptText: modeItem.promptText 
    };
    setSelectedMode(modeObj);
  };

  const followUpChips = [
    "Explain More", "Find Doctors", "Compare Medicines", "Book Appointment"
  ];

  const handleFileUpload = async (file: File, analysisType: string) => {
    const analysisEndpoints: Record<string, string> = {
      prescription: '/api/ai/analyze-prescription',
      report: '/api/ai/analyze-report',
      food: '/api/ai/analyze-food',
      image: '/api/ai/analyze-image',
    };

    const analysisLabels: Record<string, string> = {
      prescription: 'Analyzing Prescription',
      report: 'Analyzing Medical Report',
      food: 'Analyzing Food & Nutrition',
      image: 'Analyzing Medical Image',
    };

    const endpoint = analysisEndpoints[analysisType] || analysisEndpoints.image;
    const label = analysisLabels[analysisType] || 'Analyzing Image';

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Uploaded: **${file.name}** (${label})`,
    };
    if (activeThreadId) addMessageToThread(activeThreadId, userMsg);
    setIsTyping(true);

    const botMsgId = (Date.now() + 1).toString();
    if (activeThreadId) {
      addMessageToThread(activeThreadId, { id: botMsgId, role: 'bot', content: '' });
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      const analysisContent = data.analysis || 'Analysis could not be completed.';
      parseStructuredBlocks(analysisContent);

      if (activeThreadId) {
        updateMessageInThread(activeThreadId, botMsgId, analysisContent);
      }
    } catch (error: any) {
      if (activeThreadId) {
        updateMessageInThread(activeThreadId, botMsgId, `**Analysis Error:** ${error.message || "File analysis could not be completed."}`);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-white overflow-hidden">
      
      {/* Emergency Alert Banner */}
      <AnimatePresence>
        {emergencyAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-600 text-white overflow-hidden z-50 relative"
          >
            <div className="max-w-[900px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertTriangle size={28} />
                </motion.div>
                <div>
                  <p className="font-black text-[16px]">জরুরি সতর্কবার্তা: {emergencyAlert.condition}</p>
                  <p className="text-[14px] text-red-100 mt-0.5">{emergencyAlert.message}</p>
                </div>
              </div>
              <a
                href={`tel:${emergencyAlert.callNumber}`}
                className="flex items-center gap-2 bg-white text-red-600 font-bold px-5 py-2.5 rounded-xl text-[14px] hover:bg-red-50 transition-colors shrink-0 shadow-lg"
              >
                <Phone size={18} /> কল করুন {emergencyAlert.callNumber}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Perspective Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-60">
        <PerspectiveGrid3D variant="chat" fadeRadius={85} />
      </div>

      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
        <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] grayscale">
          <Image 
            src="/images/Oxpecker_icon.png" 
            alt="Watermark" 
            fill 
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pt-8 pb-4 relative z-10">
        <div className="max-w-[900px] mx-auto w-full px-4 md:px-8">
          
          {messages.length === 0 ? (
            <WelcomeScreen onSelect={handleWelcomeSelect} />
          ) : (
            <div className="flex flex-col space-y-2 mt-4 md:mt-8 pb-10">
              {messages.map((msg) => {
                if (isTyping && msg.role === "bot" && msg.content === "") return null;
                return <MessageBubble key={msg.id} role={msg.role} content={msg.content} />;
              })}
              
              {isTyping && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start mb-6">
                  <div className="flex gap-4 w-[760px] max-w-full">
                    <div className="relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1 bg-sky-600/5 ring-1 ring-primary/20 shadow-sm overflow-hidden">
                      <motion.div
                        animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-sky-600/10 rounded-full"
                      />
                      <Image src="/images/Oxpecker_icon.png" alt="AI Processing" fill sizes="40px" className="object-contain p-2 relative z-10" />
                    </div>
                    
                    <div className="flex items-center">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[14px] text-sky-600/70 font-medium flex items-center gap-1.5"
                      >
                        Oxpecker AI is analyzing
                        <span className="flex gap-0.5">
                          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>.</motion.span>
                          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}>.</motion.span>
                          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}>.</motion.span>
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}

              {!isTyping && messages.length > 0 && messages[messages.length - 1].role === "bot" && messages[messages.length - 1].content !== "" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 mt-2 ml-12"
                >
                  {followUpChips.map((chip, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSend(chip)}
                      className="flex items-center gap-1.5 h-[38px] px-4 rounded-full bg-white border border-slate-200 text-slate-600 text-[14px] font-medium hover:border-primary/50 hover:text-sky-600 transition-colors shadow-sm"
                    >
                      {chip} <ArrowRight size={14} className="opacity-50" />
                    </button>
                  ))}
                </motion.div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput 
        onSend={(t) => handleSend(t)} 
        onFileUpload={handleFileUpload}
        selectedMode={selectedMode} 
        onSelectMode={setSelectedMode}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-white flex items-center justify-center text-slate-500">Loading Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
