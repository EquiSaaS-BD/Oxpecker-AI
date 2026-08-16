"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Star, BedDouble, Wind, Tv, ShieldCheck, CreditCard, 
  CheckCircle2, Share2, Heart, AlertCircle, CalendarDays, User, MapPin, 
  Phone, Users
} from "lucide-react";

// Mock data
const bed = {
  id: "bed_vip_01",
  type: "VIP Cabin Premium",
  hospital: "Labaid Specialized Hospital",
  price: 5000, // per night
  advanceRequired: 1000,
  available: 4,
  floor: "4th Floor",
  roomNo: "401",
  rating: 4.9,
  reviews: 128,
  description: "Experience the ultimate comfort and privacy in our VIP Premium Cabin. Designed for patients who require a tranquil environment, this spacious cabin comes equipped with modern medical amenities, a dedicated attendant bed, and a private entertainment system.",
  features: [
    { icon: BedDouble, name: "Motorized Patient Bed" },
    { icon: Wind, name: "Central AC with Temp Control" },
    { icon: Tv, name: "43 inch Smart TV" },
    { icon: ShieldCheck, name: "24/7 Premium Nursing" },
  ],
  rules: [
    "Maximum 1 attendant allowed overnight",
    "Visiting hours: 4:00 PM - 7:00 PM",
    "No outside food without doctor's permission"
  ],
  images: [
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop"
  ]
};

export default function BedBookingPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    patientName: "",
    gender: "",
    age: "",
    guardianName: "",
    address: "",
    phone: ""
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Basic calculation for UI purposes (mocked 1 night if dates are empty)
  const isFormValid = Object.values(formData).every(val => val.trim() !== "") && paymentMethod !== null;

  if (isSuccess) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F8FAFC] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] shadow-xl p-10 max-w-[500px] w-full text-center"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-primary" />
          </div>
          <h1 className="text-[32px] font-[800] text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 text-[16px] mb-8 leading-relaxed">
            Your stay in the <strong className="text-slate-800">{bed.type}</strong> has been secured. An advance of ৳{bed.advanceRequired} was paid successfully.
          </p>
          
          <div className="space-y-3">
            <Link href="/appointments" className="flex items-center justify-center w-full h-14 bg-primary text-white rounded-[16px] font-bold text-[16px] shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
              View Digital Memo
            </Link>
            <button onClick={() => router.push(`/hospitals/${id}`)} className="flex items-center justify-center w-full h-14 bg-slate-50 text-slate-700 rounded-[16px] font-bold text-[16px] hover:bg-slate-100 transition-colors">
              Back to Hospital
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white font-sans pb-32 scroll-smooth">
      
      {/* Navbar Overlay */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors">
          <ChevronLeft size={20} /> Back to Profile
        </button>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors">
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-8">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] md:text-[40px] font-[800] text-slate-900 leading-tight mb-2">{bed.type}</h1>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[14px] md:text-[15px] font-bold text-slate-600">
            <span className="flex items-center gap-1.5"><Star size={18} className="text-amber-400 fill-amber-400" /> {bed.rating} ({bed.reviews} reviews)</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-primary">{bed.hospital}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Floor: {bed.floor}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Room: {bed.roomNo}</span>
          </div>
        </div>

        {/* Image Grid (Airbnb Style) */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[300px] md:h-[500px] mb-12 rounded-[24px] overflow-hidden">
          <div className="md:col-span-2 md:row-span-2 relative h-full bg-slate-100 cursor-pointer group">
            <Image src={bed.images[0]} alt="Main" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
          <div className="hidden md:block relative h-full bg-slate-100 cursor-pointer group">
            <Image src={bed.images[1]} alt="Img 1" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
          <div className="hidden md:block relative h-full bg-slate-100 cursor-pointer group rounded-tr-[24px]">
            <Image src={bed.images[2]} alt="Img 2" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
          <div className="hidden md:block md:col-span-2 relative h-full bg-slate-100 cursor-pointer group rounded-br-[24px]">
            <Image src={bed.images[3]} alt="Img 3" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 relative">
          
          {/* Left: Details */}
          <div className="flex-1 space-y-10 pb-12">
            
            {/* Description */}
            <div>
              <h2 className="text-[22px] md:text-[24px] font-[800] text-slate-900 mb-4">About this room</h2>
              <p className="text-[15px] md:text-[16px] text-slate-600 leading-relaxed">{bed.description}</p>
            </div>

            <hr className="border-t border-slate-100" />

            {/* Features */}
            <div>
              <h2 className="text-[22px] md:text-[24px] font-[800] text-slate-900 mb-6">What this room offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {bed.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <feature.icon size={26} className="text-primary/70" />
                    <span className="text-[15px] md:text-[16px] text-slate-700 font-medium">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-t border-slate-100" />

            {/* Rules */}
            <div>
              <h2 className="text-[22px] md:text-[24px] font-[800] text-slate-900 mb-6 flex items-center gap-2">
                <AlertCircle size={24} className="text-slate-900" /> Things to know
              </h2>
              <ul className="space-y-4">
                {bed.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span className="text-[15px] md:text-[16px] text-slate-600">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right: Comprehensive Booking Engine */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="sticky top-[100px] bg-white rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
              
              <div className="flex items-end gap-2 mb-2">
                <span className="text-[32px] font-[800] text-slate-900 leading-none">৳{bed.price}</span>
                <span className="text-[16px] text-slate-500 font-medium mb-1">/ night</span>
              </div>
              <p className="text-[14px] font-bold text-rose-500 mb-8 bg-rose-50 inline-block px-3 py-1 rounded-md">
                Booking Advance: ৳{bed.advanceRequired}
              </p>

              {/* Comprehensive Form */}
              <div className="space-y-4 mb-8">
                
                {/* Dates */}
                <div className="flex bg-slate-50 rounded-[12px] p-1 border border-slate-100">
                  <div className="flex-1 p-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-[800] text-slate-500 uppercase tracking-widest mb-1">
                      <CalendarDays size={12} /> Check-in
                    </label>
                    <input type="date" name="checkIn" value={formData.checkIn} onChange={handleFormChange} className="w-full text-[14px] font-bold text-slate-800 outline-none bg-transparent cursor-pointer" />
                  </div>
                  <div className="w-[1px] bg-slate-200 my-2"></div>
                  <div className="flex-1 p-2 pl-4">
                    <label className="flex items-center gap-1.5 text-[11px] font-[800] text-slate-500 uppercase tracking-widest mb-1">
                      <CalendarDays size={12} /> Check-out
                    </label>
                    <input type="date" name="checkOut" value={formData.checkOut} onChange={handleFormChange} className="w-full text-[14px] font-bold text-slate-800 outline-none bg-transparent cursor-pointer" />
                  </div>
                </div>

                {/* Patient Demographics */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Patient Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" name="patientName" value={formData.patientName} onChange={handleFormChange} placeholder="Enter full name" className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-[12px] text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-1/4">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Age <span className="text-rose-500">*</span></label>
                      <input type="number" name="age" value={formData.age} onChange={handleFormChange} placeholder="Age" className="w-full h-12 px-3 bg-slate-50 border border-slate-100 rounded-[12px] text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400" />
                    </div>
                    
                    <div className="w-1/3">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Gender <span className="text-rose-500">*</span></label>
                      <select name="gender" value={formData.gender} onChange={(e: any) => handleFormChange(e)} className={`w-full h-12 px-3 bg-slate-50 border border-slate-100 rounded-[12px] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${formData.gender ? 'text-slate-800' : 'text-slate-400'}`}>
                        <option value="" disabled>Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="w-full">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Guardian <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" name="guardianName" value={formData.guardianName} onChange={handleFormChange} placeholder="Guardian name" className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-[12px] text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Address <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" name="address" value={formData.address} onChange={handleFormChange} placeholder="Full address" className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-[12px] text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Emergency Contact <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Phone number" className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-[12px] text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <h3 className="text-[14px] font-[800] text-slate-900 mb-3 uppercase tracking-wide">Advance Payment Method</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[12px] cursor-pointer transition-all ${paymentMethod === 'bkash' ? 'bg-[#e2136e]/10 ring-2 ring-[#e2136e]' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  <input type="radio" name="payment" onChange={() => setPaymentMethod('bkash')} className="hidden" />
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm relative overflow-hidden flex items-center justify-center">
                      <Image src="https://download.logo.wine/logo/BKash/BKash-Icon-Logo.wine.png" alt="bKash" fill className="object-contain p-1" />
                  </div>
                  <span className="font-bold text-slate-700 text-[13px]">bKash</span>
                </label>
                
                <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[12px] cursor-pointer transition-all ${paymentMethod === 'card' ? 'bg-primary/10 ring-2 ring-primary' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  <input type="radio" name="payment" onChange={() => setPaymentMethod('card')} className="hidden" />
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-primary">
                    <CreditCard size={20} />
                  </div>
                  <span className="font-bold text-slate-700 text-[13px]">Card</span>
                </label>
              </div>

              {/* Breakdown */}
              <div className="bg-slate-50 rounded-[12px] p-4 mb-6 space-y-2 border border-slate-100">
                <div className="flex justify-between items-center text-[14px] text-slate-600 font-medium">
                  <span>Room Total (Est. 1 Night)</span>
                  <span>৳{bed.price}</span>
                </div>
                <div className="flex justify-between items-center text-[14px] text-slate-600 font-medium">
                  <span>Due at Hospital</span>
                  <span>৳{(bed.price - bed.advanceRequired)}</span>
                </div>
                <hr className="border-slate-200 my-2" />
                <div className="flex justify-between items-center text-[16px] font-[800] text-slate-900">
                  <span>Pay Now (Advance)</span>
                  <span className="text-primary">৳{bed.advanceRequired}</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                disabled={!isFormValid}
                onClick={() => setIsSuccess(true)}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-[12px] font-bold text-[16px] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShieldCheck size={20} /> Pay ৳{bed.advanceRequired} to Confirm
              </button>

              <div className="text-center text-[12px] text-slate-400 font-medium mt-4">
                Please fill all fields to proceed to payment.
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
