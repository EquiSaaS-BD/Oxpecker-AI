"use client";

import { useState } from "react";
import { mockChambers } from "@/lib/doctorMockData";
import { 
  Building2, Plus, Trash2, Calendar, Clock, MapPin, 
  ToggleLeft, ToggleRight, Check, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";

export default function ChambersSettingsPage() {
  const [chambers, setChambers] = useState(
    mockChambers.map(c => ({ ...c, active: true }))
  );
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChamber, setNewChamber] = useState({ 
    name: "", 
    address: "", 
    time: "", 
    days: [] as string[]
  });

  const weekDays = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

  const handleToggleDay = (day: string) => {
    if (newChamber.days.includes(day)) {
      setNewChamber({ ...newChamber, days: newChamber.days.filter(d => d !== day) });
    } else {
      setNewChamber({ ...newChamber, days: [...newChamber.days, day] });
    }
  };

  const handleAddChamber = () => {
    if (!newChamber.name || !newChamber.address || !newChamber.time || newChamber.days.length === 0) {
      toast.error("Please fill all details and select at least one visiting day.");
      return;
    }
    setChambers([
      ...chambers,
      { id: `c${Date.now()}`, ...newChamber, active: true }
    ]);
    setShowAddForm(false);
    setNewChamber({ name: "", address: "", time: "", days: [] });
    toast.success("New chamber added successfully!");
  };

  const handleRemoveChamber = (id: string) => {
    setChambers(chambers.filter(c => c.id !== id));
    toast.success("Chamber removed.");
  };

  const toggleChamberStatus = (id: string) => {
    setChambers(chambers.map(c => c.id === id ? { ...c, active: !c.active } : c));
    toast.success("Chamber status updated.");
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="flex justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              Chambers & Schedule
            </h1>
            <p className="text-slate-500 mt-1">Manage your practice locations, visiting days, and time slots.</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-bold rounded-xl shadow-lg shadow-[#2F80ED]/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add Chamber
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full p-6 lg:p-8"
          >
            <h3 className="text-[16px] font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-[#2F80ED]" /> Add New Chamber
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Chamber Name / Hospital</label>
                <input 
                  type="text" 
                  placeholder="e.g. Labaid Cardiac Hospital"
                  value={newChamber.name}
                  onChange={(e) => setNewChamber({...newChamber, name: e.target.value})}
                  className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Time Slot</label>
                <input 
                  type="text" 
                  placeholder="e.g. 05:00 PM - 09:00 PM"
                  value={newChamber.time}
                  onChange={(e) => setNewChamber({...newChamber, time: e.target.value})}
                  className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Full Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. House 1, Road 4, Dhanmondi, Dhaka"
                  value={newChamber.address}
                  onChange={(e) => setNewChamber({...newChamber, address: e.target.value})}
                  className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED]"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-[13px] font-semibold text-slate-600 mb-3 ml-1">Visiting Days</label>
              <div className="flex flex-wrap gap-3">
                {weekDays.map(day => (
                  <button
                    key={day}
                    onClick={() => handleToggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border ${
                      newChamber.days.includes(day)
                        ? "bg-[#2F80ED] text-white border-[#2F80ED] shadow-md shadow-[#2F80ED]/20"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#2F80ED] hover:text-[#2F80ED]"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button 
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-[14px] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddChamber}
                className="px-8 py-2.5 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-xl text-[14px] shadow-lg transition-all"
              >
                Save Chamber
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {chambers.map((chamber) => (
          <div key={chamber.id} className={`bg-white rounded-[24px] shadow-sm border p-6 transition-all ${chamber.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              
              {/* Info */}
              <div className="flex gap-5 items-start flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${chamber.active ? 'bg-[#2F80ED]/10 text-[#2F80ED]' : 'bg-slate-100 text-slate-400'}`}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-slate-800 mb-1">{chamber.name}</h3>
                  <div className="space-y-1.5">
                    <p className="text-[14px] text-slate-500 flex items-center gap-2">
                      <MapPin size={14} /> {chamber.address}
                    </p>
                    <p className="text-[14px] text-slate-500 flex items-center gap-2">
                      <Clock size={14} /> {chamber.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Days & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 xl:border-l xl:border-slate-100 xl:pl-8">
                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                  {weekDays.map(day => (
                    <span 
                      key={day}
                      className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                        chamber.days.includes(day)
                          ? chamber.active ? "bg-slate-800 text-white" : "bg-slate-300 text-white"
                          : "bg-slate-50 text-slate-400 border border-slate-100"
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                  <button 
                    onClick={() => toggleChamberStatus(chamber.id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    {chamber.active ? (
                      <ToggleRight size={32} className="text-[#22C55E]" />
                    ) : (
                      <ToggleLeft size={32} className="text-slate-300 group-hover:text-slate-400" />
                    )}
                    <span className="text-[11px] font-bold text-slate-500">{chamber.active ? "Active" : "Inactive"}</span>
                  </button>
                  <button 
                    onClick={() => handleRemoveChamber(chamber.id)}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors ml-auto sm:ml-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {chambers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[24px] border border-slate-200 border-dashed">
            <Building2 size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-[14px]">No chambers active. Add your primary chamber schedule to receive appointments.</p>
          </div>
        )}
      </div>
    </div>
  );
}
