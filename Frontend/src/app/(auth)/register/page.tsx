"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { User, Stethoscope, Building2, CheckCircle2, Eye, EyeOff, ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type AccountType = "patient" | "doctor" | "hospital" | "assistant" | null;

interface FormData {
  accountType: AccountType;
  // Patient fields
  patientFullName: string;
  patientEmail: string;
  patientMobile: string;
  patientDob: string;
  patientGender: string;
  // Doctor fields
  doctorFullName: string;
  doctorEmail: string;
  doctorMobile: string;
  doctorRegNo: string;
  doctorSpec: string;
  // Assistant fields
  assistantFullName: string;
  assistantEmail: string;
  assistantMobile: string;
  assistantInviteCode: string;
  // Hospital fields
  hospitalName: string;
  hospitalEmail: string;
  hospitalPhone: string;
  hospitalRegNo: string;
  hospitalAddress: string;
  // Step 3
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const ACCOUNT_TYPES = [
  { value: "patient" as const, label: "Patient", desc: "Book appointments and manage health", icon: User },
  { value: "doctor" as const, label: "Doctor", desc: "Manage clinic and patient records", icon: Stethoscope },
  { value: "assistant" as const, label: "Doctor Assistant", desc: "Manage queues and chamber ops", icon: Eye },
  { value: "hospital" as const, label: "Hospital", desc: "Enterprise facility management", icon: Building2 },
];

const InputField = ({ label, id, type = "text", required = false, isHalf = false, rightElement, error, ...props }: any) => (
  <div className={`flex flex-col gap-1.5 ${isHalf ? "md:col-span-1 col-span-2" : "col-span-2"}`}>
    <label htmlFor={id} className="text-sm font-semibold text-slate-700 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {type === "select" ? (
        <>
          <select
            id={id}
            className={`w-full h-[52px] rounded-xl pl-4 pr-10 border-2 transition-all outline-none bg-transparent appearance-none cursor-pointer ${error ? "border-red-400 focus:border-red-500 bg-red-50" : "border-slate-200 focus:border-[#70DE71] hover:border-slate-300"}`}
            {...props}
          >
            <option value="" disabled>Select...</option>
            {props.options?.map((opt: string) => (
              <option key={opt} value={opt} className="text-slate-700 py-2">{opt}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown size={20} />
          </div>
        </>
      ) : (
        <input
          id={id}
          type={type}
          className={`w-full h-[52px] rounded-xl px-4 border-2 transition-all outline-none bg-transparent ${error ? "border-red-400 focus:border-red-500 bg-red-50" : "border-slate-200 focus:border-[#70DE71] hover:border-slate-300"}`}
          {...props}
        />
      )}
      {rightElement && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-red-500 font-medium ml-1">
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

export default function RegisterPage() {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    accountType: null,
    patientFullName: "", patientEmail: "", patientMobile: "", patientDob: "", patientGender: "",
    doctorFullName: "", doctorEmail: "", doctorMobile: "", doctorRegNo: "", doctorSpec: "",
    assistantFullName: "", assistantEmail: "", assistantMobile: "", assistantInviteCode: "",
    hospitalName: "", hospitalEmail: "", hospitalPhone: "", hospitalRegNo: "", hospitalAddress: "",
    password: "", confirmPassword: "", agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = useCallback((field: keyof FormData, value: string | boolean | AccountType) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }, []);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (formData.accountType === "patient") {
      if (!formData.patientFullName.trim()) errs.patientFullName = "Required";
      if (!formData.patientEmail.trim() || !isValidEmail(formData.patientEmail)) errs.patientEmail = "Valid email required";
      if (!formData.patientMobile.trim()) errs.patientMobile = "Required";
    } else if (formData.accountType === "doctor") {
      if (!formData.doctorFullName.trim()) errs.doctorFullName = "Required";
      if (!formData.doctorEmail.trim() || !isValidEmail(formData.doctorEmail)) errs.doctorEmail = "Valid email required";
      if (!formData.doctorMobile.trim()) errs.doctorMobile = "Required";
      if (!formData.doctorRegNo.trim()) errs.doctorRegNo = "Required";
      if (!formData.doctorSpec.trim()) errs.doctorSpec = "Required";
    } else if (formData.accountType === "assistant") {
      if (!formData.assistantFullName.trim()) errs.assistantFullName = "Required";
      if (!formData.assistantEmail.trim() || !isValidEmail(formData.assistantEmail)) errs.assistantEmail = "Valid email required";
      if (!formData.assistantMobile.trim()) errs.assistantMobile = "Required";
    } else if (formData.accountType === "hospital") {
      if (!formData.hospitalName.trim()) errs.hospitalName = "Required";
      if (!formData.hospitalEmail.trim() || !isValidEmail(formData.hospitalEmail)) errs.hospitalEmail = "Valid email required";
      if (!formData.hospitalPhone.trim()) errs.hospitalPhone = "Required";
      if (!formData.hospitalRegNo.trim()) errs.hospitalRegNo = "Required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!formData.password || formData.password.length < 8) errs.password = "Min 8 chars required";
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords mismatch";
    if (!formData.agreeTerms) errs.agreeTerms = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !formData.accountType) return;
    if (step === 2 && !validateStep2()) return;
    setDirection(1);
    setStep((s) => Math.min(3, s + 1));
    setErrors({});
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setIsLoading(true);
    
    const name = formData.accountType === "patient" ? formData.patientFullName 
               : formData.accountType === "doctor" ? formData.doctorFullName 
               : formData.accountType === "assistant" ? formData.assistantFullName 
               : formData.hospitalName;
               
    const email = formData.accountType === "patient" ? formData.patientEmail 
                : formData.accountType === "doctor" ? formData.doctorEmail 
                : formData.accountType === "assistant" ? formData.assistantEmail 
                : formData.hospitalEmail;

    // Check localStorage DB
    const existingUsersStr = localStorage.getItem('shustota_users');
    const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : [];
    
    if (existingUsers.some((u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim())) {
      setIsLoading(false);
      toast.error("This email is already registered. Please login.", {
        style: { background: '#EF4444', color: '#fff', border: 'none' }
      });
      return;
    }

    await new Promise((r) => setTimeout(r, 1500)); // simulate network

    // Generate 12-digit ID for assistants
    let generatedAstId = undefined;
    if (formData.accountType === "assistant") {
      generatedAstId = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    }

    // Save new user
    const newUser = {
      id: Date.now().toString(),
      assistantId: generatedAstId,
      name,
      email,
      role: formData.accountType,
      password: formData.password
    };
    
    existingUsers.push(newUser);
    localStorage.setItem('shustota_users', JSON.stringify(existingUsers));

    if (generatedAstId) {
      toast.success(`Account created! Your Assistant ID is: ${generatedAstId}`, { duration: 6000 });
    } else {
      toast.success("Account created successfully!");
    }
    
    await new Promise((r) => setTimeout(r, 1500));
    
    login({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
  };

  const slideVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0, transition: { duration: 0.2 } }),
  };


  return (
    <main className="min-h-screen bg-white flex flex-col items-center py-10 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[700px] flex flex-col items-center relative"
      >
        <Toaster position="top-center" />
        
        {/* Back to Home Button */}
        <Link href="/" className="absolute left-0 top-0 sm:top-2 p-2.5 text-slate-500 hover:text-primary bg-slate-100 hover:bg-primary/10 rounded-full transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> <span className="hidden sm:inline font-bold text-sm">Home</span>
        </Link>

        {/* Logo */}
      <Link href="/" className="mb-12">
        <Image src="/images/shustota ai logo.png" alt="Shustota AI" width={400} height={140} className="h-28 sm:h-32 w-auto object-contain" />
      </Link>

      {/* Main Container */}
      <div className="w-full max-w-[700px]">
        {/* Step Progress Indicator (1 ---- 2 ---- 3) */}
        <div className="flex items-center justify-between w-full max-w-[400px] mx-auto mb-14 relative z-10 px-2">
          {/* Background Line */}
          <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
          {/* Active Line */}
          <div className="absolute top-1/2 left-6 h-1 bg-[#70DE71] -z-10 -translate-y-1/2 transition-all duration-500 rounded-full" style={{ width: `calc(${(step - 1) * 50}%)` }}></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
              step >= s 
                ? "bg-[#70DE71] text-white shadow-[0_0_0_6px_rgba(112,222,113,0.15)]" 
                : "bg-white text-slate-400 border-2 border-slate-200"
            }`}>
              {step > s ? <CheckCircle2 size={24} strokeWidth={3} className="text-white" /> : s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {/* STEP 1: WHO ARE YOU? */}
          {step === 1 && (
            <motion.div key="step1" custom={direction} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center">
              <h1 className="text-2xl font-bold text-slate-800 mb-8 uppercase tracking-wide flex items-center gap-2">
                <HelpCircle className="text-[#70DE71]" size={28} /> Who Are You?
              </h1>
              
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 justify-items-center mb-10 max-w-[680px]">
                {ACCOUNT_TYPES.map((type) => {
                  const isSelected = formData.accountType === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => updateForm("accountType", type.value)}
                      className={`relative flex flex-col items-center justify-center gap-3 rounded-[20px] border-2 transition-all p-4 cursor-pointer overflow-hidden
                        w-[320px] h-[180px]
                        ${isSelected ? "border-[#70DE71] bg-[#70DE71]/5 shadow-[0_8px_30px_rgba(112,222,113,0.2)]" : "border-slate-200 bg-white hover:border-[#70DE71]/50 shadow-sm hover:shadow-md"}
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-[#70DE71]">
                          <CheckCircle2 size={24} className="fill-[#70DE71]/20" />
                        </div>
                      )}
                      <div className={`p-4 rounded-full ${isSelected ? "bg-[#70DE71] text-white" : "bg-slate-100 text-slate-500 transition-colors group-hover:bg-[#70DE71]/10"}`}>
                        <type.icon size={40} />
                      </div>
                      <span className={`font-bold text-[22px] ${isSelected ? "text-slate-800" : "text-slate-600"}`}>{type.label}</span>
                      <span className={`text-[15px] font-medium text-center px-4 ${isSelected ? "text-slate-600" : "text-slate-500"}`}>{type.desc}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={goNext}
                disabled={!formData.accountType}
                className="w-full h-[52px] bg-[#70DE71] hover:bg-[#5bc95c] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 2: PERSONAL INFORMATION */}
          {step === 2 && (
            <motion.div key="step2" custom={direction} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <div className="flex items-center mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 uppercase tracking-wide w-full text-center flex items-center justify-center gap-2 whitespace-nowrap">
                  <HelpCircle className="text-[#70DE71]" size={28} /> Personal Information
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-8">
                {formData.accountType === "patient" && (
                  <>
                    <InputField error={errors["patientFullName"]} id="patientFullName" label="Full Name" required isHalf value={formData.patientFullName} onChange={(e: any) => updateForm("patientFullName", e.target.value)} />
                    <InputField error={errors["patientEmail"]} id="patientEmail" label="Email Address" type="email" required isHalf value={formData.patientEmail} onChange={(e: any) => updateForm("patientEmail", e.target.value)} />
                    <InputField error={errors["patientMobile"]} id="patientMobile" label="Mobile Number" type="tel" required isHalf value={formData.patientMobile} onChange={(e: any) => updateForm("patientMobile", e.target.value)} />
                    <InputField error={errors["patientDob"]} id="patientDob" label="Date of Birth" type="date" isHalf value={formData.patientDob} onChange={(e: any) => updateForm("patientDob", e.target.value)} />
                    <InputField error={errors["patientGender"]} id="patientGender" label="Gender" type="select" options={["Male", "Female", "Other"]} isHalf value={formData.patientGender} onChange={(e: any) => updateForm("patientGender", e.target.value)} />
                    <div className="col-span-2 mt-2 bg-slate-50 p-4 rounded-[16px] border border-slate-100 shadow-sm">
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        <span className="font-bold text-slate-700">Note:</span> Blood Group, Address, Emergency Contact, Medical History and other profile information can be updated later from Profile Settings.
                      </p>
                    </div>
                  </>
                )}

                {formData.accountType === "doctor" && (
                  <>
                    <InputField error={errors["doctorFullName"]} id="doctorFullName" label="Full Name" required isHalf value={formData.doctorFullName} onChange={(e: any) => updateForm("doctorFullName", e.target.value)} />
                    <InputField error={errors["doctorEmail"]} id="doctorEmail" label="Email Address" type="email" required isHalf value={formData.doctorEmail} onChange={(e: any) => updateForm("doctorEmail", e.target.value)} />
                    <InputField error={errors["doctorMobile"]} id="doctorMobile" label="Mobile Number" type="tel" required isHalf value={formData.doctorMobile} onChange={(e: any) => updateForm("doctorMobile", e.target.value)} />
                    <InputField error={errors["doctorRegNo"]} id="doctorRegNo" label="Medical Registration Number" required isHalf value={formData.doctorRegNo} onChange={(e: any) => updateForm("doctorRegNo", e.target.value)} />
                    <InputField error={errors["doctorSpec"]} id="doctorSpec" label="Specialization" type="select" options={["General Physician", "Cardiologist", "Dermatologist", "Endocrinologist", "Gastroenterologist", "Gynecologist", "Neurologist", "Orthopedist", "Pediatrician", "Psychiatrist", "Dentist", "ENT Specialist", "Other"]} required value={formData.doctorSpec} onChange={(e: any) => updateForm("doctorSpec", e.target.value)} />
                    <div className="col-span-2 mt-2 bg-slate-50 p-4 rounded-[16px] border border-slate-100 shadow-sm">
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        <span className="font-bold text-slate-700">Note:</span> Qualification, Experience, Consultation Fee, Profile Photo and Certificates can be added later from Profile Settings.
                      </p>
                    </div>
                  </>
                )}

                {formData.accountType === "assistant" && (
                  <>
                    <InputField error={errors["assistantFullName"]} id="assistantFullName" label="Full Name" required isHalf value={formData.assistantFullName} onChange={(e: any) => updateForm("assistantFullName", e.target.value)} />
                    <InputField error={errors["assistantEmail"]} id="assistantEmail" label="Email Address" type="email" required isHalf value={formData.assistantEmail} onChange={(e: any) => updateForm("assistantEmail", e.target.value)} />
                    <InputField error={errors["assistantMobile"]} id="assistantMobile" label="Mobile Number" type="tel" required value={formData.assistantMobile} onChange={(e: any) => updateForm("assistantMobile", e.target.value)} />
                    <div className="col-span-2 mt-2 bg-slate-50 p-4 rounded-[16px] border border-slate-100 shadow-sm">
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        <span className="font-bold text-slate-700">Note:</span> After creating your account, you will receive a 12-digit Unique Assistant ID. Doctors will use this ID to invite you to their clinic.
                      </p>
                    </div>
                  </>
                )}

                {formData.accountType === "hospital" && (
                  <>
                    <InputField error={errors["hospitalName"]} id="hospitalName" label="Hospital Name" required value={formData.hospitalName} onChange={(e: any) => updateForm("hospitalName", e.target.value)} />
                    <InputField error={errors["hospitalEmail"]} id="hospitalEmail" label="Official Email" type="email" required isHalf value={formData.hospitalEmail} onChange={(e: any) => updateForm("hospitalEmail", e.target.value)} />
                    <InputField error={errors["hospitalPhone"]} id="hospitalPhone" label="Phone Number" type="tel" required isHalf value={formData.hospitalPhone} onChange={(e: any) => updateForm("hospitalPhone", e.target.value)} />
                    <InputField error={errors["hospitalRegNo"]} id="hospitalRegNo" label="Hospital Registration Number" required value={formData.hospitalRegNo} onChange={(e: any) => updateForm("hospitalRegNo", e.target.value)} />
                    <InputField error={errors["hospitalAddress"]} id="hospitalAddress" label="Address" value={formData.hospitalAddress} onChange={(e: any) => updateForm("hospitalAddress", e.target.value)} />
                    <div className="col-span-2 mt-2 bg-slate-50 p-4 rounded-[16px] border border-slate-100 shadow-sm">
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        <span className="font-bold text-slate-700">Note:</span> Hospital Logo, License, Beds, ICU, Ambulance, Google Map Location and other hospital information can be updated later from Hospital Settings.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={goBack}
                  className="w-1/3 h-[52px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  onClick={goNext}
                  className="w-2/3 h-[52px] bg-[#70DE71] hover:bg-[#5bc95c] text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PASSWORD */}
          {step === 3 && (
            <motion.div key="step3" custom={direction} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <div className="flex items-center mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 uppercase tracking-wide w-full text-center flex items-center justify-center gap-2 whitespace-nowrap">
                  <HelpCircle className="text-[#70DE71]" size={28} /> Secure Password
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-8">
                <InputField error={errors["password"]} id="password" 
                  label="Password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  isHalf 
                  value={formData.password} 
                  onChange={(e: any) => updateForm("password", e.target.value)} 
                  rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
                />
                <InputField error={errors["confirmPassword"]} id="confirmPassword" 
                  label="Confirm Password" 
                  type={showConfirm ? "text" : "password"} 
                  required 
                  isHalf 
                  value={formData.confirmPassword} 
                  onChange={(e: any) => updateForm("confirmPassword", e.target.value)} 
                  rightElement={<button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-400 hover:text-slate-600">{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-8 group">
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  <input type="checkbox" checked={formData.agreeTerms} onChange={(e) => updateForm("agreeTerms", e.target.checked)} className="peer sr-only" />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all ${formData.agreeTerms ? "bg-[#70DE71] border-[#70DE71]" : "border-slate-300 group-hover:border-[#70DE71]"}`} />
                  <CheckCircle2 size={14} className={`absolute text-white transition-opacity ${formData.agreeTerms ? "opacity-100" : "opacity-0"}`} />
                </div>
                <span className="text-sm text-slate-600 font-medium">
                  I agree to the <Link href="/terms" className="text-[#70DE71] font-bold hover:underline">Terms</Link> & <Link href="/privacy" className="text-[#70DE71] font-bold hover:underline">Privacy Policy</Link>.
                </span>
              </label>

              <div className="flex gap-4">
                <button
                  onClick={goBack}
                  disabled={isLoading}
                  className="w-1/3 h-[54px] bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-[12px] transition-all active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-2/3 h-[54px] bg-[#70DE71] hover:bg-[#5bc95c] disabled:bg-[#70DE71]/70 text-white font-bold rounded-[12px] transition-all shadow-md active:scale-[0.98] flex items-center justify-center"
                >
                  {isLoading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Account"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-slate-500 mt-12 font-medium">
          Already have an account? <Link href="/login" className="text-[#70DE71] font-bold hover:underline">Log in</Link>
        </p>
      </div>
      </motion.div>
    </main>
  );
}
