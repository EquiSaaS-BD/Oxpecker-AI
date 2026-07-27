"use client";

import React, { useState } from "react";
import { ArrowLeft, Clock, MapPin, ChevronRight, MessageSquareHeart, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ChamberPatientListPage() {
  const params = useParams();
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  // Mock chamber info
  const chamberInfo = {
    id: params.id,
    name: params.id === 'gulshan-morning' ? "Gulshan Branch" : "Banani Clinic",
    room: "Room 201",
    date: "25 Jul, 2026"
  };

  const PATIENTS = [
    { id: "1", name: "Rahim Uddin", serial: 1, time: "10:00 AM", status: "Waiting", type: "New", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahim&backgroundColor=c0aede" },
    { id: "2", name: "Karim Ali", serial: 2, time: "10:15 AM", status: "Waiting", type: "Follow-up", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karim&backgroundColor=b6e3f4" },
    { id: "3", name: "Salma Begum", serial: 3, time: "10:30 AM", status: "Waiting", type: "Report", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Salma&backgroundColor=ffdfbf" },
    { id: "4", name: "Jabbar Mia", serial: 4, time: "10:45 AM", status: "Waiting", type: "New", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jabbar&backgroundColor=d1d4f9" },
    { id: "5", name: "Fatema Khatun", serial: 5, time: "11:00 AM", status: "Waiting", type: "New", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatema&backgroundColor=e0f2fe" },
  ];

  const handleStartConversation = () => {
    setIsStarting(true);
    // Simulate pushing entire list to live dashboard queue
    setTimeout(() => {
      toast.success(`Queue for ${chamberInfo.name} pushed to Live Dashboard!`);
      router.push("/assistant"); // Navigate to live dashboard to call them
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 lg:pb-10 relative overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 border-b border-white/60 bg-white/50 backdrop-blur-md sticky top-[72px] lg:top-0">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/assistant/patient-list" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-[#2F80ED] hover:border-[#2F80ED] transition-all shadow-sm shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-[18px] lg:text-[22px] font-black text-slate-800 leading-tight">{chamberInfo.name}</h1>
              <p className="text-[13px] text-slate-500 font-medium">{chamberInfo.date} • {chamberInfo.room}</p>
            </div>
          </div>

          {/* Desktop Start Conversation Button */}
          <div className="hidden lg:block">
             <button 
                onClick={handleStartConversation}
                disabled={isStarting}
                className="w-[250px] h-[56px] bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-[16px] rounded-[16px] shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
              >
                {isStarting ? (
                  <span className="animate-pulse">Starting Queue...</span>
                ) : (
                  <>
                    <MessageSquareHeart size={20} /> Start Conversation
                  </>
                )}
              </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Button (Right below header) */}
      <div className="lg:hidden sticky top-[146px] z-20 px-4 py-3 bg-slate-50/90 backdrop-blur-md border-b border-slate-200">
        <button 
          onClick={handleStartConversation}
          disabled={isStarting}
          className="w-full h-[52px] bg-emerald-500 active:bg-emerald-600 text-white font-bold text-[15px] rounded-[16px] shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
        >
          {isStarting ? (
            <span className="animate-pulse">Starting Queue...</span>
          ) : (
            <>
              <MessageSquareHeart size={20} /> Start Conversation
            </>
          )}
        </button>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full mt-4 lg:mt-8">
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-[#2F80ED]" size={18} /> Waiting List ({PATIENTS.length})
          </h2>
        </div>

        {/* Patient List Grid */}
        <div className="grid grid-cols-1 gap-3 lg:gap-4">
          {PATIENTS.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[20px] p-3 lg:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#2F80ED]/20 transition-all flex items-center gap-4 min-h-auto lg:min-h-[88px] cursor-pointer group"
            >
              {/* Serial Number & Avatar */}
              <div className="relative shrink-0 flex items-center gap-2 lg:gap-4">
                <span className="text-[14px] lg:text-[18px] font-black text-slate-300 w-5 lg:w-8 text-center">{patient.serial}</span>
                <div className="w-[48px] h-[48px] lg:w-[56px] lg:h-[56px] rounded-[14px] lg:rounded-[16px] bg-slate-100 border-2 border-white shadow-sm relative overflow-hidden group-hover:scale-105 transition-transform">
                  <Image src={patient.image} alt={patient.name} fill className="object-cover" />
                </div>
              </div>

              {/* Patient Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] lg:text-[18px] font-bold text-slate-800 truncate mb-1 group-hover:text-[#2F80ED] transition-colors">{patient.name}</h3>
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-[12px] lg:text-[14px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Clock size={14} className="text-amber-500"/> {patient.time}</span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-[10px] lg:text-[11px] ${
                    patient.type === 'New' ? 'bg-blue-100 text-blue-600' :
                    patient.type === 'Report' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {patient.type}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center">
                 <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2F80ED] group-hover:text-white transition-colors">
                   <ChevronRight size={18} />
                 </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>

    </div>
  );
}
