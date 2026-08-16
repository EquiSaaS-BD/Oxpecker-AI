"use client";

import Image from "next/image";
import { 
  CalendarDays, Clock, MapPin, Download, CheckCircle2, QrCode, Mail, Phone
} from "lucide-react";
import { useState } from "react";

interface PassData {
  type?: "doctor" | "bed";
  id: string;
  doctorName: string;
  doctorImage: string;
  specialty: string;
  hospitalName: string;
  hospitalLogo: string;
  address: string;
  date: string;
  time: string;
  patientName: string;
  age?: string;
  guardianName?: string;
  phone?: string;
  fee: number;
  advancePaid?: number;
  status: "Confirmed" | "Pending";
}

export function AppointmentPass({ data }: { data: PassData }) {
  const isBed = data.type === "bed";
  const [notifyInput, setNotifyInput] = useState("");
  const [saved, setSaved] = useState(false);

  const dueAmount = data.fee - (data.advancePaid || 0);

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden mb-8 relative">
      
      {/* Top Banner */}
      <div className={`h-24 ${isBed ? 'bg-[#003d9b]' : 'bg-slate-900'} relative overflow-hidden flex items-center px-6 md:px-8`}>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <QrCode size={120} className="-mr-4 -mt-4" />
        </div>
        <div className="flex items-center gap-3 relative z-10 text-white w-full">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1 shrink-0">
            <Image src={data.hospitalLogo} alt="Logo" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <h2 className="font-bold text-[18px] leading-tight">{data.hospitalName}</h2>
            <p className="text-[13px] text-white/70 font-medium">Booking ID: {data.id}</p>
          </div>
          <div className="ml-auto bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
            {data.status}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        
        {/* Entity Info (Doctor or Bed) */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
              <Image src={data.doctorImage} alt="Cover" fill className="object-cover" />
            </div>
            <div>
              <h3 className="text-[20px] font-[800] text-slate-900 leading-tight mb-1">{data.doctorName}</h3>
              <p className="text-[14px] text-slate-500 font-medium mb-3">{data.specialty}</p>
              <div className="flex flex-col gap-1 text-[13px] font-bold text-slate-600">
                <span className="flex items-center gap-2"><CalendarDays size={14} className="text-primary" /> {data.date}</span>
                <span className="flex items-center gap-2"><Clock size={14} className="text-primary" /> {data.time}</span>
              </div>
            </div>
          </div>
          
          {/* QR Code on the right */}
          <div className="hidden sm:flex flex-col items-center justify-center p-2 border-2 border-slate-100 rounded-xl bg-white shadow-sm">
            <QrCode size={64} className="text-slate-800 mb-1" />
            <span className="text-[10px] font-[800] text-slate-400 uppercase tracking-widest">Scan Me</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative h-4 mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed border-slate-300"></div></div>
          <div className="absolute left-[-32px] top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200"></div>
          <div className="absolute right-[-32px] top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200"></div>
        </div>

        {/* Demographics & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-[11px] font-[800] text-slate-400 uppercase tracking-wider mb-3">Patient Details</h4>
            <div className="space-y-1.5">
              <p className="text-[14px] font-bold text-slate-900">{data.patientName} {data.age && <span className="text-slate-500 font-medium ml-1">({data.age} Yrs)</span>}</p>
              {data.guardianName && <p className="text-[13px] text-slate-600 font-medium">Guardian: {data.guardianName}</p>}
              {data.phone && <p className="text-[13px] text-slate-600 font-medium">Contact: {data.phone}</p>}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-[800] text-slate-400 uppercase tracking-wider mb-3">Location</h4>
            <p className="text-[14px] font-bold text-slate-900">{data.hospitalName}</p>
            <p className="text-[13px] text-slate-600 font-medium mt-1 leading-relaxed max-w-[200px]">{data.address}</p>
          </div>
        </div>

        {/* Financial Breakdown (Memo Style) */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-[20px] p-6 mb-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <h4 className="text-[12px] font-[800] text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
            Payment Summary
          </h4>
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center text-[15px] text-slate-600 font-medium">
              <span>Consultation Fee</span>
              <span className="font-semibold text-slate-800">৳{data.fee}</span>
            </div>
            {data.advancePaid !== undefined && data.advancePaid > 0 && (
              <div className="flex justify-between items-center text-[15px] text-emerald-600 font-bold bg-emerald-50/50 -mx-2 px-2 py-1.5 rounded-lg border border-emerald-100/50">
                <span>Advance Paid</span>
                <span>- ৳{data.advancePaid}</span>
              </div>
            )}
            
            <div className="pt-5 mt-2 border-t border-dashed border-slate-300 flex justify-between items-end">
              <div>
                <span className="block text-[15px] font-bold text-slate-900 mb-0.5">Due Amount</span>
                <span className="text-[13px] text-slate-500 font-medium">To be paid at hospital</span>
              </div>
              <div className="flex items-start gap-1 text-primary">
                <span className="text-[18px] font-bold mt-1">৳</span>
                <span className="text-[40px] font-[900] leading-none tracking-tight">{dueAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-[12px] font-bold text-[14px] transition-colors flex items-center justify-center gap-2">
            <Download size={18} /> Download Memo
          </button>
        </div>

      </div>
      
      {/* Footer Update Notification Section */}
      <div className="bg-[#f0f9ff] border-t border-[#bae6fd] px-6 md:px-8 py-5">
        <h4 className="text-[13px] font-bold text-[#0369a1] mb-2 flex items-center gap-2">
          <Mail size={16} /> Receive Updates
        </h4>
        <p className="text-[12px] text-[#0ea5e9] font-medium mb-3">Add email/phone to receive booking updates and invoices.</p>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter Email or Phone No." 
            value={notifyInput}
            onChange={(e) => setNotifyInput(e.target.value)}
            disabled={saved}
            className="flex-1 h-10 px-3 rounded-lg border border-[#bae6fd] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] disabled:bg-[#e0f2fe] disabled:text-[#0284c7]"
          />
          <button 
            onClick={() => setSaved(true)}
            disabled={saved || !notifyInput}
            className="h-10 px-4 bg-[#0284c7] hover:bg-[#0369a1] disabled:bg-[#7dd3fc] text-white text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1"
          >
            {saved ? <><CheckCircle2 size={16} /> Saved</> : "Save"}
          </button>
        </div>
      </div>

    </div>
  );
}
