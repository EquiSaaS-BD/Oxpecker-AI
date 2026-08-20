"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, X, Send, Mic, FileText, Stethoscope, Pill, ClipboardList,
  Camera, ChevronRight, AlertTriangle, RefreshCw,
  FileSearch, Brain, Clipboard, Check, Edit3, Download,
} from "lucide-react";
import { useSpeechToText, VoiceMicButton, VoiceWaveform } from "@/components/chat/VoiceInput";

// ============================================
// Doctor AI Assistant - "Second Doctor"
// Helps doctors write prescriptions, scan reports,
// suggest medicines, and reduce documentation burden
// ============================================

interface DoctorMessage {
  id: string;
  role: "doctor" | "ai";
  content: string;
  type?: "text" | "prescription" | "report_scan" | "medicine_suggestion";
  prescriptionData?: PrescriptionDraft;
}

interface PrescriptionDraft {
  chiefComplaint?: string;
  diagnosis?: string;
  vitals?: string;
  medicines?: {
    name: string;
    generic: string;
    strength: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  investigations?: string[];
  advice?: string;
  followUp?: string;
}

interface PatientContext {
  name: string;
  age: number;
  gender: string;
  symptoms: string;
  id: string;
}

// Quick Action Cards for Doctor
const QUICK_ACTIONS = [
  {
    icon: ClipboardList,
    title: "প্রেসক্রিপশন লিখুন",
    titleEn: "Write Prescription",
    desc: "রোগীর লক্ষণ বলুন, AI প্রেসক্রিপশন তৈরি করবে",
    prompt: "এই রোগীর জন্য প্রেসক্রিপশন তৈরি করুন। রোগীর লক্ষণগুলো হলো: ",
    color: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    icon: FileSearch,
    title: "রিপোর্ট স্ক্যান করুন",
    titleEn: "Scan Report",
    desc: "রিপোর্টের ছবি দিন, AI বিশ্লেষণ করবে",
    prompt: "[SCAN_REPORT]",
    color: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    icon: Pill,
    title: "ওষুধ সাজেশন",
    titleEn: "Medicine Suggestion",
    desc: "রোগ বলুন, সঠিক ওষুধ ও ডোজ পাবেন",
    prompt: "এই রোগের জন্য সঠিক ওষুধ, ডোজ এবং সতর্কতা সাজেস্ট করুন: ",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    icon: Brain,
    title: "ডিফারেনশিয়াল ডায়াগনোসিস",
    titleEn: "Differential Diagnosis",
    desc: "লক্ষণ দিন, সম্ভাব্য রোগগুলো জানুন",
    prompt: "নিচের লক্ষণগুলোর ভিত্তিতে ডিফারেনশিয়াল ডায়াগনোসিস দিন: ",
    color: "text-amber-600 bg-amber-50 border-amber-100",
  },
  {
    icon: Stethoscope,
    title: "ট্রিটমেন্ট প্ল্যান",
    titleEn: "Treatment Plan",
    desc: "সম্পূর্ণ চিকিৎসা পরিকল্পনা তৈরি করুন",
    prompt: "এই রোগীর জন্য সম্পূর্ণ ট্রিটমেন্ট প্ল্যান তৈরি করুন। ডায়াগনোসিস: ",
    color: "text-rose-600 bg-rose-50 border-rose-100",
  },
  {
    icon: AlertTriangle,
    title: "ড্রাগ ইন্টারেকশন চেক",
    titleEn: "Drug Interaction",
    desc: "ওষুধের মধ্যে ক্ষতিকর মিথস্ক্রিয়া যাচাই",
    prompt: "নিচের ওষুধগুলোর মধ্যে কোনো ড্রাগ ইন্টারেকশন বা বিপদ আছে কিনা চেক করুন: ",
    color: "text-red-600 bg-red-50 border-red-100",
  },
];

// System prompt for Doctor AI Assistant
const DOCTOR_SYSTEM_PROMPT = `You are Oxpecker AI - Doctor's Clinical Assistant. You work alongside doctors to help them:

1. **Write Prescriptions**: When a doctor describes symptoms/diagnosis, generate a complete prescription in structured format.
2. **Analyze Reports**: When given lab report data, identify abnormals, explain findings, suggest follow-up.
3. **Suggest Medicines**: Recommend appropriate medicines with exact brand names (Bangladeshi market), dosage, frequency, duration, and warnings.
4. **Differential Diagnosis**: Given symptoms, list probable diagnoses ranked by likelihood.
5. **Drug Interactions**: Check for dangerous drug interactions.
6. **Treatment Plans**: Create comprehensive treatment plans.

RULES:
- You are assisting a LICENSED DOCTOR, not a patient. Speak professionally.
- Use Bangladeshi medicine brand names (Napa, Seclo, Ace, Sergel, etc.)
- Prices in BDT (৳)
- Always include generic names alongside brand names
- Flag any contraindications or drug interactions
- When writing prescriptions, use this JSON format:

\`\`\`json:prescription_draft
{
  "chiefComplaint": "...",
  "diagnosis": "...",
  "vitals": "...",
  "medicines": [
    {
      "name": "Brand Name",
      "generic": "Generic Name",
      "strength": "500mg",
      "dosage": "1+0+1",
      "frequency": "Twice daily",
      "duration": "7 days",
      "instructions": "After meal"
    }
  ],
  "investigations": ["CBC", "Urine R/E"],
  "advice": "...",
  "followUp": "7 days"
}
\`\`\`

- Respond in the same language the doctor uses (Bangla or English)
- Be concise but thorough
- Always verify critical decisions with the doctor`;

export function DoctorAIAssistant({
  isOpen,
  onClose,
  patient,
  onPrescriptionReady,
}: {
  isOpen: boolean;
  onClose: () => void;
  patient?: PatientContext | null;
  onPrescriptionReady?: (data: PrescriptionDraft) => void;
}) {
  const [messages, setMessages] = useState<DoctorMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const [prescriptionDraft, setPrescriptionDraft] = useState<PrescriptionDraft | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice
  const { isListening, transcript, isSupported: voiceSupported, toggleListening, setTranscript } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setInput(prev => prev + transcript);
      setTranscript("");
    }
  }, [transcript, setTranscript]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Welcome message with patient context
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = patient
        ? `🩺 **ডাক্তার সাহেব, আমি আপনার AI সহকারী।**\n\nবর্তমান রোগী: **${patient.name}** (${patient.age}/${patient.gender})\nলক্ষণ: ${patient.symptoms}\n\nকিভাবে সাহায্য করতে পারি? নিচের অপশনগুলো থেকে বেছে নিন অথবা সরাসরি কমান্ড দিন।`
        : `🩺 **ডাক্তার সাহেব, আমি আপনার AI সহকারী।**\n\nআমি আপনাকে প্রেসক্রিপশন লেখা, রিপোর্ট বিশ্লেষণ, ওষুধ সাজেশন, এবং ডকুমেন্টেশনে সাহায্য করতে পারি। নিচের অপশনগুলো থেকে শুরু করুন।`;

      setMessages([{ id: "welcome", role: "ai", content: welcomeMsg }]);
    }
  }, [isOpen, patient]);

  const handleSend = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isLoading) return;

    setInput("");
    setShowActions(false);

    // Check if it's a report scan action
    if (msgText === "[SCAN_REPORT]") {
      fileInputRef.current?.click();
      return;
    }

    const doctorMsg: DoctorMessage = {
      id: Date.now().toString(),
      role: "doctor",
      content: msgText,
    };
    setMessages(prev => [...prev, doctorMsg]);
    setIsLoading(true);

    // Bot placeholder
    const botId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botId, role: "ai", content: "" }]);

    try {
      // Build context with patient info
      const systemContext = patient
        ? `${DOCTOR_SYSTEM_PROMPT}\n\nCURRENT PATIENT:\nName: ${patient.name}\nAge: ${patient.age}\nGender: ${patient.gender}\nSymptoms: ${patient.symptoms}\nID: ${patient.id}`
        : DOCTOR_SYSTEM_PROMPT;

      const allMessages = [
        { role: "system", content: systemContext },
        ...messages.filter(m => m.id !== "welcome").map(m => ({
          role: m.role === "doctor" ? "user" : "assistant",
          content: m.content,
        })),
        { role: "user", content: msgText },
      ];

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!response.ok) throw new Error("AI request failed");

      // Stream response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.content || parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                fullContent += content;
                setMessages(prev =>
                  prev.map(m => m.id === botId ? { ...m, content: fullContent } : m)
                );
              }
            } catch {}
          }
        }
      }

      // Parse prescription draft from response
      const prescMatch = fullContent.match(/```json:prescription_draft\s*\n?([\s\S]*?)```/);
      if (prescMatch) {
        try {
          const draft = JSON.parse(prescMatch[1].trim());
          setPrescriptionDraft(draft);
        } catch {}
      }
    } catch (error: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === botId
            ? { ...m, content: `⚠️ Error: ${error.message}\n\nAPI Key কনফিগার করা আছে কিনা নিশ্চিত করুন।` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle report upload
  const handleReportUpload = async (file: File) => {
    const doctorMsg: DoctorMessage = {
      id: Date.now().toString(),
      role: "doctor",
      content: `📎 রিপোর্ট আপলোড: **${file.name}**\nবিশ্লেষণ করুন এবং বলুন রোগী কোন কোন সমস্যায় আছে, কি কি করতে হবে, এবং ওষুধ সাজেস্ট করুন।`,
    };
    setMessages(prev => [...prev, doctorMsg]);
    setShowActions(false);
    setIsLoading(true);

    const botId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botId, role: "ai", content: "🔍 রিপোর্ট বিশ্লেষণ করছি..." }]);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ai/analyze-report", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Report analysis failed");

      const data = await response.json();
      const analysis = data.analysis || "বিশ্লেষণ সম্ভব হয়নি।";

      setMessages(prev =>
        prev.map(m => m.id === botId ? { ...m, content: analysis } : m)
      );

      // Check for prescription draft
      const prescMatch = analysis.match(/```json:prescription_draft\s*\n?([\s\S]*?)```/);
      if (prescMatch) {
        try {
          const draft = JSON.parse(prescMatch[1].trim());
          setPrescriptionDraft(draft);
        } catch {}
      }
    } catch (error: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === botId ? { ...m, content: `⚠️ রিপোর্ট বিশ্লেষণে সমস্যা: ${error.message}` } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptPrescription = () => {
    if (prescriptionDraft && onPrescriptionReady) {
      onPrescriptionReady(prescriptionDraft);
      setPrescriptionDraft(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 w-full lg:max-w-[520px] h-full bg-white shadow-2xl z-[101] flex flex-col border-l border-slate-200"
      >
        {/* Header */}
        <div className="h-[72px] px-5 border-b border-slate-100 flex items-center justify-between    shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl    flex items-center justify-center text-white shadow-md">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-slate-800">Oxpecker AI</h2>
              <p className="text-[12px] text-slate-500 font-medium">Doctor&apos;s Clinical Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([]);
                setShowActions(true);
                setPrescriptionDraft(null);
              }}
              className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "doctor" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${
                msg.role === "doctor"
                  ? "bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3"
                  : "bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"
              }`}>
                {msg.role === "ai" && !msg.content && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-[13px]">চিন্তা করছি...</span>
                  </div>
                )}
                <div className={`text-[14px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "doctor" ? "text-white" : "text-slate-700"
                }`}>
                  {msg.content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={i}>{part.slice(2, -2)}</strong>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Quick Actions */}
          {showActions && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {QUICK_ACTIONS.map((action, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    if (action.prompt === "[SCAN_REPORT]") {
                      fileInputRef.current?.click();
                    } else {
                      setInput(action.prompt);
                      textareaRef.current?.focus();
                    }
                  }}
                  className={`flex flex-col items-start gap-2 p-3 rounded-xl border text-left hover:shadow-sm transition-all ${action.color}`}
                >
                  <action.icon size={20} />
                  <div>
                    <p className="text-[13px] font-bold leading-tight">{action.title}</p>
                    <p className="text-[11px] opacity-70 mt-0.5 leading-tight">{action.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Prescription Draft Card */}
          <AnimatePresence>
            {prescriptionDraft && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border-2 border-blue-200 rounded-2xl overflow-hidden shadow-md"
              >
                <div className="   px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Clipboard size={18} />
                    <span className="font-bold text-[14px]">প্রেসক্রিপশন ড্রাফট</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-3 py-1 bg-white/20 text-white text-[12px] font-bold rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3 text-[13px]">
                  {prescriptionDraft.chiefComplaint && (
                    <div>
                      <p className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Chief Complaint</p>
                      <p className="text-slate-700 mt-0.5">{prescriptionDraft.chiefComplaint}</p>
                    </div>
                  )}
                  {prescriptionDraft.diagnosis && (
                    <div>
                      <p className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Diagnosis</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{prescriptionDraft.diagnosis}</p>
                    </div>
                  )}
                  {prescriptionDraft.medicines && prescriptionDraft.medicines.length > 0 && (
                    <div>
                      <p className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mb-1.5">Medicines ({prescriptionDraft.medicines.length})</p>
                      {prescriptionDraft.medicines.map((med, i) => (
                        <div key={i} className="bg-slate-50 rounded-lg p-2.5 mb-1.5 border border-slate-100">
                          <p className="font-bold text-slate-800">{med.name} <span className="font-normal text-slate-400">{med.strength}</span></p>
                          <p className="text-[11px] text-slate-400 italic">{med.generic}</p>
                          <p className="text-[12px] text-blue-600 mt-1">
                            {med.dosage} • {med.frequency} • {med.duration} • {med.instructions}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {prescriptionDraft.advice && (
                    <div>
                      <p className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Advice</p>
                      <p className="text-slate-700 mt-0.5">{prescriptionDraft.advice}</p>
                    </div>
                  )}
                  {prescriptionDraft.followUp && (
                    <div>
                      <p className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Follow Up</p>
                      <p className="text-slate-700 mt-0.5">{prescriptionDraft.followUp}</p>
                    </div>
                  )}
                </div>

                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={handleAcceptPrescription}
                    className="flex-1 h-[40px] bg-emerald-600 text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors"
                  >
                    <Check size={16} /> Accept & Use
                  </button>
                  <button
                    onClick={() => handleSend("এই প্রেসক্রিপশনটি আবার রিভাইজ করুন এবং আরো ভালো ওষুধ সাজেস্ট করুন।")}
                    className="h-[40px] px-4 border border-slate-200 text-slate-600 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} /> Revise
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Hidden File Input for Report Scan */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleReportUpload(file);
            e.target.value = "";
          }}
        />

        {/* Input Area */}
        <div className="p-3 border-t border-slate-100 bg-white shrink-0">
          {/* Patient context bar */}
          {patient && (
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[11px] font-bold flex items-center justify-center">
                {patient.name.charAt(0)}
              </div>
              <span className="text-[12px] text-slate-500 font-medium">
                {patient.name} • {patient.age}/{patient.gender} • {patient.symptoms}
              </span>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Quick actions toggle */}
            <button
              onClick={() => setShowActions(!showActions)}
              className="w-[40px] h-[40px] rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0"
            >
              <Bot size={18} />
            </button>

            {/* Report upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-[40px] h-[40px] rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0"
            >
              <Camera size={18} />
            </button>

            {/* Text input */}
            <div className="flex-1 bg-slate-100 rounded-xl px-3 py-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="কমান্ড দিন বা প্রশ্ন করুন..."
                className="w-full bg-transparent resize-none outline-none text-[14px] text-slate-800 placeholder:text-slate-400 py-2 max-h-[80px] leading-tight"
                rows={1}
              />
            </div>

            {/* Voice */}
            <VoiceWaveform isActive={isListening} />
            <VoiceMicButton isListening={isListening} onToggle={toggleListening} isSupported={voiceSupported} />

            {/* Send */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-[40px] h-[40px] rounded-xl flex items-center justify-center transition-all shrink-0 ${
                input.trim() && !isLoading
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
