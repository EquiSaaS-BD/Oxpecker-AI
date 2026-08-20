"use client";

import React, { useState } from "react";
import { Search, MapPin, Calendar, Users, Building, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const CHAMBERS = [
  { id: "gulshan-morning", name: "Gulshan Branch", room: "Room 201", date: "25 Jul, 2026", location: "Gulshan 2, Dhaka", patientsCount: 12 },
  { id: "banani-evening", name: "Banani Clinic", room: "Room 105", date: "25 Jul, 2026", location: "Banani, Dhaka", patientsCount: 8 },
  { id: "dhanmondi-morning", name: "Dhanmondi Care", room: "Room 304", date: "26 Jul, 2026", location: "Dhanmondi 27", patientsCount: 15 },
  { id: "mirpur-evening", name: "Mirpur Specialized", room: "Room 401", date: "26 Jul, 2026", location: "Mirpur 10", patientsCount: 5 },
];

export default function ChamberSelectionPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChambers = CHAMBERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 lg:pb-10 relative overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-5 lg:py-8 bg-white/50 backdrop-blur-md border-b border-white/60 sticky top-[72px] lg:top-0">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] lg:text-[28px] font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="w-12 h-12 rounded-[16px]    flex items-center justify-center shrink-0 border border-blue-200 shadow-sm">
                <Building className="text-[#2F80ED]" size={24} strokeWidth={2.5} />
              </div>
              Select Chamber
            </h1>
            <p className="text-slate-500 mt-2 text-[14px] lg:text-[15px] font-medium">Choose a chamber location to view its patient list.</p>
          </div>
          
          <div className="relative w-full lg:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search chamber or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[48px] pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-[#2F80ED] focus:ring-4 focus:ring-[#2F80ED]/10 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Chamber List Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full mt-6">
        
        {filteredChambers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Building size={24} className="text-slate-400" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-800">No Chambers Found</h3>
            <p className="text-[14px] text-slate-500 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {filteredChambers.map((chamber, index) => (
              <motion.div
                key={chamber.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/assistant/patient-list/${chamber.id}`}>
                  <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[20px] p-4 lg:p-6 min-h-[120px] lg:min-h-[140px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[#2F80ED]/30 transition-all group relative overflow-hidden flex flex-col justify-between">
                    
                    {/* Background Graphic */}
                    <div className="absolute right-[-10%] top-[-10%] w-[40%] h-[120%]  from-blue-50/50  pointer-events-none group-hover:from-blue-100/50 transition-colors" />

                    <div className="flex justify-between items-start relative z-10">
                      <div className="pr-12">
                        <h3 className="text-[18px] lg:text-[20px] font-bold text-slate-800 mb-2 group-hover:text-[#2F80ED] transition-colors line-clamp-1">{chamber.name}</h3>
                        
                        <div className="space-y-1.5">
                          <p className="flex items-center gap-2 text-[13px] lg:text-[14px] text-slate-600 font-medium">
                            <MapPin size={16} className="text-rose-500" /> {chamber.location}
                          </p>
                          <p className="flex items-center gap-2 text-[13px] lg:text-[14px] text-slate-600 font-medium">
                            <Building size={16} className="text-emerald-500" /> {chamber.room}
                          </p>
                          <p className="flex items-center gap-2 text-[13px] lg:text-[14px] text-slate-600 font-medium">
                            <Calendar size={16} className="text-amber-500" /> {chamber.date}
                          </p>
                        </div>
                      </div>

                      {/* Patient Count Badge */}
                      <div className="absolute top-0 right-0 w-[48px] h-[48px] bg-blue-50 border border-blue-100 rounded-full flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:bg-[#2F80ED] group-hover:border-[#2F80ED] transition-colors">
                        <span className="text-[16px] font-black text-[#2F80ED] group-hover:text-white leading-none">{chamber.patientsCount}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-[#2F80ED] transition-colors">View Queue</span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2F80ED] group-hover:text-white transition-colors">
                        <ArrowRight size={16} />
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
