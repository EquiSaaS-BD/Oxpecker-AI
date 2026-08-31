"use client";

import React, { useState } from "react";
import { Plus, Search, Trash2, GripVertical, Info, Mic, Bot, ChevronDown, Check } from "lucide-react";
import { usePrescription } from "@/context/PrescriptionContext";


const CustomSelect = ({ value, onChange, options, colorClass }: { value: string, onChange: (v: string) => void, options: string[], colorClass: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[32px] md:h-8 pl-2 pr-2 bg-slate-50 border border-slate-200 rounded-[6px] text-[12px] font-bold text-slate-600 cursor-pointer transition-all shadow-sm flex items-center justify-between group hover:border-${colorClass}-500/50`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={14} className={`text-${colorClass}-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[140px] max-h-[200px] overflow-y-auto bg-slate-800 border border-slate-300 rounded-lg shadow-2xl z-50 py-1">
          {options.map(opt => (
            <div 
              key={opt} 
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`px-3 py-2 text-[12px] font-bold cursor-pointer hover:bg-slate-700 transition-colors ${value === opt ? 'text-sky-400 bg-slate-700/50' : 'text-slate-600'}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const MedicineAutocomplete = ({ value, onChange, onSelect }: { value: string, onChange: (v: string) => void, onSelect: (name: string, type: string) => void }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!value.trim() || !showSuggestions) {
      setSuggestions([]);
      return;
    }
    
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to fetch medicines", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [value, showSuggestions]);

  const handleSelect = (med: any) => {
    const fullName = `${med.brandName} ${med.strength}`;
    onSelect(fullName, med.dosageForm || "Tablet");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      } else if (suggestions.length > 0) {
        e.preventDefault();
        handleSelect(suggestions[0]);
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input 
        type="text" 
        value={value} 
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search medicine..."
        className="w-full h-[36px] md:h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] md:text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-sky-500 transition-colors"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar">
          {suggestions.map((smed, idx) => (
            <div 
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input from losing focus
                handleSelect(smed);
              }}
              className={`px-3 py-2.5 border-b border-slate-200 last:border-0 cursor-pointer flex flex-col gap-0.5 transition-colors ${highlightedIndex === idx ? 'bg-slate-800' : 'hover:bg-slate-50/80'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-[13px]">{smed.brandName} <span className="text-slate-500 font-normal">{smed.strength}</span></span>
                <span className="text-[10px] font-semibold text-sky-400 bg-sky-900/30 px-1.5 py-0.5 rounded-md">{smed.dosageForm}</span>
              </div>
              <span className="text-[11px] text-slate-500 italic truncate">{smed.genericName}</span>
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  React.useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(searchInput)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.slice(0, 5)); // Limit to 5
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Failed to fetch medicines", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300); // debounce
    return () => clearTimeout(timer);
  }, [searchInput]);
  
  const addMedicineFromSuggestion = (med: any) => {
    setMedicines([...medicines, { 
      id: Date.now(), 
      name: `${med.brandName} ${med.strength}`, 
      type: med.dosageForm || "Tablet", 
      dosageM: "0", dosageN: "0", dosageE: "0", 
      frequency: "Daily", 
      duration: "5 Days", 
      notes: "After meal" 
    }]);
    setSearchInput("");
    setShowSuggestions(false);
  };


  const addEmptyMedicine = () => {
    setMedicines([...medicines, { 
      id: Date.now(), 
      name: "", 
      type: "Tablet", 
      dosageM: "0", dosageN: "0", dosageE: "0", 
      frequency: "Daily", 
      duration: "5 Days", 
      notes: "After meal" 
    }]);
  };

  const addAISuggestion = () => {
    setMedicines([...medicines, { 
      id: Date.now(), 
      name: "Cap. Seclo 20mg", 
      type: "Capsule", 
      dosageM: "1", dosageN: "0", dosageE: "1", 
      frequency: "Daily", 
      duration: "14 Days", 
      notes: "Before meal" 
    }]);
  };

  const removeMedicine = (id: number | string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const updateMedicine = (id: number | string, field: string, value: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const updateMedicineFields = (id: number | string, updates: Record<string, string>) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim() !== '') {
      setMedicines([...medicines, { 
        id: Date.now(), 
        name: searchInput, 
        type: "Tablet", 
        dosageM: "0", dosageN: "0", dosageE: "0", 
        frequency: "Daily", 
        duration: "5 Days", 
        notes: "After meal" 
      }]);
      setSearchInput("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Medicine Toolbar */}
      <div className="bg-white border border-slate-200 rounded-[14px] p-2 sm:px-4 sm:py-2.5 flex items-center justify-between shadow-sm">
        <h3 className="font-bold text-[15px] sm:text-[16px] text-slate-800 px-2 sm:px-0">Rx Medicines</h3>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            title="Voice Input"
            className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-700 bg-slate-800 sm:bg-transparent hover:bg-slate-700 sm:hover:bg-transparent w-[36px] h-[36px] sm:w-auto sm:h-auto rounded-[10px] transition-all active:scale-95"
          >
            <Mic size={18} className="sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Voice Input</span>
          </button>
          
          <button 
            title="AI Suggestion"
            onClick={addAISuggestion} 
            className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-purple-400 hover:text-purple-300 bg-purple-900/30 sm:bg-transparent hover:bg-purple-800/40 sm:hover:bg-transparent w-[36px] h-[36px] sm:w-auto sm:h-auto rounded-[10px] transition-all active:scale-95"
          >
            <Bot size={18} className="sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">AI Suggestion</span>
          </button>
          
          <button 
            title="Add Medicine"
            onClick={addEmptyMedicine} 
            className="flex items-center justify-center gap-1.5 text-[13px] font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 font-bold  w-[36px] h-[36px] sm:w-auto sm:px-4 rounded-[10px] transition-all shadow-sm active:scale-95"
          >
            <Plus size={20} className="sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Medicine List */}
      <div className="flex flex-col gap-3">
        {medicines.map((med) => (
          <div key={med.id} className="relative bg-white border border-slate-200 hover:border-slate-300 rounded-[14px] p-4 md:p-3 shadow-sm transition-all group flex flex-col md:flex-row md:items-start gap-4 md:gap-3">
            {/* Grip (Desktop only) */}
            <button className="hidden md:block mt-[22px] text-slate-500 hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0">
              <GripVertical size={18} />
            </button>
            
            {/* Medicine Name */}
            <div className="w-full md:w-[280px] pr-8 md:pr-0 shrink-0">
              <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Medicine Name</label>
              <MedicineAutocomplete 
                value={med.name} 
                onChange={(val) => updateMedicine(med.id, 'name', val)}
                onSelect={(name, type) => updateMedicineFields(med.id, { name, type })}
              />
            </div>

            {/* Dosage + Frequency + Duration */}
            <div className="grid grid-cols-2 md:flex md:flex-nowrap gap-2.5 md:gap-3 flex-1 items-start w-full mt-1 md:mt-0">
              
              <div className="col-span-2 sm:col-span-1 md:w-[120px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-sky-400 tracking-wider mb-1 block text-left">Dosage (M-N-E)</label>
                <div className="flex items-center gap-1 text-sky-400/40 text-sm font-bold w-full">
                  <button 
                    onClick={() => updateMedicine(med.id, 'dosageM', med.dosageM === '0' ? '1' : '0')}
                    className={`flex-1 md:w-8 h-[32px] md:h-8 rounded-[6px] text-[13px] font-bold text-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] focus:outline-none border ${med.dosageM === '0' ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-600' : 'bg-sky-600 border-sky-600 text-white shadow-sm shadow-sky-600/30'}`}
                  >
                    {med.dosageM || '0'}
                  </button>
                  <span>+</span>
                  <button 
                    onClick={() => updateMedicine(med.id, 'dosageN', med.dosageN === '0' ? '1' : '0')}
                    className={`flex-1 md:w-8 h-[32px] md:h-8 rounded-[6px] text-[13px] font-bold text-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] focus:outline-none border ${med.dosageN === '0' ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-600' : 'bg-sky-600 border-sky-600 text-white shadow-sm shadow-sky-600/30'}`}
                  >
                    {med.dosageN || '0'}
                  </button>
                  <span>+</span>
                  <button 
                    onClick={() => updateMedicine(med.id, 'dosageE', med.dosageE === '0' ? '1' : '0')}
                    className={`flex-1 md:w-8 h-[32px] md:h-8 rounded-[6px] text-[13px] font-bold text-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] focus:outline-none border ${med.dosageE === '0' ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-600' : 'bg-sky-600 border-sky-600 text-white shadow-sm shadow-sky-600/30'}`}
                  >
                    {med.dosageE || '0'}
                  </button>
                </div>
              </div>

              <div className="col-span-1 md:w-[100px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-fuchsia-400 tracking-wider mb-1 block">Frequency</label>
                <div className="relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <select 
                    value={med.frequency} onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)} 
                    className="w-full h-[32px] md:h-8 pl-2 pr-5 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded-[6px] text-[12px] font-bold text-slate-600 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/50 appearance-none cursor-pointer transition-all truncate shadow-sm"
                  >
                    <option className="bg-white text-slate-700">Daily</option>
                    <option className="bg-white text-slate-700">Twice a day</option>
                    <option className="bg-white text-slate-700">Thrice a day</option>
                    <option className="bg-white text-slate-700">4 times a day</option>
                    <option className="bg-white text-slate-700">Alternate days</option>
                    <option className="bg-white text-slate-700">Weekly</option>
                    <option className="bg-white text-slate-700">SOS (As needed)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-fuchsia-500 pointer-events-none transition-transform" />
                </div>
              </div>

              <div className="col-span-1 md:w-[90px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-amber-400 tracking-wider mb-1 block">Duration</label>
                <div className="relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <select 
                    value={med.duration} onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)} 
                    className="w-full h-[32px] md:h-8 pl-2 pr-5 bg-amber-900/20 border border-amber-500/30 rounded-[6px] text-[12px] font-bold text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 appearance-none cursor-pointer transition-all truncate shadow-sm"
                  >
                    <option className="bg-white text-slate-700">1 Day</option>
                    <option className="bg-white text-slate-700">2 Days</option>
                    <option className="bg-white text-slate-700">3 Days</option>
                    <option className="bg-white text-slate-700">5 Days</option>
                    <option className="bg-white text-slate-700">7 Days</option>
                    <option className="bg-white text-slate-700">10 Days</option>
                    <option className="bg-white text-slate-700">14 Days</option>
                    <option className="bg-white text-slate-700">1 Month</option>
                    <option className="bg-white text-slate-700">2 Months</option>
                    <option className="bg-white text-slate-700">3 Months</option>
                    <option className="bg-white text-slate-700">Continue</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none transition-transform" />
                </div>
              </div>
              
              <div className="col-span-1 md:w-[130px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-teal-400 tracking-wider mb-1 block">Instructions</label>
                <div className="relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <select 
                    value={med.notes} onChange={(e) => updateMedicine(med.id, 'notes', e.target.value)} 
                    className="w-full h-[32px] md:h-8 pl-2 pr-5 bg-teal-900/20 border border-teal-500/30 rounded-[6px] text-[12px] font-bold text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 appearance-none cursor-pointer transition-all truncate shadow-sm"
                  >
                    <option className="bg-white text-slate-700">After meal</option>
                    <option className="bg-white text-slate-700">Before meal</option>
                    <option className="bg-white text-slate-700">With meal</option>
                    <option className="bg-white text-slate-700">Empty stomach</option>
                    <option className="bg-white text-slate-700">At bedtime</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-teal-500 pointer-events-none transition-transform" />
                </div>
              </div>

            </div>

            {/* Remove button (absolute top right on mobile, inline on desktop) */}
            <button onClick={() => removeMedicine(med.id)} className="absolute top-4 right-4 md:static md:mt-4 md:w-[40px] md:h-[32px] shrink-0 text-slate-500 hover:text-red-500 transition-colors rounded-[8px] hover:bg-red-900/30 flex items-center justify-center p-1 md:p-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Empty State Input */}
      <div className="relative mt-2">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchEnter}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search and add another medicine... (Press Enter)"
          className="w-full h-[48px] pl-10 pr-4 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 rounded-[12px] text-[14px] text-slate-600 outline-none transition-colors"
        />
        
        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 overflow-hidden">
            {suggestions.map((med, idx) => (
              <div 
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addMedicineFromSuggestion(med);
                }}
                className="px-4 py-3 border-b border-slate-200 last:border-0 hover:bg-slate-50 cursor-pointer flex flex-col gap-0.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[14px]">{med.brandName} <span className="text-slate-500 font-normal">{med.strength}</span></span>
                  <span className="text-[11px] font-semibold text-sky-400 bg-sky-900/30 px-2 py-0.5 rounded-full">{med.dosageForm}</span>
                </div>
                <span className="text-[12px] text-slate-500 italic">{med.genericName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
