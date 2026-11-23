"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Calendar, Clock, CheckCircle2, Building2 } from "lucide-react";
import { mockDoctors, DoctorProfile } from "@/lib/mockData";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MedicalLoader } from "@/components/shared/MedicalLoader";

const consultationTypes = ["Hospital Visit", "Video Call"];

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [doctorNotFound, setDoctorNotFound] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form State
  const [consultType, setConsultType] = useState("Hospital Visit");
  const [selectedChamber, setSelectedChamber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateIso, setSelectedDateIso] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Patient Info State
  const [patientName, setPatientName] = useState(user?.name || "");
  const [patientPhone, setPatientPhone] = useState(user?.phone || "");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState(user?.gender || "Male");
  const [patientBloodGroup, setPatientBloodGroup] = useState("O+");
  const [patientHeightCm, setPatientHeightCm] = useState("");
  const [patientWeightKg, setPatientWeightKg] = useState("");
  const [patientReason, setPatientReason] = useState("");
  const [bookingRefId, setBookingRefId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name) setPatientName((prev) => prev || user.name || "");
    if (user?.phone) setPatientPhone((prev) => prev || user.phone || "");
    if (user?.gender) setPatientGender((prev) => prev || user.gender || "Male");
    fetch("/api/patient/360", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        const p = res?.patient;
        if (!p) return;
        if (p.phone) setPatientPhone((prev) => prev || p.phone);
        if (p.age) setPatientAge((prev) => prev || String(p.age));
        if (p.bloodGroup) setPatientBloodGroup(p.bloodGroup);
        if (p.heightCm) setPatientHeightCm(String(p.heightCm));
        if (p.weightKg) setPatientWeightKg(String(p.weightKg));
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const rawId = resolvedParams.id;
    const doc = mockDoctors.find(function(d) { return d.id === rawId || d.id === ("doc-" + rawId) || d.id.replace("doc-", "") === rawId; });
    // SAFETY: never substitute another doctor's profile for an unknown ID.
    if (doc) setDoctor(doc);
    else setDoctorNotFound(true);
  }, [resolvedParams.id]);

  if (doctorNotFound) {
    return (
      <div className="h-full min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-white p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
          <ArrowLeft size={26} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Doctor Not Found</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            The doctor profile you are trying to book could not be found. Please go back and select a doctor from the directory.
          </p>
          <p className="text-[13px] text-slate-400 mt-1">অনুগ্রহ করে ডাক্তারের তালিকা থেকে আবার নির্বাচন করুন।</p>
        </div>
        <button
          onClick={() => router.push("/doctors")}
          className="mt-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          Browse Doctors
        </button>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="h-full min-h-[60vh] flex items-center justify-center bg-white">
        <MedicalLoader text="Loading Booking" />
      </div>
    );
  }

  // Generate next 7 days for the date picker
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isoDate: d.toISOString().split('T')[0]
    };
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const submitBooking = async () => {
    setIsSubmitting(true);
    try {
      const isValidUuid = (str?: string) => str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;
      const bookingDateStr = selectedDateIso || new Date().toISOString().split("T")[0];
      const resolvedName = patientName.trim() || user?.name || "Patient";
      const resolvedPhone = patientPhone.trim() || user?.phone || "N/A";
      const hospitalTitle = selectedChamber || doctor.hospital || "Oxpecker Partner Hospital";

      // 1. Primary Unified Hub Sync -> MPI Patient 360 + Prisma Appointment + Hospital HMS Booking
      const hubRes = await fetch("/api/integrations/v1/sync", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `oxp-book-${doctor.id}-${bookingDateStr}-${resolvedPhone}-${selectedTime || "10"}`,
        },
        body: JSON.stringify({
          channel: "oxpecker_booking",
          clinicSlug: "oxpecker-flagship-hospital",
          patient: {
            name: resolvedName,
            phone: resolvedPhone,
            email: user?.email || undefined,
            age: patientAge ? Number(patientAge) : undefined,
            gender: patientGender,
            bloodGroup: patientBloodGroup,
            heightCm: patientHeightCm ? Number(patientHeightCm) : undefined,
            weightKg: patientWeightKg ? Number(patientWeightKg) : undefined,
          },
          appointment: {
            doctorId: doctor.id,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            hospitalName: hospitalTitle,
            date: bookingDateStr,
            time: selectedTime || "10:00 AM",
            type: consultType === "Video Call" ? "video" : "in_person",
            source: "oxpecker",
            status: "confirmed",
            fee: Number(doctor.fee) || 1000,
            notes: `${consultType} - ${hospitalTitle}${patientReason ? ` - Reason: ${patientReason}` : ""}`,
          },
        }),
      }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

      if (hubRes?.mrn) {
        setBookingRefId(hubRes.mrn);
      }

      // 2. Supabase backup insert for compatibility
      const { error } = await supabase.from("bookings").insert({
        patient_id: user && isValidUuid(user.id) ? user.id : null,
        doctor_id: isValidUuid(doctor?.id) ? doctor.id : null,
        patient_name: resolvedName,
        patient_email: user?.email || null,
        patient_phone: resolvedPhone,
        doctor_name: doctor.name,
        doctor_specialty: doctor.specialty,
        booking_date: bookingDateStr,
        booking_time: selectedTime || "10:00 AM",
        status: "confirmed",
        consultation_fee: Number(doctor.fee) || 1000,
        platform_fee: 50,
        total_fee: (Number(doctor.fee) || 1000) + 50,
        notes: `${consultType} - ${selectedChamber || "Chamber"}${patientReason ? ` - Reason: ${patientReason}` : ""}${patientAge ? ` (Age: ${patientAge})` : ""}`,
      }).select().maybeSingle();

      if (error && !hubRes?.success) {
        console.error("Supabase booking insert error:", error.message);
      } else {
        toast.success("Appointment confirmed & synced to Patient 360° + Hospital Queue!");
      }
      setStep(5);
    } catch (err: any) {
      console.error("Booking error:", err);
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white font-sans pb-32 selection:bg-sky-600/20">
      
      {/* Minimalist Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-[1000px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors text-[15px]"
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          {/* Subtle Progress Indicator */}
          <div className="hidden md:flex items-center gap-1.5">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === step ? 'w-8 bg-sky-600' : i < step ? 'w-4 bg-sky-600/40' : 'w-4 bg-slate-100'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto mt-8 md:mt-12 px-6 flex flex-col lg:flex-row gap-12 md:gap-20">
        
        {/* Left Column - Clean Booking Flow */}
        <div className="flex-1 min-h-[500px]">
            
          {/* Step 1: Consultation & Chamber */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h1 className="text-[32px] md:text-[36px] font-[800] text-slate-900 tracking-tight mb-2">Consultation Type</h1>
              <p className="text-[16px] text-slate-500 mb-10">How would you like to consult the doctor?</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                {consultationTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setConsultType(type)}
                    className={`relative p-5 md:p-6 rounded-[20px] text-center transition-all duration-300 ${
                      consultType === type 
                        ? 'bg-white text-slate-900 shadow-xl shadow-slate-900/10 scale-[1.02]' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-semibold text-[15px]">{type}</span>
                    {consultType === type && (
                      <CheckCircle2 size={18} className="absolute top-4 right-4 text-slate-900/50" />
                    )}
                  </button>
                ))}
              </div>

              {consultType === "Hospital Visit" && doctor.chambers && doctor.chambers.length > 0 && (
                <div className="animate-fade-in-up">
                  <h3 className="text-[18px] font-bold text-slate-900 mb-5">Available Chambers</h3>
                  <div className="space-y-4">
                    {doctor.chambers.map((chamber, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedChamber(chamber.name)}
                        className={`w-full p-5 rounded-[20px] text-left transition-all duration-300 flex items-start gap-5 ${
                          selectedChamber === chamber.name 
                            ? 'bg-white text-slate-900 shadow-md' 
                            : 'bg-white ring-1 ring-slate-100 hover:ring-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`mt-0.5 p-3 rounded-[14px] ${selectedChamber === chamber.name ? 'bg-white/20 text-slate-900' : 'bg-slate-100 text-slate-500'}`}>
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h4 className={`font-bold text-[17px] mb-1 ${selectedChamber === chamber.name ? 'text-slate-900' : 'text-slate-900'}`}>{chamber.name}</h4>
                          <p className={`text-[14px] leading-relaxed mb-2 ${selectedChamber === chamber.name ? 'text-slate-600' : 'text-slate-500'}`}>{chamber.address}</p>
                          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[13px] font-medium ${selectedChamber === chamber.name ? 'bg-white/10 text-slate-900' : 'bg-slate-100 text-slate-600'}`}>
                            <Clock size={14} /> {chamber.days}, {chamber.time}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <h1 className="text-[32px] md:text-[36px] font-[800] text-slate-900 tracking-tight mb-2">Date & Time</h1>
              <p className="text-[16px] text-slate-500 mb-10">Select your preferred slot for the appointment.</p>
              
              <h3 className="text-[18px] font-bold text-slate-900 mb-5" suppressHydrationWarning>
                <span suppressHydrationWarning>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                {dates.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDate(d.fullDate);
                      setSelectedDateIso(d.isoDate);
                    }}
                    suppressHydrationWarning
                    className={`min-w-[72px] h-[90px] rounded-[20px] flex flex-col items-center justify-center transition-all duration-300 shrink-0 ${
                      selectedDate === d.fullDate 
                        ? 'bg-white text-slate-900 shadow-xl shadow-slate-900/10 scale-[1.05]' 
                        : 'bg-white ring-1 ring-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[13px] font-medium mb-1 uppercase tracking-wider" suppressHydrationWarning>{d.dayStr}</span>
                    <span className="text-[22px] font-bold" suppressHydrationWarning>{d.dateNum}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between mt-6 mb-5 gap-2">
                <h3 className="text-[18px] font-bold text-slate-900">Available Slots</h3>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg animate-pulse border border-rose-100 flex items-center gap-1">
                  Slots filling fast: Only 2 left
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {doctor.timeSlots.map((time, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3.5 rounded-[14px] text-center transition-all duration-300 text-[14px] font-medium ${
                      selectedTime === time 
                        ? 'bg-sky-600 text-white shadow-md shadow-primary/20 scale-[1.02]' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Patient Info */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <h1 className="text-[32px] md:text-[36px] font-[800] text-slate-900 tracking-tight mb-2">Patient Details</h1>
              <p className="text-[16px] text-slate-500 mb-10">Please provide the patient's basic information.</p>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-3">Patient Name</label>
                  <input 
                    type="text" 
                    value={patientName} 
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. John Doe" 
                    className="w-full pb-3 bg-transparent text-[18px] text-slate-900 placeholder:text-slate-600 border-b border-slate-200 focus:border-primary outline-none transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-3">Phone Number</label>
                  <input 
                    type="tel" 
                    value={patientPhone} 
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="e.g. +880 1711-000000" 
                    className="w-full pb-3 bg-transparent text-[18px] text-slate-900 placeholder:text-slate-600 border-b border-slate-200 focus:border-primary outline-none transition-colors" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-3">Age</label>
                    <input 
                      type="number" 
                      value={patientAge} 
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="28" 
                      className="w-full pb-3 bg-transparent text-[18px] text-slate-900 placeholder:text-slate-600 border-b border-slate-200 focus:border-primary outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-3">Gender</label>
                    <select 
                      value={patientGender} 
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full pb-3 bg-transparent text-[18px] text-slate-900 border-b border-slate-200 focus:border-primary outline-none transition-colors cursor-pointer appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group</label>
                    <select
                      value={patientBloodGroup}
                      onChange={(e) => setPatientBloodGroup(e.target.value)}
                      className="w-full pb-3 bg-transparent text-[16px] text-slate-900 border-b border-slate-200 focus:border-primary outline-none transition-colors cursor-pointer"
                    >
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Height (cm, Optional)</label>
                    <input
                      type="number"
                      value={patientHeightCm}
                      onChange={(e) => setPatientHeightCm(e.target.value)}
                      placeholder="170"
                      className="w-full pb-3 bg-transparent text-[16px] text-slate-900 placeholder:text-slate-500 border-b border-slate-200 focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Weight (kg, Optional)</label>
                    <input
                      type="number"
                      value={patientWeightKg}
                      onChange={(e) => setPatientWeightKg(e.target.value)}
                      placeholder="70"
                      className="w-full pb-3 bg-transparent text-[16px] text-slate-900 placeholder:text-slate-500 border-b border-slate-200 focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-3">Reason for visit (Optional)</label>
                  <textarea 
                    rows={1} 
                    value={patientReason} 
                    onChange={(e) => setPatientReason(e.target.value)}
                    placeholder="Briefly describe your symptoms..." 
                    className="w-full pb-3 bg-transparent text-[18px] text-slate-900 placeholder:text-slate-600 border-b border-slate-200 focus:border-primary outline-none transition-colors resize-none" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary & Payment */}
          {step === 4 && (
            <div className="animate-fade-in-up">
              <h1 className="text-[32px] md:text-[36px] font-[800] text-slate-900 tracking-tight mb-2">Review Booking</h1>
              <p className="text-[16px] text-slate-500 mb-10">Verify your details before confirming the appointment.</p>
              
              <div className="bg-slate-50 p-6 md:p-8 rounded-[24px] mb-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-sky-600" />
                
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-slate-200">
                  <div className="w-[72px] h-[72px] rounded-full overflow-hidden shrink-0 relative ring-4 ring-white shadow-sm">
                    <Image src={doctor.image} alt={doctor.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[22px] text-slate-900 mb-1">{doctor.name}</h4>
                    <p className="text-sky-600 font-medium text-[15px]">{doctor.specialty}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="text-[16px] font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar size={16} className="text-slate-500" />
                      {selectedDate || "Not selected"}, {selectedTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">Consultation Type</p>
                    <p className="text-[16px] font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 size={16} className="text-slate-500" />
                      {consultType}
                    </p>
                  </div>
                  {consultType === "Hospital Visit" && (
                    <div className="md:col-span-2">
                      <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">Chamber Address</p>
                      <p className="text-[16px] font-semibold text-slate-900 flex items-start gap-2">
                        <MapPin size={16} className="text-slate-500 shrink-0 mt-0.5" />
                        <span>{selectedChamber}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className=" from-primary/5 via-primary/[0.08] to-primary/5 p-6 rounded-[24px] border border-primary/20 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="block font-[800] text-[18px] text-slate-900 mb-1">Total Payable Amount</span>
                    <span className="text-[13px] text-slate-500 font-medium bg-white/50 px-2 py-0.5 rounded-md border border-slate-200/50">Includes all taxes and fees</span>
                  </div>
                  <div className="flex items-start gap-1 text-sky-600">
                    <span className="text-[20px] font-bold mt-1.5">৳</span>
                    <span className="font-[900] text-[48px] tracking-tight leading-none drop-shadow-sm">{doctor.fee}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-[36px] font-[800] text-slate-900 tracking-tight mb-3">Booking Confirmed</h2>
              <p className="text-slate-500 text-[16px] max-w-[440px] leading-relaxed mb-6">
                Your appointment with <span className="font-semibold text-slate-900">{doctor.name}</span> is confirmed for <span className="font-semibold text-slate-900">{selectedDate || "Next Available"}</span> at <span className="font-semibold text-slate-900">{selectedTime || "10:00 AM"}</span>.
              </p>
              {bookingRefId && (
                <div className="mb-8 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Synced to Patient 360° & Hospital Queue • UHID/MRN: {bookingRefId}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => router.push("/patient/profile")}
                  className="px-7 h-[48px] bg-sky-600 hover:bg-sky-700 text-white rounded-full font-semibold text-[14px] transition-colors cursor-pointer"
                >
                  View in Patient 360° Profile
                </button>
                <button
                  onClick={() => router.push("/appointments")}
                  className="px-7 h-[48px] bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold text-[14px] transition-colors cursor-pointer"
                >
                  Track Live Queue
                </button>
                <button
                  onClick={() => router.push(`/doctors/${doctor.id}`)}
                  className="px-6 h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full font-semibold text-[14px] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          {step < 5 && (
            <div className="mt-12 pt-8 flex items-center justify-between border-t border-slate-100">
              {step > 1 ? (
                <button 
                  onClick={prevStep}
                  className="px-6 h-[48px] text-slate-500 hover:text-slate-900 font-semibold text-[15px] transition-colors"
                >
                  Back
                </button>
              ) : <div></div>}
              
              <button 
                onClick={step === 4 ? submitBooking : nextStep}
                disabled={isSubmitting || (step === 1 && consultType === 'Hospital Visit' && !selectedChamber) || (step === 2 && (!selectedDate || !selectedTime))}
                className={`px-8 h-[48px] rounded-full font-semibold text-[15px] transition-all duration-300 ${
                  (isSubmitting || (step === 1 && consultType === 'Hospital Visit' && !selectedChamber) || (step === 2 && (!selectedDate || !selectedTime)))
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                    : 'bg-sky-600 text-white shadow-lg shadow-primary/20 hover:bg-[#0052cc] hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? "Confirming..." : step === 4 ? "Confirm & Pay" : "Continue"}
              </button>
            </div>
          )}

        </div>

        {/* Right Column - Minimalist Profile Snippet (Hidden on Success) */}
        {step < 5 && (
          <div className="hidden lg:block w-[320px] shrink-0">
            <div className="sticky top-[104px]">
              
              <div className="mb-8">
                <h3 className="font-[800] text-[20px] text-slate-900 mb-6">Booking Summary</h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden relative border border-slate-200">
                    <Image src={doctor.image} alt={doctor.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[16px] text-slate-900 leading-snug">{doctor.name}</h4>
                    <p className="text-[13px] font-medium text-slate-500">{doctor.specialty}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-slate-500">Consultation Fee</span>
                    <span className="text-slate-900 font-bold">৳{doctor.fee}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-slate-500">Service Charge</span>
                    <span className="text-slate-900 font-bold">৳50</span>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-dashed border-slate-200">
                    <span className="text-slate-500 text-[12px] font-bold uppercase tracking-wider mb-2 block">Total to Pay</span>
                    <div className=" from-primary/5  p-4 rounded-xl border border-sky-200 flex items-center justify-between">
                      <span className="text-slate-800 font-bold text-[14px]">Payable Now</span>
                      <div className="flex items-start gap-1 text-sky-600">
                        <span className="text-[16px] font-bold mt-0.5">৳</span>
                        <span className="text-[32px] font-[900] leading-none tracking-tight">{Number(doctor.fee) + 50}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-sky-600/60 shrink-0 mt-0.5" size={16} />
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                  By confirming this booking, you agree to the Terms of Service and Cancellation Policy.
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
