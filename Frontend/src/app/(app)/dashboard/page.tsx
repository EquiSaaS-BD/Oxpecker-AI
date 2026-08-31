"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Droplet, Flame, Activity, Check, AlertCircle, Calendar, Clock, Moon, Dumbbell, UtensilsCrossed } from "lucide-react";
import { upcomingAppointment, nutritionData } from "@/data";
import { fetchDashboardStats } from "@/lib/api";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchDashboardStats();
      setDashboardData(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">লোড হচ্ছে... (Loading...)</div>;
  }

  if (!dashboardData) {
    return <div className="p-8 text-center text-slate-500">ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।</div>;
  }

  const { user: userProfile, healthScore, reminders: medicineReminders } = dashboardData;
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">আপনার স্বাস্থ্য ড্যাশবোর্ড</h1>
        <p className="text-slate-500 mt-1">স্বাগতম, {userProfile.name.split(' ')[0]}। এখানে আপনার আজকের স্বাস্থ্যের সারসংক্ষেপ।</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Top Row: Score & Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Health Score Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50/60 to-transparent pointer-events-none"></div>
              
              <h3 className="font-bold text-slate-900 mb-6 relative z-10">স্বাস্থ্য স্কোর</h3>
              
              <div className="flex flex-col items-center justify-center relative z-10">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e0e8ff"
                      strokeWidth="3.8"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#00687b"
                      strokeWidth="2.8"
                      strokeDasharray={`${healthScore.score}, 100`}
                      strokeLinecap="round"
                      className="animate-progress"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-900">{healthScore.score}</span>
                    <span className="text-sm font-medium text-emerald-600">{healthScore.label}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50/30 px-3 py-1 rounded-full">
                  <Activity size={14} />
                  <span>{healthScore.trendLabel}</span>
                </div>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-primary bg-slate-100 overflow-hidden relative">
                      <UserPlaceholder />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-900">{userProfile.name}</h3>
                      <p className="text-sm text-slate-500">বয়স: {userProfile.age} | রক্ত গ্রুপ: {userProfile.bloodGroup}</p>
                    </div>
                  </div>
                  <div className="bg-indigo-50 text-indigo-900 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {userProfile.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-medium">উচ্চতা</p>
                    <p className="text-lg font-bold text-slate-900">{userProfile.height}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-medium">ওজন</p>
                    <p className="text-lg font-bold text-slate-900">{userProfile.weight}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Nutrition Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-emerald-600 inline-block" /> পুষ্টি বুদ্ধিমত্তা
              </h3>
              <Link href="/nutrition" className="text-sm text-sky-600 font-medium flex items-center hover:underline">
                বিস্তারিত <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <Flame size={16} />
                  </div>
                  <span className="font-medium text-slate-800">ক্যালোরি</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold text-slate-900">{nutritionData.calories.current}</span>
                  <span className="text-sm text-slate-500 mb-1">/ {nutritionData.calories.goal}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((nutritionData.calories.current / nutritionData.calories.goal) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                    <Droplet size={16} />
                  </div>
                  <span className="font-medium text-slate-800">পানি</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold text-slate-900">{nutritionData.water.current}</span>
                  <span className="text-sm text-slate-500 mb-1">/ {nutritionData.water.goal} {nutritionData.water.unit}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-sky-600 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((nutritionData.water.current / nutritionData.water.goal) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Activity size={16} />
                  </div>
                  <span className="font-medium text-slate-800">সাপ্তাহিক প্রোটিন</span>
                </div>
                <div className="flex items-center justify-between h-[42px]">
                  <span className="text-lg font-bold text-indigo-600">{nutritionData.weeklyRating}</span>
                  {/* Sparkline mock */}
                  <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                    <path d="M0 20L10 15L20 18L30 8L40 12L50 4L60 6" stroke="#004e32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Medicine Reminders */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-sky-500 font-bold tracking-widest text-xs uppercase bg-sky-50 px-2 py-1 rounded-md">REMINDER</span> ওষুধের রিমাইন্ডার
            </h3>
            
            <div className="space-y-4">
              {medicineReminders.map((rem: any) => (
                <div key={rem.id} className={`p-4 rounded-xl border ${rem.overdue ? 'border-l-4 border-l-rose-500 bg-rose-50/10 border-slate-50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900">{rem.name}</h4>
                    {rem.taken ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        <Check size={10} /> নেওয়া হয়েছে
                      </span>
                    ) : rem.overdue ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                        <AlertCircle size={10} /> বাকি আছে
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1"><Clock size={14} /> {rem.time}</div>
                    <div>• {rem.dosage}</div>
                  </div>
                  
                  {rem.overdue && (
                    <Link 
                      href="/medicines" 
                      className="mt-3 block text-center w-full py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 text-sm font-medium rounded-lg transition-colors"
                    >
                      ওষুধ গ্রহণ নিশ্চিত করুন
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointment */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-emerald-500 font-bold tracking-widest text-xs uppercase bg-emerald-50 px-2 py-1 rounded-md">NEXT</span> আসন্ন অ্যাপয়েন্টমেন্ট
            </h3>
            
            <Link 
              href="/appointments" 
              className="flex items-center gap-4 bg-slate-50/70 hover:bg-sky-50/50 p-4 rounded-xl border border-slate-100 hover:border-sky-200 transition-all group"
            >
              <div suppressHydrationWarning className="w-14 h-14 bg-white rounded-xl flex flex-col items-center justify-center text-sky-900 shrink-0 shadow-sm border border-sky-200 group-hover:border-sky-400 transition-colors">
                <span className="text-xs font-bold uppercase">{upcomingAppointment.date.toLocaleString('en-GB', { month: 'short' })}</span>
                <span className="text-xl font-black leading-none">{upcomingAppointment.date.getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">{upcomingAppointment.doctorName}</h4>
                <p className="text-sm text-slate-500 mb-1 truncate">{upcomingAppointment.specialty}</p>
                <div className="flex items-center gap-1 text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded inline-flex">
                  <Clock size={12} /> {upcomingAppointment.time}
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Small Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white text-slate-900 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
              <Moon size={64} className="absolute -right-4 -bottom-4 text-slate-900 opacity-10 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium mb-1 opacity-80">ঘুমের স্কোর</p>
              <p className="text-2xl font-bold">৭.৫ ঘণ্টা</p>
            </div>
            <div className="bg-indigo-50 text-indigo-900 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
              <Dumbbell size={64} className="absolute -right-4 -bottom-4 text-indigo-900 opacity-10 group-hover:scale-110 transition-transform transform -rotate-45" />
              <p className="text-sm font-medium mb-1 opacity-80">ব্যায়াম</p>
              <p className="text-2xl font-bold">৪৫ মিনিট</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function UserPlaceholder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-slate-500 opacity-50" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
