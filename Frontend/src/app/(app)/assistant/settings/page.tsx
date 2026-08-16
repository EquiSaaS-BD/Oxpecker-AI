"use client";

import React, { useState, useEffect, useRef } from "react";
import { Settings, User, Bell, Shield, LogOut, ChevronRight, Moon, Edit3, Fingerprint, FileCheck2, GraduationCap, CheckCircle2, UploadCloud, X, Save, FileText, Globe, Camera, AlertCircle, Info, Stethoscope, Upload, Image as ImageIcon, Clock } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AssistantSettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  
  // Settings State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");

  // Profile Edit State
  const [isIdentityEditMode, setIsIdentityEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "+880 1711-000000",
    address: "Dhaka, Bangladesh"
  });

  // Verification State Workflow
  const [verificationStep, setVerificationStep] = useState<'idle' | 'select' | 'upload' | 'pending'>('idle');
  const [selectedDocType, setSelectedDocType] = useState<'NID' | 'Passport' | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  // Verification Countdown State
  const [countdown, setCountdown] = useState(72 * 60 * 60); // 72 hours in seconds

  useEffect(() => {
    if (verificationStep === 'pending') {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [verificationStep]);

  const formatCountdown = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Load user data into form when available
  useEffect(() => {
    if (user) {
      setEditForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  // Handle Profile Picture Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateUser({
          ...user,
          image: base64String
        });
        toast.success("Profile picture updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock Verification State
  const profileCompletion = 80;
  const isReady = profileCompletion >= 80;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUser({
        ...user,
        name: editForm.name,
        email: editForm.email
      });
      toast.success("Profile saved successfully to the database!");
      setIsIdentityEditMode(false);
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent < 50) return "bg-red-500";
    if (percent < 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getProgressBg = (percent: number) => {
    if (percent < 50) return "bg-red-100";
    if (percent < 80) return "bg-amber-100";
    return "bg-emerald-100";
  };

  const getProgressText = (percent: number) => {
    if (percent < 50) return "text-red-600";
    if (percent < 80) return "text-amber-600";
    return "text-emerald-600";
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 lg:pb-10 relative overflow-hidden">
      
      {/* Decorative background blobs for glassmorphism refraction */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Page Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] lg:text-[28px] font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-slate-100 to-slate-200/50 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                <Settings className="text-slate-700" size={24} strokeWidth={2.5} />
              </div>
              Settings
            </h1>
            <p className="text-slate-500 mt-2 text-[14px] lg:text-[15px]">Manage your account, preferences, and security.</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full mt-2 lg:mt-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Profile Card & Tabs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[20px] lg:rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 flex flex-col gap-6 relative overflow-hidden group">
              <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-start gap-4">
                <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border-[3px] border-white shadow-md overflow-hidden group/avatar">
                  <Image 
                    src={user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e0f2fe"} 
                    alt="Assistant Avatar"
                    fill
                    className="object-cover"
                  />
                  {/* Upload Overlay */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                  >
                    <Camera size={20} className="text-white" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                  />
                </div>
                <div className="flex-1 text-center sm:text-left lg:text-left">
                  <h2 className="text-[18px] lg:text-[20px] font-bold text-slate-800">{user?.name || "Assistant"}</h2>
                  <p className="text-[14px] text-[#2F80ED] font-bold capitalize">{user?.role || "Head Assistant"}</p>
                </div>
              </div>

              {/* Profile Completion Bar */}
              <div className={`p-4 rounded-xl border ${isReady ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <p className={`text-[12px] font-bold uppercase tracking-wider ${getProgressText(profileCompletion)}`}>
                    Profile Status
                  </p>
                  <p className={`text-[14px] font-extrabold ${getProgressText(profileCompletion)}`}>
                    {profileCompletion}%
                  </p>
                </div>
                <div className={`h-2.5 w-full rounded-full overflow-hidden ${getProgressBg(profileCompletion)}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(profileCompletion)}`} 
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <p className="text-[12px] text-slate-500 mt-2 font-medium leading-relaxed">
                  {isReady 
                    ? "Verified. Doctors can send you connection invites." 
                    : "Complete 80% to accept doctor invites."}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:flex flex-col gap-2 bg-white/40 backdrop-blur-md border border-white/60 p-2 rounded-[20px]">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 p-4 rounded-[14px] transition-all font-semibold ${activeTab === 'profile' ? 'bg-white shadow-sm text-[#2F80ED]' : 'text-slate-500 hover:bg-white/50'}`}
              >
                <User size={20} /> My Profile
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 p-4 rounded-[14px] transition-all font-semibold ${activeTab === 'security' ? 'bg-white shadow-sm text-[#2F80ED]' : 'text-slate-500 hover:bg-white/50'}`}
              >
                <Shield size={20} /> Security
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center gap-3 p-4 rounded-[14px] transition-all font-semibold ${activeTab === 'preferences' ? 'bg-white shadow-sm text-[#2F80ED]' : 'text-slate-500 hover:bg-white/50'}`}
              >
                <Bell size={20} /> Preferences
              </button>
            </div>

          </div>

          {/* Right Column: Settings Content */}
          <div className="lg:col-span-8 pb-12 lg:pb-0">
            
            {/* Mobile Tabs */}
            <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 hide-scrollbar">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-[14px] transition-all ${activeTab === 'profile' ? 'bg-[#2F80ED] text-white shadow-md' : 'bg-white/60 text-slate-500 border border-white'}`}
              >
                My Profile
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-[14px] transition-all ${activeTab === 'security' ? 'bg-[#2F80ED] text-white shadow-md' : 'bg-white/60 text-slate-500 border border-white'}`}
              >
                Security
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-[14px] transition-all ${activeTab === 'preferences' ? 'bg-[#2F80ED] text-white shadow-md' : 'bg-white/60 text-slate-500 border border-white'}`}
              >
                Preferences
              </button>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                  <>
                    <div className="bg-white/80 backdrop-blur-xl rounded-[20px] lg:rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 transition-all">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
                          <Fingerprint className="text-[#2F80ED]" /> Assistant Identity
                        </h3>
                        {isIdentityEditMode ? (
                          <button 
                            onClick={handleSaveProfile as any}
                            className="bg-[#2F80ED] hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                          >
                            <Save size={16} /> Save
                          </button>
                        ) : (
                          <button 
                            onClick={() => setIsIdentityEditMode(true)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                          >
                            <Edit3 size={16} /> Edit
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                          {isIdentityEditMode ? (
                            <input 
                              type="text" 
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="w-full bg-white px-4 py-3 rounded-xl border border-blue-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-[15px] font-semibold text-slate-800 shadow-sm"
                            />
                          ) : (
                            <p className="text-[15px] font-semibold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 transition-all">{user?.name || "Not set"}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                          {isIdentityEditMode ? (
                            <input 
                              type="email" 
                              value={editForm.email}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className="w-full bg-white px-4 py-3 rounded-xl border border-blue-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-[15px] font-semibold text-slate-800 shadow-sm"
                            />
                          ) : (
                            <p className="text-[15px] font-semibold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 transition-all">{user?.email || "Not set"}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                          {isIdentityEditMode ? (
                            <input 
                              type="text" 
                              value={editForm.phone}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              className="w-full bg-white px-4 py-3 rounded-xl border border-blue-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-[15px] font-semibold text-slate-800 shadow-sm"
                            />
                          ) : (
                            <p className="text-[15px] font-semibold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 transition-all">{editForm.phone}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assistant ID (Read-only)</label>
                          <div className="flex items-center gap-2 opacity-80 cursor-not-allowed">
                            <p className="text-[15px] font-mono font-bold text-[#2F80ED] bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 flex-1">
                              492 183 029 155
                            </p>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText("492183029155");
                                toast.success("ID Copied!");
                              }}
                              className="h-[46px] px-4 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verification Center (3-Step Workflow) */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[20px] lg:rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
                          <FileCheck2 className="text-[#2F80ED]" /> Identity Verification
                        </h3>
                      </div>
                      
                      {verificationStep === 'idle' && (
                        <div className="text-center py-6 px-4">
                          <div className="w-16 h-16 bg-blue-50 text-[#2F80ED] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield size={32} />
                          </div>
                          <h4 className="text-[16px] font-bold text-slate-800 mb-2">Verify your Identity</h4>
                          <p className="text-[14px] text-slate-500 mb-6 w-full whitespace-nowrap overflow-hidden text-ellipsis">
                            To ensure platform security, please verify your identity using a government-issued document.
                          </p>
                          <button 
                            onClick={() => setVerificationStep('select')}
                            className="bg-[#2F80ED] text-white px-6 py-3 rounded-xl font-bold text-[14px] hover:bg-blue-600 active:scale-95 transition-all shadow-md"
                          >
                            Start Verification
                          </button>
                        </div>
                      )}

                      {verificationStep === 'select' && (
                        <div>
                          <h4 className="text-[15px] font-bold text-slate-800 mb-4">Select Document Type</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button 
                              onClick={() => {
                                setSelectedDocType('NID');
                                setVerificationStep('upload');
                              }}
                              className="p-5 border-2 border-slate-100 rounded-[16px] text-left hover:border-[#2F80ED] hover:bg-blue-50/30 transition-all group"
                            >
                              <FileText className="text-slate-400 group-hover:text-[#2F80ED] mb-3" size={28} />
                              <h5 className="text-[15px] font-bold text-slate-800 mb-1">National ID Card</h5>
                              <p className="text-[13px] text-slate-500">Government issued NID</p>
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedDocType('Passport');
                                setVerificationStep('upload');
                              }}
                              className="p-5 border-2 border-slate-100 rounded-[16px] text-left hover:border-[#2F80ED] hover:bg-blue-50/30 transition-all group"
                            >
                              <Globe className="text-slate-400 group-hover:text-[#2F80ED] mb-3" size={28} />
                              <h5 className="text-[15px] font-bold text-slate-800 mb-1">Passport</h5>
                              <p className="text-[13px] text-slate-500">International Passport</p>
                            </button>
                          </div>
                          <button 
                            onClick={() => setVerificationStep('idle')}
                            className="mt-6 text-[14px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {verificationStep === 'upload' && (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <button onClick={() => setVerificationStep('select')} className="text-slate-400 hover:text-slate-700">
                              <ChevronRight className="rotate-180" size={20} />
                            </button>
                            <div>
                              <h4 className="text-[15px] font-bold text-slate-800">Upload {selectedDocType}</h4>
                              <p className="text-[13px] text-slate-500">Please provide a clear image of your document.</p>
                            </div>
                          </div>

                          <div className="border-2 border-dashed border-slate-200 rounded-[20px] p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer relative group">
                            <input 
                              type="file" 
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  setUploadedFileName(e.target.files[0].name);
                                }
                              }}
                            />
                            {uploadedFileName ? (
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                                  <ImageIcon size={28} />
                                </div>
                                <p className="text-[15px] font-bold text-emerald-600">{uploadedFileName}</p>
                                <p className="text-[13px] text-slate-500 mt-1">Click to change file</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-blue-50 text-[#2F80ED] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                  <UploadCloud size={28} />
                                </div>
                                <p className="text-[15px] font-bold text-slate-700">Click to upload or drag and drop</p>
                                <p className="text-[13px] text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 flex gap-3">
                            <button 
                              onClick={() => setVerificationStep('select')}
                              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                              Back
                            </button>
                            <button 
                              onClick={() => {
                                if (uploadedFileName) {
                                  setVerificationStep('pending');
                                  toast.success("Document submitted for review!");
                                } else {
                                  toast.error("Please select a file first");
                                }
                              }}
                              className={`flex-1 px-4 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${uploadedFileName ? 'bg-[#2F80ED] text-white hover:bg-blue-600 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                              Submit Document
                            </button>
                          </div>
                        </div>
                      )}

                      {verificationStep === 'pending' && (
                        <div className="bg-amber-50 border border-amber-200/60 rounded-[16px] p-6 text-center">
                          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                          </div>
                          <h4 className="text-[16px] font-bold text-amber-700 mb-2">Pending Manual Review</h4>
                          <p className="text-[14px] text-amber-600/80 mb-6 max-w-4xl mx-auto leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis">
                            Your {selectedDocType} has been submitted successfully. A Super Admin will manually review your document. Please allow up to <strong>72 hours</strong> for verification.
                          </p>
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div className="inline-flex items-center gap-2 bg-amber-100/50 px-5 py-2.5 rounded-full text-amber-700 text-[14px] font-bold">
                              <Clock size={18} className="animate-pulse" />
                              Review in progress...
                            </div>
                            <div className="inline-flex items-center gap-2 bg-slate-800 px-5 py-2.5 rounded-full text-white text-[14px] font-bold shadow-md tracking-wider font-mono">
                              {formatCountdown(countdown)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                  <div className="bg-white/80 backdrop-blur-xl rounded-[20px] lg:rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60">
                    <h3 className="text-[18px] font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Shield className="text-amber-500" /> Security Settings
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="text-[13px] font-bold text-slate-700 block mb-2">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#2F80ED] transition-colors" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[13px] font-bold text-slate-700 block mb-2">New Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#2F80ED] transition-colors" />
                        </div>
                        <div>
                          <label className="text-[13px] font-bold text-slate-700 block mb-2">Confirm New Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#2F80ED] transition-colors" />
                        </div>
                      </div>
                      <button 
                        onClick={() => toast.success("Password successfully updated!")}
                        className="bg-[#2F80ED] text-white px-6 py-3 rounded-xl font-bold text-[14px] hover:bg-[#256bc7] active:scale-95 transition-all shadow-md w-full sm:w-auto"
                      >
                        Update Password
                      </button>
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-100">
                      <h4 className="text-[16px] font-bold text-slate-800 mb-2">Two-Factor Authentication</h4>
                      <p className="text-[14px] text-slate-500 mb-4">Add an extra layer of security to your account.</p>
                      <button 
                        onClick={() => toast.success("2FA Setup initiated")}
                        className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-[14px] hover:bg-slate-50 active:scale-95 transition-all shadow-sm w-full sm:w-auto"
                      >
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                )}

                {/* PREFERENCES TAB */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[20px] lg:rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60">
                      <h3 className="text-[18px] font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Settings className="text-slate-500" /> App Preferences
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                              <Bell size={22} />
                            </div>
                            <div>
                              <span className="text-[16px] font-semibold text-slate-800 block">Push Notifications</span>
                              <span className="text-[13px] text-slate-500">Receive alerts for queues and appointments</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setNotificationsEnabled(!notificationsEnabled);
                              toast(notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled");
                            }}
                            className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${notificationsEnabled ? 'bg-[#22C55E]' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                        
                        <div className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                              <Moon size={22} />
                            </div>
                            <div>
                              <span className="text-[16px] font-semibold text-slate-800 block">Dark Mode</span>
                              <span className="text-[13px] text-slate-500">Toggle dark theme across the app</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setDarkMode(!darkMode);
                              toast.info("Dark mode coming soon!");
                            }}
                            className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${darkMode ? 'bg-[#2F80ED]' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${darkMode ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50/50 backdrop-blur-xl rounded-[20px] lg:rounded-[24px] p-6 shadow-sm border border-red-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-[16px] font-bold text-red-600 mb-1">Sign Out</h4>
                          <p className="text-[13px] text-red-400">Log out of your assistant account</p>
                        </div>
                        <button 
                          onClick={handleLogout}
                          className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 hover:bg-red-600 active:scale-95 transition-all shadow-md"
                        >
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
            
            <p className="text-center text-[13px] text-slate-400 font-medium py-8 pb-12">
              Shustota AI App v1.2.0 • Production Level
            </p>

          </div>
        </div>
      </div>



    </div>
  );
}
