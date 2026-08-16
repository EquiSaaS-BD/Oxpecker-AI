"use client";

import { useState, useRef, useEffect } from "react";
import { mockEducation } from "@/lib/doctorMockData";
import { 
  ShieldCheck, UploadCloud, FileText,
  Clock, Lock, CheckCircle2, GraduationCap, 
  Plus, Trash2, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";

export default function EducationSettingsPage() {
  // --- BMDC Verification State ---
  const [bmdcReg, setBmdcReg] = useState("");
  const [bmdcStatus, setBmdcStatus] = useState<"none" | "pending" | "verified">("none");
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // --- Education State ---
  const [educationList, setEducationList] = useState(mockEducation);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "" });

  // Load BMDC State
  useEffect(() => {
    const savedBmdcStatus = localStorage.getItem('shustota_doc_bmdc_status');
    if (savedBmdcStatus) setBmdcStatus(savedBmdcStatus as any);
    const savedReg = localStorage.getItem('shustota_doc_bmdc');
    if (savedReg) setBmdcReg(savedReg);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.includes('pdf') && !file.type.includes('image/')) {
        toast.error("Please upload a PDF or Image (JPG/PNG).");
        return;
      }
      setCertificateFile(file);
    }
  };

  const handleSubmitBMDC = () => {
    if (!bmdcReg.trim()) return toast.error("Please enter BMDC Registration Number.");
    if (!certificateFile) return toast.error("Please upload your medical certificate.");

    toast.loading("Submitting credentials securely...", { id: 'bmdc' });
    setTimeout(() => {
      toast.success("Medical credentials submitted for verification!", { id: 'bmdc' });
      setBmdcStatus("pending");
      localStorage.setItem('shustota_doc_bmdc_status', 'pending');
      localStorage.setItem('shustota_doc_bmdc', bmdcReg);
    }, 2000);
  };

  const handleAddEducation = () => {
    if (!newEducation.degree || !newEducation.institution || !newEducation.year) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    setEducationList([
      { 
        id: `e${Date.now()}`, 
        ...newEducation, 
        status: "Pending" 
      },
      ...educationList
    ]);
    
    setNewEducation({ degree: "", institution: "", year: "" });
    setShowAddForm(false);
    toast.success("Education record added successfully.");
  };

  const handleRemoveEducation = (id: string) => {
    setEducationList(educationList.filter(e => e.id !== id));
    toast.success("Education record removed.");
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            Education & Certifications
          </h1>
          <p className="text-slate-500 mt-1">Manage your educational background and official medical credentials.</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Medical Credentials Verification (BMDC) */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full">
          <div className="p-6 border-b border-slate-100 bg-[#2F80ED]/5">
            <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#2F80ED]" /> Primary Medical Credentials (BMDC)
            </h3>
            <p className="text-[13px] text-slate-500 mt-1 leading-snug">To practice on the platform, your primary medical credentials must be verified by the Super Admin.</p>
          </div>
          
          <div className="p-6 lg:p-8 space-y-6">
            
            <AnimatePresence>
              {bmdcStatus === "pending" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-[16px] p-4 flex gap-3"
                >
                  <Clock size={20} className="text-[#F59E0B] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[14px] font-bold text-[#D97706]">Pending Verification</h4>
                    <p className="text-[13px] text-[#D97706]/80 mt-1 leading-snug">
                      Your credentials are under review by the Super Admin. Please allow up to <strong>72 hours</strong> for manual verification.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 flex justify-between items-center">
                  <span>BMDC Registration Number</span>
                  {bmdcStatus === "pending" && <Lock size={12} className="text-slate-400" />}
                </label>
                <input 
                  type="text" 
                  value={bmdcReg}
                  onChange={(e) => setBmdcReg(e.target.value)}
                  disabled={bmdcStatus === "pending"}
                  placeholder="e.g. A-12345"
                  className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 flex justify-between items-center">
                  <span>Upload Certificate (PDF/JPG)</span>
                  {bmdcStatus === "pending" && <Lock size={12} className="text-slate-400" />}
                </label>
                
                <input 
                  type="file"
                  ref={certInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,image/jpeg,image/png"
                  className="hidden"
                  disabled={bmdcStatus === "pending"}
                />

                <div 
                  onClick={() => bmdcStatus !== "pending" && certInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-[16px] p-6 flex flex-col items-center justify-center transition-all ${
                    bmdcStatus === "pending" 
                      ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed" 
                      : "border-slate-300 bg-slate-50 hover:bg-[#2F80ED]/5 hover:border-[#2F80ED] cursor-pointer"
                  }`}
                >
                  {certificateFile ? (
                    <div className="flex flex-col items-center">
                      <FileText size={32} className="text-[#22C55E] mb-2" />
                      <span className="text-[13px] font-bold text-slate-700 text-center">{certificateFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud size={24} className="text-slate-400 mb-2" />
                      <span className="text-[14px] font-bold text-slate-700">Click to upload document</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {bmdcStatus !== "pending" && (
              <button 
                onClick={handleSubmitBMDC}
                className="w-full md:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} />
                Submit Medical Credentials
              </button>
            )}

          </div>
        </div>

        {/* Education Background */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap size={20} className="text-[#2F80ED]" /> Educational Background
              </h3>
              <p className="text-[13px] text-slate-500 mt-1">List your degrees and qualifications.</p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-[#2F80ED]/10 text-[#2F80ED] hover:bg-[#2F80ED]/20 font-bold rounded-lg transition-colors flex items-center gap-2 text-[13px]"
            >
              <Plus size={16} /> Add New
            </button>
          </div>

          <div className="p-6 lg:p-8 space-y-4">
            
            <AnimatePresence>
              {showAddForm && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-50 border border-slate-200 p-6 rounded-[16px] mb-6"
                >
                  <h4 className="text-[14px] font-bold text-slate-800 mb-4">Add New Degree</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1">Degree Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. MBBS, FCPS"
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                        className="w-full h-[40px] bg-white border border-slate-200 rounded-lg px-3 text-[13px] focus:outline-none focus:border-[#2F80ED]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1">Institution</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dhaka Medical College"
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                        className="w-full h-[40px] bg-white border border-slate-200 rounded-lg px-3 text-[13px] focus:outline-none focus:border-[#2F80ED]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1">Passing Year</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2015"
                        value={newEducation.year}
                        onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                        className="w-full h-[40px] bg-white border border-slate-200 rounded-lg px-3 text-[13px] focus:outline-none focus:border-[#2F80ED]"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button 
                      onClick={() => setShowAddForm(false)}
                      className="px-5 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-lg text-[13px]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddEducation}
                      className="px-5 py-2 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-lg text-[13px]"
                    >
                      Save Degree
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {educationList.length === 0 ? (
              <div className="text-center py-10">
                <Award size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-[14px]">No education records found. Add your degrees to build trust with patients.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {educationList.map((edu) => (
                  <div key={edu.id} className="group p-5 border border-slate-100 bg-white hover:border-slate-300 hover:shadow-md rounded-[16px] transition-all flex justify-between items-center">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-[#2F80ED]/10 rounded-full flex items-center justify-center shrink-0">
                        <GraduationCap size={18} className="text-[#2F80ED]" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                          {edu.degree}
                          {edu.status === 'Verified' ? (
                            <span className="text-[10px] uppercase font-bold bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={10} /> Verified
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold bg-[#F59E0B]/10 text-[#D97706] px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </h4>
                        <p className="text-[13px] text-slate-500 mt-0.5">{edu.institution} • {edu.year}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
