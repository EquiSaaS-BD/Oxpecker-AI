"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, MapPin, CheckCircle2, ChevronLeft, ChevronRight, Activity, Calendar, Receipt, MessageSquareHeart, X, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ChamberPatientQueuePage() {
  const params = useParams();
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [billingPatient, setBillingPatient] = useState<any>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chamberInfo = {
    id: params.id,
    name: params.id === 'gulshan-morning' ? "Gulshan Branch" : "Banani Clinic",
    room: "Room 201",
    date: "25 Jul, 2026"
  };

  const mockPatients = [
    { id: "P-10021", name: "Rahim Uddin", age: 45, gender: "Male", phone: "01711223344", diagnosis: "Consultation & ECG", type: "Appointment", date: "2026-07-25T10:00:00", status: "Completed", avatar: "R", totalBill: 1500, paid: 1500 },
    { id: "P-10022", name: "Fatema Begum", age: 32, gender: "Female", phone: "01822334455", diagnosis: "Root Canal", type: "Walk-in", date: "2026-07-25T11:15:00", status: "Waiting", avatar: "F", totalBill: 4500, paid: 2000 },
    { id: "P-10023", name: "Abdul Karim", age: 58, gender: "Male", phone: "01933445566", diagnosis: "General Checkup", type: "Follow-up", date: "2026-07-24T14:30:00", status: "Completed", avatar: "A", totalBill: 1000, paid: 1000 },
    { id: "P-10024", name: "Salma Akter", age: 28, gender: "Female", phone: "01544556677", diagnosis: "Blood Test & X-Ray", type: "Appointment", date: "2026-07-24T09:45:00", status: "Waiting", avatar: "S", totalBill: 3200, paid: 0 },
  ];

  const totalPages = Math.ceil(mockPatients.length / itemsPerPage);
  const currentData = mockPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleStartConversation = () => {
    setIsStarting(true);
    setTimeout(() => {
      toast.success(`Queue for ${chamberInfo.name} pushed to Live Dashboard!`);
      router.push("/assistant"); 
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 lg:pb-10 relative overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 border-b border-white/60 bg-white/50 backdrop-blur-md sticky top-[72px] lg:top-0">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/assistant/patients" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm shrink-0">
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

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-0 sm:px-6 lg:px-8 mt-4 lg:mt-6">
        
        <div className="px-4 sm:px-0 mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-indigo-600" size={18} /> Queue & Billing
          </h2>
        </div>

        {/* DESKTOP VIEW: Data Table (Clone of Doctor's Patient Table) */}
        <div className="hidden lg:block bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[13px] text-slate-500 font-bold tracking-wide uppercase">
                  <th className="px-6 py-4 rounded-tl-[20px]">Patient Info</th>
                  <th className="px-6 py-4">Diagnosis</th>
                  <th className="px-6 py-4">Visit Type</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right rounded-tr-[20px]">Action</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {currentData.map((patient) => (
                  <tr key={patient.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          {patient.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{patient.name}</p>
                          <p className="text-[12.5px] text-slate-500 font-medium">{patient.id} • {patient.gender}, {patient.age}y</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700 line-clamp-1 max-w-[200px]">{patient.diagnosis}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[12.5px] font-bold">
                        {patient.type === 'Appointment' ? <Calendar size={13}/> : patient.type === 'Walk-in' ? <MapPin size={13}/> : <Activity size={13}/>} 
                        {patient.type}
                      </span>
                    </td>
                    <td className="px-6 py-4" suppressHydrationWarning>
                      <p className="font-bold text-slate-700" suppressHydrationWarning>{new Date(patient.date).toLocaleDateString('en-GB')}</p>
                      <p className="text-[12.5px] text-slate-500" suppressHydrationWarning>{new Date(patient.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      {patient.status === "Completed" && <span className="inline-flex items-center gap-1 text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md text-[12px] font-bold"><CheckCircle2 size={12}/> Completed</span>}
                      {patient.status === "Waiting" && <span className="inline-flex items-center gap-1 text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-md text-[12px] font-bold"><Clock size={12}/> Waiting</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setBillingPatient(patient)}
                        className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[13px] font-bold shadow-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 ml-auto"
                      >
                        <Receipt size={16} /> Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[13px] font-bold text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, mockPatients.length)} of {mockPatients.length} entries
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE VIEW: Patient Cards */}
        <div className="lg:hidden flex flex-col space-y-3 px-4 sm:px-0 py-2">
           {currentData.map((patient) => (
             <div key={patient.id} className="bg-white rounded-[16px] border border-[#2F80ED]/40 shadow-sm p-4 flex flex-col relative overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[40px] rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[16px]">
                      {patient.avatar}
                    </div>
                    <div>
                      <h4 className="text-[16px] font-bold text-slate-800">{patient.name}</h4>
                      <p className="text-[13px] text-slate-500 font-medium">{patient.id} • {patient.age}y</p>
                    </div>
                  </div>
                  <div>
                    {patient.status === "Completed" && <span className="text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded text-[11px] font-bold">Completed</span>}
                    {patient.status === "Waiting" && <span className="text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded text-[11px] font-bold">Waiting</span>}
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-slate-500 font-medium">Diagnosis:</span>
                    <span className="font-bold text-slate-700">{patient.diagnosis}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-slate-500 font-medium">Type:</span>
                    <span className="font-bold text-slate-700">{patient.type}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-slate-500 font-medium">Date:</span>
                    <span className="font-bold text-slate-700" suppressHydrationWarning>{new Date(patient.date).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setBillingPatient(patient)}
                  className="w-full h-[44px] bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-[12px] font-bold text-[14px] transition-colors flex items-center justify-center gap-2"
                >
                  <Receipt size={18} /> View Bill
                </button>
             </div>
           ))}
        </div>

      </div>

      {/* BILLING DRAWER (Slide In Panel) */}
      <AnimatePresence>
        {billingPatient && (
          <>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-white/40 backdrop-blur-sm z-[100]"
              onClick={() => setBillingPatient(null)}
            />

            {/* Desktop Slide from Right | Mobile Bottom Sheet */}
            <motion.div 
              initial={{ x: '100%', y: '100%' }} 
              animate={{ x: 0, y: 0 }} 
              exit={{ x: '100%', y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 lg:bottom-auto lg:top-0 right-0 w-full h-[80vh] lg:h-full lg:max-w-[450px] bg-white shadow-2xl z-[101] flex flex-col rounded-t-[24px] lg:rounded-none lg:border-l border-slate-200"
            >
              {/* Drawer Header */}
              <div className="h-[72px] px-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 pt-2 lg:pt-safe-top rounded-t-[24px] lg:rounded-none">
                <h2 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
                  <Receipt size={20} className="text-indigo-600" /> Patient Billing
                </h2>
                <button onClick={() => setBillingPatient(null)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={18}/>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar bg-slate-50/50">
                
                {/* Patient Summary Card */}
                <div className="bg-white rounded-[16px] p-5 shadow-sm border border-slate-100 flex items-center gap-4 mb-6">
                  <div className="w-[48px] h-[48px] rounded-full bg-indigo-50 text-indigo-600 font-bold text-[20px] flex items-center justify-center shrink-0 border border-indigo-100">
                    {billingPatient.avatar}
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-slate-800">{billingPatient.name}</h3>
                    <p className="text-[13px] font-medium text-slate-500 font-mono">{billingPatient.id} • {billingPatient.phone}</p>
                  </div>
                </div>

                {/* Billing Details Box */}
                <div className="bg-white rounded-[16px] shadow-sm border border-slate-100 overflow-hidden mb-6">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-[14px] font-bold text-slate-800">Invoice Details</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Treatment / Service</span>
                      <span className="font-bold text-slate-800">{billingPatient.diagnosis}</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Date</span>
                      <span className="font-bold text-slate-800" suppressHydrationWarning>{new Date(billingPatient.date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Total Bill</span>
                      <span className="font-bold text-slate-800">৳{billingPatient.totalBill}</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Amount Paid</span>
                      <span className="font-bold text-emerald-600">৳{billingPatient.paid}</span>
                    </div>
                    <div className="w-full h-px bg-slate-200" />
                    <div className="flex justify-between items-center text-[16px]">
                      <span className="text-slate-800 font-black">Due Amount</span>
                      <span className={`font-black ${billingPatient.totalBill - billingPatient.paid > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        ৳{billingPatient.totalBill - billingPatient.paid}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-white shrink-0 pb-safe">
                 <button 
                  onClick={() => {
                     toast.success("Bill confirmed!");
                     setBillingPatient(null);
                  }}
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
