"use client";

import React, { useState } from "react";
import { Plus, Search, Trash2, GripVertical, Mic, Bot, ChevronDown } from "lucide-react";
import { usePrescription } from "@/context/PrescriptionContext";

interface QuickMedItem {
  brandName: string;
  strength: string;
  genericName: string;
  dosageForm: string;
  defaultDoseM?: string;
  defaultDoseN?: string;
  defaultDoseE?: string;
  defaultNotes?: string;
}

/**
 * Instant 0ms local prefix dictionary of top prescribed medicines in Bangladesh
 * so inline ghost-text ("N" -> "Napa 500 mg [Tab]") appears instantaneously,
 * augmented in real-time by the 28,151 DGDA database API (/api/medicines/search).
 */
const INSTANT_MED_INDEX: QuickMedItem[] = [
  { brandName: "Napa", strength: "500 mg", genericName: "Paracetamol", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "After meal" },
  { brandName: "Napa Extend", strength: "665 mg", genericName: "Paracetamol Extended Release", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "After meal" },
  { brandName: "Napa Extra", strength: "500 mg + 65 mg", genericName: "Paracetamol + Caffeine", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "After meal" },
  { brandName: "Seclo", strength: "20 mg", genericName: "Omeprazole", dosageForm: "Capsule", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "Before meal" },
  { brandName: "Sergel", strength: "20 mg", genericName: "Esomeprazole", dosageForm: "Capsule", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "Before meal" },
  { brandName: "Maxpro", strength: "20 mg", genericName: "Esomeprazole", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "Before meal" },
  { brandName: "Pantonix", strength: "20 mg", genericName: "Pantoprazole", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "Before meal" },
  { brandName: "Monas", strength: "10 mg", genericName: "Montelukast", dosageForm: "Tablet", defaultDoseM: "0", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "At bedtime" },
  { brandName: "Fexo", strength: "120 mg", genericName: "Fexofenadine HCl", dosageForm: "Tablet", defaultDoseM: "0", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "After meal" },
  { brandName: "Alatrol", strength: "10 mg", genericName: "Cetirizine HCl", dosageForm: "Tablet", defaultDoseM: "0", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "At bedtime" },
  { brandName: "Azithrocin", strength: "500 mg", genericName: "Azithromycin", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "0", defaultNotes: "After meal" },
  { brandName: "Zimax", strength: "500 mg", genericName: "Azithromycin", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "0", defaultNotes: "After meal" },
  { brandName: "Cef-3", strength: "200 mg", genericName: "Cefixime", dosageForm: "Capsule", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "After meal" },
  { brandName: "Comet", strength: "500 mg", genericName: "Metformin HCl", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "After meal" },
  { brandName: "Amdocal", strength: "5 mg", genericName: "Amlodipine", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "0", defaultNotes: "After meal" },
  { brandName: "Bizoran", strength: "5/20 mg", genericName: "Amlodipine + Olmesartan", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "0", defaultNotes: "After meal" },
  { brandName: "Coralcal-D", strength: "500 mg", genericName: "Calcium + Vitamin D3", dosageForm: "Tablet", defaultDoseM: "0", defaultDoseN: "1", defaultDoseE: "0", defaultNotes: "After meal" },
  { brandName: "Rivotril", strength: "0.5 mg", genericName: "Clonazepam", dosageForm: "Tablet", defaultDoseM: "0", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "At bedtime" },
  { brandName: "Tufnil", strength: "200 mg", genericName: "Tolfenamic Acid", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "After meal" },
  { brandName: "Losectil", strength: "20 mg", genericName: "Omeprazole", dosageForm: "Capsule", defaultDoseM: "1", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "Before meal" },
  { brandName: "Omidon", strength: "10 mg", genericName: "Domperidone", dosageForm: "Tablet", defaultDoseM: "1", defaultDoseN: "1", defaultDoseE: "1", defaultNotes: "Before meal" },
  { brandName: "Ecosprin", strength: "75 mg", genericName: "Aspirin", dosageForm: "Tablet", defaultDoseM: "0", defaultDoseN: "1", defaultDoseE: "0", defaultNotes: "After meal" },
  { brandName: "Atova", strength: "10 mg", genericName: "Atorvastatin", dosageForm: "Tablet", defaultDoseM: "0", defaultDoseN: "0", defaultDoseE: "1", defaultNotes: "At bedtime" },
];

function findInstantMatches(query: string): QuickMedItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const prefixMatches = INSTANT_MED_INDEX.filter((m) =>
    `${m.brandName} ${m.strength}`.toLowerCase().startsWith(q)
  );
  const containsMatches = INSTANT_MED_INDEX.filter(
    (m) =>
      !prefixMatches.includes(m) &&
      (`${m.brandName} ${m.strength}`.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().startsWith(q))
  );
  return [...prefixMatches, ...containsMatches].slice(0, 8);
}

function computeGhostSuffix(typed: string, topCandidate?: QuickMedItem): string {
  if (!typed || !topCandidate) return "";
  const fullTarget = `${topCandidate.brandName} ${topCandidate.strength}`.trim();
  if (
    fullTarget.toLowerCase().startsWith(typed.toLowerCase()) &&
    fullTarget.length > typed.length
  ) {
    return fullTarget.slice(typed.length);
  }
  return "";
}

// Levenshtein distance for fuzzy spell-checking
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function findSpellingSuggestion(query: string): QuickMedItem | null {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return null;
  // If exact match already exists, no typo
  const exact = INSTANT_MED_INDEX.find(
    (m) => `${m.brandName} ${m.strength}`.toLowerCase() === q || m.brandName.toLowerCase() === q
  );
  if (exact) return null;

  let bestMatch: QuickMedItem | null = null;
  let minDistance = 999;
  for (const m of INSTANT_MED_INDEX) {
    const d = levenshteinDistance(q, m.brandName.toLowerCase());
    if (d > 0 && d <= 2 && d < minDistance) {
      minDistance = d;
      bestMatch = m;
    }
  }
  return bestMatch;
}

const MedicineAutocomplete = ({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (med: {
    name: string;
    type: string;
    dosageM?: string;
    dosageN?: string;
    dosageE?: string;
    notes?: string;
  }) => void;
}) => {
  const [apiSuggestions, setApiSuggestions] = useState<QuickMedItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  const localInstant = React.useMemo(() => findInstantMatches(value), [value]);

  const combinedSuggestions = React.useMemo(() => {
    const map = new Map<string, QuickMedItem>();
    for (const item of localInstant) {
      map.set(`${item.brandName}-${item.strength}`.toLowerCase(), item);
    }
    for (const item of apiSuggestions) {
      const key = `${item.brandName}-${item.strength}`.toLowerCase();
      if (!map.has(key)) map.set(key, item);
    }
    return Array.from(map.values()).slice(0, 8);
  }, [localInstant, apiSuggestions]);

  const activeCandidate =
    combinedSuggestions[highlightedIndex >= 0 ? highlightedIndex : 0] ||
    combinedSuggestions[0];
  const ghostSuffix = showSuggestions ? computeGhostSuffix(value, activeCandidate) : "";

  // Spell check typo detector (shows red color indicator)
  const spellSuggestion = React.useMemo(() => {
    if (!value || value.trim().length < 3) return null;
    if (combinedSuggestions.length > 0 && combinedSuggestions.some(m => m.brandName.toLowerCase().startsWith(value.toLowerCase().slice(0, 3)))) {
      return null;
    }
    return findSpellingSuggestion(value);
  }, [value, combinedSuggestions]);

  const isMisspelled = Boolean(spellSuggestion);

  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!value.trim() || !showSuggestions) {
      setApiSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setApiSuggestions(data.slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to fetch medicines", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 120);
    return () => clearTimeout(timer);
  }, [value, showSuggestions]);

  const handleSelect = (med: QuickMedItem) => {
    const fullName = `${med.brandName} ${med.strength}`.trim();
    onSelect({
      name: fullName,
      type: med.dosageForm || "Tablet",
      dosageM: med.defaultDoseM,
      dosageN: med.defaultDoseN,
      dosageE: med.defaultDoseE,
      notes: med.defaultNotes,
    });
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && combinedSuggestions.length > 0) {
      e.preventDefault();
      setShowSuggestions(true);
      setHighlightedIndex((prev) =>
        prev < combinedSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp" && combinedSuggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : combinedSuggestions.length - 1
      );
    } else if (
      (e.key === "Tab" || e.key === "ArrowRight") &&
      showSuggestions &&
      activeCandidate &&
      value.trim().length > 0
    ) {
      const fullName = `${activeCandidate.brandName} ${activeCandidate.strength}`.trim();
      if (fullName.toLowerCase() !== value.trim().toLowerCase()) {
        e.preventDefault();
        handleSelect(activeCandidate);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (spellSuggestion) {
        handleSelect(spellSuggestion);
      } else if (showSuggestions && activeCandidate && ghostSuffix) {
        handleSelect(activeCandidate);
      } else {
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Search
        size={14}
        className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none transition-colors ${
          isMisspelled ? "text-rose-500" : "text-slate-400"
        }`}
      />

      {/* Input box with red indicator for spelling mistakes */}
      <div
        className={`relative w-full h-[36px] md:h-8 rounded-[8px] transition-all overflow-hidden border ${
          isMisspelled
            ? "border-rose-400 bg-rose-50/40 ring-1 ring-rose-400/50"
            : "bg-slate-50 border-slate-200 focus-within:border-slate-900 focus-within:bg-white"
        }`}
      >
        {ghostSuffix && !isMisspelled && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pl-8 pr-14 flex items-center text-[14px] md:text-[13px] font-semibold pointer-events-none select-none whitespace-pre overflow-hidden"
          >
            <span className="text-transparent">{value}</span>
            <span className="text-slate-400">{ghostSuffix}</span>
          </div>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type medicine (e.g. N → Napa)..."
          className={`relative z-10 w-full h-full pl-8 pr-14 bg-transparent text-[14px] md:text-[13px] font-semibold focus:outline-none ${
            isMisspelled ? "text-rose-800 underline decoration-wavy decoration-rose-400" : "text-slate-800"
          }`}
          autoComplete="off"
        />

        {ghostSuffix && !isMisspelled && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600 pointer-events-none">
            Tab ↹
          </span>
        )}
      </div>

      {/* Red Color Spelling Alert & "Did You Mean" Suggestion */}
      {isMisspelled && spellSuggestion && (
        <div className="mt-1 flex items-center justify-between bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md text-[11px] text-rose-700 animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-rose-600">বানান সতর্কবার্তা:</span>
            <span>আপনি কি <strong className="font-bold underline text-rose-800">{spellSuggestion.brandName} {spellSuggestion.strength}</strong> বোঝাতে চেয়েছেন?</span>
          </div>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect(spellSuggestion);
            }}
            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10px] shadow-2xs"
          >
            ঠিক করুন
          </button>
        </div>
      )}

      {showSuggestions && combinedSuggestions.length > 0 && !isMisspelled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[260px] overflow-y-auto custom-scrollbar">
          {combinedSuggestions.map((smed, idx) => (
            <div
              key={`${smed.brandName}-${smed.strength}-${idx}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(smed);
              }}
              className={`px-3 py-2 border-b border-slate-100 last:border-0 cursor-pointer flex flex-col gap-0.5 transition-colors ${
                highlightedIndex === idx ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-800 text-[13px]">
                  {smed.brandName}{" "}
                  <span className="text-slate-500 font-medium">{smed.strength}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {idx === highlightedIndex && (
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                      Tab ↹
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-slate-700 bg-slate-200/70 px-1.5 py-0.5 rounded">
                    {smed.dosageForm}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 truncate">{smed.genericName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function MedicineBuilder() {
  const { data, updateData } = usePrescription();
  const medicines = data.medicines;

  const setMedicines = (newMedicines: typeof data.medicines) => {
    updateData({ medicines: newMedicines });
  };

  const [searchInput, setSearchInput] = useState("");
  const [apiSuggestions, setApiSuggestions] = useState<QuickMedItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);

  const localInstant = React.useMemo(() => findInstantMatches(searchInput), [searchInput]);

  const combinedBottomSuggestions = React.useMemo(() => {
    const map = new Map<string, QuickMedItem>();
    for (const item of localInstant) {
      map.set(`${item.brandName}-${item.strength}`.toLowerCase(), item);
    }
    for (const item of apiSuggestions) {
      const key = `${item.brandName}-${item.strength}`.toLowerCase();
      if (!map.has(key)) map.set(key, item);
    }
    return Array.from(map.values()).slice(0, 6);
  }, [localInstant, apiSuggestions]);

  const topCandidate =
    combinedBottomSuggestions[highlightedIdx] || combinedBottomSuggestions[0];
  const bottomGhostSuffix = computeGhostSuffix(searchInput, topCandidate);

  // Bottom spell check typo detector
  const bottomSpellSuggestion = React.useMemo(() => {
    if (!searchInput || searchInput.trim().length < 3) return null;
    if (
      combinedBottomSuggestions.length > 0 &&
      combinedBottomSuggestions.some((m) =>
        m.brandName.toLowerCase().startsWith(searchInput.toLowerCase().slice(0, 3))
      )
    ) {
      return null;
    }
    return findSpellingSuggestion(searchInput);
  }, [searchInput, combinedBottomSuggestions]);

  const isBottomMisspelled = Boolean(bottomSpellSuggestion);

  React.useEffect(() => {
    if (!searchInput.trim()) {
      setApiSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    setHighlightedIdx(0);

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(searchInput)}`);
        if (res.ok) {
          const json = await res.json();
          setApiSuggestions(json.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch medicines", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 120);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const addMedicineFromSuggestion = (med: QuickMedItem) => {
    setMedicines([
      ...medicines,
      {
        id: Date.now(),
        name: `${med.brandName} ${med.strength}`.trim(),
        type: med.dosageForm || "Tablet",
        dosageM: med.defaultDoseM || "1",
        dosageN: med.defaultDoseN || "0",
        dosageE: med.defaultDoseE || "1",
        frequency: "Daily",
        duration: "7 Days",
        notes: med.defaultNotes || "After meal",
      },
    ]);
    setSearchInput("");
    setShowSuggestions(false);
  };

  const addCustomMedicineByName = (rawName: string) => {
    const clean = rawName.trim();
    if (!clean) return;
    setMedicines([
      ...medicines,
      {
        id: Date.now(),
        name: clean,
        type: "Tablet",
        dosageM: "1",
        dosageN: "0",
        dosageE: "1",
        frequency: "Daily",
        duration: "7 Days",
        notes: "After meal",
      },
    ]);
    setSearchInput("");
    setShowSuggestions(false);
  };

  const addEmptyMedicine = () => {
    setMedicines([
      ...medicines,
      {
        id: Date.now(),
        name: "",
        type: "Tablet",
        dosageM: "1",
        dosageN: "0",
        dosageE: "1",
        frequency: "Daily",
        duration: "7 Days",
        notes: "After meal",
      },
    ]);
  };

  const addAISuggestion = () => {
    setMedicines([
      ...medicines,
      {
        id: Date.now(),
        name: "Cap. Seclo 20 mg",
        type: "Capsule",
        dosageM: "1",
        dosageN: "0",
        dosageE: "1",
        frequency: "Daily",
        duration: "14 Days",
        notes: "Before meal",
      },
    ]);
  };

  const removeMedicine = (id: number | string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: number | string, field: string, value: string) => {
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const updateMedicineFields = (id: number | string, updates: Record<string, string>) => {
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleBottomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && combinedBottomSuggestions.length > 0) {
      e.preventDefault();
      setHighlightedIdx((prev) =>
        prev < combinedBottomSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp" && combinedBottomSuggestions.length > 0) {
      e.preventDefault();
      setHighlightedIdx((prev) =>
        prev > 0 ? prev - 1 : combinedBottomSuggestions.length - 1
      );
    } else if (
      (e.key === "Tab" || e.key === "ArrowRight") &&
      searchInput.trim().length > 0 &&
      topCandidate
    ) {
      // Pressing Tab auto-completes the inline ghost suggestion immediately!
      e.preventDefault();
      addMedicineFromSuggestion(topCandidate);
    } else if (e.key === "Enter" && searchInput.trim() !== "") {
      e.preventDefault();
      // If doctor typed a custom medicine name not in DB, Enter adds it directly as typed!
      addCustomMedicineByName(searchInput);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Medicine Toolbar */}
      <div className="bg-white border border-slate-200 rounded-[14px] p-2 sm:px-4 sm:py-2.5 flex items-center justify-between shadow-xs">
        <div>
          <h3 className="font-bold text-[15px] sm:text-[16px] text-slate-800 px-2 sm:px-0">
            Rx Medicines
          </h3>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Type first letters (e.g. <span className="font-bold text-slate-700">N</span> for{" "}
            <span className="font-bold text-slate-700">Napa 500 mg</span>) and press{" "}
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 border border-slate-300 rounded">
              Tab ↹
            </kbd>{" "}
            to auto-complete, or{" "}
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 border border-slate-300 rounded">
              Enter ↵
            </kbd>{" "}
            for any custom medicine.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            title="AI Suggestion"
            onClick={addAISuggestion}
            className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-[10px] transition-all active:scale-95"
          >
            <Bot size={16} />
            <span className="hidden sm:inline">AI Suggest</span>
          </button>

          <button
            type="button"
            title="Add Medicine"
            onClick={addEmptyMedicine}
            className="flex items-center justify-center gap-1.5 text-[13px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-[10px] transition-all active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Row</span>
          </button>
        </div>
      </div>

      {/* Medicine List */}
      <div className="flex flex-col gap-3">
        {medicines.map((med) => (
          <div
            key={med.id}
            className="relative bg-white border border-slate-200 hover:border-slate-300 rounded-[14px] p-4 md:p-3 shadow-xs transition-all group flex flex-col md:flex-row md:items-start gap-4 md:gap-3"
          >
            <button
              type="button"
              className="hidden md:block mt-[22px] text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0"
            >
              <GripVertical size={18} />
            </button>

            {/* Medicine Name with Inline Ghost Autocomplete */}
            <div className="w-full md:w-[290px] pr-8 md:pr-0 shrink-0">
              <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">
                Medicine Name (Tab ↹ to complete)
              </label>
              <MedicineAutocomplete
                value={med.name}
                onChange={(val) => updateMedicine(med.id, "name", val)}
                onSelect={(selected) => {
                  const updates: Record<string, string> = {
                    name: selected.name,
                    type: selected.type,
                  };
                  if (selected.dosageM) updates.dosageM = selected.dosageM;
                  if (selected.dosageN) updates.dosageN = selected.dosageN;
                  if (selected.dosageE) updates.dosageE = selected.dosageE;
                  if (selected.notes) updates.notes = selected.notes;
                  updateMedicineFields(med.id, updates);
                }}
              />
            </div>

            {/* Dosage + Frequency + Duration */}
            <div className="grid grid-cols-2 md:flex md:flex-nowrap gap-2.5 md:gap-3 flex-1 items-start w-full mt-1 md:mt-0">
              <div className="col-span-2 sm:col-span-1 md:w-[120px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 block text-left">
                  Dosage (M-N-E)
                </label>
                <div className="flex items-center gap-1 text-slate-400 text-sm font-bold w-full">
                  <button
                    type="button"
                    onClick={() =>
                      updateMedicine(med.id, "dosageM", med.dosageM === "0" ? "1" : "0")
                    }
                    className={`flex-1 md:w-8 h-[32px] md:h-8 rounded-[6px] text-[13px] font-bold text-center transition-all border ${
                      med.dosageM === "0"
                        ? "bg-slate-50 border-slate-200 text-slate-500"
                        : "bg-slate-900 border-slate-900 text-white"
                    }`}
                  >
                    {med.dosageM || "0"}
                  </button>
                  <span>+</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateMedicine(med.id, "dosageN", med.dosageN === "0" ? "1" : "0")
                    }
                    className={`flex-1 md:w-8 h-[32px] md:h-8 rounded-[6px] text-[13px] font-bold text-center transition-all border ${
                      med.dosageN === "0"
                        ? "bg-slate-50 border-slate-200 text-slate-500"
                        : "bg-slate-900 border-slate-900 text-white"
                    }`}
                  >
                    {med.dosageN || "0"}
                  </button>
                  <span>+</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateMedicine(med.id, "dosageE", med.dosageE === "0" ? "1" : "0")
                    }
                    className={`flex-1 md:w-8 h-[32px] md:h-8 rounded-[6px] text-[13px] font-bold text-center transition-all border ${
                      med.dosageE === "0"
                        ? "bg-slate-50 border-slate-200 text-slate-500"
                        : "bg-slate-900 border-slate-900 text-white"
                    }`}
                  >
                    {med.dosageE || "0"}
                  </button>
                </div>
              </div>

              <div className="col-span-1 md:w-[105px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">
                  Frequency
                </label>
                <div className="relative">
                  <select
                    value={med.frequency}
                    onChange={(e) => updateMedicine(med.id, "frequency", e.target.value)}
                    className="w-full h-[32px] md:h-8 pl-2 pr-5 bg-slate-50 border border-slate-200 rounded-[6px] text-[12px] font-bold text-slate-700 focus:outline-none focus:border-slate-900 appearance-none cursor-pointer truncate"
                  >
                    <option>Daily</option>
                    <option>Twice a day</option>
                    <option>Thrice a day</option>
                    <option>4 times a day</option>
                    <option>Alternate days</option>
                    <option>Weekly</option>
                    <option>SOS (As needed)</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                </div>
              </div>

              <div className="col-span-1 md:w-[95px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">
                  Duration
                </label>
                <div className="relative">
                  <select
                    value={med.duration}
                    onChange={(e) => updateMedicine(med.id, "duration", e.target.value)}
                    className="w-full h-[32px] md:h-8 pl-2 pr-5 bg-slate-50 border border-slate-200 rounded-[6px] text-[12px] font-bold text-slate-700 focus:outline-none focus:border-slate-900 appearance-none cursor-pointer truncate"
                  >
                    <option>1 Day</option>
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
                  <ChevronDown
                    size={13}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 md:w-[130px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">
                  Instructions
                </label>
                <div className="relative">
                  <select
                    value={med.notes}
                    onChange={(e) => updateMedicine(med.id, "notes", e.target.value)}
                    className="w-full h-[32px] md:h-8 pl-2 pr-5 bg-slate-50 border border-slate-200 rounded-[6px] text-[12px] font-bold text-slate-700 focus:outline-none focus:border-slate-900 appearance-none cursor-pointer truncate"
                  >
                    <option>After meal</option>
                    <option>Before meal</option>
                    <option>With meal</option>
                    <option>Empty stomach</option>
                    <option>At bedtime</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeMedicine(med.id)}
              className="absolute top-4 right-4 md:static md:mt-4 md:w-[36px] md:h-[32px] shrink-0 text-slate-400 hover:text-rose-600 transition-colors rounded-[8px] hover:bg-rose-50 flex items-center justify-center p-1 md:p-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Smart-Compose Quick-Add Bar */}
      <div className="relative mt-1">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-20 pointer-events-none"
        />

        <div
          className={`relative w-full h-[48px] rounded-[12px] overflow-hidden shadow-2xs transition-all border ${
            isBottomMisspelled
              ? "border-rose-400 bg-rose-50/40 ring-1 ring-rose-400/50"
              : "bg-white border-slate-300 focus-within:border-slate-900"
          }`}
        >
          {/* Ghost completion text right after cursor */}
          {bottomGhostSuffix && !isBottomMisspelled && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pl-10 pr-36 flex items-center text-[14px] font-semibold pointer-events-none select-none whitespace-pre overflow-hidden"
            >
              <span className="text-transparent">{searchInput}</span>
              <span className="text-slate-400">{bottomGhostSuffix}</span>
            </div>
          )}

          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleBottomKeyDown}
            onFocus={() => {
              if (searchInput.trim()) setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
            placeholder="Type medicine (e.g. 'N' for Napa 500 mg) — Press Tab ↹ to auto-complete or Enter ↵ for custom medicine"
            className={`relative z-10 w-full h-full pl-10 pr-36 bg-transparent text-[14px] font-semibold outline-none ${
              isBottomMisspelled
                ? "text-rose-800 underline decoration-wavy decoration-rose-400"
                : "text-slate-800"
            }`}
            autoComplete="off"
          />

          {searchInput.trim() && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 pointer-events-none">
              {topCandidate && !isBottomMisspelled && (
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-slate-900 text-white">
                  Tab ↹ {topCandidate.brandName}
                </span>
              )}
              {isBottomMisspelled && bottomSpellSuggestion && (
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-rose-600 text-white">
                  Enter ↵ {bottomSpellSuggestion.brandName}
                </span>
              )}
              <span className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline">
                Enter ↵ Custom
              </span>
            </div>
          )}
        </div>

        {/* Bottom Red Color Spelling Alert */}
        {isBottomMisspelled && bottomSpellSuggestion && (
          <div className="mt-1 flex items-center justify-between bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs text-rose-700 animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-rose-600">বানান সতর্কবার্তা:</span>
              <span>
                আপনি কি <strong className="font-bold underline text-rose-800">{bottomSpellSuggestion.brandName} {bottomSpellSuggestion.strength}</strong> বোঝাতে চেয়েছেন?
              </span>
            </div>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addMedicineFromSuggestion(bottomSpellSuggestion);
              }}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-[11px] shadow-2xs"
            >
              ঠিক করুন ও যোগ করুন
            </button>
          </div>
        )}

        {/* Autocomplete Dropdown */}
        {showSuggestions && combinedBottomSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {combinedBottomSuggestions.map((med, idx) => (
              <div
                key={`${med.brandName}-${med.strength}-${idx}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addMedicineFromSuggestion(med);
                }}
                className={`px-4 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer flex items-center justify-between transition-colors ${
                  idx === highlightedIdx ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-[14px]">
                      {med.brandName}
                    </span>
                    <span className="text-slate-500 text-xs font-semibold">
                      {med.strength}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                      {med.dosageForm}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">{med.genericName}</span>
                </div>

                <div className="flex items-center gap-2">
                  {idx === highlightedIdx && (
                    <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                      Press Tab ↹
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
