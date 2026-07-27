"use client";

import { useState } from "react";
import { mockPracticeLocations } from "@/lib/doctorMockData";
import { 
  MapPin, Plus, Trash2, Navigation, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";

export default function PracticeLocationsPage() {
  const [locations, setLocations] = useState<{ id: string, name: string, address: string, googleMapsLink?: string }[]>([
    { id: "L-1", name: "Green View Hospital", address: "Dhanmondi, Dhaka", googleMapsLink: "" }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: "", address: "", googleMapsLink: "" });

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.address) {
      toast.error("Name and Address are required.");
      return;
    }
    setLocations([
      ...locations,
      { id: `l${Date.now()}`, ...newLocation }
    ]);
    setShowAddForm(false);
    setNewLocation({ name: "", address: "", googleMapsLink: "" });
    toast.success("Location added successfully!");
  };

  const handleRemoveLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
    toast.success("Location removed.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard!");
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="flex justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              Practice Locations
            </h1>
            <p className="text-slate-500 mt-1">Manage physical addresses where patients can visit you.</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-bold rounded-xl shadow-lg shadow-[#2F80ED]/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add Location
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
              <MapPin size={20} className="text-[#2F80ED]" /> Add New Practice Location
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Location Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. HealthCare Clinic"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Google Maps Link (Optional)</label>
                <input 
                  type="text" 
                  placeholder="https://maps.google.com/..."
                  value={newLocation.googleMapsLink}
                  onChange={(e) => setNewLocation({...newLocation, googleMapsLink: e.target.value})}
                  className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Complete Address</label>
                <textarea 
                  placeholder="Street address, building number, floor, city, etc."
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                  className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] resize-none"
                />
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
                onClick={handleAddLocation}
                className="px-8 py-2.5 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-xl text-[14px] shadow-lg transition-all"
              >
                Save Location
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 flex flex-col justify-between group hover:border-[#2F80ED]/30 hover:shadow-md transition-all">
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#2F80ED]/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={24} className="text-[#2F80ED]" />
                </div>
                <button 
                  onClick={() => handleRemoveLocation(loc.id)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="text-[18px] font-bold text-slate-800 mb-2">{loc.name}</h3>
              <p className="text-[14px] text-slate-500 leading-relaxed mb-6">{loc.address}</p>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
              <button 
                onClick={() => copyToClipboard(loc.address)}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-[13px] border border-slate-200 transition-colors flex justify-center items-center gap-2"
              >
                <Copy size={16} /> Copy Address
              </button>
              <button 
                onClick={() => {
                  if(loc.googleMapsLink) window.open(loc.googleMapsLink, '_blank');
                  else toast.info("No maps link provided for this location.");
                }}
                className={`w-11 h-11 flex items-center justify-center rounded-xl text-white transition-colors ${
                  loc.googleMapsLink ? 'bg-[#2F80ED] hover:bg-[#2563EB] shadow-md shadow-[#2F80ED]/20' : 'bg-slate-300 cursor-not-allowed'
                }`}
                title="Open in Maps"
              >
                <Navigation size={18} />
              </button>
            </div>
            
          </div>
        ))}
      </div>
      
      {locations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-[24px] border border-slate-200 border-dashed">
          <MapPin size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-[14px]">No practice locations added.</p>
        </div>
      )}
    </div>
  );
}
