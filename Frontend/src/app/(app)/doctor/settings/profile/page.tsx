"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { mockDoctorProfile } from "@/lib/doctorMockData";
import { 
  Camera, Save,
  Phone, Globe, Link,
  UploadCloud, FileText,
  Clock, CheckCircle2, Lock,
  User, IdCard, BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";

export default function ProfileSettingsPage() {
  // --- Form State ---
  const [formData, setFormData] = useState({
    ...mockDoctorProfile,
    gender: "Male",
    phone: "+880 1711-000000",
    whatsapp: "+880 1711-000000",
    facebook: "facebook.com/dr.fazlul",
    linkedin: "linkedin.com/in/drfazlul",
    avatar: mockDoctorProfile.avatar,
  });

  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // --- Identity ID State ---
  const [idType, setIdType] = useState("Government ID");
  const [idStatus, setIdStatus] = useState<"none" | "pending" | "verified">("none");
  const [idFile, setIdFile] = useState<File | null>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  // --- Load Initial State ---
  useEffect(() => {
    const savedIdStatus = localStorage.getItem('shustota_doc_id_status');
    if (savedIdStatus) setIdStatus(savedIdStatus as any);
    
    const savedIdType = localStorage.getItem('shustota_doc_id_type');
    if (savedIdType) setIdType(savedIdType);
  }, []);

  // --- Calculate Verification Score (Adjusted for Profile Only) ---
  const verificationScore = useMemo(() => {
    let score = 0;
    
    // Basic Info: 30%
    if (formData.name && formData.specialization && formData.bio && formData.gender) score += 30;
    
    // Contact Info: 30%
    if (formData.consultationFee && formData.phone && (formData.facebook || formData.linkedin)) score += 30;
    
    // ID Verification: 40%
    if (idStatus === "pending" || idStatus === "verified") score += 40;

    return score;
  }, [formData, idStatus]);

  // --- Handlers ---
  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully!");
    }, 1500);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.includes('image/')) {
        toast.error("Please upload a valid image file (JPG/PNG).");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, avatar: event.target!.result as string }));
          toast.success("Profile photo updated!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.includes('pdf') && !file.type.includes('image/')) {
        toast.error("Please upload a PDF or Image (JPG/PNG).");
        return;
      }
      setIdFile(file);
    }
  };

  const handleSubmitID = () => {
    if (!idFile) return toast.error("Please upload your Identity Document.");

    toast.loading("Submitting identity document securely...", { id: 'idDoc' });
    setTimeout(() => {
      toast.success("Identity document submitted for verification!", { id: 'idDoc' });
      setIdStatus("pending");
      localStorage.setItem('shustota_doc_id_status', 'pending');
      localStorage.setItem('shustota_doc_id_type', idType);
    }, 2000);
  };

  // UI Helpers
  const isGreen = verificationScore >= 90;
  const isYellow = verificationScore >= 40 && verificationScore < 90;

  const specializations = [
    "Cardiology", "Dermatology", "Neurology", "Orthopedics", 
    "Pediatrics", "Psychiatry", "General Practice", "Gynecology",
    "Oncology", "Urology", "Endocrinology", "Ophthalmology"
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <Toaster position="top-center" />
      
      {/* Header & Verification Bar */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              Public Profile 
              {isGreen && <BadgeCheck size={28} className="text-[#22C55E]" />}
            </h1>
            <p className="text-slate-500 mt-1">Manage your public information and identity verification.</p>
          </div>

          <div className="w-full md:w-[350px]">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[13px] font-bold text-slate-600 uppercase tracking-wider">Profile Verification</span>
              <span className={`text-[20px] font-extrabold ${isGreen ? 'text-[#22C55E]' : isYellow ? 'text-[#F59E0B]' : 'text-slate-500'}`}>
                {verificationScore}%
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${verificationScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isGreen 
                    ? 'bg-gradient-to-r from-[#22C55E] to-[#10B981]' 
                    : isYellow 
                      ? 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]' 
                      : 'bg-gradient-to-r from-slate-400 to-slate-300'
                }`}
              />
            </div>
            {isGreen && <p className="text-[12px] font-bold text-[#22C55E] mt-2 flex items-center gap-1 justify-end"><CheckCircle2 size={14}/> Identity Verified</p>}
          </div>
        </div>
      </div>

      {/* Main Stack */}
      <div className="flex flex-col gap-8">
        
        {/* Full Page Width: Public Profile Form */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full">
          
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-6 bg-slate-50">
            <div className="relative group shrink-0">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                {isGreen && (
                  <div className="absolute inset-0 border-4 border-[#22C55E] rounded-full pointer-events-none"></div>
                )}
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-[18px] font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
                Public Photo 
              </h3>
              <p className="text-[13px] text-slate-500 mt-1 mb-4">Recommended size: 400x400px (JPG or PNG).</p>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/jpeg,image/png,image/jpg" 
                  className="hidden" 
                />
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <Camera size={14}/> Change Photo
                </button>
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, avatar: "https://i.pravatar.cc/150?u=placeholder" }))}
                  className="px-5 py-2 text-red-500 hover:bg-red-50 text-[13px] font-bold rounded-xl transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-[#2F80ED]" /> Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
                  />
                </div>
                
                <div className="md:col-span-1">
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Specialization</label>
                  <select 
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
                  >
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Professional Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="h-[1px] w-full bg-slate-100"></div>

            {/* Consultation & Contact */}
            <div>
              <h4 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Phone size={18} className="text-[#2F80ED]" /> Contact & Fees
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Consultation Fee (BDT)</label>
                  <input 
                    type="text" 
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                    className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1 flex items-center gap-1.5">
                      Public Phone Number
                  </label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1 flex items-center gap-1.5">
                    <Globe size={14} className="text-[#1877F2]" /> Facebook Profile
                  </label>
                  <input 
                    type="text" 
                    value={formData.facebook}
                    onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                    className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1 flex items-center gap-1.5">
                    <Link size={14} className="text-[#0A66C2]" /> LinkedIn Profile
                  </label>
                  <input 
                    type="text" 
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                    className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[14px] font-bold rounded-xl shadow-lg shadow-slate-800/20 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save size={18} />
                )}
                Save Profile
              </button>
            </div>

          </div>
        </div>

        {/* Identity Document Verification (Full Width Panel) */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full xl:w-1/2">
          <div className="p-6 border-b border-slate-100 bg-[#8B5CF6]/5">
            <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
              <IdCard size={20} className="text-[#8B5CF6]" /> Identity Verification
            </h3>
            <p className="text-[13px] text-slate-500 mt-1 leading-snug">Verify your identity to increase trust and receive the verified profile badge.</p>
          </div>
          
          <div className="p-6 space-y-6">
            
            <AnimatePresence>
              {idStatus === "pending" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-[16px] p-4 flex gap-3"
                >
                  <Clock size={20} className="text-[#F59E0B] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[14px] font-bold text-[#D97706]">Pending Verification</h4>
                    <p className="text-[13px] text-[#D97706]/80 mt-1 leading-snug">
                      Your ID document is under review by the Super Admin. Please allow up to <strong>72 hours</strong> for manual verification.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 flex justify-between items-center">
                  <span>Document Type</span>
                  {idStatus === "pending" && <Lock size={12} className="text-slate-400" />}
                </label>
                <select 
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  disabled={idStatus === "pending"}
                  className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  <option value="Government ID">Government ID (NID)</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 flex justify-between items-center">
                  <span>Upload {idType} (PDF/JPG)</span>
                  {idStatus === "pending" && <Lock size={12} className="text-slate-400" />}
                </label>
                
                <input 
                  type="file"
                  ref={idInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,image/jpeg,image/png"
                  className="hidden"
                  disabled={idStatus === "pending"}
                />

                <div 
                  onClick={() => idStatus !== "pending" && idInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-[16px] p-6 flex flex-col items-center justify-center transition-all ${
                    idStatus === "pending" 
                      ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed" 
                      : "border-slate-300 bg-slate-50 hover:bg-[#8B5CF6]/5 hover:border-[#8B5CF6] cursor-pointer"
                  }`}
                >
                  {idFile ? (
                    <div className="flex flex-col items-center">
                      <FileText size={32} className="text-[#22C55E] mb-2" />
                      <span className="text-[13px] font-bold text-slate-700 text-center">{idFile.name}</span>
                      <span className="text-[11px] text-slate-500 mt-1">Ready to upload</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud size={32} className="text-slate-400 mb-3" />
                      <span className="text-[14px] font-bold text-slate-700">Click to upload document</span>
                      <span className="text-[12px] text-slate-500 mt-1">Clear copy required (Max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {idStatus !== "pending" && (
              <button 
                onClick={handleSubmitID}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <IdCard size={18} />
                Submit Identity Document
              </button>
            )}

            {idStatus === "pending" && (
              <button 
                disabled
                className="w-full bg-slate-100 text-slate-400 font-bold py-3.5 rounded-xl border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock size={16} /> Locked During Review
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
