"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Mail, Lock, ShieldCheck, ArrowRight, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [identity, setIdentity] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [targetUser, setTargetUser] = useState<any>(null);
  
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Step 1: Verify Email/Phone exists
  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity.trim()) {
      toast.error("Please enter your email or phone number.");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));
    
    const existingUsersStr = localStorage.getItem('shustota_users');
    const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : [];
    
    // In our mock DB, we only have emails.
    const user = existingUsers.find((u: any) => u.email.toLowerCase() === identity.toLowerCase());
    
    setIsLoading(false);
    
    if (user) {
      setTargetUser(user);
      setStep(2);
      toast.success("OTP sent to your email!");
    } else {
      toast.error("No account found with this email/phone.");
    }
  };

  // Step 2: Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 4) {
      toast.error("Please enter the complete OTP.");
      return;
    }
    
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
    
    // Accept any 4-digit code in the simulation
    setStep(3);
    toast.success("OTP verified successfully!");
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    
    // Update local DB
    const existingUsersStr = localStorage.getItem('shustota_users');
    const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : [];
    
    const updatedUsers = existingUsers.map((u: any) => {
      if (u.id === targetUser.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    
    localStorage.setItem('shustota_users', JSON.stringify(updatedUsers));
    
    setIsLoading(false);
    toast.success("Password reset successfully! Redirecting...");
    
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  const slideVariants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { x: -20, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center py-10 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[460px] flex flex-col items-center relative"
      >
        <Toaster position="top-center" />
        
        {/* Back Button */}
        {step === 1 && (
          <Link href="/login" className="absolute left-0 top-2 sm:top-4 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={24} />
          </Link>
        )}
        
        {/* Logo */}
        <Link href="/" className="mb-10">
          <Image src="/images/shustota ai logo.png" alt="Shustota AI" width={400} height={140} className="h-24 sm:h-28 w-auto object-contain" />
        </Link>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-8 w-full max-w-[280px]">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-[#70DE71]" : "bg-slate-100"}`} />
            </div>
          ))}
        </div>

        <div className="w-full relative overflow-hidden" style={{ minHeight: "360px" }}>
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Find Account */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#e6fae6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} className="text-[#70DE71]" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">Reset Password</h1>
                  <p className="text-slate-500 font-medium">Enter your email or phone number</p>
                </div>

                <form onSubmit={handleVerifyIdentity} className="space-y-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Email or Phone</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="text" 
                        value={identity}
                        onChange={(e) => setIdentity(e.target.value)}
                        placeholder="john@example.com or 0171..."
                        className="w-full h-[52px] bg-transparent border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-[#70DE71] hover:border-slate-300 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  <button type="submit" disabled={isLoading} className="w-full h-[52px] bg-[#70DE71] hover:bg-[#5bc95c] text-white rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(112,222,113,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    {isLoading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span> : <>Continue <ArrowRight size={20} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#e6fae6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={32} className="text-[#70DE71]" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">Verification Code</h1>
                  <p className="text-slate-500 font-medium text-sm px-4">
                    We've sent a 4-digit code to <br/> <strong className="text-slate-700">{targetUser?.email}</strong>
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-[60px] h-[72px] text-center text-3xl font-extrabold text-slate-800 bg-transparent border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#70DE71] focus:bg-[#f6fdf6] hover:border-slate-300 transition-all"
                      />
                    ))}
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <button onClick={verifyOtp} disabled={isLoading} className="w-full h-[52px] bg-[#70DE71] hover:bg-[#5bc95c] text-white rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(112,222,113,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      {isLoading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span> : "Verify OTP"}
                    </button>
                    <p className="text-center text-sm font-semibold text-slate-500">
                      Didn't receive code? <button className="text-[#70DE71] hover:underline ml-1">Resend</button>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: New Password */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#e6fae6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} className="text-[#70DE71]" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">New Password</h1>
                  <p className="text-slate-500 font-medium">Create a strong, new password</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-[52px] bg-transparent border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-[#70DE71] hover:border-slate-300 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
                    <div className="relative">
                      <CheckCircle2 className={`absolute left-4 top-1/2 -translate-y-1/2 ${confirmPassword && newPassword === confirmPassword ? 'text-[#70DE71]' : 'text-slate-400'}`} size={20} />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-[52px] bg-transparent border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-[#70DE71] hover:border-slate-300 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button type="submit" disabled={isLoading} className="w-full h-[52px] bg-[#70DE71] hover:bg-[#5bc95c] text-white rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(112,222,113,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      {isLoading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span> : "Save Password"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
