"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { ChatInput, ChatMode } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ArrowRight, AlertTriangle, Phone, FileImage } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { detectEmergency } from "@/lib/ai/emergency-detector";

import { getSystemPrompt } from "@/lib/ai/system-prompt";
import { useChatHistory, Message } from "@/context/ChatHistoryContext";

type EmergencyAlert = {
  type: string;
  condition: string;
  severity: string;
  message: string;
  callNumber: string;
};

export default function ChatPage() {
  const { activeThreadId, getActiveThread, addMessageToThread, createNewThread, updateMessageInThread, updateThreadTitle } = useChatHistory();
  
  // Create a thread if none exists on mount
  useEffect(() => {
    if (!activeThreadId) {
      createNewThread("New Chat");
    }
  }, [activeThreadId, createNewThread]);

  const activeThread = getActiveThread();
  const messages = activeThread?.messages || [];

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

  // Parse emergency alerts and doctor recommendations from AI response
  const parseStructuredBlocks = useCallback((content: string) => {
    // Check for emergency alerts
    const emergencyMatch = content.match(/```json:emergency_alert\s*\n?([\s\S]*?)```/);
    if (emergencyMatch) {
      try {
        const alert = JSON.parse(emergencyMatch[1]);
        setEmergencyAlert(alert);
      } catch { /* ignore parse errors */ }
    }
  }, []);

  const handleSend = async (text: string) => {
    const userMsgContent = text.trim();
    if (!userMsgContent && !selectedMode) return;

    let apiContent = userMsgContent;
    let displayContent = userMsgContent;

    if (selectedMode) {
      apiContent = userMsgContent 
        ? `[Action: ${selectedMode.title}]\n\n${userMsgContent}` 
        : `[Action: ${selectedMode.title}]`;
      
      displayContent = `|MODE:${selectedMode.title}|${userMsgContent}`;
      setSelectedMode(null);
    }

    // Add user message to UI
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: displayContent };
    const threadIdToUse = activeThreadId || createNewThread("New Chat");
    
    // Add user message to global state
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

    // Generate AI Title for new threads
    if (messages.length === 0 && apiContent) {
      fetch("/api/ai/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: apiContent }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.title) updateThreadTitle(threadIdToUse, data.title);
      })
      .catch(err => console.error("Title gen failed", err));
    }

    // Create placeholder bot message for streaming
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = { id: botMsgId, role: "bot", content: "" };
    addMessageToThread(threadIdToUse, botMsg);

    try {
      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            messages: [...messages, { role: "user" as const, content: apiContent }].map(m => ({
              role: m.role === "bot" ? "assistant" as const : "user" as const,
              content: m.content,
            }))
        }),
        signal: abortControllerRef.current.signal 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Read the SSE stream
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
          if (!trimmed) continue;
          if (trimmed === "data: [DONE]") continue;
          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.content) {
                fullContent += data.content;
                // Update the bot message in-place for streaming effect
                updateMessageInThread(threadIdToUse, botMsgId, fullContent);
              }
            } catch {
              // Skip malformed data
            }
          }
        }
      }

      // Parse any structured blocks (emergency alerts, etc.)
      parseStructuredBlocks(fullContent);

    } catch (error: any) {
      if (error.name === "AbortError") return;
      
      console.error("[Oxpecker AI] Stream error:", error);
      // Show error as bot message
      updateMessageInThread(
        threadIdToUse, 
        botMsgId, 
        `⚠️ **Error:** ${error.message || "Something went wrong. Please try again."}\n\nPlease check that your AI provider API keys are configured in \`.env.local\`.`
      );
    } finally {
      setIsTyping(false);
    }
  };

  const followUpChips = [
    "Explain More", "Find Doctors", "Compare Medicines", "Book Appointment"
  ];

  // ============================================
  // File Upload Handler for Image Analysis
  // ============================================
  const handleFileUpload = async (file: File, analysisType: string) => {
    const analysisEndpoints: Record<string, string> = {
      prescription: '/api/ai/analyze-prescription',
      report: '/api/ai/analyze-report',
      food: '/api/ai/analyze-food',
      image: '/api/ai/analyze-image',
    };

    const analysisLabels: Record<string, string> = {
      prescription: '📋 Analyzing Prescription',
      report: '📊 Analyzing Medical Report',
      food: '🍽️ Analyzing Food & Nutrition',
      image: '🔬 Analyzing Medical Image',
    };

    const endpoint = analysisEndpoints[analysisType] || analysisEndpoints.image;
    const label = analysisLabels[analysisType] || '🔍 Analyzing Image';

    // Show user message with file name
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `📎 Uploaded: **${file.name}** (${label})`,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Create placeholder bot message
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'bot', content: '' }]);

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

      // Parse for emergency alerts
      parseStructuredBlocks(analysisContent);

      // Update bot message with analysis
      setMessages(prev =>
        prev.map(m =>
          m.id === botMsgId ? { ...m, content: analysisContent } : m
        )
      );
    } catch (error: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === botMsgId
            ? { ...m, content: `⚠️ **Analysis Error:** ${error.message}\n\nPlease ensure your AI provider API keys are configured in \`.env.local\` and support vision/image analysis.` }
            : m
        )
      );
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
                  <p className="font-black text-[16px]">⚠️ EMERGENCY DETECTED: {emergencyAlert.condition}</p>
                  <p className="text-[14px] text-red-100 mt-0.5">{emergencyAlert.message}</p>
                </div>
              </div>
              <a
                href={`tel:${emergencyAlert.callNumber}`}
                className="flex items-center gap-2 bg-white text-red-600 font-bold px-5 py-2.5 rounded-xl text-[14px] hover:bg-red-50 transition-colors shrink-0 shadow-lg"
              >
                <Phone size={18} /> Call {emergencyAlert.callNumber}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
        <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] grayscale">
          <Image 
            src="/images/shustota-icon.png" 
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
            <WelcomeScreen onSelect={(mode) => setSelectedMode(mode)} />
          ) : (
            <div className="flex flex-col space-y-2 mt-4 md:mt-8 pb-10">
              {messages.map((msg) => {
                // Don't render the empty bot bubble if we are showing the custom typing indicator
                if (isTyping && msg.role === "bot" && msg.content === "") return null;
                return <MessageBubble key={msg.id} role={msg.role} content={msg.content} />;
              })}
              
              {isTyping && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start mb-6">
                  <div className="flex gap-4 w-[760px] max-w-full">
                    {/* Pulsing Avatar */}
                    <div className="relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1 bg-primary/5 ring-1 ring-primary/20 shadow-sm overflow-hidden">
                      <motion.div
                        animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-primary/10 rounded-full"
                      />
                      <Image src="/images/shustota-icon.png" alt="AI Processing" fill sizes="40px" className="object-contain p-2 relative z-10" />
                    </div>
                    
                    {/* Processing Text */}
                    <div className="flex items-center">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[14px] text-primary/70 font-medium flex items-center gap-1.5"
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

              {/* Follow-up Chips (Only show after a bot message and not typing) */}
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
                      className="flex items-center gap-1.5 h-[38px] px-4 rounded-full bg-white border border-slate-200 text-slate-600 text-[14px] font-medium hover:border-primary/50 hover:text-primary transition-colors shadow-sm"
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
        onSend={handleSend} 
        onFileUpload={handleFileUpload}
        selectedMode={selectedMode} 
        onSelectMode={setSelectedMode}
      />
    </div>
  );
}
