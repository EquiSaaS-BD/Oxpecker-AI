"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, Clock, XCircle, DollarSign, Video, 
  Play, Pause, SkipForward, AlertTriangle, 
  FileText, MoreVertical, Search, Plus, TrendingUp, TrendingDown, CheckCircle2, ChevronDown, X, BellRing, User, Receipt
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const stats = [
  { title: "Today's Appts", count: "42", trend: "+12%", trendUp: true, icon: Users, color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200/80" },
  { title: "Waiting", count: "12", trend: "-2%", trendUp: false, icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border border-amber-200/80" },
  { title: "Revenue", count: "৳28K", trend: "+18%", trendUp: true, icon: DollarSign, color: "text-purple-700", bg: "bg-purple-50 border border-purple-200/80" },
];

const INITIAL_QUEUE = [
  { id: "S-01", name: "Rahim Uddin", age: 45, gender: "M", phone: "01711...", time: "10:30 AM", type: "First Visit", symptoms: "Fever, Cough", status: "Waiting", payment: "Paid", paymentMethod: "Online (bKash)" },
  { id: "S-02", name: "Fatema Begum", age: 32, gender: "F", phone: "01822...", time: "10:45 AM", type: "Follow Up", symptoms: "Headache", status: "Waiting", payment: "Pending", paymentMethod: "Cash" },
  { id: "S-03", name: "Korim Hossain", age: 58, gender: "M", phone: "01933...", time: "11:00 AM", type: "First Visit", symptoms: "Chest Pain", status: "Waiting", payment: "Paid", paymentMethod: "Online (Card)", priority: true },
  { id: "S-04", name: "Nusrat Jahan", age: 24, gender: "F", phone: "01644...", time: "11:15 AM", type: "Report Show", symptoms: "Blood Test", status: "Waiting", payment: "Paid", paymentMethod: "Online (Nagad)" },
];

export default function AssistantDashboardPage() {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignedDoctorName, setAssignedDoctorName] = useState("Not Connected");

  useEffect(() => {
    if ((user as any)?.doctorId) {
      const usersStr = localStorage.getItem('oxpecker_users');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const doc = users.find((u: any) => u.id === (user as any).doctorId);
        if (doc) {
          setAssignedDoctorName(doc.name || "Assigned Doctor");
        }
      }
    }
  }, [user]);

  useEffect(() => {
    // Simulate fetching dashboard data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  // LIVE QUEUE STATE MACHINE
  // States: 'idle' (waiting to start), 'active' (timer running), 'signaled' (doctor blinking yellow)
  const [queueState, setQueueState] = useState<'idle' | 'active' | 'signaled'>('idle');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Derived state
  const currentIndex = queue.findIndex(p => p.status === 'In Consultation' || p.status === 'Waiting');
  const currentPatient = currentIndex !== -1 ? queue[currentIndex] : null;
  const nextPatient = currentIndex !== -1 && currentIndex + 1 < queue.length ? queue[currentIndex + 1] : null;

  useEffect(() => {
    if (queueState === 'active') {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [queueState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = () => {
    if (!currentPatient) return;
    setQueueState('active');
    setTimer(0);
    const newQueue = [...queue];
    newQueue[currentIndex].status = 'In Consultation';
    setQueue(newQueue);
  };

  const handleComplete = () => {
    if (!currentPatient) return;
    setQueueState('idle');
    setTimer(0);
    const newQueue = [...queue];
    newQueue[currentIndex].status = 'Completed';
    setQueue(newQueue);
  };

  const handleSkip = () => {
    if (!currentPatient) return;
    setQueueState('idle');
    setTimer(0);
    const newQueue = [...queue];
    newQueue[currentIndex].status = 'Skipped';
    setQueue(newQueue);
  };

  // Mocking the doctor's signal
  const simulateDoctorSignal = () => {
    if (queueState === 'active') {
      setQueueState('signaled');
    }
  };

  const handleSignaledNext = () => {
    handleComplete();
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-4 md:gap-6 relative min-h-screen pb-24 lg:pb-10 bg-slate-50 animate-pulse">
        
        {/* Skeleton Hero Box */}
        <div className="w-full rounded-none sm:rounded-[24px] sm:mt-4 bg-slate-200 border-y sm:border border-slate-200 p-6 md:p-8 flex flex-col justify-between overflow-hidden relative min-h-[300px]">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div className="h-6 w-40 bg-slate-300 rounded-md"></div>
            <div className="h-8 w-8 bg-slate-300 rounded-full"></div>
          </div>
          <div className="flex flex-col relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="h-4 w-32 bg-slate-300 rounded-md mb-4"></div>
                <div className="h-16 w-64 md:w-96 bg-slate-300 rounded-xl mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-slate-300 rounded-md"></div>
                  <div className="h-6 w-24 bg-slate-300 rounded-md"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-slate-300 rounded-full"></div>
                <div className="h-14 w-14 bg-slate-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-4 sm:mx-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[20px] p-6 border border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
                <div className="h-8 w-24 bg-slate-200 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton Queue List */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 mx-4 sm:mx-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="h-8 w-40 bg-slate-200 rounded-md"></div>
            <div className="w-full md:w-[300px] h-10 bg-slate-200 rounded-xl"></div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full lg:w-1/3">
                  <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                    <div className="h-3 w-20 bg-slate-200 rounded-md"></div>
                  </div>
                </div>
                <div className="flex-1 space-y-2 hidden md:block">
                  <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
                  <div className="h-3 w-32 bg-slate-200 rounded-md"></div>
                </div>
                <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 md:gap-6 relative min-h-screen pb-24 lg:pb-10 bg-slate-50">
      
      {/* 1. HERO: Live Queue Control */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full rounded-none sm:rounded-[24px] sm:mt-4 shadow-sm border-y sm:border border-slate-200 p-6 md:p-8 flex flex-col justify-between transition-colors duration-500 overflow-hidden relative
          ${queueState === 'signaled' ? 'bg-amber-400 border-amber-500 shadow-[0_0_40px_rgba(251,191,36,0.3)]' : 
            queueState === 'active' ? 'bg-white' : 'bg-white'}
        `}
      >
        {/* Background Decorative Rings */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 transition-colors duration-500
          ${queueState === 'signaled' ? 'bg-white/20' : queueState === 'active' ? 'bg-emerald-100' : 'bg-[#2F80ED]/20'}
        `} />

        <div className="flex justify-between items-center mb-6 md:mb-8 relative z-10">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-current backdrop-blur-md transition-colors" title="Back to Queue List">
               <ChevronDown size={18} className={`rotate-90 ${queueState === 'signaled' ? 'text-amber-950' : queueState === 'active' ? 'text-slate-800' : 'text-slate-900'}`} />
            </button>
            {queueState === 'signaled' ? (
              <div className="w-4 h-4 rounded-full bg-white animate-ping" />
            ) : queueState === 'active' ? (
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-[#2F80ED]" />
            )}
            <h2 className={`text-[16px] md:text-[18px] font-bold uppercase tracking-wider ${queueState === 'signaled' ? 'text-amber-950' : queueState === 'active' ? 'text-slate-800' : 'text-slate-500'}`}>
              Live Queue Status
            </h2>
          </div>
          
          {/* Debug/Mock Button to trigger doctor signal */}
          {queueState === 'active' && (
            <button onClick={simulateDoctorSignal} className="px-3 py-1 bg-slate-100 hover:bg-amber-100 text-[11px] font-bold text-slate-500 rounded-full transition-colors">
              Mock Doctor Signal
            </button>
          )}
        </div>

        {currentPatient ? (
          <div className="flex flex-col relative z-10">
            {/* Main Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <p className={`text-[14px] font-bold uppercase tracking-widest mb-2 ${queueState === 'signaled' ? 'text-amber-900/70' : queueState === 'active' ? 'text-emerald-600' : 'text-[#2F80ED]'}`}>
                  {queueState === 'active' ? 'In Consultation' : queueState === 'signaled' ? 'Doctor Calling Next' : 'Waiting To Start'}
                </p>
                <div className="flex items-center gap-4">
                  <h1 className={`text-[56px] md:text-[72px] font-black leading-none tracking-tighter ${queueState === 'signaled' ? 'text-amber-950' : queueState === 'active' ? 'text-slate-800' : 'text-slate-900'}`}>
                    {currentPatient.id}
                  </h1>
                  <div className={`h-[48px] w-1 rounded-full ${queueState === 'signaled' ? 'bg-amber-500' : queueState === 'active' ? 'bg-slate-200' : 'bg-slate-700'}`} />
                  <div className="flex flex-col">
                    <h2 className={`text-[24px] md:text-[32px] font-bold leading-tight ${queueState === 'signaled' ? 'text-amber-950' : queueState === 'active' ? 'text-slate-800' : 'text-slate-900'}`}>
                      {currentPatient.name}
                    </h2>
                    {nextPatient && queueState !== 'signaled' && (
                      <p className={`text-[15px] font-medium mt-1 flex items-center gap-2 ${queueState === 'active' ? 'text-slate-500' : 'text-slate-500'}`}>
                        <span className="opacity-70">Next:</span> {nextPatient.id} {nextPatient.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timer */}
              {queueState === 'active' && (
                <div className="flex flex-col md:items-end">
                  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">Time Elapsed</span>
                  <span className="text-[48px] font-mono font-bold text-emerald-700 leading-none bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 shadow-inner">
                    {formatTime(timer)}
                  </span>
                </div>
              )}
            </div>

            {/* Massive Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-2">
              
              {queueState === 'idle' && (
                <>
                  <button onClick={handleStart} className="flex-1 min-h-[64px] bg-sky-600 hover:bg-sky-700 text-white rounded-[20px] font-bold text-[18px] md:text-[20px] transition-transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-md">
                    <Play fill="currentColor" size={24} /> Start Conversation
                  </button>
                  <button onClick={handleSkip} className="sm:w-[160px] min-h-[64px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-[20px] font-bold text-[16px] transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
                    <SkipForward size={20} /> Skip
                  </button>
                </>
              )}

              {queueState === 'active' && (
                <>
                  <button onClick={() => setIsBillingOpen(true)} className="w-[140px] md:w-[180px] min-h-[64px] bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border-2 border-indigo-200 hover:border-indigo-600 rounded-[20px] font-bold text-[16px] md:text-[18px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm">
                    <Receipt size={24} /> Bill
                  </button>
                  <button onClick={handleComplete} className="flex-1 min-h-[64px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-bold text-[18px] md:text-[20px] transition-transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-md">
                    <CheckCircle2 size={24} /> Mark Completed
                  </button>
                </>
              )}

              {queueState === 'signaled' && (
                <>
                  <button onClick={handleSignaledNext} className="flex-1 min-h-[72px] bg-white text-amber-600 rounded-[24px] font-black text-[20px] md:text-[24px] transition-transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-2xl animate-pulse">
                    <BellRing size={28} /> Call Next Now
                  </button>
                </>
              )}

            </div>
          </div>
        ) : (
           <div className="py-8 text-center relative z-10">
             <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle2 size={32} className="text-emerald-600" />
             </div>
             <h2 className="text-[24px] font-bold text-slate-900 mb-2">Queue Empty</h2>
             <p className="text-slate-500">All patients have been seen.</p>
           </div>
        )}
      </motion.div>

      <div className="px-4 sm:px-0 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mt-2">
        {/* Statistics Cards */}
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
              <div>
                <h3 className="text-[24px] font-black text-slate-800 leading-none mb-1">{stat.count}</h3>
                <p className="text-[13px] font-semibold text-slate-500">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Doctor Status */}
        <div className="md:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 relative shrink-0">
               <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=e0f2fe" alt="Doctor" fill className="object-cover" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-slate-800">{assignedDoctorName}</h3>
              <div className="flex items-center gap-2 mt-1">
                {queueState === 'idle' ? (
                  <><div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div><span className="text-[14px] font-bold text-slate-500">Waiting for Patient</span></>
                ) : queueState === 'active' ? (
                  <><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[14px] font-bold text-emerald-600">In Consultation</span></>
                ) : (
                  <><div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></div><span className="text-[14px] font-bold text-amber-600">Calling Next</span></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Queue List (Simplified Desktop only or Scrollable) */}
      <div className="mt-4 px-4 sm:px-0">
        <h3 className="text-[16px] font-bold text-slate-800 mb-3 px-1">Upcoming Queue</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
           {queue.filter(p => p.status === 'Waiting').map((row, i) => (
             <div key={i} className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-800 text-[16px] border border-slate-200">
                   {row.id.split('-')[1]}
                 </div>
                 <div>
                   <p className="font-bold text-slate-800">{row.name}</p>
                   <p className="text-[13px] text-slate-500 mt-0.5">{row.time} • {row.type}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="flex flex-col items-end mr-1 sm:mr-2 shrink-0">
                    {row.payment === "Paid" ? (
                      <span className="text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full whitespace-nowrap">{row.paymentMethod}</span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">Pending ({row.paymentMethod})</span>
                    )}
                 </div>
                 <button onClick={() => setSelectedPatient(row)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 hover:text-[#2F80ED] transition-colors">
                   <User size={18} />
                 </button>
               </div>
             </div>
           ))}
           {queue.filter(p => p.status === 'Waiting').length === 0 && (
             <div className="p-6 text-center text-slate-500 font-medium">No more patients waiting.</div>
           )}
        </div>
      </div>

      {/* Floating Add Button (Mobile) */}
      <div className="fixed bottom-24 sm:bottom-8 right-6 sm:right-8 z-40">
        <button className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] bg-[#2F80ED] hover:bg-[#256bbd] text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95">
          <Plus size={24} />
        </button>
      </div>

      {/* Simple Details Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="w-full sm:w-[400px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Patient Info</h3>
                <button onClick={() => setSelectedPatient(null)} className="p-2 bg-slate-50 rounded-full"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-[#2F80ED] text-[24px] font-bold flex items-center justify-center">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-[20px] font-bold text-slate-800">{selectedPatient.name}</h2>
                    <p className="text-slate-500">{selectedPatient.id}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <p className="text-[14px] text-slate-600"><strong className="text-slate-800">Phone:</strong> {selectedPatient.phone}</p>
                  <p className="text-[14px] text-slate-600"><strong className="text-slate-800">Age/Gender:</strong> {selectedPatient.age} / {selectedPatient.gender}</p>
                  <p className="text-[14px] text-slate-600"><strong className="text-slate-800">Symptoms:</strong> {selectedPatient.symptoms}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Billing Drawer (Dashboard version) */}
      <AnimatePresence>
        {isBillingOpen && currentPatient && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-white/40 backdrop-blur-sm z-[100]"
              onClick={() => setIsBillingOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%', y: '100%' }} animate={{ x: 0, y: 0 }} exit={{ x: '100%', y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 lg:bottom-auto lg:top-0 right-0 w-full h-[80vh] lg:h-full lg:max-w-[450px] bg-white shadow-2xl z-[101] flex flex-col rounded-t-[24px] lg:rounded-none lg:border-l border-slate-200"
            >
              <div className="h-[72px] px-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 pt-2 lg:pt-safe-top rounded-t-[24px] lg:rounded-none">
                <h2 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
                  <Receipt size={20} className="text-indigo-600" /> Patient Billing
                </h2>
                <button onClick={() => setIsBillingOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={18}/>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar bg-slate-50/50">
                <div className="bg-white rounded-[16px] p-5 shadow-sm border border-slate-100 flex items-center gap-4 mb-6">
                  <div className="w-[48px] h-[48px] rounded-full bg-indigo-50 text-indigo-600 font-bold text-[20px] flex items-center justify-center shrink-0 border border-indigo-100">
                    {currentPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-slate-800">{currentPatient.name}</h3>
                    <p className="text-[13px] font-medium text-slate-500 font-mono">{currentPatient.id} • {currentPatient.phone}</p>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] shadow-sm border border-slate-100 overflow-hidden mb-6">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-[14px] font-bold text-slate-800">Invoice Details</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Treatment / Service</span>
                      <span className="font-bold text-slate-800">{currentPatient.symptoms || "General"}</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Date</span>
                      <span className="font-bold text-slate-800" suppressHydrationWarning>{new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Total Bill</span>
                      <span className="font-bold text-slate-800">৳1500</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Amount Paid</span>
                      <span className="font-bold text-emerald-600">৳0</span>
                    </div>
                    <div className="w-full h-px bg-slate-200" />
                    <div className="flex justify-between items-center text-[16px]">
                      <span className="text-slate-800 font-black">Due Amount</span>
                      <span className="font-black text-rose-500">৳1500</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-[13px] font-bold text-slate-700 mb-2">Select Payment Method</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button className="h-10 bg-indigo-50 border border-indigo-600 text-indigo-700 rounded-lg text-[13px] font-bold">Cash</button>
                        <button className="h-10 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[13px] font-medium hover:bg-slate-100">bKash</button>
                        <button className="h-10 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[13px] font-medium hover:bg-slate-100">Card</button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-white shrink-0 pb-safe">
                 <button 
                  onClick={() => setIsBillingOpen(false)}
                  className="w-full h-[52px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-[14px] transition-all flex items-center justify-center gap-2 text-[15px] shadow-md active:scale-[0.98]"
                 >
                   <CheckCircle2 size={20}/> Confirm Payment & Generate Bill
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
