"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  GripVertical, 
  Mic, 
  MicOff,
  Sparkles, 
  ChevronDown, 
  Pill, 
  Check, 
  Loader2,
  AlertCircle,
  Tag
} from "lucide-react";
import { usePrescription } from "@/context/PrescriptionContext";
import { toast } from "sonner";

interface MedicineSuggestion {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  price: number;
  packageContainer?: string;
  formattedName: string;
  category: string;
}

export function MedicineBuilder() {
  const { data, updateData } = usePrescription();
  const medicines = data.medicines;
  
  const setMedicines = (newMedicines: typeof data.medicines) => {
    updateData({ medicines: newMedicines });
  };

  // State for active autocomplete
  const [activeMedId, setActiveMedId] = useState<number | string | null>(null);
  const [suggestions, setSuggestions] = useState<MedicineSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Global bottom search input
  const [globalSearch, setGlobalSearch] = useState("");
  const [isGlobalActive, setIsGlobalActive] = useState(false);
  const [globalSuggestions, setGlobalSuggestions] = useState<MedicineSuggestion[]>([]);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [globalHighlightedIndex, setGlobalHighlightedIndex] = useState(0);

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [voiceTargetId, setVoiceTargetId] = useState<number | string | "global">("global");

  // Debounce search timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const globalDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fetch suggestions helper
  const fetchSuggestions = async (query: string, setResults: (items: MedicineSuggestion[]) => void, setLoading: (loading: boolean) => void) => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(query.trim())}&limit=10`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      setResults(json.results || []);
    } catch (err) {
      console.error("Error fetching medicine suggestions:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle row input change with live suggestions
  const handleNameChange = (id: number | string, val: string) => {
    updateMedicine(id, "name", val);
    setActiveMedId(id);
    setHighlightedIndex(0);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val, setSuggestions, setIsLoadingSuggestions);
    }, 120);
  };

  // Handle global search input change
  const handleGlobalSearchChange = (val: string) => {
    setGlobalSearch(val);
    setIsGlobalActive(true);
    setGlobalHighlightedIndex(0);

    if (globalDebounceRef.current) clearTimeout(globalDebounceRef.current);
    globalDebounceRef.current = setTimeout(() => {
      fetchSuggestions(val, setGlobalSuggestions, setIsLoadingGlobal);
    }, 120);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveMedId(null);
        setIsGlobalActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Smart defaults based on category/dosage form
  const getSmartDefaults = (med: MedicineSuggestion) => {
    const cat = med.category || "";
    const form = (med.dosageForm || "").toLowerCase();

    let dosageM = "1";
    let dosageN = "0";
    let dosageE = "1";
    let frequency = "Twice a day";
    let duration = "7 Days";
    let notes = "After meal";
    let type = "Tablet";

    if (form.includes("capsule")) type = "Capsule";
    else if (form.includes("syrup") || form.includes("suspension")) type = "Syrup";
    else if (form.includes("injection") || form.includes("infusion")) type = "Injection";
    else if (form.includes("drop")) type = "Drops";
    else if (form.includes("ointment") || form.includes("cream")) type = "Ointment";

    if (cat === "Gastric") {
      dosageM = "1";
      dosageN = "0";
      dosageE = "1";
      frequency = "Twice a day";
      duration = "14 Days";
      notes = "Before meal";
    } else if (cat === "Painkiller") {
      dosageM = "1";
      dosageN = "1";
      dosageE = "1";
      frequency = "Thrice a day";
      duration = "3 Days";
      notes = "After meal";
    } else if (cat === "Antibiotic") {
      dosageM = "1";
      dosageN = "0";
      dosageE = "1";
      frequency = "Twice a day";
      duration = "7 Days";
      notes = "After meal";
    } else if (cat === "Allergy") {
      dosageM = "0";
      dosageN = "0";
      dosageE = "1";
      frequency = "Daily";
      duration = "7 Days";
      notes = "At bedtime";
    } else if (cat === "Cardiac") {
      dosageM = "1";
      dosageN = "0";
      dosageE = "0";
      frequency = "Daily";
      duration = "Continue";
      notes = "Morning";
    }

    return { dosageM, dosageN, dosageE, frequency, duration, notes, type };
  };

  // Select a suggestion for a specific row
  const selectSuggestion = (id: number | string, item: MedicineSuggestion) => {
    const smart = getSmartDefaults(item);
    setMedicines(
      medicines.map((m) =>
        m.id === id
          ? {
              ...m,
              name: item.formattedName,
              type: smart.type,
              dosageM: smart.dosageM,
              dosageN: smart.dosageN,
              dosageE: smart.dosageE,
              frequency: smart.frequency,
              duration: smart.duration,
              notes: smart.notes,
            }
          : m
      )
    );
    setActiveMedId(null);
    setSuggestions([]);
  };

  // Add new medicine from suggestion or global input
  const addMedicineFromSuggestion = (item: MedicineSuggestion) => {
    const smart = getSmartDefaults(item);
    setMedicines([
      ...medicines,
      {
        id: Date.now(),
        name: item.formattedName,
        type: smart.type,
        dosageM: smart.dosageM,
        dosageN: smart.dosageN,
        dosageE: smart.dosageE,
        frequency: smart.frequency,
        duration: smart.duration,
        notes: smart.notes,
      },
    ]);
    setGlobalSearch("");
    setIsGlobalActive(false);
    setGlobalSuggestions([]);
  };

  const addEmptyMedicine = () => {
    const newId = Date.now();
    setMedicines([
      ...medicines,
      {
        id: newId,
        name: "",
        type: "Tablet",
        dosageM: "1",
        dosageN: "0",
        dosageE: "1",
        frequency: "Daily",
        duration: "5 Days",
        notes: "After meal",
      },
    ]);
    setActiveMedId(newId);
  };

  // AI Suggestions based on clinical diagnosis & symptoms
  const addAISuggestion = () => {
    const complaint = (data.chiefComplaint || "").toLowerCase();
    const diag = (data.diagnosis || "").toLowerCase();
    const combined = `${complaint} ${diag}`;

    let aiMeds = [];

    if (combined.includes("fever") || combined.includes("body ache") || combined.includes("pain") || combined.includes("জ্বর") || combined.includes("ব্যথা")) {
      aiMeds.push(
        {
          id: Date.now(),
          name: "Tab. Napa Extra 500 mg+65 mg",
          type: "Tablet",
          dosageM: "1",
          dosageN: "1",
          dosageE: "1",
          frequency: "Thrice a day",
          duration: "3 Days",
          notes: "After meal",
        },
        {
          id: Date.now() + 1,
          name: "Cap. Seclo 20 mg",
          type: "Capsule",
          dosageM: "1",
          dosageN: "0",
          dosageE: "1",
          frequency: "Twice a day",
          duration: "14 Days",
          notes: "Before meal",
        }
      );
    } else if (combined.includes("gastric") || combined.includes("acidity") || combined.includes("ulcer") || combined.includes("গ্যাস") || combined.includes("বমি")) {
      aiMeds.push(
        {
          id: Date.now(),
          name: "Cap. Maxpro 20 mg",
          type: "Capsule",
          dosageM: "1",
          dosageN: "0",
          dosageE: "1",
          frequency: "Twice a day",
          duration: "14 Days",
          notes: "Before meal",
        },
        {
          id: Date.now() + 1,
          name: "Tab. Omidon 10 mg",
          type: "Tablet",
          dosageM: "1",
          dosageN: "1",
          dosageE: "1",
          frequency: "Thrice a day",
          duration: "5 Days",
          notes: "Before meal",
        }
      );
    } else if (combined.includes("cough") || combined.includes("cold") || combined.includes("allergy") || combined.includes("কাশি") || combined.includes("ঠাণ্ডা")) {
      aiMeds.push(
        {
          id: Date.now(),
          name: "Tab. Fexo 120 mg",
          type: "Tablet",
          dosageM: "0",
          dosageN: "0",
          dosageE: "1",
          frequency: "Daily",
          duration: "7 Days",
          notes: "At bedtime",
        },
        {
          id: Date.now() + 1,
          name: "Tab. Montene 10 mg",
          type: "Tablet",
          dosageM: "0",
          dosageN: "0",
          dosageE: "1",
          frequency: "Daily",
          duration: "14 Days",
          notes: "At bedtime",
        }
      );
    } else {
      // Default common prescription set
      aiMeds.push(
        {
          id: Date.now(),
          name: "Tab. Napa Extend 665 mg",
          type: "Tablet",
          dosageM: "1",
          dosageN: "0",
          dosageE: "1",
          frequency: "Twice a day",
          duration: "5 Days",
          notes: "After meal",
        },
        {
          id: Date.now() + 1,
          name: "Cap. Sergel 20 mg",
          type: "Capsule",
          dosageM: "1",
          dosageN: "0",
          dosageE: "1",
          frequency: "Twice a day",
          duration: "14 Days",
          notes: "Before meal",
        }
      );
    }

    setMedicines([...medicines, ...aiMeds]);
    toast.success("✨ AI clinical medicine recommendations added!");
  };

  const removeMedicine = (id: number | string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: number | string, field: string, value: string) => {
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  // Keyboard navigation for row suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number | string) => {
    if (!suggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        setActiveMedId(null);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (suggestions[highlightedIndex]) {
        selectSuggestion(id, suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setActiveMedId(null);
    }
  };

  // Keyboard navigation for global search
  const handleGlobalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (globalSuggestions && globalSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setGlobalHighlightedIndex((prev) => (prev < globalSuggestions.length - 1 ? prev + 1 : prev));
        return;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setGlobalHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        return;
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (globalSuggestions[globalHighlightedIndex]) {
          addMedicineFromSuggestion(globalSuggestions[globalHighlightedIndex]);
          return;
        }
      } else if (e.key === "Escape") {
        setIsGlobalActive(false);
        return;
      }
    }

    if (e.key === "Enter" && globalSearch.trim() !== "") {
      setMedicines([
        ...medicines,
        {
          id: Date.now(),
          name: globalSearch.trim(),
          type: "Tablet",
          dosageM: "1",
          dosageN: "0",
          dosageE: "1",
          frequency: "Daily",
          duration: "5 Days",
          notes: "After meal",
        },
      ]);
      setGlobalSearch("");
      setIsGlobalActive(false);
    }
  };

  // Voice Input Handler
  const toggleVoiceInput = (targetId: number | string | "global" = "global") => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input is not supported on this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      setVoiceTargetId(targetId);
      toast.info("🎤 Listening... Speak medicine name (e.g., 'Napa Extra', 'Seclo 20')");

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (!transcript) return;

        toast.loading(`Processing voice: "${transcript}"...`, { id: "voice-search" });

        try {
          const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(transcript)}&limit=5`);
          const json = await res.json();
          toast.dismiss("voice-search");

          if (json.results && json.results.length > 0) {
            const topMed = json.results[0];
            if (targetId === "global") {
              addMedicineFromSuggestion(topMed);
            } else {
              selectSuggestion(targetId, topMed);
            }
            toast.success(`✅ Added: ${topMed.formattedName}`);
          } else {
            // Manual fallback
            if (targetId === "global") {
              setMedicines([
                ...medicines,
                {
                  id: Date.now(),
                  name: transcript,
                  type: "Tablet",
                  dosageM: "1",
                  dosageN: "0",
                  dosageE: "1",
                  frequency: "Daily",
                  duration: "5 Days",
                  notes: "After meal",
                },
              ]);
            } else {
              updateMedicine(targetId, "name", transcript);
            }
            toast.info(`Added: ${transcript}`);
          }
        } catch (err) {
          toast.dismiss("voice-search");
          if (targetId === "global") {
            setMedicines([
              ...medicines,
              {
                id: Date.now(),
                name: transcript,
                type: "Tablet",
                dosageM: "1",
                dosageN: "0",
                dosageE: "1",
                frequency: "Daily",
                duration: "5 Days",
                notes: "After meal",
              },
            ]);
          } else {
            updateMedicine(targetId, "name", transcript);
          }
        }
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        if (e.error !== "no-speech") {
          toast.error(`Voice error: ${e.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      console.error("Speech recognition error:", e);
      toast.error("Could not start microphone.");
    }
  };

  // Helper badge color by dosage form
  const getBadgeStyle = (form: string) => {
    const f = (form || "").toLowerCase();
    if (f.includes("tablet")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (f.includes("capsule")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (f.includes("syrup") || f.includes("suspension")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (f.includes("injection") || f.includes("infusion")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (f.includes("drop")) return "bg-cyan-50 text-cyan-700 border-cyan-200";
    if (f.includes("cream") || f.includes("ointment")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="flex flex-col gap-4" ref={dropdownRef}>
      {/* Medicine Toolbar */}
      <div className="bg-white border border-slate-200 rounded-[14px] p-2 sm:px-4 sm:py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[15px] sm:text-[16px] text-[#111827] px-2 sm:px-0">Rx Medicines</h3>
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            21,700+ Medicines Live
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            type="button"
            title="Voice Input"
            onClick={() => toggleVoiceInput("global")}
            className={`flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-all rounded-[10px] w-[36px] h-[36px] sm:w-auto sm:px-3 sm:py-1.5 active:scale-95 border ${
              isListening && voiceTargetId === "global"
                ? "bg-red-500 text-white border-red-600 animate-pulse shadow-md shadow-red-500/20"
                : "text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200"
            }`}
          >
            {isListening && voiceTargetId === "global" ? (
              <>
                <MicOff size={16} className="text-white" />
                <span className="hidden sm:inline">Listening...</span>
              </>
            ) : (
              <>
                <Mic size={16} /> 
                <span className="hidden sm:inline">Voice Input</span>
              </>
            )}
          </button>
          
          <button 
            type="button"
            title="AI Suggestion"
            onClick={addAISuggestion} 
            className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 w-[36px] h-[36px] sm:w-auto sm:px-3 sm:py-1.5 rounded-[10px] transition-all active:scale-95 shadow-sm"
          >
            <Sparkles size={16} className="text-purple-600" /> 
            <span className="hidden sm:inline">AI Suggestion</span>
          </button>
          
          <button 
            type="button"
            title="Add Medicine"
            onClick={addEmptyMedicine} 
            className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-white bg-[#2F80ED] hover:bg-[#256bbd] w-[36px] h-[36px] sm:w-auto sm:px-4 sm:py-1.5 rounded-[10px] transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} /> 
            <span className="hidden sm:inline">Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Medicine List */}
      <div className="flex flex-col gap-3">
        {medicines.map((med, index) => (
          <div 
            key={med.id} 
            className="relative bg-white border border-slate-200 hover:border-slate-300 rounded-[14px] p-4 md:p-3 shadow-sm transition-all group flex flex-col md:flex-row md:items-center gap-4 md:gap-3"
          >
            {/* Grip / Index Badge */}
            <div className="hidden md:flex items-center gap-1 text-slate-300 group-hover:text-slate-500 shrink-0">
              <span className="text-[11px] font-bold w-4 text-center">{index + 1}.</span>
            </div>
            
            {/* Medicine Name with Live Autocomplete */}
            <div className="w-full md:w-[290px] pr-8 md:pr-0 shrink-0 relative">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1 flex items-center justify-between">
                <span>Medicine Name</span>
                {med.type && (
                  <span className="text-[9px] text-[#2F80ED] font-semibold normal-case">
                    {med.type}
                  </span>
                )}
              </label>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={med.name} 
                  onChange={(e) => handleNameChange(med.id, e.target.value)}
                  onFocus={() => {
                    setActiveMedId(med.id);
                    if (med.name) {
                      fetchSuggestions(med.name, setSuggestions, setIsLoadingSuggestions);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, med.id)}
                  placeholder="Type brand or generic name..."
                  className="w-full h-[38px] md:h-[34px] pl-8 pr-8 bg-slate-50 border border-slate-200 focus:border-[#2F80ED] focus:bg-white rounded-[8px] text-[13px] font-semibold text-slate-800 focus:outline-none transition-all"
                  autoComplete="off"
                />

                {/* Micro voice icon on field */}
                <button
                  type="button"
                  onClick={() => toggleVoiceInput(med.id)}
                  title="Voice input for this medicine"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                    isListening && voiceTargetId === med.id
                      ? "text-red-500 animate-pulse bg-red-50"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Mic size={14} />
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {activeMedId === med.id && (suggestions.length > 0 || isLoadingSuggestions) && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-[280px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  {isLoadingSuggestions ? (
                    <div className="p-3 text-center text-slate-400 flex items-center justify-center gap-2 text-xs font-medium">
                      <Loader2 size={14} className="animate-spin text-[#2F80ED]" />
                      Searching 21,700+ medicines...
                    </div>
                  ) : (
                    <>
                      {suggestions.map((item, idx) => (
                        <div
                          key={item.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectSuggestion(med.id, item);
                          }}
                          className={`p-2.5 px-3 cursor-pointer flex flex-col gap-1 transition-colors ${
                            idx === highlightedIndex ? "bg-blue-50/70" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getBadgeStyle(item.dosageForm)}`}>
                                {item.dosageForm}
                              </span>
                              <span className="font-bold text-[13px] text-slate-900">
                                {item.brandName}
                              </span>
                              {item.strength && (
                                <span className="text-[12px] font-semibold text-[#2F80ED] bg-blue-50 px-1.5 py-0.2 rounded">
                                  {item.strength}
                                </span>
                              )}
                            </div>
                            {item.price > 0 && (
                              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                ৳ {item.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-medium text-slate-600 truncate max-w-[180px]">
                              {item.genericName}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                              {item.manufacturer.replace(" Ltd.", "").replace(" Pharmaceuticals", "")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Dosage (M-N-E) + Frequency + Duration + Instructions */}
            <div className="grid grid-cols-2 md:flex md:flex-nowrap gap-2.5 md:gap-3 flex-1 items-start md:items-center w-full mt-1 md:mt-0">
              
              {/* Dosage (M-N-E) */}
              <div className="col-span-2 sm:col-span-1 md:w-[125px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-[#2F80ED] tracking-wider mb-1 block text-left">
                  Dosage (M-N-E)
                </label>
                <div className="flex items-center gap-1 text-[#2F80ED]/40 text-sm font-bold w-full">
                  <button 
                    type="button"
                    onClick={() => updateMedicine(med.id, 'dosageM', med.dosageM === '0' ? '1' : med.dosageM === '1' ? '2' : '0')}
                    className={`flex-1 md:w-8 h-[34px] md:h-[32px] rounded-[6px] text-[13px] font-bold text-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] focus:outline-none border ${
                      med.dosageM === '0' 
                        ? 'bg-[#2F80ED]/5 border-[#2F80ED]/20 text-[#2F80ED] hover:bg-[#2F80ED]/15' 
                        : 'bg-[#2F80ED] border-[#2F80ED] text-white shadow-sm shadow-[#2F80ED]/30'
                    }`}
                  >
                    {med.dosageM || '0'}
                  </button>
                  <span>+</span>
                  <button 
                    type="button"
                    onClick={() => updateMedicine(med.id, 'dosageN', med.dosageN === '0' ? '1' : med.dosageN === '1' ? '2' : '0')}
                    className={`flex-1 md:w-8 h-[34px] md:h-[32px] rounded-[6px] text-[13px] font-bold text-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] focus:outline-none border ${
                      med.dosageN === '0' 
                        ? 'bg-[#2F80ED]/5 border-[#2F80ED]/20 text-[#2F80ED] hover:bg-[#2F80ED]/15' 
                        : 'bg-[#2F80ED] border-[#2F80ED] text-white shadow-sm shadow-[#2F80ED]/30'
                    }`}
                  >
                    {med.dosageN || '0'}
                  </button>
                  <span>+</span>
                  <button 
                    type="button"
                    onClick={() => updateMedicine(med.id, 'dosageE', med.dosageE === '0' ? '1' : med.dosageE === '1' ? '2' : '0')}
                    className={`flex-1 md:w-8 h-[34px] md:h-[32px] rounded-[6px] text-[13px] font-bold text-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] focus:outline-none border ${
                      med.dosageE === '0' 
                        ? 'bg-[#2F80ED]/5 border-[#2F80ED]/20 text-[#2F80ED] hover:bg-[#2F80ED]/15' 
                        : 'bg-[#2F80ED] border-[#2F80ED] text-white shadow-sm shadow-[#2F80ED]/30'
                    }`}
                  >
                    {med.dosageE || '0'}
                  </button>
                </div>
              </div>

              {/* Frequency */}
              <div className="col-span-1 md:w-[105px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-fuchsia-600 tracking-wider mb-1 block">Frequency</label>
                <div className="relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <select 
                    value={med.frequency} 
                    onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)} 
                    className="w-full h-[34px] md:h-[32px] pl-2 pr-5 bg-fuchsia-50/50 border border-fuchsia-200 rounded-[6px] text-[12px] font-bold text-fuchsia-700 focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20 appearance-none cursor-pointer transition-all truncate shadow-sm"
                  >
                    <option>Daily</option>
                    <option>Twice a day</option>
                    <option>Thrice a day</option>
                    <option>4 times a day</option>
                    <option>Alternate days</option>
                    <option>Weekly</option>
                    <option>SOS (As needed)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-fuchsia-500 pointer-events-none transition-transform" />
                </div>
              </div>

              {/* Duration */}
              <div className="col-span-1 md:w-[95px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-amber-600 tracking-wider mb-1 block">Duration</label>
                <div className="relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <select 
                    value={med.duration} 
                    onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)} 
                    className="w-full h-[34px] md:h-[32px] pl-2 pr-5 bg-amber-50/50 border border-amber-200 rounded-[6px] text-[12px] font-bold text-amber-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 appearance-none cursor-pointer transition-all truncate shadow-sm"
                  >
                    <option>1 Day</option>
                    <option>2 Days</option>
                    <option>3 Days</option>
                    <option>5 Days</option>
                    <option>7 Days</option>
                    <option>10 Days</option>
                    <option>14 Days</option>
                    <option>1 Month</option>
                    <option>2 Months</option>
                    <option>3 Months</option>
                    <option>Continue</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none transition-transform" />
                </div>
              </div>
              
              {/* Instructions / Notes */}
              <div className="col-span-2 md:w-[130px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-teal-600 tracking-wider mb-1 block">Instructions</label>
                <div className="relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <select 
                    value={med.notes} 
                    onChange={(e) => updateMedicine(med.id, 'notes', e.target.value)} 
                    className="w-full h-[34px] md:h-[32px] pl-2 pr-5 bg-teal-50/50 border border-teal-200 rounded-[6px] text-[12px] font-bold text-teal-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 appearance-none cursor-pointer transition-all truncate shadow-sm"
                  >
                    <option>After meal</option>
                    <option>Before meal</option>
                    <option>With meal</option>
                    <option>Empty stomach</option>
                    <option>At bedtime</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-teal-500 pointer-events-none transition-transform" />
                </div>
              </div>

            </div>

            {/* Remove button */}
            <button 
              type="button"
              onClick={() => removeMedicine(med.id)} 
              className="absolute top-4 right-4 md:static md:mt-4 md:w-[36px] md:h-[32px] shrink-0 text-slate-400 hover:text-red-500 transition-colors rounded-[8px] hover:bg-red-50 flex items-center justify-center p-1 md:p-0"
              title="Remove medicine"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Medicine Search Input with Live Autocomplete */}
      <div className="relative mt-2">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text"
          value={globalSearch}
          onChange={(e) => handleGlobalSearchChange(e.target.value)}
          onFocus={() => {
            setIsGlobalActive(true);
            if (globalSearch) {
              fetchSuggestions(globalSearch, setGlobalSuggestions, setIsLoadingGlobal);
            }
          }}
          onKeyDown={handleGlobalKeyDown}
          placeholder="Search and add medicine (e.g. Napa, Seclo, Ciprocin, Ace)..."
          className="w-full h-[48px] pl-11 pr-24 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#2F80ED] focus:bg-white rounded-[12px] text-[14px] font-semibold text-slate-800 outline-none transition-all shadow-sm"
          autoComplete="off"
        />

        {/* Action icons on global search */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => toggleVoiceInput("global")}
            title="Voice search"
            className={`p-1.5 rounded-lg border transition-all ${
              isListening && voiceTargetId === "global"
                ? "bg-red-500 text-white border-red-600 animate-pulse"
                : "text-slate-500 hover:text-slate-800 bg-white border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Mic size={15} />
          </button>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            Enter
          </kbd>
        </div>

        {/* Global Autocomplete Dropdown */}
        {isGlobalActive && (globalSuggestions.length > 0 || isLoadingGlobal) && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {isLoadingGlobal ? (
              <div className="p-3 text-center text-slate-400 flex items-center justify-center gap-2 text-xs font-medium">
                <Loader2 size={14} className="animate-spin text-[#2F80ED]" />
                Searching 21,700+ medicines...
              </div>
            ) : (
              <>
                <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500 flex items-center justify-between border-b border-slate-100">
                  <span>Suggested Medicines</span>
                  <span>Click or Press Enter to Add</span>
                </div>
                {globalSuggestions.map((item, idx) => (
                  <div
                    key={item.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addMedicineFromSuggestion(item);
                    }}
                    className={`p-3 px-4 cursor-pointer flex flex-col gap-1 transition-colors ${
                      idx === globalHighlightedIndex ? "bg-blue-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getBadgeStyle(item.dosageForm)}`}>
                          {item.dosageForm}
                        </span>
                        <span className="font-bold text-[14px] text-slate-900">
                          {item.brandName}
                        </span>
                        {item.strength && (
                          <span className="text-[12px] font-bold text-[#2F80ED] bg-blue-50 px-1.5 py-0.5 rounded">
                            {item.strength}
                          </span>
                        )}
                      </div>
                      {item.price > 0 && (
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          ৳ {item.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[12px] text-slate-500">
                      <span className="font-medium text-slate-600">
                        {item.genericName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.manufacturer}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
