"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { 
  User, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ChevronDown, 
  HelpCircle,
  AlertCircle,
  Droplet,
  Check,
  ShieldCheck,
  Sparkles,
  Phone,
  Calendar,
  Hash,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Login3DBackground } from "@/components/shared/Login3DBackground";
import { initiateGoogleSignIn } from "@/lib/googleAuth";

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

type AccountType = "patient" | "doctor" | "hospital" | "assistant" | null;

interface FormData {
  accountType: AccountType;
  // Patient fields
  patientFullName: string;
  patientEmail: string;
  patientMobile: string;
  patientDob: string;
  patientGender: string;
  patientBloodGroup: string;
  // Doctor fields
  doctorFullName: string;
  doctorEmail: string;
  doctorMobile: string;
  doctorRegNo: string;
  doctorSpec: string;
  doctorHospital: string;
  doctorFee: string;
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
  hospitalType: string;
  // Step 3
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}


const AssistantIcon = ({ size, className }: any) => (
  <div 
    className={`inline-block bg-current ${className}`}
    style={{
      width: size, 
      height: size, 
      WebkitMaskImage: 'url(/images/assistant-icon.png)',
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskImage: 'url(/images/assistant-icon.png)',
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
    }}
  />
);

const ACCOUNT_TYPES = [
  { value: "patient" as const, label: "Patient", desc: "Book appointments and manage health", icon: User },
  { value: "doctor" as const, label: "Doctor", desc: "Manage clinic and patient records", icon: Stethoscope },
  { value: "assistant" as const, label: "Doctor Assistant", desc: "Manage queues and chamber ops", icon: AssistantIcon },
  { value: "hospital" as const, label: "Hospital", desc: "Enterprise facility management", icon: Building2 },
];

const InputField = ({ label, id, type = "text", required = false, isHalf = false, rightElement, error, ...props }: any) => (
  <div className={`flex flex-col gap-1.5 ${isHalf ? "md:col-span-1 col-span-2" : "col-span-2"}`}>
    <label htmlFor={id} className="text-[13px] font-semibold text-slate-500 ml-1 mb-0.5 tracking-tight">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {type === "select" ? (
        <>
          <select
            id={id}
            className={`w-full h-[52px] rounded-2xl pl-4 pr-10 transition-all outline-none appearance-none cursor-pointer text-[15px] font-medium ${error ? "bg-red-50 text-red-900 border border-red-200 focus:border-red-400 focus:ring-4 focus:ring-red-100" : "bg-black/[0.03] text-slate-900 border border-transparent hover:bg-black/[0.05] focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50"}`}
            {...props}
          >
            <option value="" disabled>Select...</option>
            {props.options?.map((opt: string) => (
              <option key={opt} value={opt} className="text-slate-700 py-2">{opt}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <ChevronDown size={20} />
          </div>
        </>
      ) : (
        <input
          id={id}
          type={type}
          className={`w-full h-[52px] rounded-2xl px-4 transition-all outline-none text-[15px] font-medium ${props.disabled ? "bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200" : error ? "bg-red-50 text-red-900 border border-red-200 focus:border-red-400 focus:ring-4 focus:ring-red-100" : "bg-black/[0.03] text-slate-900 border border-transparent hover:bg-black/[0.05] focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50"}`}
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

  // Google OAuth States
  const [googleUser, setGoogleUser] = useState<{
    name: string;
    email: string;
    picture: string;
  } | null>(null);
  const [isGoogleOnboarding, setIsGoogleOnboarding] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [pulseCards, setPulseCards] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    accountType: null,
    patientFullName: "", patientEmail: "", patientMobile: "", patientDob: "", patientGender: "", patientBloodGroup: "",
    doctorFullName: "", doctorEmail: "", doctorMobile: "", doctorRegNo: "", doctorSpec: "", doctorHospital: "", doctorFee: "",
    assistantFullName: "", assistantEmail: "", assistantMobile: "", assistantInviteCode: "",
    hospitalName: "", hospitalEmail: "", hospitalPhone: "", hospitalRegNo: "", hospitalAddress: "", hospitalType: "General Hospital",
    password: "", confirmPassword: "", agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = useCallback((field: keyof FormData, value: string | boolean | AccountType) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }, []);

  // Check if returning from OAuth callback with pending Google user
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("oxpecker_google_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setGoogleUser(parsed);
        if (parsed.role) {
          updateForm("accountType", parsed.role);
          if (parsed.role === "patient") {
            updateForm("patientFullName", parsed.name || "");
            updateForm("patientEmail", parsed.email || "");
          } else if (parsed.role === "doctor") {
            updateForm("doctorFullName", parsed.name || "");
            updateForm("doctorEmail", parsed.email || "");
          } else if (parsed.role === "assistant") {
            updateForm("assistantFullName", parsed.name || "");
            updateForm("assistantEmail", parsed.email || "");
          } else if (parsed.role === "hospital") {
            updateForm("hospitalName", parsed.name || "");
            updateForm("hospitalEmail", parsed.email || "");
          }
        }
        setIsGoogleOnboarding(true);
        sessionStorage.removeItem("oxpecker_google_user");
      }
    } catch (e) {
      console.warn("Stored google user read error:", e);
    }
  }, [updateForm]);

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

  // Google Sign-Up Trigger
  const handleGoogleSignUp = async () => {
    if (!formData.accountType) {
      setPulseCards(true);
      setTimeout(() => setPulseCards(false), 900);
      toast.warning("Please choose your role above (Patient, Doctor, Assistant, or Hospital) first!");
      return;
    }

    setIsGoogleLoading(true);
    sessionStorage.setItem("oxpecker_pending_role", formData.accountType);

    try {
      const gUser = await initiateGoogleSignIn();
      
      // 1. Check if user already exists in profiles
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", gUser.email.toLowerCase().trim())
        .maybeSingle();

      if (existingUser && existingUser.phone) {
        toast.success(`Welcome back, ${existingUser.name}! Logging you in...`);
        login(existingUser as any);
        return;
      }

      // 2. New or incomplete profile -> attach Google info and go to role onboarding
      setGoogleUser({
        name: gUser.name,
        email: gUser.email,
        picture: gUser.picture
      });

      if (formData.accountType === "patient") {
        updateForm("patientFullName", gUser.name);
        updateForm("patientEmail", gUser.email);
      } else if (formData.accountType === "doctor") {
        updateForm("doctorFullName", gUser.name);
        updateForm("doctorEmail", gUser.email);
      } else if (formData.accountType === "assistant") {
        updateForm("assistantFullName", gUser.name);
        updateForm("assistantEmail", gUser.email);
      } else if (formData.accountType === "hospital") {
        updateForm("hospitalName", gUser.name);
        updateForm("hospitalEmail", gUser.email);
      }

      setIsGoogleOnboarding(true);
      toast.success("Google account verified! Please complete required role profile details.");
    } catch (err: any) {
      console.error("Google sign in error:", err);
      toast.error(err.message || "Google authentication was cancelled.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Validate Google Onboarding required fields
  const validateGoogleOnboarding = () => {
    const errs: Record<string, string> = {};
    if (formData.accountType === "patient") {
      if (!formData.patientFullName.trim()) errs.patientFullName = "Full name is required";
      if (!formData.patientMobile.trim()) errs.patientMobile = "Mobile number is required";
      if (!formData.patientDob) errs.patientDob = "Date of birth is required";
      if (!formData.patientGender) errs.patientGender = "Gender is required";
      if (!formData.patientBloodGroup) errs.patientBloodGroup = "Blood group is required";
    } else if (formData.accountType === "doctor") {
      if (!formData.doctorFullName.trim()) errs.doctorFullName = "Full name is required";
      if (!formData.doctorMobile.trim()) errs.doctorMobile = "Mobile number is required";
      if (!formData.doctorRegNo.trim()) errs.doctorRegNo = "BMDC Reg No is required";
      if (!formData.doctorSpec.trim()) errs.doctorSpec = "Specialty is required";
      if (!formData.doctorHospital.trim()) errs.doctorHospital = "Hospital/Chamber name is required";
    } else if (formData.accountType === "assistant") {
      if (!formData.assistantFullName.trim()) errs.assistantFullName = "Full name is required";
      if (!formData.assistantMobile.trim()) errs.assistantMobile = "Mobile number is required";
      if (!formData.assistantInviteCode.trim()) errs.assistantInviteCode = "Doctor or clinic ID is required";
    } else if (formData.accountType === "hospital") {
      if (!formData.hospitalName.trim()) errs.hospitalName = "Hospital name is required";
      if (!formData.hospitalPhone.trim()) errs.hospitalPhone = "Phone number is required";
      if (!formData.hospitalRegNo.trim()) errs.hospitalRegNo = "Facility license/Reg No is required";
      if (!formData.hospitalAddress.trim()) errs.hospitalAddress = "Address is required";
    }
    if (!formData.agreeTerms) errs.agreeTerms = "You must agree to terms & privacy policy";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Google Onboarding Submission Handler
  const handleGoogleOnboardingSubmit = async () => {
    if (!validateGoogleOnboarding()) {
      toast.error("Please fill in all mandatory fields marked with *");
      return;
    }
    setIsLoading(true);

    const name = formData.accountType === "patient" ? formData.patientFullName 
               : formData.accountType === "doctor" ? formData.doctorFullName 
               : formData.accountType === "assistant" ? formData.assistantFullName 
               : formData.hospitalName;

    const email = (googleUser?.email || 
                  (formData.accountType === "patient" ? formData.patientEmail 
                  : formData.accountType === "doctor" ? formData.doctorEmail 
                  : formData.accountType === "assistant" ? formData.assistantEmail 
                  : formData.hospitalEmail)).toLowerCase().trim();

    const phone = formData.accountType === "patient" ? formData.patientMobile 
                : formData.accountType === "doctor" ? formData.doctorMobile 
                : formData.accountType === "assistant" ? formData.assistantMobile 
                : formData.hospitalPhone;

    const role = formData.accountType || "patient";

    try {
      const profileData: any = {
        name: name || "User",
        email: email,
        role: role,
        status: "active",
        phone: phone || null,
        image: googleUser?.picture || null,
        date_of_birth: formData.accountType === "patient" ? formData.patientDob || null : null,
        gender: formData.accountType === "patient" ? formData.patientGender || null : null,
        blood_group: formData.accountType === "patient" ? formData.patientBloodGroup || null : null,
        specialty: formData.accountType === "doctor" ? formData.doctorSpec || null : null,
        hospital_name: formData.accountType === "doctor" ? formData.doctorHospital || null 
                     : formData.accountType === "hospital" ? formData.hospitalName || null : null,
        address: formData.accountType === "hospital" ? formData.hospitalAddress || null : null,
        join_date: new Date().toISOString().split("T")[0]
      };

      const { data: newProfile, error: profileErr } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: "email" })
        .select()
        .single();

      if (profileErr) {
        console.warn("Supabase upsert warning, fallback insert:", profileErr);
      }

      const effectiveId = newProfile?.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "user-" + Date.now());

      if (role === "doctor") {
        try {
          await supabase.from("doctors").insert({
            profile_id: effectiveId,
            name: name,
            specialty: formData.doctorSpec || "General Physician",
            hospital: formData.doctorHospital || "Oxpecker Partner Hospital",
            consultation_fee: Number(formData.doctorFee) || 500,
            is_verified: true
          });
        } catch (docErr) {
          console.warn("Doctor insert warning:", docErr);
        }
      } else if (role === "hospital") {
        try {
          await supabase.from("hospitals").insert({
            profile_id: effectiveId,
            name: formData.hospitalName,
            email: email,
            phone: formData.hospitalPhone || null,
            address: formData.hospitalAddress || null,
            specialty: formData.hospitalType || "Hospital",
            is_verified: true
          });
        } catch (hospErr) {
          console.warn("Hospital insert warning:", hospErr);
        }
      }

      const registeredUser = {
        id: effectiveId,
        name: name,
        email: email,
        role: role,
        phone: phone,
        image: googleUser?.picture || null,
        date_of_birth: profileData.date_of_birth,
        gender: profileData.gender,
        blood_group: profileData.blood_group,
        address: profileData.address,
        specialty: profileData.specialty,
        hospital_name: profileData.hospital_name,
        status: "active"
      };

      toast.success("Account successfully created with Google!");
      login(registeredUser as any);
    } catch (err: any) {
      console.error("Google onboarding registration error:", err);
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setIsLoading(true);

    const name = formData.accountType === "patient" ? formData.patientFullName 
               : formData.accountType === "doctor" ? formData.doctorFullName 
               : formData.accountType === "assistant" ? formData.assistantFullName 
               : formData.hospitalName;

    const email = (formData.accountType === "patient" ? formData.patientEmail 
                : formData.accountType === "doctor" ? formData.doctorEmail 
                : formData.accountType === "assistant" ? formData.assistantEmail 
                : formData.hospitalEmail).toLowerCase().trim();

    const phone = formData.accountType === "patient" ? formData.patientMobile 
                : formData.accountType === "doctor" ? formData.doctorMobile 
                : formData.accountType === "assistant" ? formData.assistantMobile 
                : formData.hospitalPhone;

    const role = formData.accountType || "patient";

    try {
      // 1. Check if user with this email already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", email)
        .maybeSingle();

      if (existingUser) {
        toast.error("An account with this email already exists. Please log in.");
        setIsLoading(false);
        return;
      }

      // 2. Insert new profile into Supabase profiles table
      const profileInsertData: any = {
        name: name || "User",
        email: email,
        role: role,
        status: "active",
        phone: phone || null,
        password: formData.password,
        date_of_birth: formData.accountType === "patient" ? formData.patientDob || null : null,
        gender: formData.accountType === "patient" ? formData.patientGender || null : null,
        specialty: formData.accountType === "doctor" ? formData.doctorSpec || null : null,
        hospital_name: formData.accountType === "hospital" ? formData.hospitalName || null : null,
        address: formData.accountType === "hospital" ? formData.hospitalAddress || null : null,
        join_date: new Date().toISOString().split("T")[0]
      };

      let effectiveProfile: any = null;
      try {
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert(profileInsertData)
          .select()
          .single();

        if (profileError) {
          console.warn("Supabase profile registration warning (offline/mock fallback):", profileError);
        } else {
          effectiveProfile = newProfile;
        }
      } catch (insertErr) {
        console.warn("Supabase insert network error (using local provision):", insertErr);
      }

      if (!effectiveProfile) {
        effectiveProfile = {
          id: (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "user-" + Date.now()),
          ...profileInsertData,
        };
      }

      // 3. Role specific table inserts
      if (role === "doctor" && effectiveProfile?.id) {
        try {
          await supabase.from("doctors").insert({
            profile_id: effectiveProfile.id,
            name: name,
            specialty: formData.doctorSpec || "General Physician",
            hospital: "Oxpecker Partner Hospital",
            is_verified: true
          });
        } catch (docErr) {
          console.warn("Doctor table insert warning:", docErr);
        }
      } else if (role === "hospital" && effectiveProfile?.id) {
        try {
          await supabase.from("hospitals").insert({
            profile_id: effectiveProfile.id,
            name: formData.hospitalName,
            email: email,
            phone: formData.hospitalPhone || null,
            address: formData.hospitalAddress || null,
            is_verified: true
          });
        } catch (hospErr) {
          console.warn("Hospital table insert warning:", hospErr);
        }
      }

      const registeredUser = {
        id: effectiveProfile.id,
        name: effectiveProfile.name,
        email: effectiveProfile.email,
        role: effectiveProfile.role,
        phone: effectiveProfile.phone,
        image: effectiveProfile.image,
        date_of_birth: effectiveProfile.date_of_birth,
        gender: effectiveProfile.gender,
        blood_group: effectiveProfile.blood_group,
        address: effectiveProfile.address,
        specialty: effectiveProfile.specialty,
        hospital_name: effectiveProfile.hospital_name
      };

      toast.success("Account created successfully!");
      login(registeredUser as any);
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0, transition: { duration: 0.2 } }),
  };


  return (
    <main className="min-h-screen bg-white flex flex-col items-center py-10 px-4 sm:px-6 relative overflow-hidden">
      <Login3DBackground />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[700px] flex flex-col items-center relative z-10"
      >
        <Toaster position="top-center" />
        
        {/* Back to Home Button */}
        <Link href="/" className="absolute left-0 top-0 sm:top-2 p-2.5 text-slate-500 hover:text-primary bg-slate-100 hover:bg-primary/10 rounded-full transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> <span className="hidden sm:inline font-bold text-sm">Home</span>
        </Link>

        {/* Logo */}
      <Link href="/" className="mb-12">
        <Image src="/images/Oxpecker_full_size.png" alt="Oxpecker AI" width={280} height={90} className="h-10 sm:h-12 w-auto object-contain" />
      </Link>

      {/* Main Container */}
      <div className="w-full max-w-[700px]">
        {/* Step Progress Indicator */}
        {!isGoogleOnboarding ? (
          <div className="flex items-center justify-between w-full max-w-[400px] mx-auto mb-12 relative z-10 px-2">
            {/* Background Line */}
            <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
            {/* Active Line */}
            <div className="absolute top-1/2 left-6 h-1 bg-sky-600 -z-10 -translate-y-1/2 transition-all duration-500 rounded-full" style={{ width: `calc(${(step - 1) * 50}%)` }}></div>
            
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                step >= s 
                  ? "bg-sky-600 text-white shadow-[0_0_0_6px_rgba(112,222,113,0.15)]" 
                  : "bg-white text-slate-500 border-2 border-slate-200"
              }`}>
                {step > s ? <CheckCircle2 size={24} strokeWidth={3} className="text-slate-900" /> : s}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full max-w-[460px] mx-auto mb-10 relative z-10 px-4">
            {/* Background connecting line */}
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-sky-600 -z-10 -translate-y-1/2 rounded-full"></div>
            
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-600 text-white shadow-md">
                <Check size={20} strokeWidth={3} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 capitalize">{formData.accountType}</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-600 text-white shadow-md">
                <Check size={20} strokeWidth={3} />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Google Verified</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500 text-white shadow-md ring-4 ring-amber-100 animate-pulse">
                <Sparkles size={18} />
              </div>
              <span className="text-[11px] font-bold text-amber-700">Mandatory Profile</span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {/* GOOGLE ONBOARDING VIEW */}
          {isGoogleOnboarding ? (
            <motion.div
              key="google-onboarding"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={14} /> Profile Onboarding
                </div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Complete Your {ACCOUNT_TYPES.find((t) => t.value === formData.accountType)?.label} Profile
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  Google account connected! Provide required healthcare details to finish creating your account.
                </p>
              </div>

              {/* Attached Google Account Banner */}
              <div className="w-full bg-gradient-to-r from-sky-50/70 via-white to-slate-50 border border-sky-100 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  {googleUser?.picture ? (
                    <img
                      src={googleUser.picture}
                      alt={googleUser.name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200">
                      <GoogleIcon size={24} />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{googleUser?.name || "Google User"}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck size={12} /> Google Verified
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{googleUser?.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-sky-600 text-white capitalize shadow-sm">
                    {formData.accountType}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGoogleOnboarding(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline px-2 py-1"
                  >
                    Change Role
                  </button>
                </div>
              </div>

              {/* Mandatory Role Form Fields */}
              <div className="grid grid-cols-2 gap-5 mb-8">
                {formData.accountType === "patient" && (
                  <>
                    <InputField
                      error={errors["patientFullName"]}
                      id="patientFullName"
                      label="Full Name"
                      required
                      isHalf
                      value={formData.patientFullName}
                      onChange={(e: any) => updateForm("patientFullName", e.target.value)}
                    />
                    <InputField
                      id="patientEmail"
                      label="Email Address (Google Verified)"
                      type="email"
                      required
                      isHalf
                      disabled
                      value={formData.patientEmail || googleUser?.email || ""}
                      rightElement={<ShieldCheck size={18} className="text-emerald-500" />}
                    />
                    <InputField
                      error={errors["patientMobile"]}
                      id="patientMobile"
                      label="Mobile Number"
                      type="tel"
                      required
                      isHalf
                      placeholder="e.g. +880 1712-345678"
                      value={formData.patientMobile}
                      onChange={(e: any) => updateForm("patientMobile", e.target.value)}
                    />
                    <InputField
                      error={errors["patientDob"]}
                      id="patientDob"
                      label="Date of Birth"
                      type="date"
                      required
                      isHalf
                      value={formData.patientDob}
                      onChange={(e: any) => updateForm("patientDob", e.target.value)}
                    />
                    <InputField
                      error={errors["patientGender"]}
                      id="patientGender"
                      label="Gender"
                      type="select"
                      required
                      options={["Male", "Female", "Other"]}
                      isHalf
                      value={formData.patientGender}
                      onChange={(e: any) => updateForm("patientGender", e.target.value)}
                    />
                    <InputField
                      error={errors["patientBloodGroup"]}
                      id="patientBloodGroup"
                      label="Blood Group"
                      type="select"
                      required
                      options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
                      isHalf
                      value={formData.patientBloodGroup}
                      onChange={(e: any) => updateForm("patientBloodGroup", e.target.value)}
                    />
                    <div className="col-span-2 bg-sky-50/50 p-4 rounded-xl border border-sky-100 flex items-start gap-3">
                      <Droplet size={18} className="text-sky-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Medical records, prescriptions, and doctor consultations will be linked to your verified Google account: <strong className="text-slate-800">{googleUser?.email}</strong>.
                      </p>
                    </div>
                  </>
                )}

                {formData.accountType === "doctor" && (
                  <>
                    <InputField
                      error={errors["doctorFullName"]}
                      id="doctorFullName"
                      label="Full Name & Credentials"
                      required
                      isHalf
                      value={formData.doctorFullName}
                      onChange={(e: any) => updateForm("doctorFullName", e.target.value)}
                    />
                    <InputField
                      id="doctorEmail"
                      label="Doctor Email (Google Verified)"
                      type="email"
                      required
                      isHalf
                      disabled
                      value={formData.doctorEmail || googleUser?.email || ""}
                      rightElement={<ShieldCheck size={18} className="text-emerald-500" />}
                    />
                    <InputField
                      error={errors["doctorMobile"]}
                      id="doctorMobile"
                      label="Contact Mobile Number"
                      type="tel"
                      required
                      isHalf
                      placeholder="e.g. +880 1812-345678"
                      value={formData.doctorMobile}
                      onChange={(e: any) => updateForm("doctorMobile", e.target.value)}
                    />
                    <InputField
                      error={errors["doctorRegNo"]}
                      id="doctorRegNo"
                      label="BMDC Registration Number"
                      required
                      isHalf
                      placeholder="e.g. BMDC-A-54321"
                      value={formData.doctorRegNo}
                      onChange={(e: any) => updateForm("doctorRegNo", e.target.value)}
                    />
                    <InputField
                      error={errors["doctorSpec"]}
                      id="doctorSpec"
                      label="Primary Specialization"
                      type="select"
                      options={[
                        "General Physician",
                        "Cardiologist",
                        "Dermatologist",
                        "Endocrinologist",
                        "Gastroenterologist",
                        "Gynecologist",
                        "Neurologist",
                        "Orthopedist",
                        "Pediatrician",
                        "Psychiatrist",
                        "Dentist",
                        "ENT Specialist",
                        "Other",
                      ]}
                      required
                      isHalf
                      value={formData.doctorSpec}
                      onChange={(e: any) => updateForm("doctorSpec", e.target.value)}
                    />
                    <InputField
                      error={errors["doctorHospital"]}
                      id="doctorHospital"
                      label="Hospital / Chamber Name"
                      required
                      isHalf
                      placeholder="e.g. Popular Diagnostic Center"
                      value={formData.doctorHospital}
                      onChange={(e: any) => updateForm("doctorHospital", e.target.value)}
                    />
                    <InputField
                      error={errors["doctorFee"]}
                      id="doctorFee"
                      label="Consultation Fee (৳ BDT)"
                      type="number"
                      isHalf
                      placeholder="e.g. 800"
                      value={formData.doctorFee}
                      onChange={(e: any) => updateForm("doctorFee", e.target.value)}
                    />
                    <div className="col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <Stethoscope size={18} className="text-sky-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        BMDC registration number is required for doctor identity verification. Your digital prescription signature will be tied to this ID.
                      </p>
                    </div>
                  </>
                )}

                {formData.accountType === "assistant" && (
                  <>
                    <InputField
                      error={errors["assistantFullName"]}
                      id="assistantFullName"
                      label="Full Name"
                      required
                      isHalf
                      value={formData.assistantFullName}
                      onChange={(e: any) => updateForm("assistantFullName", e.target.value)}
                    />
                    <InputField
                      id="assistantEmail"
                      label="Email (Google Verified)"
                      type="email"
                      required
                      isHalf
                      disabled
                      value={formData.assistantEmail || googleUser?.email || ""}
                      rightElement={<ShieldCheck size={18} className="text-emerald-500" />}
                    />
                    <InputField
                      error={errors["assistantMobile"]}
                      id="assistantMobile"
                      label="Mobile Number"
                      type="tel"
                      required
                      isHalf
                      placeholder="e.g. +880 1912-345678"
                      value={formData.assistantMobile}
                      onChange={(e: any) => updateForm("assistantMobile", e.target.value)}
                    />
                    <InputField
                      error={errors["assistantInviteCode"]}
                      id="assistantInviteCode"
                      label="Assigned Doctor ID / Clinic Code"
                      required
                      isHalf
                      placeholder="e.g. DOC-9821 or Chamber Name"
                      value={formData.assistantInviteCode}
                      onChange={(e: any) => updateForm("assistantInviteCode", e.target.value)}
                    />
                    <div className="col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Doctor Assistants can manage patient appointments, serial queues, and vitals recording for their assigned clinic or doctor.
                      </p>
                    </div>
                  </>
                )}

                {formData.accountType === "hospital" && (
                  <>
                    <InputField
                      error={errors["hospitalName"]}
                      id="hospitalName"
                      label="Hospital / Organization Name"
                      required
                      isHalf
                      placeholder="e.g. Evercare Hospital Dhaka"
                      value={formData.hospitalName}
                      onChange={(e: any) => updateForm("hospitalName", e.target.value)}
                    />
                    <InputField
                      id="hospitalEmail"
                      label="Official Email (Google Verified)"
                      type="email"
                      required
                      isHalf
                      disabled
                      value={formData.hospitalEmail || googleUser?.email || ""}
                      rightElement={<ShieldCheck size={18} className="text-emerald-500" />}
                    />
                    <InputField
                      error={errors["hospitalPhone"]}
                      id="hospitalPhone"
                      label="Emergency Hotline / Contact Phone"
                      type="tel"
                      required
                      isHalf
                      placeholder="e.g. 10678 or +880 2-8836000"
                      value={formData.hospitalPhone}
                      onChange={(e: any) => updateForm("hospitalPhone", e.target.value)}
                    />
                    <InputField
                      error={errors["hospitalRegNo"]}
                      id="hospitalRegNo"
                      label="DGHS License / Registration No"
                      required
                      isHalf
                      placeholder="e.g. DGHS-REG-2024-991"
                      value={formData.hospitalRegNo}
                      onChange={(e: any) => updateForm("hospitalRegNo", e.target.value)}
                    />
                    <InputField
                      id="hospitalType"
                      label="Hospital Category"
                      type="select"
                      options={[
                        "General Hospital",
                        "Specialized Hospital",
                        "Diagnostic & Consultation Center",
                        "Private Clinic",
                        "Medical College & Hospital",
                      ]}
                      value={formData.hospitalType}
                      onChange={(e: any) => updateForm("hospitalType", e.target.value)}
                    />
                    <InputField
                      error={errors["hospitalAddress"]}
                      id="hospitalAddress"
                      label="Complete Physical Address"
                      required
                      placeholder="Plot #, Road #, Sector, City"
                      value={formData.hospitalAddress}
                      onChange={(e: any) => updateForm("hospitalAddress", e.target.value)}
                    />
                  </>
                )}
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-3 cursor-pointer mb-8 group">
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => updateForm("agreeTerms", e.target.checked)}
                    className="peer sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 transition-all ${
                      formData.agreeTerms
                        ? "bg-sky-600 border-sky-600"
                        : "border-slate-300 bg-slate-50 group-hover:border-sky-500"
                    }`}
                  />
                  <CheckCircle2
                    size={14}
                    className={`absolute text-white transition-opacity ${
                      formData.agreeTerms ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-700 font-semibold">
                    I agree to Oxpecker AI <Link href="/terms" className="text-sky-600 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-sky-600 font-bold hover:underline">Privacy Policy</Link>.
                  </span>
                  {errors["agreeTerms"] && (
                    <span className="text-xs text-red-500 font-medium mt-0.5">{errors["agreeTerms"]}</span>
                  )}
                </div>
              </label>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsGoogleOnboarding(false)}
                  disabled={isLoading}
                  className="w-1/3 h-[54px] bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-xl transition-all active:scale-[0.98]"
                >
                  Change Role
                </button>
                <button
                  type="button"
                  onClick={handleGoogleOnboardingSubmit}
                  disabled={isLoading}
                  className="w-2/3 h-[54px] bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Complete Registration & Launch</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : step === 1 ? (
            <motion.div key="step1" custom={direction} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
              <h1 className="text-2xl font-bold text-slate-800 mb-8 uppercase tracking-wide flex items-center gap-2">
                <HelpCircle className="text-sky-600" size={28} /> Who Are You?
              </h1>
              
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 justify-items-center mb-8 max-w-[680px]">
                {ACCOUNT_TYPES.map((type) => {
                  const isSelected = formData.accountType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateForm("accountType", type.value)}
                      className={`relative flex flex-col items-center justify-center gap-3 rounded-[20px] border-2 transition-all p-4 cursor-pointer overflow-hidden
                        w-full max-w-[320px] h-[180px]
                        ${pulseCards ? "ring-4 ring-amber-400/80 border-amber-400 scale-[1.03] shadow-[0_0_25px_rgba(251,191,36,0.45)]" : ""}
                        ${isSelected ? "border-sky-600 bg-sky-600/5 shadow-[0_8px_30px_rgba(112,222,113,0.2)]" : "border-slate-200 bg-white hover:border-sky-600/50 shadow-sm hover:shadow-md"}
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-sky-600">
                          <CheckCircle2 size={24} className="fill-[#70DE71]/20" />
                        </div>
                      )}
                      <div className={`p-4 rounded-full ${isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500 transition-colors group-hover:bg-sky-600/10"}`}>
                        <type.icon size={40} />
                      </div>
                      <span className={`font-bold text-[22px] ${isSelected ? "text-slate-800" : "text-slate-600"}`}>{type.label}</span>
                      <span className={`text-[15px] font-medium text-center px-4 ${isSelected ? "text-slate-600" : "text-slate-500"}`}>{type.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Regular Email Registration Continue Button */}
              <button
                type="button"
                onClick={goNext}
                disabled={!formData.accountType}
                className="w-full h-[52px] bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Continue with Email & Password
              </button>

              {/* Divider */}
              <div className="w-full flex items-center my-6 gap-4">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Or Sign Up With Google</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Continue with Google System */}
              <div className="w-full flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleLoading}
                  className={`w-full h-[54px] rounded-xl font-bold flex items-center justify-center gap-3 transition-all relative overflow-hidden active:scale-[0.99] ${
                    formData.accountType
                      ? "bg-white text-slate-800 border-2 border-slate-300 hover:border-sky-500 hover:bg-slate-50 shadow-sm hover:shadow-md cursor-pointer"
                      : "bg-slate-50 text-slate-400 border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer"
                  }`}
                  title={!formData.accountType ? "Please select an account type above first" : "Sign up with Google"}
                >
                  {isGoogleLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" />
                      <span className="text-slate-600">Connecting Google...</span>
                    </>
                  ) : (
                    <>
                      <div className={!formData.accountType ? "opacity-60 grayscale-[40%]" : ""}>
                        <GoogleIcon size={22} />
                      </div>
                      <span className={formData.accountType ? "text-slate-800 font-bold" : "text-slate-500 font-semibold"}>
                        {formData.accountType
                          ? `Continue with Google as ${ACCOUNT_TYPES.find((t) => t.value === formData.accountType)?.label}`
                          : "Continue with Google"}
                      </span>
                      {formData.accountType ? (
                        <span className="ml-auto mr-3 hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="ml-auto mr-3 hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-500">
                          Select Role First
                        </span>
                      )}
                    </>
                  )}
                </button>

                {/* Helper / Clarity Message when inactive */}
                {!formData.accountType && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50/90 border border-amber-200/70 rounded-lg px-3.5 py-2 mt-3 w-full"
                  >
                    <AlertCircle size={15} className="shrink-0 text-amber-600" />
                    <span>
                      Select an account type above (<strong className="font-semibold">Patient, Doctor, Assistant, Hospital</strong>) to activate Google Sign-Up.
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div key="step2" custom={direction} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <div className="flex items-center mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 uppercase tracking-wide w-full text-center flex items-center justify-center gap-2 whitespace-nowrap">
                  <HelpCircle className="text-sky-600" size={28} /> Personal Information
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
                  type="button"
                  onClick={goBack}
                  className="w-1/3 h-[52px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="w-2/3 h-[52px] bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="step3" custom={direction} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <div className="flex items-center mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-wide w-full text-center flex items-center justify-center gap-2 whitespace-nowrap">
                  <HelpCircle className="text-sky-600" size={28} /> Secure Password
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
                  rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-slate-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
                />
                <InputField error={errors["confirmPassword"]} id="confirmPassword" 
                  label="Confirm Password" 
                  type={showConfirm ? "text" : "password"} 
                  required 
                  isHalf 
                  value={formData.confirmPassword} 
                  onChange={(e: any) => updateForm("confirmPassword", e.target.value)} 
                  rightElement={<button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-500 hover:text-slate-600">{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-8 group">
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  <input type="checkbox" checked={formData.agreeTerms} onChange={(e) => updateForm("agreeTerms", e.target.checked)} className="peer sr-only" />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all ${formData.agreeTerms ? "bg-sky-600 border-sky-600" : "border-slate-300 bg-slate-50 group-hover:border-sky-500"}`} />
                  <CheckCircle2 size={14} className={`absolute text-white transition-opacity ${formData.agreeTerms ? "opacity-100" : "opacity-0"}`} />
                </div>
                <span className="text-sm text-slate-600 font-semibold">
                  I agree to the <Link href="/terms" className="text-sky-600 font-bold hover:text-sky-700 hover:underline">Terms</Link> & <Link href="/privacy" className="text-sky-600 font-bold hover:text-sky-700 hover:underline">Privacy Policy</Link>.
                </span>
              </label>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isLoading}
                  className="w-1/3 h-[54px] bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-[12px] transition-all active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-2/3 h-[54px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold rounded-[12px] transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center"
                >
                  {isLoading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Account"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-slate-500 mt-12 font-semibold">
          Already have an account? <Link href="/login" className="text-sky-600 font-bold hover:text-sky-700 hover:underline">Log in</Link>
        </p>
      </div>
      </motion.div>
    </main>
  );
}
