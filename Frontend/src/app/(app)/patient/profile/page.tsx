"use client";

import Link from "next/link";
import { User, Activity, Heart, Clock, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, FileText } from "lucide-react";

export default function PatientProfilePage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
      
      {/* Header Info */}
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          রোগীর প্রোফাইল (Patient Profile)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          সর্বশেষ আপডেট: আজ সকাল ১০:৩০
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Patient Info Card (Span 4) */}
        <div className="md:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col items-center text-center shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-sky-50" />
          <img
            className="w-24 h-24 rounded-full object-cover border-4 border-white relative z-10 mt-4 shadow-sm bg-slate-100"
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300"
            alt="Patient Avatar"
          />
          <h2 className="text-xl font-bold mt-4 text-slate-900">রহিম উদ্দিন</h2>
          <p className="text-sm text-slate-500 font-medium">রোগী আইডি: #SHU-8492</p>

          <div className="mt-6 w-full flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-xs font-semibold text-slate-500">বয়স / লিঙ্গ</span>
              <span className="text-sm font-bold text-slate-800">৪৫ / পুরুষ</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-xs font-semibold text-slate-500">রক্তের গ্রুপ</span>
              <span className="text-sm font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">O+</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-xs font-semibold text-slate-500">যোগাযোগ</span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                +৮৮০ ১৭১২-৩৪৫৬৭৮ <ShieldCheck size={16} className="text-sky-600" />
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-xs font-semibold text-slate-500">পরিচয় যাচাইকরণ</span>
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                NID: যাচাইকৃত <CheckCircle2 size={16} className="text-emerald-600" />
              </span>
            </div>
          </div>

          <Link 
            href="/settings"
            className="mt-6 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition-colors text-center shadow-xs"
          >
            প্রোফাইল সম্পাদনা করুন
          </Link>
        </div>

        {/* Health Metrics & Medical History (Span 8) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Vitals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500">রক্তচাপ</span>
                <Heart size={20} className="text-rose-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">120/80 <span className="text-xs text-slate-400 font-normal">mmHg</span></div>
                <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                  স্বাভাবিক
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500">হৃদস্পন্দন</span>
                <Activity size={20} className="text-sky-600" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">72 <span className="text-xs text-slate-400 font-normal">bpm</span></div>
                <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold">
                  স্থিতিশীল
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500">রক্তের শর্করা</span>
                <Activity size={20} className="text-amber-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">5.8 <span className="text-xs text-slate-400 font-normal">mmol/L</span></div>
                <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                  সীমানায়
                </span>
              </div>
            </div>
          </div>

          {/* Medical History Summary */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">চিকিৎসার ইতিহাস</h3>
              <Link href="/reports" className="text-xs font-bold text-sky-600 hover:underline">সব দেখুন</Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">উচ্চ রক্তচাপ নিয়ন্ত্রণ</h4>
                  <p className="text-xs text-slate-500">ডাঃ শফিকুল ইসলাম - গত ২ বছর ধরে চিকিৎসাধীন</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">বার্ষিক স্বাস্থ্য পরীক্ষা</h4>
                  <p className="text-xs text-slate-500">শুশ্রূষতা ডায়াগনস্টিক - ১৫ জানুয়ারী, ২০২৪</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">আসন্ন অ্যাপয়েন্টমেন্ট</h3>
              <Link href="/doctors" className="text-xs font-bold bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors">
                + নতুন বুকিং
              </Link>
            </div>
            <div className="border border-slate-200/80 rounded-xl p-4 flex items-center justify-between bg-slate-50 hover:shadow-xs transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center bg-sky-600 text-white rounded-xl w-12 h-12 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider">মে</span>
                  <span className="text-lg font-black leading-none">১২</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">ডাঃ নাদিয়া সুলতানা</h4>
                  <p className="text-xs text-slate-500">কার্ডিওলজিস্ট • বিকাল ৪:০০</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
