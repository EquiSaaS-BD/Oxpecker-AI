import React, { useState } from "react";
import { Plus, Search, Trash2, GripVertical, Info, Mic, Sparkles, ChevronDown } from "lucide-react";
import { usePrescription } from "@/context/PrescriptionContext";

export function MedicineBuilder() {
  const { data, updateData } = usePrescription();
  const medicines = data.medicines;
  
  const setMedicines = (newMedicines: typeof data.medicines) => {
    updateData({ medicines: newMedicines });
  };

  const [searchInput, setSearchInput] = useState("");

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
        <h3 className="font-bold text-[15px] sm:text-[16px] text-[#111827] px-2 sm:px-0">Rx Medicines</h3>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            title="Voice Input"
            className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 sm:bg-transparent hover:bg-slate-100 sm:hover:bg-transparent w-[36px] h-[36px] sm:w-auto sm:h-auto rounded-[10px] transition-all active:scale-95"
          >
            <Mic size={18} className="sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Voice Input</span>
          </button>
          
          <button 
            title="AI Suggestion"
            onClick={addAISuggestion} 
            className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 sm:bg-transparent hover:bg-purple-100 sm:hover:bg-transparent w-[36px] h-[36px] sm:w-auto sm:h-auto rounded-[10px] transition-all active:scale-95"
          >
            <Sparkles size={18} className="sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">AI Suggestion</span>
          </button>
          
          <button 
            title="Add Medicine"
            onClick={addEmptyMedicine} 
            className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-white bg-[#6DDA6E] hover:bg-[#5bc95c] w-[36px] h-[36px] sm:w-auto sm:px-4 rounded-[10px] transition-all shadow-sm active:scale-95"
          >
            <Plus size={20} className="sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Medicine List */}
      <div className="flex flex-col gap-3">
        {medicines.map((med) => (
          <div key={med.id} className="relative bg-white border border-slate-200 hover:border-slate-300 rounded-[14px] p-4 md:p-3 shadow-sm transition-all group flex flex-col md:flex-row md:items-center gap-4 md:gap-3">
            {/* Grip (Desktop only) */}
            <button className="hidden md:block text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0">
              <GripVertical size={18} />
            </button>
            
            {/* Medicine Name */}
            <div className="w-full md:w-[280px] pr-8 md:pr-0 shrink-0">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Medicine Name</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={med.name} 
                  onChange={(e) => updateMedicine(med.id, 'name', e.target.value)}
                  placeholder="Search medicine..."
                  className="w-full h-[36px] md:h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] md:text-[13px] font-semibold text-slate-800 focus:outline-none focus:border-[#2F80ED]"
                />
              </div>
            </div>

            {/* Dosage + Frequency + Duration */}
            <div className="grid grid-cols-2 md:flex md:flex-nowrap gap-2.5 md:gap-3 flex-1 items-start md:items-center w-full mt-1 md:mt-0">
              
              <div className="col-span-2 sm:col-span-1 md:w-[120px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-[#2F80ED] tracking-wider mb-1 block text-left">Dosage (M-N-E)</label>
                <div className="flex items-center gap-1 text-[#2F80ED]/40 text-sm font-bold w-full">
                  <button 
                    onClick={() => updateMedicine(med.id, 'dosageM', med.dosageM === '0' ? '1' : '0')}
                    className={`flex-1 md:w-8 h-[32px] md:h-8 rounded-[6px] text-[13px] font-bold text-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] focus:outline-none border ${med.dosageM === '0' ? 'bg-[#2F80ED]/5 border-[#2F80ED]/20 text-[#2F80ED] hover:bg-[#2F80ED]/15' : 'bg-[#2F80ED] border-[#2F80ED] text-white shadow-sm shadow-[#2F80ED]/30'}`}
                  >
                    {med.dosageM || '0'}
                  </button>
                  <span>+</span>
                  <button 
                    onClick={() => updateMedicine(med.id, 'dosageN', med.dosageN === '0' ? '1' : '0')}
                    className={`flex-1 md:w-8 h-[32px] md:h-8 rounded-[6px] text-[13px] font-bold text-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] focus:outline-none border ${med.dosageN === '0' ? 'bg-[#2F80ED]/5 border-[#2F80ED]/20 text-[#2F80ED] hover:bg-[#2F80ED]/15' : 'bg-[#2F80ED] border-[#2F80ED] text-white shadow-sm shadow-[#2F80ED]/30'}`}
                  >
                    {med.dosageN || '0'}
                  </button>
                  <span>+</span>
                  <button 
                    onClick={() => updateMedicine(med.id, 'dosageE', med.dosageE === '0' ? '1' : '0')}
                    className={`flex-1 md:w-8 h-[32px] md:h-8 rounded-[6px] text-[13px] font-bold text-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] focus:outline-none border ${med.dosageE === '0' ? 'bg-[#2F80ED]/5 border-[#2F80ED]/20 text-[#2F80ED] hover:bg-[#2F80ED]/15' : 'bg-[#2F80ED] border-[#2F80ED] text-white shadow-sm shadow-[#2F80ED]/30'}`}
                  >
                    {med.dosageE || '0'}
                  </button>
                </div>
              </div>

              <div className="col-span-1 md:w-[100px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-fuchsia-600 tracking-wider mb-1 block">Frequency</label>
                <div className="relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <select 
                    value={med.frequency} onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)} 
                    className="w-full h-[32px] md:h-8 pl-2 pr-5 bg-fuchsia-50/50 border border-fuchsia-200 rounded-[6px] text-[12px] font-bold text-fuchsia-700 focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20 appearance-none cursor-pointer transition-all truncate shadow-sm"
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

              <div className="col-span-1 md:w-[90px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-amber-600 tracking-wider mb-1 block">Duration</label>
                <div className="relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <select 
                    value={med.duration} onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)} 
                    className="w-full h-[32px] md:h-8 pl-2 pr-5 bg-amber-50/50 border border-amber-200 rounded-[6px] text-[12px] font-bold text-amber-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 appearance-none cursor-pointer transition-all truncate shadow-sm"
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
              
              <div className="col-span-1 md:w-[130px] md:flex-none">
                <label className="text-[9px] font-bold uppercase text-teal-600 tracking-wider mb-1 block">Instructions</label>
                <div className="relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <select 
                    value={med.notes} onChange={(e) => updateMedicine(med.id, 'notes', e.target.value)} 
                    className="w-full h-[32px] md:h-8 pl-2 pr-5 bg-teal-50/50 border border-teal-200 rounded-[6px] text-[12px] font-bold text-teal-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 appearance-none cursor-pointer transition-all truncate shadow-sm"
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

            {/* Remove button (absolute top right on mobile, inline on desktop) */}
            <button onClick={() => removeMedicine(med.id)} className="absolute top-4 right-4 md:static md:mt-4 md:w-[40px] md:h-[32px] shrink-0 text-slate-400 hover:text-red-500 transition-colors rounded-[8px] hover:bg-red-50 flex items-center justify-center p-1 md:p-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Empty State Input */}
      <div className="relative mt-2">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchEnter}
          placeholder="Search and add another medicine... (Press Enter)"
          className="w-full h-[48px] pl-10 pr-4 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#2F80ED] focus:bg-white rounded-[12px] text-[14px] text-slate-700 outline-none transition-colors"
        />
      </div>
    </div>
  );
}
