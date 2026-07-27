import { useState, useEffect } from "react";
import { X, SlidersHorizontal } from "lucide-react";

interface DoctorFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const specializations = ["Cardiologist", "Neurologist", "Dentist", "Orthopedic", "Gynecologist", "Pediatrician"];
const availability = ["Available Today", "Available Tomorrow", "Next Week"];
const consultationTypes = ["Hospital Visit", "Video Call", "Audio Call", "Home Visit"];

export function DoctorFilterModal({ isOpen, onClose }: DoctorFilterModalProps) {
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedAvail, setSelectedAvail] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [feeRange, setFeeRange] = useState<number>(5000);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelection = (set: React.Dispatch<React.SetStateAction<string[]>>, list: string[], item: string) => {
    set(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleApply = () => {
    onClose();
  };

  const handleClear = () => {
    setSelectedSpecs([]);
    setSelectedAvail([]);
    setSelectedTypes([]);
    setFeeRange(5000);
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} 
        onClick={handleClose} 
      />

      {/* Side Panel */}
      <div className={`relative w-full max-w-[420px] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <SlidersHorizontal size={16} className="text-primary" />
            </div>
            Filters
          </h2>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin space-y-7">
          
          {/* Speciality */}
          <div>
            <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">Speciality</h3>
            <div className="flex flex-wrap gap-2">
              {specializations.map(spec => (
                <button 
                  key={spec}
                  onClick={() => toggleSelection(setSelectedSpecs, selectedSpecs, spec)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                    selectedSpecs.includes(spec) 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Consultation Type */}
          <div>
            <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">Consultation Type</h3>
            <div className="flex flex-wrap gap-2">
              {consultationTypes.map(type => (
                <button 
                  key={type}
                  onClick={() => toggleSelection(setSelectedTypes, selectedTypes, type)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                    selectedTypes.includes(type) 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">Availability</h3>
            <div className="flex flex-wrap gap-2">
              {availability.map(avail => (
                <button 
                  key={avail}
                  onClick={() => toggleSelection(setSelectedAvail, selectedAvail, avail)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                    selectedAvail.includes(avail) 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {avail}
                </button>
              ))}
            </div>
          </div>

          {/* Consultation Fee */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Consultation Fee</h3>
              <span className="text-[14px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">Up to ৳{feeRange}</span>
            </div>
            <div className="px-1 mt-4">
              <input 
                type="range" 
                min="500" 
                max="5000"
                step="500"
                value={feeRange}
                onChange={(e) => setFeeRange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[12px] text-slate-500 mt-2 font-medium">
                <span>৳500</span>
                <span>৳5000+</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
          <button 
            onClick={handleClear}
            className="flex-1 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold transition-colors text-[14px] rounded-xl border border-slate-200"
          >
            Clear All
          </button>
          <button 
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-primary hover:bg-[#0052cc] text-white rounded-xl font-bold transition-colors text-[14px] shadow-lg shadow-primary/20"
          >
            Show Results
          </button>
        </div>

      </div>
    </div>
  );
}
