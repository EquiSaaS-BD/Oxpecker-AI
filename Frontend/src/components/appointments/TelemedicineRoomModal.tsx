"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Mic, MicOff, Video, VideoOff, MonitorUp, FileText, PhoneOff, 
  ShieldCheck, Volume2, X, ChevronRight, CheckCircle2, HeartPulse, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface TelemedicineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  specialty: string;
  doctorImage: string;
  hospitalName: string;
  patientName: string;
  serialNumber: string;
}

export function TelemedicineRoomModal({
  isOpen,
  onClose,
  doctorName,
  specialty,
  doctorImage,
  hospitalName,
  patientName,
  serialNumber
}: TelemedicineRoomModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCallSeconds(0);
      setIsScreenSharing(false);
      setIsNotesOpen(false);
      return;
    }

    const timer = setInterval(() => {
      setCallSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCallTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleToggleMic = () => {
    setIsMuted(prev => {
      const next = !prev;
      toast.info(next ? "মাইক্রোফোন মিউট করা হয়েছে" : "মাইক্রোফোন আনমিউট করা হয়েছে");
      return next;
    });
  };

  const handleToggleVideo = () => {
    setIsVideoOff(prev => {
      const next = !prev;
      toast.info(next ? "ক্যামেরা বন্ধ করা হয়েছে" : "ক্যামেরা চালু করা হয়েছে");
      return next;
    });
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(prev => {
      const next = !prev;
      toast.info(next ? "স্ক্রিন শেয়ারিং শুরু হয়েছে" : "স্ক্রিন শেয়ারিং বন্ধ করা হয়েছে");
      return next;
    });
  };

  const handleEndCall = () => {
    toast.success("পরামর্শ সম্পন্ন হয়েছে। প্রেসক্রিপশন রিপোর্ট সেকশনে সংরক্ষিত হয়েছে।");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="h-16 md:h-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0 relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 relative shrink-0">
              <Image src={doctorImage} alt={doctorName} fill className="object-cover" />
            </div>
            <div>
              <h3 className="text-white font-bold text-[15px] md:text-[17px] leading-tight flex items-center gap-2">
                {doctorName}
                <span className="text-[11px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </h3>
              <p className="text-slate-400 text-[12px] md:text-[13px]">{specialty} • {hospitalName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {formatCallTime(callSeconds)}
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700">
              <ShieldCheck size={14} className="text-[#00C2A8]" />
              WebRTC 1080p Encrypted
            </div>

            <button 
              onClick={handleEndCall}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Center Main Stage */}
        <div className="flex-1 relative flex items-center justify-center p-4 md:p-6 overflow-hidden">
          
          {/* Main Doctor Screen */}
          <div className="w-full h-full max-w-[1200px] max-h-[85vh] bg-slate-900 rounded-[24px] border border-slate-800 overflow-hidden relative shadow-2xl flex items-center justify-center">
            
            <Image 
              src={doctorImage} 
              alt={doctorName} 
              fill 
              className="object-cover opacity-80 filter brightness-95" 
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

            {/* Doctor Overlay Info */}
            <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 text-white text-sm font-semibold shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{doctorName} (Speaking)</span>
                <Volume2 size={16} className="text-emerald-400 ml-1" />
              </div>
            </div>

            {/* Picture in Picture Patient Preview */}
            <div className="absolute top-6 right-6 w-36 h-48 md:w-52 md:h-64 rounded-2xl bg-slate-800 border-2 border-slate-700/80 shadow-2xl overflow-hidden z-20 flex flex-col justify-between p-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 px-1">
                <span>{patientName}</span>
                <span className="text-[#00C2A8]">{serialNumber}</span>
              </div>

              {isVideoOff ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <VideoOff size={24} className="mb-1 text-slate-500" />
                  <span className="text-xs">Camera Off</span>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center relative rounded-xl overflow-hidden bg-slate-900">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                    {patientName.charAt(0) || "P"}
                  </div>
                  <span className="absolute bottom-2 text-[10px] text-slate-300 font-medium bg-black/60 px-2 py-0.5 rounded">
                    You (Patient)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                <span>{isMuted ? "Muted" : "Active"}</span>
                {isMuted && <MicOff size={12} className="text-rose-400" />}
              </div>
            </div>

            {/* Notes Drawer (when active) */}
            <AnimatePresence>
              {isNotesOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  className="absolute right-0 top-0 bottom-0 w-full sm:w-[360px] bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800 p-6 overflow-y-auto z-30 flex flex-col"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <h4 className="text-white font-bold text-base flex items-center gap-2">
                      <FileText size={18} className="text-[#00C2A8]" /> Live Clinical Notes
                    </h4>
                    <button onClick={() => setIsNotesOpen(false)} className="text-slate-400 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-4 text-sm">
                    <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Patient Vitals</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <span className="text-slate-300">BP: 122/80 mmHg</span>
                        <span className="text-slate-300">Heart Rate: 74 bpm</span>
                        <span className="text-slate-300">SpO2: 99%</span>
                        <span className="text-slate-300">Temp: 98.4 F</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Prescription Draft</p>
                      <ul className="mt-2 space-y-2 text-xs text-slate-200">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>Tab. Napa Extend 665mg - 1+0+1 (After meal, 5 days)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>Tab. Seclo 20mg - 1+0+0 (Before breakfast, 14 days)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Follow Up</p>
                      <p className="text-xs text-slate-300 mt-1">Review in 7 days with Complete Blood Count (CBC) report.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="h-24 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-4 flex items-center justify-center shrink-0 relative z-20">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            
            {/* Mic Button */}
            <button 
              onClick={handleToggleMic}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                isMuted ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Video Toggle Button */}
            <button 
              onClick={handleToggleVideo}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                isVideoOff ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>

            {/* Screen Share Button */}
            <button 
              onClick={handleToggleScreenShare}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                isScreenSharing ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30" : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
              title="Share Screen"
            >
              <MonitorUp size={22} />
            </button>

            {/* Notes Button */}
            <button 
              onClick={() => setIsNotesOpen(prev => !prev)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                isNotesOpen ? "bg-[#00C2A8] text-slate-950 font-bold shadow-lg shadow-[#00C2A8]/30" : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
              title="View Clinical Notes"
            >
              <FileText size={22} />
            </button>

            {/* End Call Button */}
            <button 
              onClick={handleEndCall}
              className="h-12 md:h-14 px-6 md:px-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm md:text-base flex items-center gap-2 shadow-xl shadow-rose-600/40 active:scale-95 transition-all"
            >
              <PhoneOff size={20} />
              <span>End Call</span>
            </button>

          </div>
        </div>

      </div>
    </AnimatePresence>
  );
}
