"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Building, ChevronDown, Receipt, MessageSquareHeart, CheckCircle2, Clock, Activity, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Mock Data
const CHAMBERS = [
  { id: "c1", name: "Gulshan Branch", room: "Room 201", date: "25 Jul, 2026", location: "Gulshan 2, Dhaka" },
  { id: "c2", name: "Banani Clinic", room: "Room 105", date: "25 Jul, 2026", location: "Banani, Dhaka" },
];

const MOCK_PATIENTS: Record<string, any[]> = {
  "c1": [
    { id: "P-10021", name: "Rahim Uddin", age: 45, gender: "Male", phone: "01711223344", diagnosis: "Consultation & ECG", type: "Appointment", date: "2026-07-25T10:00:00", status: "Completed", avatar: "R", totalBill: 1500, paid: 1500 },
    { id: "P-10022", name: "Fatema Begum", age: 32, gender: "Female", phone: "01822334455", diagnosis: "Root Canal", type: "Walk-in", date: "2026-07-25T11:15:00", status: "Waiting", avatar: "F", totalBill: 4500, paid: 2000 },
  ],
  "c2": [
    { id: "P-10023", name: "Abdul Karim", age: 58, gender: "Male", phone: "01933445566", diagnosis: "General Checkup", type: "Follow-up", date: "2026-07-24T14:30:00", status: "Completed", avatar: "A", totalBill: 1000, paid: 1000 },
    { id: "P-10024", name: "Salma Akter", age: 28, gender: "Female", phone: "01544556677", diagnosis: "Blood Test & X-Ray", type: "Appointment", date: "2026-07-24T09:45:00", status: "Waiting", avatar: "S", totalBill: 3200, paid: 0 },
  ]
};

export default function AssistantPatientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedChamberId, setExpandedChamberId] = useState<string | null>(null);
  const [billingPatient, setBillingPatient] = useState<any>(null);
  const [isStartingQueue, setIsStartingQueue] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching patient data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredChambers = CHAMBERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleChamber = (id: string) => {
    setExpandedChamberId(prev => prev === id ? null : id);
  };

  const handleStartConversation = (chamberName: string) => {
    setIsStartingQueue(true);
    setTimeout(() => {
      setIsStartingQueue(false);
      toast.success(`Queue for ${chamberName} pushed to Live Dashboard!`);
      router.push("/assistant"); 
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 lg:pb-10 relative overflow-hidden -mt-6 lg:-mt-10 animate-pulse">
        {/* Decorative Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Skeleton Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/50 px-4 lg:px-8 py-5 lg:py-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)] pt-6 lg:pt-10">
          <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="h-8 bg-slate-200 rounded-lg w-64 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded-md w-80"></div>
            </div>
            <div className="h-[48px] bg-slate-200 rounded-xl w-full lg:w-[320px]"></div>
          </div>
        </div>

        {/* Skeleton Accordion List */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto w-full mt-6 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[20px] overflow-hidden border border-slate-200 p-5 lg:p-6 flex items-center justify-between">
              <div className="flex items-center gap-4 w-full">
                <div className="w-[48px] h-[48px] rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex-1">
                  <div className="h-6 bg-slate-200 rounded-md w-48 mb-2"></div>
                  <div className="flex gap-3">
                    <div className="h-4 bg-slate-200 rounded-md w-32"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-24"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-28"></div>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 lg:pb-10 relative overflow-hidden -mt-6 lg:-mt-10">
      
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/50 px-4 lg:px-8 py-5 lg:py-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)] sticky top-0 z-30 pt-6 lg:pt-10">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[20px] lg:text-[24px] font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-inner">
                <Building className="text-indigo-600" size={24} />
              </div>
              Patient Management
            </h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1">Select a chamber to manage patients and process bills.</p>
          </div>
          <div className="relative w-full lg:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search chamber..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[48px] pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Accordion List Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto w-full mt-6 flex flex-col gap-4">
        
        {filteredChambers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Building size={32} className="text-slate-600 mb-4" />
            <h3 className="text-[18px] font-bold text-slate-800">No Chambers Found</h3>
          </div>
        ) : (
          filteredChambers.map((chamber, index) => {
            const isExpanded = expandedChamberId === chamber.id;
            const patients = MOCK_PATIENTS[chamber.id] || [];

            return (
              <motion.div
                key={chamber.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-[20px] overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'shadow-[0_12px_40px_rgba(0,0,0,0.08)] border-indigo-200 border-2' : 'shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                {/* Chamber Header (Clickable) */}
                <div 
                  onClick={() => toggleChamber(chamber.id)}
                  className="cursor-pointer p-5 lg:p-6 flex items-center justify-between relative group"
                >
                  <div className="absolute right-0 top-0 w-[40%] h-full  from-indigo-50/50  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-[48px] h-[48px] rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-[18px] font-black text-indigo-600">{patients.length}</span>
                    </div>
                    <div>
                      <h3 className="text-[18px] lg:text-[20px] font-bold text-slate-800 mb-1">{chamber.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-[13px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-rose-400"/> {chamber.location}</span>
                        <span className="flex items-center gap-1.5"><Building size={14} className="text-emerald-400"/> {chamber.room}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-amber-400"/> {chamber.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                    <ChevronDown size={20} />
                  </div>
                </div>

                {/* Expanded Content (Patient List) - Desktop Only */}
                <div className="hidden lg:block">
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="border-t border-slate-100 bg-slate-50/50 p-4 lg:p-6">
                          
                          {/* Action Bar inside Expanded state */}
                          <div className="flex items-center justify-between mb-4">
                             <h4 className="font-bold text-slate-700 text-[15px] flex items-center gap-2">
                               Patient Queue <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[12px]">{patients.length}</span>
                             </h4>
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleStartConversation(chamber.name); }}
                               disabled={isStartingQueue}
                               className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-[13px] lg:text-[14px] rounded-xl shadow-sm transition-all flex items-center gap-2"
                             >
                               <MessageSquareHeart size={16} /> 
                               {isStartingQueue ? 'Starting...' : 'Start Conversation'}
                             </button>
                          </div>

                          {/* Patient Rows */}
                          <div className="flex flex-col gap-3">
                            {patients.map(patient => (
                              <div key={patient.id} className="bg-white border border-slate-200 rounded-[16px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 transition-colors shadow-sm">
                                
                                {/* Info */}
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-[18px] shrink-0">
                                    {patient.avatar}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-slate-800 text-[15px]">{patient.name}</h5>
                                    <div className="flex items-center gap-2 mt-1 text-[13px] font-medium text-slate-500">
                                      <span>{patient.id}</span>
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                      <span>{patient.diagnosis}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Status & Bill Action */}
                                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                                  {patient.status === "Completed" && <span className="flex items-center gap-1 text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md text-[12px] font-bold shrink-0"><CheckCircle2 size={14}/> Completed</span>}
                                  {patient.status === "Waiting" && <span className="flex items-center gap-1 text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-md text-[12px] font-bold shrink-0"><Clock size={14}/> Waiting</span>}
                                  
                                  {/* The Bill Icon Button */}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setBillingPatient(patient); }}
                                    className="w-[40px] h-[40px] rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors tooltip-trigger relative group"
                                  >
                                    <Receipt size={18} />
                                    {/* Tooltip */}
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Process Bill</span>
                                  </button>
                                </div>

                              </div>
                            ))}
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            );
          })
        )}
      </div>

      {/* MOBILE FULL SCREEN MODAL FOR EXPANDED CHAMBER */}
      <AnimatePresence>
        {expandedChamberId && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-slate-50 flex flex-col lg:hidden"
          >
            {(() => {
              const activeChamber = CHAMBERS.find(c => c.id === expandedChamberId);
              const patients = MOCK_PATIENTS[expandedChamberId] || [];
              if (!activeChamber) return null;
              
              return (
                <>
                  {/* Modal Header */}
                  <div className="bg-white px-4 py-4 pt-[env(safe-area-inset-top,16px)] border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setExpandedChamberId(null)} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-700 transition-colors">
                        <X size={20} />
                      </button>
                      <div>
                        <h2 className="text-[18px] font-bold text-slate-800 leading-tight">{activeChamber.name}</h2>
                        <span className="text-[13px] font-medium text-slate-500">{patients.length} Patients</span>
                      </div>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto px-4 py-6">
                    <button 
                      onClick={() => handleStartConversation(activeChamber.name)}
                      disabled={isStartingQueue}
                      className="w-full h-[52px] bg-emerald-500 active:bg-emerald-600 text-white font-bold text-[15px] rounded-[14px] shadow-md transition-all flex items-center justify-center gap-2 mb-6"
                    >
                      <MessageSquareHeart size={20} /> 
                      {isStartingQueue ? 'Starting...' : 'Start Conversation'}
                    </button>

                    <h4 className="font-bold text-slate-700 text-[15px] mb-4">Patient Queue</h4>

                    <div className="flex flex-col gap-3 pb-safe">
                      {patients.map(patient => (
                        <div key={patient.id} className="bg-white border border-slate-200 rounded-[16px] p-4 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                          
                          {/* Info */}
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-[18px] shrink-0">
                              {patient.avatar}
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-[15px] leading-none mb-1.5">{patient.name}</h5>
                              <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                                <span>{patient.id}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{patient.diagnosis}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status & Bill Action */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                            {patient.status === "Completed" && <span className="flex items-center gap-1 text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md text-[12px] font-bold"><CheckCircle2 size={14}/> Completed</span>}
                            {patient.status === "Waiting" && <span className="flex items-center gap-1 text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-md text-[12px] font-bold"><Clock size={14}/> Waiting</span>}
                            
                            <button 
                              onClick={() => setBillingPatient(patient)}
                              className="w-[40px] h-[40px] rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"
                            >
                              <Receipt size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="h-[72px] px-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 pt-2 lg:pt-safe-top rounded-t-[24px] lg:rounded-none">
                <h2 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
                  <Receipt size={20} className="text-indigo-600" /> Patient Billing
                </h2>
                <button onClick={() => setBillingPatient(null)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={18}/>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar bg-slate-50/50">
                <div className="bg-white rounded-[16px] p-5 shadow-sm border border-slate-100 flex items-center gap-4 mb-6">
                  <div className="w-[48px] h-[48px] rounded-full bg-indigo-50 text-indigo-600 font-bold text-[20px] flex items-center justify-center shrink-0 border border-indigo-100">
                    {billingPatient.avatar}
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-slate-800">{billingPatient.name}</h3>
                    <p className="text-[13px] font-medium text-slate-500 font-mono">{billingPatient.id} • {billingPatient.phone}</p>
                  </div>
                </div>

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
                  onClick={() => {
                     toast.success("Bill confirmed & receipt generated!");
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
