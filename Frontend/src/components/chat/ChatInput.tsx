import { useState, useRef, useEffect } from "react";
import { Plus, Mic, Camera, ArrowRight, FileText, Activity, Image as ImageIcon, Pill, Apple, FileOutput, X, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeechToText, VoiceMicButton, VoiceWaveform } from "./VoiceInput";

export type ChatMode = {
  title: string;
  icon?: any;
  color?: string;
  bg?: string;
};

export function ChatInput({ 
  onSend, 
  onFileUpload,
  selectedMode, 
  onSelectMode 
}: { 
  onSend: (text: string) => void;
  onFileUpload?: (file: File, analysisType: string) => void;
  selectedMode?: ChatMode | null;
  onSelectMode?: (mode: ChatMode | null) => void;
}) {
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingAnalysisType, setPendingAnalysisType] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice input
  const { isListening, transcript, isSupported: voiceSupported, toggleListening, setTranscript } = useSpeechToText();

  // Sync voice transcript to textarea
  useEffect(() => {
    if (transcript) {
      setText(prev => prev + transcript);
      setTranscript("");
    }
  }, [transcript, setTranscript]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [text, selectedMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (text.trim() || selectedMode) {
      onSend(text); // we can pass text and mode, or let page.tsx handle mode
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const menuItems = [
    { icon: FileText, title: "Scan Prescription", desc: "Extract medicine & instructions", color: "text-blue-600", bg: "bg-blue-100", analysisType: "prescription" },
    { icon: FileOutput, title: "Upload Medical Report", desc: "Analyze blood test, MRI, etc.", color: "text-purple-600", bg: "bg-purple-100", analysisType: "report" },
    { icon: Activity, title: "Upload Lab Result", desc: "Check parameters against normal", color: "text-rose-600", bg: "bg-rose-100", analysisType: "report" },
    { icon: ImageIcon, title: "Upload X-Ray / Image", desc: "Visual AI analysis", color: "text-amber-600", bg: "bg-amber-100", analysisType: "image" },
    { icon: Pill, title: "Compare Medicines", desc: "Check alternatives & side-effects", color: "text-teal-600", bg: "bg-teal-100" },
    { icon: Apple, title: "Food Calorie Scanner", desc: "Upload food image for nutrition", color: "text-green-600", bg: "bg-green-100", analysisType: "food" },
    { icon: Paperclip, title: "Upload from Device", desc: "Select photo, report or document", color: "text-slate-700", bg: "bg-slate-100", isAction: true },
  ];

  return (
    <div className="sticky bottom-0 w-full pb-4 sm:pb-6 pt-2 px-3 sm:px-4 md:px-8     z-40">
      <div className="max-w-[900px] mx-auto relative flex flex-col items-center">
        
        {/* Floating Plus Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute bottom-full mb-3 left-0 w-[240px] bg-white/80 backdrop-blur-3xl border border-slate-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] rounded-[20px] p-1.5 z-50 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col">
                {menuItems.map((item, idx) => (
                  <div key={idx} className="w-full">
                    {item.isAction && (
                      <div className="my-1 mx-2 border-t border-slate-200"></div>
                    )}
                    <button
                      className="group flex items-center gap-3 w-full p-2 rounded-2xl hover:bg-slate-100/50 transition-all text-left"
                      onClick={() => {
                        if (item.title === "Upload from Device") {
                          setPendingAnalysisType('image');
                          fileInputRef.current?.click();
                        } else if (item.analysisType) {
                          setPendingAnalysisType(item.analysisType);
                          fileInputRef.current?.click();
                        } else {
                          if (onSelectMode) onSelectMode(item);
                        }
                        setMenuOpen(false);
                      }}
                    >
                      <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center ${item.color} shrink-0 shadow-sm border border-black/5 group-hover:scale-105 transition-transform`}>
                        <item.icon size={16} strokeWidth={2.5} />
                      </div>
                      <div className="font-[800] text-[13px] text-slate-700 group-hover:text-slate-900 transition-colors">
                        {item.title}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && onFileUpload) {
              onFileUpload(file, pendingAnalysisType || 'image');
              setPendingAnalysisType(null);
            } else if (file) {
              onSend(`[Uploaded File: ${file.name}]`);
            }
            // Reset input
            e.target.value = '';
          }} 
          accept="image/*,.pdf,.doc,.docx"
        />

        {/* Input Container */}
        <div className="w-full flex items-end gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-xl rounded-xl p-1 sm:p-1.5 min-h-[48px] sm:min-h-[52px] border border-slate-200/80 shadow-sm focus-within:shadow-[0_8px_30px_rgba(0,61,155,0.08)] focus-within:border-primary/20 focus-within:bg-white transition-all duration-300">
          
          {/* Left Action (Plus Button) */}
          <button 
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] shrink-0 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-transparent transition-all duration-300 active:scale-95 mb-0.5 ml-0.5"
          >
            <Plus size={22} className={`transition-transform duration-300 ease-out ${menuOpen ? 'rotate-[135deg] text-primary' : ''}`} />
          </button>

          {/* Textarea Wrapper */}
          <div className="flex-1 flex flex-col justify-center mb-[2px] mt-[2px]">
            {/* Selected Mode Chip */}
            <AnimatePresence>
              {selectedMode && (
                <motion.div 
                  initial={{ opacity: 0, y: 5, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 6 }}
                  exit={{ opacity: 0, y: 5, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-100/80 rounded-[10px] w-fit border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2">
                      {selectedMode.icon && (
                        <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center ${selectedMode.bg} ${selectedMode.color} shadow-sm border border-white/50`}>
                          <selectedMode.icon size={12} strokeWidth={3} />
                        </div>
                      )}
                      <span className="text-[12px] font-bold text-slate-700">{selectedMode.title}</span>
                    </div>
                    <button 
                      onClick={() => onSelectMode?.(null)} 
                      className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-0.5 rounded-full transition-colors ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={selectedMode ? `Add a message about ${selectedMode.title.toLowerCase()}...` : "Ask Oxpecker AI a health question..."}
              className="w-full max-h-[220px] bg-transparent resize-none outline-none text-[15px] sm:text-[16px] text-slate-800 placeholder:text-slate-400 py-2 px-2 sm:px-3 scrollbar-thin self-center leading-tight"
              rows={1}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 shrink-0 mb-0.5 pr-0.5">
            {/* Voice Waveform (visible when listening) */}
            <VoiceWaveform isActive={isListening} />
            
            {/* Mic Button */}
            <div className="hidden sm:flex">
              <VoiceMicButton isListening={isListening} onToggle={toggleListening} isSupported={voiceSupported} />
            </div>
            <button 
              type="button"
              onClick={() => {
                setPendingAnalysisType('image');
                fileInputRef.current?.click();
              }}
              className="hidden sm:flex w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-full items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <Camera size={20} />
            </button>
            <button 
              onClick={handleSend}
              disabled={!text.trim() && !selectedMode}
              className={`w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                (text.trim() || selectedMode) ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,61,155,0.25)] hover:bg-primary/90 hover:shadow-[0_6px_16px_rgba(0,61,155,0.3)] hover:scale-105 active:scale-95" : "bg-slate-100/80 text-slate-400"
              }`}
            >
              <ArrowRight size={20} className={(text.trim() || selectedMode) ? "ml-0.5" : ""} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center mt-2.5 pb-1 w-full">
          <p className="text-[11px] sm:text-[12px] text-slate-400 font-medium">
            AI can make mistakes. Verify important medical information.
          </p>
        </div>
      </div>
    </div>
  );
}
