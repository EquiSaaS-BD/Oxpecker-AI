"use client";

import React, { useState, useEffect } from "react";
import { AppointmentPass } from "@/components/appointments/AppointmentPass";
import { CalendarRange, Bed, Stethoscope, Calendar, Clock, MapPin, Video, Navigation, Activity, BellRing } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const timelineStages = [
  "Booked", "Confirmed", "Checked In", "Waiting", "Doctor Calling", "Consultation", "Completed"
];

// Mock data representing saved appointments
const mockDoctorAppointments = [
  {
    type: "doctor" as const,
    id: "AP-8942-01",
    doctorName: "Dr. Farzana Alam",
    doctorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop",
    specialty: "Gynecologist",
    hospitalName: "Labaid Specialized Hospital",
    hospitalLogo: "/images/shustota-icon.png",
    address: "House 6, Road 4, Dhanmondi, Dhaka",
    date: "24 Nov, 2026",
    time: "10:30 AM",
    patientName: "Rafin Hossain",
    age: "28",
    guardianName: "Md. Hasan",
    phone: "017XXXXXXXX",
    fee: 1050,
    advancePaid: 0,
    status: "Confirmed" as const
  }
];

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"tracker" | "passes">("tracker");
  
  const [currentStageIndex, setCurrentStageIndex] = useState(3); // "Waiting"
  const [showNotification, setShowNotification] = useState(true);

  // Live Queue Mock State
  const [timer, setTimer] = useState(263); // Mock starting time 4:23
  
  const mockUpcomingQueue = [
    { id: "S-02", waitTime: 12 },
    { id: "S-03", waitTime: 25 },
    { id: "S-04", waitTime: 38 }
  ];

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

  // Auto-hide notification after 6s for demo
  useEffect(() => {
    const notifTimer = setTimeout(() => setShowNotification(false), 6000);
    return () => clearTimeout(notifTimer);
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-[#F7FAFC] font-sans pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <h1 className="font-[800] text-[20px] text-slate-900 flex items-center gap-2">
          <CalendarRange size={22} className="text-[#00C2A8]" />
          My Appointments
        </h1>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-[12px] w-full md:w-auto">
          <button 
            onClick={() => setActiveTab("tracker")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-[14px] font-bold transition-all ${activeTab === 'tracker' ? 'bg-white text-slate-900 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95'}`}
          >
            <Activity size={16} /> Live Tracker
          </button>
          <button 
            onClick={() => setActiveTab("passes")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-[14px] font-bold transition-all ${activeTab === 'passes' ? 'bg-white text-slate-900 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95'}`}
          >
            <Stethoscope size={16} /> Passes & Memos
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        
        {activeTab === "tracker" && (
           <div className="w-full flex flex-col gap-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-[20px] font-bold text-slate-800">Live Appointment Tracker</h2>
             
             {/* 1. Appointment Card (340px height) */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full h-auto lg:h-[340px] bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 lg:p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
             >
               <div className="flex flex-col lg:flex-row justify-between gap-6">
                 <div className="flex gap-5 items-start">
                   <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-4 border-white shadow-sm relative bg-slate-50 shrink-0">
                      <Image src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop" alt="Doctor" fill className="object-cover" />
                   </div>
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <h2 className="text-[22px] font-bold text-slate-800">Dr. Farzana Alam</h2>
                       <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] text-[12px] font-bold rounded-full flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse"></span> In Consultation
                       </span>
                     </div>
                     <p className="text-[15px] text-slate-500 font-medium flex items-center gap-1.5 mb-1"><MapPin size={16} /> Labaid Specialized Hospital</p>
                     <p className="text-[14px] text-slate-400">Gynecologist • First Visit</p>
                   </div>
                 </div>
                 
                 <div className="flex flex-col lg:items-end gap-2 text-right bg-slate-50 p-4 lg:bg-transparent lg:p-0 rounded-xl">
                   <div className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">Appointment Date & Time</div>
                   <div className="flex items-center gap-2 text-[18px] font-bold text-slate-800">
                     <Calendar size={18} className="text-[#00C2A8]" /> Nov 24, 2026
                   </div>
                   <div className="flex items-center gap-2 text-[18px] font-bold text-slate-800">
                     <Clock size={18} className="text-[#00C2A8]" /> 10:30 AM
                   </div>
                 </div>
               </div>
       
               <div className="flex flex-col xl:flex-row gap-4 my-6">
                 {/* 1. Now Serving (TV Display logic) */}
                 <div className="flex-1 bg-slate-900 rounded-[20px] p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg border border-slate-800">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none" />
                   
                   <div className="flex items-center gap-2 mb-3 bg-emerald-500/20 px-4 py-1.5 rounded-full border border-emerald-500/30 relative z-10">
                     <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[14px] font-bold text-emerald-400 uppercase tracking-wider">Now Serving</span>
                   </div>
                   
                   <h2 className="text-[64px] font-black text-white leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] relative z-10 mb-2">
                     S-01
                   </h2>
                   
                   <div className="bg-slate-800/80 backdrop-blur-md px-5 py-2 rounded-xl border border-slate-700/50 flex flex-col items-center relative z-10">
                     <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Time Elapsed</span>
                     <span className="text-[24px] font-mono font-bold text-emerald-400 leading-none">{formatTime(timer)}</span>
                   </div>
                 </div>

                 {/* 2. Patient's Target Token */}
                 <div className="w-full xl:w-[200px] bg-[#F8FAFC] rounded-[20px] p-5 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                   <span className="text-[13px] text-slate-500 font-bold uppercase tracking-wider mb-2 text-center">Your Token</span>
                   <div className="w-full flex items-center justify-center gap-2">
                     <div className="w-4 h-4 rounded-full bg-[#00C2A8] animate-pulse" />
                     <span className="text-[48px] font-black text-[#00C2A8] leading-none">S-14</span>
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-200/60 w-full flex flex-row xl:flex-col justify-between items-center text-center gap-2">
                     <div>
                       <span className="block text-[20px] font-bold text-[#F59E0B] leading-none">12</span>
                       <span className="text-[11px] text-slate-500 font-bold uppercase">Ahead</span>
                     </div>
                     <div className="w-[1px] h-8 xl:w-full xl:h-[1px] bg-slate-200/60" />
                     <div>
                       <span className="block text-[20px] font-bold text-slate-800 leading-none">~45m</span>
                       <span className="text-[11px] text-slate-500 font-bold uppercase">Est. Wait</span>
                     </div>
                   </div>
                 </div>
                 
                 {/* 3. Up Next Queue */}
                 <div className="flex-[1.5] bg-[#F8FAFC] rounded-[20px] border border-slate-200 p-4 flex flex-col overflow-hidden">
                   <div className="flex items-center justify-between mb-3">
                     <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                       <Users size={16} className="text-slate-500" /> Up Next
                     </h3>
                   </div>
                   <div className="flex flex-col gap-2 overflow-y-auto max-h-[180px] custom-scrollbar pr-2">
                     {mockUpcomingQueue.map((patient, idx) => (
                       <div key={patient.id} className={`w-full p-3 rounded-xl flex items-center justify-between border ${idx === 0 ? 'bg-white border-[#2F80ED]/30 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-white'} transition-colors`}>
                         <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[13px] ${idx === 0 ? 'bg-[#2F80ED] text-white' : 'bg-slate-200 text-slate-600'}`}>
                             {idx + 1}
                           </div>
                           <div>
                             <span className={`text-[20px] font-black leading-none ${idx === 0 ? 'text-slate-800' : 'text-slate-600'}`}>{patient.id}</span>
                             <span className={`block text-[11px] font-bold mt-0.5 ${idx === 0 ? 'text-[#2F80ED]' : 'text-slate-400'}`}>{idx === 0 ? 'Be Ready' : 'In Line'}</span>
                           </div>
                         </div>
                         <div className="text-right">
                           <span className="text-[18px] font-bold text-amber-500 leading-none">~{patient.waitTime}m</span>
                           <span className="block text-[11px] text-slate-400 font-bold">WAIT</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
       
               <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="text-[13px] text-slate-400 font-medium flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                   <Activity size={14} className="text-[#00C2A8]" /> Avg Duration: 12 mins • Last Updated: Just now
                 </div>
                 <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
                   <button className="flex-1 md:flex-none px-5 h-[44px] rounded-[12px] bg-slate-100 text-slate-600 font-bold text-[14px] hover:bg-slate-200 transition-colors">Reschedule</button>
                   <button className="flex-1 md:flex-none px-5 h-[44px] rounded-[12px] bg-red-50 text-red-500 font-bold text-[14px] hover:bg-red-100 transition-colors">Cancel</button>
                   <button className="flex-1 md:flex-none px-5 h-[44px] rounded-[12px] bg-white border-2 border-slate-200 text-slate-700 font-bold text-[14px] hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors flex items-center justify-center gap-2">
                     <Navigation size={16} /> Navigate
                   </button>
                   <button className="flex-1 md:flex-none px-6 h-[44px] rounded-[12px] bg-[#00C2A8] text-white font-bold text-[14px] hover:bg-[#00a892] shadow-lg shadow-[#00C2A8]/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">
                     <Video size={18} /> Join Video
                   </button>
                 </div>
               </div>
             </motion.div>
       
             {/* 2. Patient Queue Tracker Timeline (240px height) */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="w-full h-auto md:h-[240px] bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 lg:p-8 flex flex-col justify-between overflow-hidden relative hover:shadow-md transition-shadow"
             >
               <div className="flex justify-between items-center z-10 relative">
                 <h2 className="text-[20px] font-bold text-slate-800">Appointment Progress</h2>
                 <span className="text-[14px] font-bold text-[#00C2A8] bg-[#00C2A8]/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-[#00C2A8] animate-pulse"></span>
                   Current Stage: Waiting
                 </span>
               </div>
       
               {/* Desktop Timeline */}
               <div className="relative mt-12 mb-6 px-4 z-10 hidden md:block">
                 <div className="absolute top-1/2 -translate-y-1/2 left-8 right-8 h-[8px] bg-slate-100 rounded-full z-0 overflow-hidden">
                    {/* Striped progress background effect could go here */}
                 </div>
                 
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(currentStageIndex / (timelineStages.length - 1)) * 100}%` }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="absolute top-1/2 -translate-y-1/2 left-8 h-[8px] bg-gradient-to-r from-[#00C2A8]/80 to-[#00C2A8] rounded-full z-0 shadow-[0_0_10px_rgba(0,194,168,0.5)]"
                 ></motion.div>
       
                 <div className="relative z-10 flex justify-between items-center w-full">
                   {timelineStages.map((stage, idx) => {
                     const isActive = idx <= currentStageIndex;
                     const isCurrent = idx === currentStageIndex;
                     return (
                       <div key={idx} className="flex flex-col items-center gap-3 relative">
                         <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center border-[4px] transition-all duration-500 z-10
                           ${isActive ? 'bg-[#00C2A8] border-white shadow-[0_0_0_3px_rgba(0,194,168,0.3)]' : 'bg-white border-slate-200'}
                           ${isCurrent ? 'scale-125' : ''}
                         `}>
                           {isActive && idx < currentStageIndex && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                           {isCurrent && <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>}
                         </div>
                         <span className={`text-[13px] font-bold absolute top-10 whitespace-nowrap px-2 py-1 rounded-md
                           ${isCurrent ? 'text-white bg-[#00C2A8] shadow-sm' : isActive ? 'text-slate-700' : 'text-slate-400'}
                         `}>
                           {stage}
                         </span>
                       </div>
                     );
                   })}
                 </div>
               </div>
               
               {/* Mobile Timeline */}
               <div className="md:hidden mt-6 flex flex-col gap-6 relative px-4 py-4 bg-slate-50 rounded-xl">
                 <div className="absolute top-6 bottom-6 left-[25px] w-[3px] bg-slate-200 z-0"></div>
                 <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: `${(currentStageIndex / (timelineStages.length - 1)) * 100}%` }}
                   transition={{ duration: 1.5 }}
                   className="absolute top-6 left-[25px] w-[3px] bg-[#00C2A8] z-0"
                 ></motion.div>

                 {timelineStages.map((stage, idx) => {
                   const isActive = idx <= currentStageIndex;
                   const isCurrent = idx === currentStageIndex;
                   return (
                     <div key={idx} className="flex items-center gap-5 relative z-10">
                       <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center border-[3px] transition-all
                         ${isActive ? 'bg-[#00C2A8] border-white shadow-[0_0_0_2px_rgba(0,194,168,1)]' : 'bg-white border-slate-200'}
                       `}>
                          {isActive && idx < currentStageIndex && <div className="w-2 h-2 bg-white rounded-full"></div>}
                       </div>
                       <span className={`text-[15px] font-bold ${isCurrent ? 'text-[#00C2A8]' : isActive ? 'text-slate-800' : 'text-slate-400'}`}>{stage}</span>
                     </div>
                   );
                 })}
               </div>
             </motion.div>
       
             {/* Live Notifications Slide-in */}
             <AnimatePresence>
               {showNotification && (
                 <motion.div 
                   initial={{ opacity: 0, x: 50 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                   className="fixed bottom-10 right-10 w-full max-w-[360px] h-auto min-h-[80px] bg-white rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center p-4 gap-4 z-50 cursor-pointer hover:-translate-y-1 transition-transform"
                   onClick={() => setShowNotification(false)}
                 >
                   <div className="w-[48px] h-[48px] rounded-full bg-[#00C2A8]/10 text-[#00C2A8] flex items-center justify-center shrink-0 relative">
                     <BellRing size={20} />
                     <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                   </div>
                   <div className="flex-1">
                     <h4 className="text-[14px] font-bold text-slate-800 mb-0.5">Queue Update</h4>
                     <p className="text-[13px] text-slate-500 font-medium leading-tight">Doctor has arrived. Queue started.</p>
                   </div>
                   <span className="text-[11px] text-slate-400 font-bold self-start mt-1 bg-slate-50 px-2 py-0.5 rounded-md">Just now</span>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        )}

        {activeTab === "passes" && (
          <div className="max-w-[700px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-slate-500 mb-8 text-center text-[15px] print:hidden bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              Show this Digital Memo at the hospital reception to confirm your arrival.
            </p>
            {mockDoctorAppointments.map((appointment) => (
              <AppointmentPass key={appointment.id} data={appointment} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
