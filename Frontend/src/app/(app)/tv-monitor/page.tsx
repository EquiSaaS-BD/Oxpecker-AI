"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, BellRing, UserCircle, Activity } from 'lucide-react';
import Image from 'next/image';

const INITIAL_QUEUE = [
  { id: "S-01", status: "Serving", waitTime: 0 },
  { id: "S-02", status: "Next", waitTime: 12 },
  { id: "S-03", status: "Waiting", waitTime: 25 },
  { id: "S-04", status: "Waiting", waitTime: 38 },
  { id: "S-05", status: "Waiting", waitTime: 50 },
  { id: "S-06", status: "Waiting", waitTime: 62 },
];

export default function TvMonitorPage() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [timer, setTimer] = useState(263); // Mock starting time 4:23

  // Active Patient
  const activePatient = queue.find(p => p.status === 'Serving');
  const upcomingPatients = queue.filter(p => p.status !== 'Serving');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-white flex flex-col md:flex-row overflow-hidden font-sans select-none">
      
      {/* LEFT SIDE: Hero Section (NOW SERVING) */}
      <div className="w-full md:w-[60%] h-[50vh] md:h-full bg-[#0a1128] flex flex-col relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="p-8 md:p-12 flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-[#2F80ED] to-[#6DDA6E] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-[24px] md:text-[32px] leading-none">S</span>
          </div>
          <div>
            <h1 className="text-[20px] md:text-[28px] font-black tracking-tight text-white">Shustota AI</h1>
            <p className="text-[14px] md:text-[18px] text-slate-400 font-medium">Patient Queue Display</p>
          </div>
        </div>

        {/* Main Serving Display */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-3 mb-6 bg-emerald-500/20 px-6 py-2 rounded-full border border-emerald-500/30">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[20px] md:text-[24px] font-bold text-emerald-400 uppercase tracking-widest">Now Serving</span>
            </div>

            <h2 className="text-[120px] md:text-[180px] lg:text-[220px] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              {activePatient?.id || '--'}
            </h2>

            <div className="mt-8 flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-slate-800/50 backdrop-blur-md px-8 py-4 rounded-3xl border border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-600 relative shrink-0">
                  <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=0f172a" alt="Doctor" fill className="object-cover" />
                </div>
                <div className="text-left">
                  <p className="text-[20px] md:text-[24px] font-bold text-white">Dr. Sarah Rahman</p>
                  <p className="text-[16px] md:text-[18px] text-slate-400">Room 102</p>
                </div>
              </div>
              <div className="w-1 h-16 bg-slate-700 hidden md:block" />
              <div className="text-center md:text-left">
                <p className="text-[14px] uppercase tracking-wider text-slate-400 font-bold mb-1">Time Elapsed</p>
                <p className="text-[32px] md:text-[40px] font-mono font-bold text-emerald-400 leading-none">{formatTime(timer)}</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* RIGHT SIDE: Upcoming Queue */}
      <div className="w-full md:w-[40%] h-[50vh] md:h-full bg-slate-900 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Users size={28} className="text-slate-400" />
            <h2 className="text-[24px] md:text-[32px] font-bold text-white tracking-tight">Up Next</h2>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-[18px] font-bold text-slate-300">{upcomingPatients.length} Waiting</span>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 flex flex-col gap-4 relative z-10">
          <AnimatePresence>
            {upcomingPatients.map((patient, index) => (
              <motion.div 
                key={patient.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full rounded-2xl p-6 flex items-center justify-between border ${
                  index === 0 
                    ? 'bg-gradient-to-r from-[#2F80ED]/20 to-transparent border-[#2F80ED]/30' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                } transition-colors backdrop-blur-sm shadow-xl`}
              >
                <div className="flex items-center gap-6">
                  {/* Position Badge */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-black ${
                    index === 0 ? 'bg-[#2F80ED] text-white shadow-[0_0_20px_rgba(47,128,237,0.4)]' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Token */}
                  <div>
                    <h3 className={`text-[36px] md:text-[48px] font-black leading-none ${index === 0 ? 'text-white' : 'text-slate-300'}`}>
                      {patient.id}
                    </h3>
                    <p className={`text-[16px] md:text-[18px] mt-1 font-medium ${index === 0 ? 'text-blue-300' : 'text-slate-500'}`}>
                      {index === 0 ? 'Be Ready' : 'In Line'}
                    </p>
                  </div>
                </div>

                {/* Wait Time */}
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={18} className="text-amber-500" />
                    <span className="text-[14px] md:text-[16px] font-bold text-slate-400 uppercase tracking-wider">Est. Wait</span>
                  </div>
                  <div className="text-[24px] md:text-[32px] font-black text-amber-500">
                    ~{patient.waitTime} <span className="text-[16px] md:text-[20px] font-bold text-amber-500/70">min</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {upcomingPatients.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-12">
              <Activity size={48} className="text-slate-500 mb-4" />
              <p className="text-[24px] font-bold text-slate-400">No more patients waiting</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 text-center border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <p className="text-[14px] text-slate-500 font-medium flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live updates active
          </p>
        </div>

      </div>

    </div>
  );
}
