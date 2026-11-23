"use client";

import React, { useState, useEffect } from "react";
import { AppointmentPass } from "@/components/appointments/AppointmentPass";
import { CalendarRange, Stethoscope, Calendar, Clock, MapPin, Video, Navigation, Activity, History, CheckCircle2, ArrowRight, Users, AlertTriangle, FileText } from "lucide-react";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'sonner';
import ReportsPage from "../reports/page";
import { TelemedicineRoomModal } from "@/components/appointments/TelemedicineRoomModal";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { mockDoctors } from "@/lib/mockData";

// SAFETY: resolve the real profile of the doctor actually stored on the
// appointment record. Never substitutes another doctor's photo or identity.
const resolveDoctorProfile = (name?: string | null) => {
  if (!name) return null;
  const clean = String(name).toLowerCase().replace(/,.*$/, "").replace(/^prof\./, "").trim();
  return (
    mockDoctors.find((d) => {
      const dn = d.name.toLowerCase().replace(/^prof\./, "").trim();
      return clean === dn || dn.includes(clean) || clean.includes(dn.replace("dr. ", ""));
    }) || null
  );
};

const doctorAvatar = (name?: string | null) => resolveDoctorProfile(name)?.image || "/images/Oxpecker_icon.png";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"tracker" | "passes" | "history" | "reports">("tracker");
  const [timer, setTimer] = useState(1543);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [liveAppointments, setLiveAppointments] = useState<any[]>([]);

  useEffect(() => {
    async function loadBookings() {
      const combined: any[] = [];
      try {
        const hubRes = await fetch("/api/patient/360", { credentials: "include" });
        if (hubRes.ok) {
          const hubData = await hubRes.json();
          const hubApts = Array.isArray(hubData?.appointments) ? hubData.appointments : [];
          for (const a of hubApts) {
            combined.push({
              type: "doctor" as const,
              id: `HUB-${String(a.id).slice(0, 8).toUpperCase()}`,
              doctorName: a.doctorName || "Specialist Doctor",
              doctorImage: doctorAvatar(a.doctorName),
              specialty: `${a.specialty || "Specialist"}${a.source && a.source !== "oxpecker" ? ` (${a.source})` : ""}`,
              hospitalName: a.hospitalName || "Oxpecker Partner Hospital",
              hospitalLogo: "/images/Oxpecker_icon.png",
              address: a.notes || "Partner Hospital Chamber",
              date: a.date || (a.dateTime ? String(a.dateTime).slice(0, 10) : "Scheduled"),
              time: a.time || "10:30 AM",
              patientName: hubData?.patient?.name || user?.name || "Patient",
              age: hubData?.patient?.age != null && hubData.patient.age !== "" ? String(hubData.patient.age) : "N/A",
              guardianName: "Self",
              phone: hubData?.patient?.phone || "N/A",
              fee: Number(a.fee) || 1000,
              advancePaid: 0,
              status: "Confirmed" as const,
            });
          }
        }
      } catch {}

      try {
        if (user?.email || user?.id) {
          let query = supabase.from("bookings").select("*");
          const isValidUuid = (str?: string) => str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;

          if (isValidUuid(user?.id) && user?.email) {
            query = query.or(`patient_id.eq.${user.id},patient_email.ilike.${user.email}`);
          } else if (user?.email) {
            query = query.ilike("patient_email", user.email);
          } else if (isValidUuid(user?.id)) {
            query = query.eq("patient_id", user.id);
          }
          const { data, error } = await query.order("created_at", { ascending: false });
          if (!error && data && data.length > 0) {
            for (const b of data) {
              combined.push({
                type: "doctor" as const,
                id: `BK-${b.id.slice(0, 8).toUpperCase()}`,
                doctorName: b.doctor_name || "Specialist Doctor",
                doctorImage: doctorAvatar(b.doctor_name),
                specialty: b.doctor_specialty || "Specialist",
                hospitalName: "Oxpecker Partner Hospital",
                hospitalLogo: "/images/Oxpecker_icon.png",
                address: b.notes || "Dhanmondi, Dhaka",
                date: b.booking_date,
                time: b.booking_time,
                patientName: b.patient_name,
                age: "N/A",
                guardianName: "Self",
                phone: b.patient_phone || "N/A",
                fee: Number(b.total_fee) || 1050,
                advancePaid: 0,
                status: "Confirmed" as const,
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load live appointments:", err);
      }

      setLiveAppointments(combined);
    }
    loadBookings();
  }, [user]);

  // SAFETY: only real, live appointment records — no mock fallback. If there
  // are none, the tabs show honest empty states instead of another doctor's data.
  const allDoctorAppointments = liveAppointments;
  const currentAppointment = allDoctorAppointments[0];
  
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
  let iconTheme = "text-slate-500";
  let message = "Doctor is seeing other patients";
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

  const handleVideoCall = () => {
    setIsVideoModalOpen(true);
    toast.success(`${currentAppointment?.doctorName || "Doctor"} এর লাইভ টেলিমেডিসিন কক্ষে যুক্ত হওয়া হয়েছে।`);
  };

  const handleViewDetails = (doctorName: string) => {
    setActiveTab("passes");
    toast.info(`${doctorName} এর অ্যাপয়েন্টমেন্ট মেমো প্রদর্শিত হচ্ছে।`);
  };

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

             {!currentAppointment && (
               <div className="w-full min-h-[300px] bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-100 p-10 flex flex-col items-center justify-center gap-4 text-center">
                 <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                   <CalendarRange size={26} />
                 </div>
                 <div>
                   <h3 className="text-lg font-[900] text-slate-900">No Active Appointment</h3>
                   <p className="text-sm text-slate-500 mt-1 max-w-sm">
                     You have no upcoming appointments yet. Book a doctor to see your live queue tracker here.
                   </p>
                   <p className="text-[13px] text-slate-400 mt-1">আপনার কোনো আসন্ন অ্যাপয়েন্টমেন্ট নেই। ডাক্তার বুক করলে এখানে লাইভ ট্র্যাকার দেখা যাবে।</p>
                 </div>
                 <button
                   onClick={() => (window.location.href = "/doctors")}
                   className="mt-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl transition-colors"
                 >
                   Book a Doctor
                 </button>
               </div>
             )}

             {currentAppointment && (
             <div className="w-full min-h-[400px] bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-100 p-5 md:p-8 flex flex-col gap-8">
               
               {/* Top Section: Doctor & Location */}
               <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-100 pb-6">
                 <div className="flex items-center gap-5">
                    <div className="w-[72px] h-[72px] rounded-[20px] overflow-hidden shadow-md border border-slate-100 relative shrink-0">
                       <Image src={currentAppointment.doctorImage} alt="Doctor" fill className="object-cover" />
                    </div>
                    <div>
                      <h2 className="text-[24px] font-[900] text-slate-900 leading-tight tracking-tight">
                        {currentAppointment.doctorName}
                      </h2>
                      <p className="text-[15px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                        <MapPin size={16} className="text-[#00C2A8]" /> {currentAppointment.hospitalName}
                      </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 md:justify-end">
                    <button 
                      onClick={handleVideoCall}
                      className="h-[48px] px-6 rounded-xl bg-[#00C2A8]/10 text-[#00C2A8] font-[800] text-[15px] hover:bg-[#00C2A8]/20 transition-colors flex items-center gap-2 cursor-pointer"
                    >
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
                 
                 <div className="h-[88px] bg-white rounded-[24px] shadow-inner flex flex-col justify-center items-center relative overflow-hidden">
                   <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400 to-transparent blur-xl"></div>
                   <span className="text-[11px] font-[800] text-slate-500 uppercase tracking-widest mb-0.5 relative z-10 flex items-center gap-1.5"><Clock size={12} /> ELAPSED TIME</span>
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
                       <span className="flex items-center gap-1.5"><Calendar size={16} /> {currentAppointment.date}</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                       <span className="flex items-center gap-1.5"><Clock size={16} /> {currentAppointment.time}</span>
                     </div>
                     <span className={`text-[12px] font-[800] uppercase tracking-widest ${isNow ? 'text-emerald-500' : isNext ? 'text-amber-500' : 'text-slate-500'}`}>Appointment Schedule</span>
                   </div>

                   {/* Token Details */}
                   <div className="flex flex-col md:flex-row items-center justify-between w-full relative z-10">
                     <div className="flex flex-col items-center md:items-start">
                       <span className={`text-[13px] font-[900] uppercase tracking-widest mb-2 px-3 py-1 rounded-full transition-colors duration-500 ${badgeTheme}`}>
                         Your Token
                       </span>
                       <div className={`text-[72px] font-[900] leading-none tracking-tighter transition-colors duration-500 drop-shadow-sm ${tokenText}`}>
                         {currentAppointment.id.replace(/[^A-Z0-9]/g, "").slice(-4)}
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
                   <span className={`text-[12px] font-[800] uppercase tracking-widest transition-colors duration-500 ${isNow ? 'text-emerald-500/80' : isNext ? 'text-amber-500/80' : 'text-slate-500'}`}>Est. Wait Time</span>
                 </div>
               </motion.div>

             </div>
             )}

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
            {allDoctorAppointments.map((appointment) => (
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
              {liveAppointments.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-[24px] p-10 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <History size={26} />
                  </div>
                  <h3 className="text-lg font-[900] text-slate-900">No Past Appointments</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Your completed and past appointments will appear here once you have consultation history.
                  </p>
                  <p className="text-[13px] text-slate-400">আপনার অতীত অ্যাপয়েন্টমেন্টের হিস্ট্রি এখানে দেখা যাবে।</p>
                </div>
              ) : liveAppointments.map((apt) => (
                <div key={apt.id} className="bg-white border border-slate-200/80 rounded-[24px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-300 transition-all cursor-pointer group">

                  <div className="flex items-center gap-5">
                    {/* Date Bubble */}
                    <div className="w-[72px] h-[72px] rounded-[20px] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-sky-600/5 group-hover:border-primary/20 transition-colors">
                      <Calendar size={22} className="text-sky-600" />
                      <span className="text-[11px] font-[800] text-slate-500 mt-1.5">{apt.time}</span>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-[20px] font-[900] text-slate-900 group-hover:text-[#00C2A8] transition-colors tracking-tight">{apt.doctorName}</h3>
                      <p className="text-[15px] font-medium text-slate-500">{apt.specialty}</p>
                      <p className="text-[14px] text-slate-500 mt-1.5 font-bold flex items-center gap-1.5 flex-wrap"><MapPin size={14}/> {apt.hospitalName} • {apt.date}</p>
                      <p className="text-[14px] text-slate-500 font-bold">{apt.fee && Number(apt.fee) > 0 ? `৳${apt.fee}` : "Fee: N/A"}</p>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-3 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                    {apt.status === "Completed" ? (
                      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[14px] font-[800] rounded-full border border-emerald-100">
                        <CheckCircle2 size={16} /> Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-50 text-sky-600 text-[14px] font-[800] rounded-full border border-sky-100">
                        <CheckCircle2 size={16} /> {apt.status || "Confirmed"}
                      </span>
                    )}
                    <button
                      onClick={() => handleViewDetails(apt.doctorName)}
                      className="text-[15px] font-[800] text-[#00C2A8] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 cursor-pointer"
                    >
                      View Details <ArrowRight size={18} />
                    </button>
                  </div>

                </div>
              ))}
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

      {/* Telemedicine Consultation Room Modal */}
      <TelemedicineRoomModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        doctorName={currentAppointment?.doctorName || "Doctor"}
        specialty={currentAppointment?.specialty || ""}
        doctorImage={currentAppointment?.doctorImage || "/images/Oxpecker_icon.png"}
        hospitalName={currentAppointment?.hospitalName || "Oxpecker"}
        patientName={currentAppointment?.patientName || user?.name || "Patient"}
        serialNumber={currentAppointment?.id.replace(/[^A-Z0-9]/g, "").slice(-4) || "S-00"}
      />

    </div>
  );
}
