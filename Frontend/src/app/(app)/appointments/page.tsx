"use client";

import React, { useState, useEffect } from "react";
import { AppointmentPass } from "@/components/appointments/AppointmentPass";
import { CalendarRange, Stethoscope, Calendar, Clock, MapPin, Video, Navigation, Activity, History, CheckCircle2, XCircle, ArrowRight, Users, AlertTriangle, FileText } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ReportsPage from "../reports/page";

const mockDoctorAppointments = [
  {
    type: "doctor" as const,
    id: "AP-8942-01",
    doctorName: "Dr. Farzana Alam",
    doctorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop",
    specialty: "Gynecologist",
    hospitalName: "Labaid Specialized Hospital",
    hospitalLogo: "/images/Oxpecker_icon.png",
    address: "House 6, Road 4, Dhanmondi, Dhaka",
    date: "24 Nov, 2026",
    time: "10:30 AM",
    patientName: "Patient Profile",
    age: "28",
    guardianName: "Md. Hasan",
    phone: "017XXXXXXXX",
    fee: 1050,
    advancePaid: 0,
    status: "Confirmed" as const
  }
];

const mockHistoryAppointments = [
  { id: "AP-8120", doctor: "Dr. Ahmed Hossain", specialty: "Cardiologist", date: "15 Oct, 2026", time: "05:00 PM", status: "Completed", fee: 1200 },
  { id: "AP-7052", doctor: "Dr. Salma Begum", specialty: "Dermatologist", date: "02 Sep, 2026", time: "11:30 AM", status: "Cancelled", fee: 800 },
  { id: "AP-6401", doctor: "Dr. Farzana Alam", specialty: "Gynecologist", date: "10 Aug, 2026", time: "10:00 AM", status: "Completed", fee: 1000 },
];

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"tracker" | "passes" | "history" | "reports">("tracker");
  const [timer, setTimer] = useState(1543);
  
  // Dynamic Queue Simulation
  const [peopleAhead, setPeopleAhead] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate queue moving every 10 seconds for demo
  useEffect(() => {
    if (peopleAhead > 0) {
      const sim = setTimeout(() => setPeopleAhead(prev => prev - 1), 10000);
      return () => clearTimeout(sim);
    }
  }, [peopleAhead]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  const isNext = peopleAhead === 1;
  const isNow = peopleAhead === 0;

  // Dynamic Styles
  let tokenTheme = "bg-[#00C2A8]/5 border-[#00C2A8]/20";
  let tokenText = "text-[#00C2A8]";
  let mainText = "text-slate-900";
  let iconTheme = "text-slate-400";
  let message = `Doctor is seeing S-${String(14 - peopleAhead).padStart(2, '0')}`;
  let highlightBg = "bg-[#00C2A8]/10";
  let badgeTheme = "bg-[#00C2A8]/10 text-[#00C2A8]";

  if (isNext) {
     tokenTheme = "bg-amber-50 border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.15)] ring-4 ring-amber-500/10";
     tokenText = "text-amber-500";
     mainText = "text-amber-800";
     iconTheme = "text-amber-500 animate-pulse";
     message = "You are next! Please get ready.";
     highlightBg = "bg-amber-400/20";
     badgeTheme = "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm";
  } else if (isNow) {
     tokenTheme = "bg-emerald-50 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.2)] ring-4 ring-emerald-500/20";
     tokenText = "text-emerald-500";
     mainText = "text-emerald-800";
     iconTheme = "text-emerald-500";
     message = "It's your turn! Please enter.";
     highlightBg = "bg-emerald-400/30";
     badgeTheme = "bg-emerald-500 text-white shadow-md animate-pulse";
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F7FAFC] font-sans pb-32">
      
      {/* =========================================
          HEADER & PREMIUM NAVBAR
         ========================================= */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 px-4 md:px-8 py-4 print:hidden shadow-sm">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-center relative gap-4">
          <h1 className="font-[900] text-[20px] md:text-[24px] text-slate-900 flex items-center gap-2 md:absolute left-0 tracking-tight">
            <CalendarRange size={24} className="text-[#00C2A8]" />
            Appointments
          </h1>
          
          {/* iOS Style Segmented Control */}
          <div className="w-full md:w-[640px] bg-slate-100/80 p-1.5 rounded-[16px] grid grid-cols-4 gap-1 relative shadow-inner border border-slate-200/50">
            {["tracker", "passes", "history", "reports"].map((tab) => {
              const Icon = tab === 'tracker' ? Activity : tab === 'passes' ? Stethoscope : tab === 'history' ? History : FileText;
              const label = tab === 'tracker' ? 'Tracker' : tab === 'passes' ? 'Passes' : tab === 'history' ? 'History' : 'Reports';
              
              return (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`relative z-10 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 h-[52px] md:h-[44px] rounded-xl text-[12px] md:text-[14px] font-[800] transition-colors ${activeTab === tab ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {activeTab === tab && (
                     <motion.div layoutId="activeNavTab" className="absolute inset-0 bg-white rounded-[12px] shadow-[0_2px_10px_rgba(0,0,0,0.08)] -z-10" />
                   )}
                   <Icon size={18} className={activeTab === tab ? 'text-[#00C2A8]' : ''} />
                   <span>{label}</span>
                 </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto ${activeTab !== "reports" ? "p-4 md:p-8" : ""}`}>
        
        {/* =========================================
            LIVE TRACKER TAB
           ========================================= */}
        {activeTab === "tracker" && (
           <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             <div className="w-full min-h-[400px] bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-100 p-5 md:p-8 flex flex-col gap-8">
               
               {/* Top Section: Doctor & Location */}
               <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-100 pb-6">
                 <div className="flex items-center gap-5">
                   <div className="w-[72px] h-[72px] rounded-[20px] overflow-hidden shadow-md border border-slate-100 relative shrink-0">
                      <Image src={mockDoctorAppointments[0].doctorImage} alt="Doctor" fill className="object-cover" />
                   </div>
                   <div>
                     <h2 className="text-[24px] font-[900] text-slate-900 leading-tight tracking-tight">
                       {mockDoctorAppointments[0].doctorName}
                     </h2>
                     <p className="text-[15px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                       <MapPin size={16} className="text-[#00C2A8]" /> {mockDoctorAppointments[0].hospitalName}
                     </p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 md:justify-end">
                    <button className="h-[48px] px-6 rounded-xl bg-[#00C2A8]/10 text-[#00C2A8] font-[800] text-[15px] hover:bg-[#00C2A8]/20 transition-colors flex items-center gap-2">
                      <Video size={18} /> Video Call
                    </button>
                 </div>
               </div>
               
               {/* Middle Section: Timing & Status Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="h-[88px]  from-emerald-500/10 to-emerald-500/5 rounded-[24px] border border-emerald-500/20 flex flex-col justify-center px-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                   <span className="text-[12px] font-[800] text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span>
                     LIVE STATUS
                   </span>
                   <span className="text-[18px] font-[900] text-emerald-700">Consultation Running</span>
                 </div>
                 
                 <div className="h-[88px] bg-slate-900 rounded-[24px] shadow-inner flex flex-col justify-center items-center relative overflow-hidden">
                   <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]    blur-xl"></div>
                   <span className="text-[11px] font-[800] text-slate-400 uppercase tracking-widest mb-0.5 relative z-10 flex items-center gap-1.5"><Clock size={12} /> ELAPSED TIME</span>
                   <span className="text-[32px] font-mono font-[900] text-emerald-400 leading-none relative z-10 tracking-tighter drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                     {formatDuration(timer)}
                   </span>
                 </div>
               </div>

               {/* Bottom Section: Dynamic Serial Ticket */}
               <motion.div 
                 layout
                 className={`mt-2 flex flex-col md:flex-row rounded-[32px] relative overflow-hidden transition-all duration-500 border ${tokenTheme}`}
               >
                 
                 {/* Left Side: Token */}
                 <div className="flex-[2] p-6 md:p-8 flex flex-col relative z-10">
                   <div className={`absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${highlightBg}`}></div>
                   
                   {/* Date & Time Header */}
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-6 pb-4 border-b border-slate-900/10 relative z-10">
                     <div className={`flex items-center gap-4 text-[14px] font-[800] ${mainText}`}>
                       <span className="flex items-center gap-1.5"><Calendar size={16} /> {mockDoctorAppointments[0].date}</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-900/20"></span>
                       <span className="flex items-center gap-1.5"><Clock size={16} /> {mockDoctorAppointments[0].time}</span>
                     </div>
                     <span className={`text-[12px] font-[800] uppercase tracking-widest ${isNow ? 'text-emerald-500' : isNext ? 'text-amber-500' : 'text-slate-400'}`}>Appointment Schedule</span>
                   </div>

                   {/* Token Details */}
                   <div className="flex flex-col md:flex-row items-center justify-between w-full relative z-10">
                     <div className="flex flex-col items-center md:items-start">
                       <span className={`text-[13px] font-[900] uppercase tracking-widest mb-2 px-3 py-1 rounded-full transition-colors duration-500 ${badgeTheme}`}>
                         Your Token
                       </span>
                       <div className={`text-[72px] font-[900] leading-none tracking-tighter transition-colors duration-500 drop-shadow-sm ${tokenText}`}>
                         S-14
                       </div>
                     </div>
                   
                   <div className="mt-6 md:mt-0 text-center md:text-right flex flex-col gap-2 relative z-10">
                     <div className={`flex items-center justify-center md:justify-end gap-2 font-[900] text-[24px] transition-colors duration-500 ${isNow ? 'text-emerald-600' : 'text-amber-500'}`}>
                       {isNow ? (
                         <><CheckCircle2 size={24} className="animate-bounce" /> Your Turn!</>
                       ) : isNext ? (
                         <><AlertTriangle size={24} className="animate-pulse" /> 1 Ahead</>
                       ) : (
                         <><Users size={24} /> {peopleAhead} Ahead</>
                       )}
                     </div>
                     <span className={`text-[16px] font-[700] transition-colors duration-500 ${mainText}`}>{message}</span>
                   </div>
                 </div>
               </div>

                 {/* Ticket Perforation / Divider (Desktop) */}
                 <div className="hidden md:flex flex-col justify-between items-center w-8 relative z-20">
                    <div className="w-8 h-8 rounded-full bg-white absolute -top-4 border-b border-slate-200/50 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)]" />
                    <div className="h-full border-l-[4px] border-dashed border-black/10 my-8" />
                    <div className="w-8 h-8 rounded-full bg-white absolute -bottom-4 border-t border-slate-200/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
                 </div>

                 {/* Ticket Perforation / Divider (Mobile) */}
                 <div className="md:hidden flex w-full justify-between items-center h-8 relative z-20">
                    <div className="w-8 h-8 rounded-full bg-white absolute -left-4 border-r border-slate-200/50 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.02)]" />
                    <div className="w-full border-t-[4px] border-dashed border-black/10 mx-8" />
                    <div className="w-8 h-8 rounded-full bg-white absolute -right-4 border-l border-slate-200/50 shadow-[inset_2px_0_4px_rgba(0,0,0,0.02)]" />
                 </div>

                 {/* Right Side: Wait Time */}
                 <div className="flex-1 bg-white/30 backdrop-blur-sm p-6 md:p-8 flex flex-col items-center justify-center text-center relative z-10">
                   <Clock size={28} className={`mb-3 transition-colors duration-500 ${iconTheme}`} />
                   <span className={`text-[32px] font-[900] leading-none mb-2 tracking-tight transition-colors duration-500 ${mainText}`}>
                     {isNow ? "0 Min" : isNext ? "~5 Min" : `~${peopleAhead * 15} Min`}
                   </span>
                   <span className={`text-[12px] font-[800] uppercase tracking-widest transition-colors duration-500 ${isNow ? 'text-emerald-500/80' : isNext ? 'text-amber-500/80' : 'text-slate-400'}`}>Est. Wait Time</span>
                 </div>
               </motion.div>

             </div>
           </div>
        )}

        {/* =========================================
            PASSES & MEMOS TAB
           ========================================= */}
        {activeTab === "passes" && (
          <div className="max-w-[700px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 text-center bg-blue-50/80 p-5 rounded-[20px] border border-blue-100 flex items-center justify-center gap-3 print:hidden shadow-sm">
              <Activity className="text-blue-500" size={24} />
              <p className="text-blue-800 text-[16px] font-bold">
                Show this Digital Memo at the hospital reception to confirm your arrival.
              </p>
            </div>
            {mockDoctorAppointments.map((appointment) => (
              <AppointmentPass key={appointment.id} data={appointment} />
            ))}
          </div>
        )}

        {/* =========================================
            HISTORY TAB
           ========================================= */}
        {activeTab === "history" && (
          <div className="w-full max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-[24px] font-[900] text-slate-900 mb-8 flex items-center gap-2">
              <History className="text-[#00C2A8]" /> Past Appointments
            </h2>
            
            <div className="flex flex-col gap-4">
              {mockHistoryAppointments.map((apt, idx) => (
                <div key={idx} className="bg-white border border-slate-200/80 rounded-[24px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-300 transition-all cursor-pointer group">
                  
                  <div className="flex items-center gap-5">
                    {/* Date Bubble */}
                    <div className="w-[72px] h-[72px] rounded-[20px] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-sky-600/5 group-hover:border-primary/20 transition-colors">
                      <span className="text-[24px] font-[900] text-slate-800 leading-none group-hover:text-sky-600 transition-colors">{apt.date.split(' ')[0]}</span>
                      <span className="text-[12px] font-[800] text-slate-500 uppercase mt-1 tracking-wider">{apt.date.split(' ')[1].replace(',', '')}</span>
                    </div>
                    
                    {/* Info */}
                    <div>
                      <h3 className="text-[20px] font-[900] text-slate-900 group-hover:text-[#00C2A8] transition-colors tracking-tight">{apt.doctor}</h3>
                      <p className="text-[15px] font-medium text-slate-500">{apt.specialty}</p>
                      <p className="text-[14px] text-slate-400 mt-1.5 font-bold flex items-center gap-1.5"><Clock size={14}/> {apt.time} • ৳{apt.fee}</p>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-3 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                    {apt.status === "Completed" ? (
                      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[14px] font-[800] rounded-full border border-emerald-100">
                        <CheckCircle2 size={16} /> Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-500 text-[14px] font-[800] rounded-full border border-red-100">
                        <XCircle size={16} /> Cancelled
                      </span>
                    )}
                    <button className="text-[15px] font-[800] text-[#00C2A8] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                      View Details <ArrowRight size={18} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <button className="px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-[800] text-[15px] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                Load More History
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          REPORTS TAB (Edge to Edge)
         ========================================= */}
      {activeTab === "reports" && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
           <ReportsPage isEmbedded={true} />
        </div>
      )}

    </div>
  );
}
