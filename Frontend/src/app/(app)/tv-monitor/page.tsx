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
    <div className="w-full h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row overflow-hidden font-sans select-none">
      
      {/* LEFT SIDE: Hero Section (NOW SERVING) */}
      <div className="w-full md:w-[60%] h-[50vh] md:h-full bg-white flex flex-col relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-100/50 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="p-8 md:p-12 flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-[24px] md:text-[32px] leading-none">O</span>
          </div>
          <div>
            <h1 className="text-[20px] md:text-[28px] font-extrabold text-slate-900 tracking-tight">Oxpecker Clinic</h1>
            <p className="text-[14px] md:text-[16px] text-slate-500 font-medium">Dr. M. Rahman • Chamber 01</p>
          </div>
        </div>

        {/* Center Now Serving */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          
          <motion.div 
            animate={{ scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2 mb-8"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
            <span className="text-emerald-600 font-bold tracking-widest uppercase text-xl">Now Serving</span>
          </motion.div>

          {activePatient ? (
            <motion.div 
              key={activePatient.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-[100px] md:text-[140px] font-black text-slate-900 leading-none tracking-tighter mb-4">
                {activePatient.id}
              </h2>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-sky-50 border border-sky-100 rounded-full shadow-sm">
                <Clock size={20} className="text-sky-600" />
                <span className="text-sky-800 text-[20px] font-bold font-mono tracking-widest">{formatTime(timer)}</span>
              </div>
            </motion.div>
          ) : (
            <div className="text-center">
              <h2 className="text-[60px] md:text-[80px] font-black text-slate-300 leading-none tracking-tight mb-4">
                No active patient
              </h2>
            </div>
          )}

        </div>
        
        {/* Footer info */}
        <div className="p-8 md:p-12 relative z-10 flex justify-between items-end">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center border border-sky-100">
                <Users size={20} className="text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Waiting</p>
                <p className="text-xl font-bold text-slate-900">{upcomingPatients.length}</p>
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-slate-400 text-sm font-medium">Please wait for your token number</p>
            <p className="text-slate-500 font-bold text-lg">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Queue List */}
      <div className="w-full md:w-[40%] h-[50vh] md:h-full bg-slate-50 p-6 md:p-8 flex flex-col relative z-20">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="text-sky-600" size={24} /> 
            Up Next
          </h2>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
          <AnimatePresence>
            {upcomingPatients.map((patient, index) => (
              <motion.div 
                key={patient.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full rounded-2xl p-6 flex items-center justify-between border ${
                  index === 0 
                    ? 'bg-sky-50 border-sky-200 shadow-md' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                } transition-colors backdrop-blur-sm`}
              >
                <div className="flex items-center gap-6">
                  {/* Position Badge */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-black ${
                    index === 0 ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div>
                    <h3 className={`text-2xl font-black mb-1 ${index === 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {patient.id}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold uppercase tracking-wide ${index === 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-500 mb-1">Est. Wait</p>
                  <p className={`text-xl font-bold ${index === 0 ? 'text-sky-700' : 'text-slate-700'}`}>
                    ~{patient.waitTime} min
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
