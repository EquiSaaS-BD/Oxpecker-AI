import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Heart, 
  Activity, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function PatientProfilePage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your health profile and upcoming appointments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Patient Info Card (Span 4) */}
        <div className="lg:col-span-4 bento-card spatial-shadow-sm flex flex-col items-center text-center relative overflow-hidden p-0">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-sky-50 to-slate-100 border-b border-slate-200/50" />
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white relative z-10 mt-10 shadow-md bg-slate-50">
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300"
              alt="Patient Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="px-6 pb-8 w-full flex flex-col items-center">
            <h2 className="text-2xl font-black mt-4 text-slate-900">Arif Hossain</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 bg-slate-100 px-3 py-1 rounded-full">ID: #OX-8492</p>

            <div className="mt-8 w-full flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Age / Gender</span>
                <span className="text-sm font-bold text-slate-800">32 / Male</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Blood Group</span>
                <span className="text-sm font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-lg shadow-xs">O+</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Insurance</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  MetLife Gold <ShieldCheck size={16} className="text-sky-600" />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">NID Verified</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  Verified <CheckCircle2 size={16} className="text-emerald-600" />
                </span>
              </div>
            </div>

            <Link 
              href="/settings"
              className="mt-8 w-full btn-clay text-sm py-3.5 px-4 rounded-2xl text-center flex justify-center items-center gap-2"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Health Metrics & Medical History (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          
          {/* Vitals Grid (Bento style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bento-card spatial-shadow-sm p-6 group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-slate-500">Blood Pressure</span>
                <div className="p-2 bg-rose-50 rounded-xl text-rose-500 group-hover:scale-110 transition-transform">
                  <Heart size={20} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-slate-900 tracking-tight">120/80 <span className="text-sm text-slate-500 font-semibold tracking-normal">mmHg</span></div>
                <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                  Normal
                </span>
              </div>
            </div>

            <div className="bento-card spatial-shadow-sm p-6 group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-slate-500">Heart Rate</span>
                <div className="p-2 bg-sky-50 rounded-xl text-sky-600 group-hover:scale-110 transition-transform">
                  <Activity size={20} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-slate-900 tracking-tight">72 <span className="text-sm text-slate-500 font-semibold tracking-normal">bpm</span></div>
                <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold">
                  Resting
                </span>
              </div>
            </div>

            <div className="bento-card spatial-shadow-sm p-6 group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-slate-500">Blood Sugar</span>
                <div className="p-2 bg-amber-50 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
                  <Activity size={20} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-slate-900 tracking-tight">5.8 <span className="text-sm text-slate-500 font-semibold tracking-normal">mmol/L</span></div>
                <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
                  Fasting
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Upcoming Appointments */}
            <div className="bento-card spatial-shadow-sm p-6 sm:p-8 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900">Appointments</h3>
                <Link href="/doctors" className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                  + Book New
                </Link>
              </div>
              <Link 
                href="/appointments"
                className="border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between bg-white spatial-shadow hover:spatial-shadow-hover transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center bg-sky-50 border border-sky-100 text-sky-700 rounded-xl w-14 h-14 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider">OCT</span>
                    <span className="text-xl font-black leading-none">24</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Dr. Anisul Islam</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Cardiology • 5:30 PM</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-sky-600 transition-colors transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Medical History Summary */}
            <div className="bento-card spatial-shadow-sm p-6 sm:p-8 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900">Recent Reports</h3>
                <Link href="/reports" className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors">View All</Link>
              </div>
              <div className="space-y-4">
                <Link href="/reports" className="flex items-start gap-4 group cursor-pointer block">
                  <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">CBC Blood Test</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Popular Diagnostic • 12 Oct 2026</p>
                  </div>
                </Link>
                <Link href="/reports" className="flex items-start gap-4 group cursor-pointer block">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">ECG Scan Result</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Labaid Hospital • 05 Sep 2026</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
