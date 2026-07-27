"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Calendar, Clock, CheckCircle2, Building2 } from "lucide-react";
import { mockDoctors, DoctorProfile } from "@/lib/mockData";

const consultationTypes = ["Hospital Visit", "Video Call"];

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [step, setStep] = useState(1);
  
  // Form State
  const [consultType, setConsultType] = useState("Hospital Visit");
  const [selectedChamber, setSelectedChamber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const doc = mockDoctors.find(d => d.id === resolvedParams.id);
    if (doc) setDoctor(doc);
  }, [resolvedParams.id]);

  if (!doctor) {
    return <div className="h-full flex items-center justify-center bg-white">Loading booking engine...</div>;
  }

  // Generate next 7 days for the date picker
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  const submitBooking = () => setStep(5);

  return (
    <div className="h-full overflow-y-auto bg-white font-sans pb-32 selection:bg-primary/20">
      
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
                  i === step ? 'w-8 bg-primary' : i < step ? 'w-4 bg-primary/40' : 'w-4 bg-slate-100'
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
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-semibold text-[15px]">{type}</span>
                    {consultType === type && (
                      <CheckCircle2 size={18} className="absolute top-4 right-4 text-white/50" />
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
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'bg-white ring-1 ring-slate-100 hover:ring-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`mt-0.5 p-3 rounded-[14px] ${selectedChamber === chamber.name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h4 className={`font-bold text-[17px] mb-1 ${selectedChamber === chamber.name ? 'text-white' : 'text-slate-900'}`}>{chamber.name}</h4>
                          <p className={`text-[14px] leading-relaxed mb-2 ${selectedChamber === chamber.name ? 'text-slate-300' : 'text-slate-500'}`}>{chamber.address}</p>
                          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[13px] font-medium ${selectedChamber === chamber.name ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>
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
              
              <h3 className="text-[18px] font-bold text-slate-900 mb-5">October 2026</h3>
              <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                {dates.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(d.fullDate)}
                    className={`min-w-[72px] h-[90px] rounded-[20px] flex flex-col items-center justify-center transition-all duration-300 shrink-0 ${
                      selectedDate === d.fullDate 
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.05]' 
                        : 'bg-white ring-1 ring-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[13px] font-medium mb-1 uppercase tracking-wider">{d.dayStr}</span>
                    <span className="text-[22px] font-bold">{d.dateNum}</span>
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
                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' 
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
                  <input type="text" placeholder="e.g. John Doe" className="w-full pb-3 bg-transparent text-[18px] text-slate-900 placeholder:text-slate-300 border-b border-slate-200 focus:border-primary outline-none transition-colors" />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-3">Age</label>
                    <input type="number" placeholder="28" className="w-full pb-3 bg-transparent text-[18px] text-slate-900 placeholder:text-slate-300 border-b border-slate-200 focus:border-primary outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-3">Gender</label>
                    <select className="w-full pb-3 bg-transparent text-[18px] text-slate-900 border-b border-slate-200 focus:border-primary outline-none transition-colors cursor-pointer appearance-none">
                      <option value="" disabled selected className="text-slate-300">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-3">Reason for visit (Optional)</label>
                  <textarea rows={1} placeholder="Briefly describe your symptoms..." className="w-full pb-3 bg-transparent text-[18px] text-slate-900 placeholder:text-slate-300 border-b border-slate-200 focus:border-primary outline-none transition-colors resize-none" />
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
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-slate-200">
                  <div className="w-[72px] h-[72px] rounded-full overflow-hidden shrink-0 relative ring-4 ring-white shadow-sm">
                    <Image src={doctor.image} alt={doctor.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[22px] text-slate-900 mb-1">{doctor.name}</h4>
                    <p className="text-primary font-medium text-[15px]">{doctor.specialty}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="text-[16px] font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      {selectedDate || "Not selected"}, {selectedTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Consultation Type</p>
                    <p className="text-[16px] font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 size={16} className="text-slate-400" />
                      {consultType}
                    </p>
                  </div>
                  {consultType === "Hospital Visit" && (
                    <div className="md:col-span-2">
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chamber Address</p>
                      <p className="text-[16px] font-semibold text-slate-900 flex items-start gap-2">
                        <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <span>{selectedChamber}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/5 via-primary/[0.08] to-primary/5 p-6 rounded-[24px] border border-primary/20 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="block font-[800] text-[18px] text-slate-900 mb-1">Total Payable Amount</span>
                    <span className="text-[13px] text-slate-500 font-medium bg-white/50 px-2 py-0.5 rounded-md border border-slate-200/50">Includes all taxes and fees</span>
                  </div>
                  <div className="flex items-start gap-1 text-primary">
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
              <p className="text-slate-500 text-[16px] max-w-[400px] leading-relaxed mb-10">
                Your appointment with <span className="font-semibold text-slate-900">{doctor.name}</span> is confirmed for <span className="font-semibold text-slate-900">{selectedDate}</span> at <span className="font-semibold text-slate-900">{selectedTime}</span>.
              </p>
              <button 
                onClick={() => router.push(`/doctors/${doctor.id}`)}
                className="px-8 h-[52px] bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold text-[15px] transition-colors"
              >
                Done
              </button>
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
                disabled={(step === 1 && consultType === 'Hospital Visit' && !selectedChamber) || (step === 2 && (!selectedDate || !selectedTime))}
                className={`px-8 h-[48px] rounded-full font-semibold text-[15px] transition-all duration-300 ${
                  ((step === 1 && consultType === 'Hospital Visit' && !selectedChamber) || (step === 2 && (!selectedDate || !selectedTime)))
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-[#0052cc] hover:-translate-y-0.5'
                }`}
              >
                {step === 4 ? "Confirm & Pay" : "Continue"}
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
                    <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-xl border border-primary/10 flex items-center justify-between">
                      <span className="text-slate-800 font-bold text-[14px]">Payable Now</span>
                      <div className="flex items-start gap-1 text-primary">
                        <span className="text-[16px] font-bold mt-0.5">৳</span>
                        <span className="text-[32px] font-[900] leading-none tracking-tight">{doctor.fee + 50}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-primary/60 shrink-0 mt-0.5" size={16} />
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
