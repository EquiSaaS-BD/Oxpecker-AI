import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Mic, Copy, Check, X, ShieldAlert, BookOpen, Stethoscope, FileText, Activity, AlertCircle, PlusCircle, ArrowRight, ArrowUp, Brain, Pill, ClipboardList, Camera, RefreshCw, Edit3, FileSearch, Clipboard, Download, MicOff, History } from "lucide-react";
import { toast } from "sonner";
import { usePrescription } from "@/context/PrescriptionContext";
import { useDoctor } from "@/context/DoctorContext";
import ReactMarkdown from "react-markdown";
import { DoctorRecommendationLoader, HospitalRecommendationLoader, MedicineRecommendationLoader } from "@/components/chat/cards/RecommendationLoaders";
import { EmergencyAlert } from "@/components/chat/cards/EmergencyAlert";
import { NutritionCard } from "@/components/chat/cards/NutritionCard";
import { PrescriptionCard } from "@/components/chat/cards/PrescriptionCard";
import { ReportCard } from "@/components/chat/cards/ReportCard";

interface Message {
  id: string;
  role: "user" | "ai";
  content?: string;
  cardData?: {
    title: string;
    summary: string;
    reasoning: string;
    confidence: number;
    actions: { label: string; icon: React.ElementType; primary?: boolean }[];
    followUps: string[];
  };
  prescriptionDraft?: PrescriptionDraft;
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

// System prompt for Doctor AI Assistant
const DOCTOR_SYSTEM_PROMPT = `You are Oxpecker AI - Doctor's Clinical Copilot built into the prescription editor. You assist licensed doctors with:

1. **Write Prescriptions**: Generate complete prescriptions with medicines (Bangladeshi brands), dosage, frequency, duration.
2. **Analyze Reports**: Identify abnormal values, explain findings, suggest follow-up tests.
3. **Suggest Medicines**: Recommend appropriate medicines with exact BD brand names (Napa, Seclo, Ace, Sergel, etc.), dosage, and warnings.
4. **Differential Diagnosis**: Given symptoms, list probable diagnoses ranked by likelihood.
5. **Drug Interactions**: Check for dangerous drug interactions between medicines.
6. **Treatment Plans**: Create comprehensive treatment plans.
7. **SOAP Notes**: Generate structured clinical documentation.
8. **Patient History Summary**: Summarize patient history concisely.

RULES:
- You are assisting a LICENSED DOCTOR, not a patient. Be professional and concise.
- Use Bangladeshi medicine brand names with generics.
- Prices in BDT (৳).
- Flag contraindications and drug interactions.
- When writing prescriptions, output this JSON block:

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

- Respond in the same language the doctor uses (Bangla or English).
- Be concise but thorough. Always verify critical decisions with the doctor.`;

function parseStructuredBlocks(content: string) {
  const blocks: { type: string; data: any; start: number; end: number }[] = [];
  const regex = /```json:([\w_]+)\s*\n?([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      blocks.push({ type: match[1], data: JSON.parse(match[2].trim()), start: match.index, end: match.index + match[0].length });
    } catch {}
  }
  return blocks;
}

function cleanContent(content: string): string {
  // Remove all markdown json blocks from display
  return content.replace(/```json(?:[^\n]*)\n?([\s\S]*?)```/g, '').trim();
}

export function AIAssistancePanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prescriptionDraft, setPrescriptionDraft] = useState<PrescriptionDraft | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Connect to Prescription Editor Context
  const { data: rxData, updateData: updateRx, addMedicine } = usePrescription();
  const { testReports, patientPrescriptions } = useDoctor();

  // Quick action chips - doctor-focused
  const defaultChips = [
    { icon: ClipboardList, label: "Write Prescription", prompt: "Write a prescription for this patient. Symptoms: " },
    { icon: FileSearch, label: "Scan Report", prompt: "[SCAN_REPORT]" },
    { icon: History, label: "Summarize History", prompt: "[SUMMARIZE_HISTORY]" },
    { icon: Pill, label: "Medicine Suggestion", prompt: "Suggest appropriate medicines with dosage for: " },
    { icon: Brain, label: "Differential Diagnosis", prompt: "Provide differential diagnosis for these symptoms: " },
    { icon: AlertCircle, label: "Drug Interaction Check", prompt: "Check for drug interactions between: " },
    { icon: Stethoscope, label: "Treatment Plan", prompt: "Create a complete treatment plan. Diagnosis: " },
    { icon: BookOpen, label: "Generate SOAP Note", prompt: "Generate a SOAP note for this patient: " },
    { icon: ShieldAlert, label: "Check Allergies", prompt: "Check possible allergies for these medicines: " },
  ];

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'bn-BD';

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setInputValue(prev => prev + finalTranscript);
          }
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      } else {
        setIsVoiceSupported(false);
      }
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {}
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, prescriptionDraft]);

  // Real AI send
  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Handle report scan
    if (text === "[SCAN_REPORT]") {
      fileInputRef.current?.click();
      return;
    }

    let displayUserText = text;
    let actualSystemText = text;

    if (text === "[SUMMARIZE_HISTORY]") {
      displayUserText = "Please summarize the patient's past medical history.";
      
      const pid = rxData?.patientId;
      const tests = pid ? testReports[pid] || [] : [];
      const pastRxs = pid ? patientPrescriptions[pid] || [] : [];
      
      if (tests.length === 0 && pastRxs.length === 0) {
        toast.info("No past medical history found for this patient.");
        return;
      }

      actualSystemText = `Summarize this patient's medical history (Patient ID: ${pid}). 
      Past Prescriptions: ${JSON.stringify(pastRxs)}. 
      Past Test Reports: ${JSON.stringify(tests)}.
      Please provide a concise summary, highlighting chronic conditions, ongoing medications, and important notes. Output in Markdown format.`;
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: displayUserText };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    const botId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: botId, role: "ai", content: "" }]);

    try {
      // Build dynamic context for EVERY prompt so the AI always knows the patient details
      const pid = rxData?.patientId;
      const currentTests = pid ? testReports[pid] || [] : [];
      const currentPastRxs = pid ? patientPrescriptions[pid] || [] : [];
      
      const dynamicContext = pid ? `\n\n--- CURRENT PATIENT CONTEXT ---\nPatient ID: ${pid}\nName: ${rxData?.patientName}\nChief Complaint: ${rxData?.chiefComplaint}\nDiagnosis: ${rxData?.diagnosis}\nPast Prescriptions: ${JSON.stringify(currentPastRxs)}\nPast Test Reports: ${JSON.stringify(currentTests)}\n---------------------------------` : '';

      const allMessages = [
        { role: "system", content: DOCTOR_SYSTEM_PROMPT + dynamicContext },
        ...messages.filter(m => m.content).map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content || "",
        })),
        { role: "user", content: actualSystemText },
      ];

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!response.ok) throw new Error("AI request failed");

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

      // Parse prescription draft (resilient regex)
      const prescMatch = fullContent.match(/```json[^\n]*\n?([\s\S]*?)```/);
      if (prescMatch) {
        try {
          const draft = JSON.parse(prescMatch[1].trim());
          setPrescriptionDraft(draft);
        } catch (err) {
          console.error("Failed to parse AI JSON:", err);
        }
      }
    } catch (error: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === botId
            ? { ...m, content: `⚠️ Error: ${error.message}\n\nPlease ensure your API Key is configured in .env.local` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Report upload handler
  const handleReportUpload = async (file: File) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `📎 Report uploaded: **${file.name}** - Analyze, identify issues, and suggest medicines.`,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const botId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botId, role: "ai", content: "🔍 Analyzing report..." }]);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ai/analyze-report", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Report analysis failed");

      const data = await response.json();
      const analysis = data.analysis || "Analysis could not be completed.";

      setMessages(prev =>
        prev.map(m => m.id === botId ? { ...m, content: analysis } : m)
      );

      // Check for prescription draft in report analysis
      const prescMatch = analysis.match(/```json[^\n]*\n?([\s\S]*?)```/);
      if (prescMatch) {
        try {
          setPrescriptionDraft(JSON.parse(prescMatch[1].trim()));
        } catch (err) {
          console.error("Failed to parse report AI JSON:", err);
        }
      }
    } catch (error: any) {
      setMessages(prev =>
        prev.map(m => m.id === botId ? { ...m, content: `⚠️ Report analysis error: ${error.message}` } : m)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: string) => {
    if (action === "Apply to Prescription") {
      toast.success("Applied to prescription!");
    } else if (action === "Copy") {
      navigator.clipboard?.writeText(messages[messages.length - 1]?.content || "");
      toast.success("Copied to clipboard!");
    }
  };

  const handleApplyPrescription = () => {
    if (prescriptionDraft) {
      // Write directly into prescription editor fields
      const updates: Record<string, any> = {};

      if (prescriptionDraft.chiefComplaint) {
        updates.chiefComplaint = prescriptionDraft.chiefComplaint;
      }
      if (prescriptionDraft.diagnosis) {
        updates.diagnosis = prescriptionDraft.diagnosis;
      }
      if (prescriptionDraft.advice) {
        updates.advice = prescriptionDraft.advice;
      }
      if (prescriptionDraft.followUp) {
        updates.followUp = prescriptionDraft.followUp;
      }
      if (prescriptionDraft.investigations && prescriptionDraft.investigations.length > 0) {
        updates.investigations = prescriptionDraft.investigations.join(", ");
        updates.investigationsList = prescriptionDraft.investigations;
      }

      // Apply text fields
      if (Object.keys(updates).length > 0) {
        updateRx(updates);
      }

      // Add medicines one by one
      if (prescriptionDraft.medicines && prescriptionDraft.medicines.length > 0) {
        prescriptionDraft.medicines.forEach((med, idx) => {
          // Parse dosage like "1+0+1" into M/N/E
          const dosageParts = (med.dosage || "").split("+").map(s => s.trim());
          addMedicine({
            id: `ai-${Date.now()}-${idx}`,
            name: `${med.name} ${med.strength || ""}`.trim(),
            type: "Tab",
            dosageM: dosageParts[0] || "0",
            dosageN: dosageParts[1] || "0",
            dosageE: dosageParts[2] || "0",
            frequency: med.frequency || "",
            duration: med.duration || "",
            notes: `${med.generic || ""} - ${med.instructions || ""}`.trim(),
          });
        });
      }

      toast.success("Applied to prescription! You can now edit the fields.");
      setPrescriptionDraft(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent rounded-[16px] xl:rounded-none border border-[#E5E7EB] xl:border-none shadow-[0_4px_16px_rgba(15,23,42,0.08)] xl:shadow-none overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-5 py-3.5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full    flex items-center justify-center shadow-sm">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-slate-800 leading-tight">Oxpecker AI Copilot</h3>
            <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6DDA6E] inline-block animate-pulse"></span>
              Doctor's Assistant
            </p>
          </div>
        </div>
        <button
          onClick={() => { setMessages([]); setPrescriptionDraft(null); }}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
          title="New conversation"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Hidden file input */}
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

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-4 bg-transparent min-h-0">
        {messages.length === 0 ? (
          /* Default State - Quick Actions */
          <div className="flex flex-col items-center justify-center h-full text-center mt-4">
            <div className="w-14 h-14    rounded-2xl shadow-md flex items-center justify-center mb-4 relative">
              <Bot size={28} className="text-white" />
              <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-[#6DDA6E] rounded-full border-2 border-white"></div>
            </div>
            <h4 className="font-black text-slate-800 text-[18px] mb-1">How can I assist you?</h4>
            <p className="text-[13px] text-slate-500 mb-6 max-w-[260px]">Prescriptions, report analysis, medicine suggestions - all in one place.</p>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {defaultChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (chip.prompt === "[SCAN_REPORT]") {
                      fileInputRef.current?.click();
                    } else {
                      setInputValue(chip.prompt);
                    }
                  }}
                  className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm transition-all px-3 py-2 rounded-xl text-[12px] font-bold"
                >
                  <chip.icon size={14} />
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation */
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {msg.role === "user" ? (
                  <div className="bg-blue-600 text-white px-4 py-2.5 rounded-[16px] rounded-tr-[4px] max-w-[85%] text-[14px] shadow-sm whitespace-pre-wrap">
                    {msg.content?.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={i}>{part.slice(2, -2)}</strong>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </div>
                ) : (
                  <div className="w-full bg-white border border-slate-200 rounded-[14px] shadow-sm overflow-hidden">
                    {!msg.content && (
                      <div className="px-4 py-4 flex items-center gap-2 text-slate-400">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                          ))}
                        </div>
                        <span className="text-[13px]">Thinking...</span>
                      </div>
                    )}
                    {msg.content && (
                      <div className="px-4 py-3 border-b border-slate-100 last:border-0">
                        {(() => {
                          const structuredBlocks = parseStructuredBlocks(msg.content);
                          const cleanedText = cleanContent(msg.content);
                          return (
                            <div className="space-y-3">
                              {cleanedText && (
                                <div className="prose prose-slate max-w-none text-[14px] text-slate-700 leading-relaxed prose-p:mb-2 prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:text-slate-800">
                                  <ReactMarkdown>{cleanedText}</ReactMarkdown>
                                </div>
                              )}
                              {structuredBlocks.map((block, idx) => (
                                <div key={idx} className="mt-2 w-full">
                                  {block.type === 'doctor_recommendation' && <DoctorRecommendationLoader data={block.data} />}
                                  {block.type === 'hospital_recommendation' && <HospitalRecommendationLoader data={block.data} />}
                                  {block.type === 'medicine_info' && <MedicineRecommendationLoader data={block.data} />}
                                  {block.type === 'emergency_alert' && <EmergencyAlert alert={block.data} />}
                                  {block.type === 'nutrition_analysis' && <NutritionCard data={block.data} />}
                                  {block.type === 'prescription_analysis' && <PrescriptionCard data={block.data} />}
                                  {block.type === 'report_analysis' && <ReportCard data={block.data} />}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Prescription Draft Card */}
            {prescriptionDraft && (
              <div className="w-full bg-white border-2 border-blue-200 rounded-[14px] shadow-md overflow-hidden">
                <div className="   px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Clipboard size={16} />
                    <span className="font-bold text-[14px]">Prescription Draft</span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5 text-[13px]">
                  {prescriptionDraft.chiefComplaint && (
                    <div>
                      <p className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Chief Complaint</p>
                      <p className="text-slate-700 mt-0.5">{prescriptionDraft.chiefComplaint}</p>
                    </div>
                  )}
                  {prescriptionDraft.diagnosis && (
                    <div>
                      <p className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Diagnosis</p>
                      <p className="text-slate-800 font-semibold mt-0.5">{prescriptionDraft.diagnosis}</p>
                    </div>
                  )}
                  {prescriptionDraft.medicines && prescriptionDraft.medicines.length > 0 && (
                    <div>
                      <p className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mb-1.5">Rx ({prescriptionDraft.medicines.length})</p>
                      {prescriptionDraft.medicines.map((med, i) => (
                        <div key={i} className="bg-slate-50 rounded-lg p-2 mb-1 border border-slate-100">
                          <p className="font-bold text-slate-800 text-[13px]">{med.name} <span className="font-normal text-slate-400">{med.strength}</span></p>
                          <p className="text-[11px] text-slate-400 italic">{med.generic}</p>
                          <p className="text-[12px] text-blue-600 mt-0.5">{med.dosage} • {med.frequency} • {med.duration} • {med.instructions}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {prescriptionDraft.investigations && prescriptionDraft.investigations.length > 0 && (
                    <div>
                      <p className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Investigations</p>
                      <p className="text-slate-700 mt-0.5">{prescriptionDraft.investigations.join(", ")}</p>
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

                <div className="px-4 pb-3 flex gap-2">
                  <button
                    onClick={handleApplyPrescription}
                    className="flex-1 h-[36px] bg-[#6DDA6E] text-white text-[12px] font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#5bc95c] transition-colors shadow-md shadow-[#6DDA6E]/20"
                  >
                    <Check size={14} /> Apply to Prescription
                  </button>
                  <button
                    onClick={() => handleSend("Revise this prescription and suggest better medicines.")}
                    className="h-[36px] px-3 border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Revise
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 pb-8 xl:pb-4 bg-white border-t border-slate-200 mt-auto shrink-0 z-10 sticky bottom-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
        {/* Quick re-access buttons */}
        {messages.length > 0 && (
          <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 bg-sky-50 text-sky-600 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 hover:bg-sky-100 transition-colors">
              <Camera size={12} /> Scan Report
            </button>
            <button onClick={() => setInputValue("Write a prescription for: ")} className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 hover:bg-blue-100 transition-colors">
              <ClipboardList size={12} /> Prescription
            </button>
            <button onClick={() => setInputValue("Check drug interactions for: ")} className="flex items-center gap-1 bg-red-50 text-red-600 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 hover:bg-red-100 transition-colors">
              <AlertCircle size={12} /> Interactions
            </button>
            <button onClick={() => setInputValue("Suggest medicines for: ")} className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 hover:bg-emerald-100 transition-colors">
              <Pill size={12} /> Medicines
            </button>
          </div>
        )}

        <div className="relative flex items-center">
          {isVoiceSupported && (
            <button 
              onClick={toggleVoice}
              className={`absolute left-2 w-9 h-9 flex items-center justify-center rounded-full transition-all z-10 ${
                isListening 
                  ? "bg-rose-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse" 
                  : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
            placeholder="Ask Copilot (e.g. Write prescription...)"
            className={`w-full h-[48px] bg-slate-100/50 hover:bg-slate-100 focus:bg-white border border-slate-200/60 rounded-full py-2 ${isVoiceSupported ? 'pl-12' : 'pl-5'} pr-14 text-[14px] text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all placeholder:text-slate-400 font-medium shadow-sm`}
          />
          <button 
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm z-10"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
