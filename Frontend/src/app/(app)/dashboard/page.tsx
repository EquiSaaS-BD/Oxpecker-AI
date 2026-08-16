"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Droplet, Flame, Activity, Check, AlertCircle, Calendar, Clock, Moon, Dumbbell } from "lucide-react";
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
    return <div className="p-8 text-center text-on-surface-variant">লোড হচ্ছে... (Loading...)</div>;
  }

  if (!dashboardData) {
    return <div className="p-8 text-center text-on-surface-variant">ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।</div>;
  }

  const { user: userProfile, healthScore, reminders: medicineReminders } = dashboardData;
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">আপনার স্বাস্থ্য ড্যাশবোর্ড</h1>
        <p className="text-on-surface-variant mt-1">শুভ সকাল, {userProfile.name.split(' ')[0]}। এখানে আপনার আজকের স্বাস্থ্যের সারসংক্ষেপ।</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Top Row: Score & Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Health Score Card */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/20 to-transparent pointer-events-none"></div>
              
              <h3 className="font-bold text-on-surface mb-6 relative z-10">স্বাস্থ্য স্কোর</h3>
              
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
                    <span className="text-4xl font-bold text-on-surface">{healthScore.score}</span>
                    <span className="text-sm font-medium text-secondary">{healthScore.label}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-tertiary bg-tertiary-container/30 px-3 py-1 rounded-full">
                  <Activity size={14} />
                  <span>{healthScore.trendLabel}</span>
                </div>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-primary bg-surface-container overflow-hidden relative">
                      <UserPlaceholder />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-on-surface">{userProfile.name}</h3>
                      <p className="text-sm text-on-surface-variant">বয়স: {userProfile.age} | রক্ত গ্রুপ: {userProfile.bloodGroup}</p>
                    </div>
                  </div>
                  <div className="bg-tertiary-container text-on-tertiary text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {userProfile.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-surface-container-low border border-outline-variant/50 p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-medium">উচ্চতা</p>
                    <p className="text-lg font-bold text-on-surface">{userProfile.height}</p>
                  </div>
                  <div className="bg-surface-container-low border border-outline-variant/50 p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-medium">ওজন</p>
                    <p className="text-lg font-bold text-on-surface">{userProfile.weight}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Nutrition Section */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-on-surface flex items-center gap-2">
                <span>🍽</span> পুষ্টি বুদ্ধিমত্তা
              </h3>
              <Link href="#" className="text-sm text-primary font-medium flex items-center hover:underline">
                বিস্তারিত <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="border border-outline-variant/50 rounded-xl p-4 bg-surface-bright">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-error">
                    <Flame size={16} />
                  </div>
                  <span className="font-medium">ক্যালোরি</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold">{nutritionData.calories.current}</span>
                  <span className="text-sm text-on-surface-variant mb-1">/ {nutritionData.calories.goal}</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5">
                  <div className="bg-error h-1.5 rounded-full" ></div>
                </div>
              </div>

              <div className="border border-outline-variant/50 rounded-xl p-4 bg-surface-bright">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <Droplet size={16} />
                  </div>
                  <span className="font-medium">পানি</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold">{nutritionData.water.current}</span>
                  <span className="text-sm text-on-surface-variant mb-1">/ {nutritionData.water.goal} {nutritionData.water.unit}</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" ></div>
                </div>
              </div>

              <div className="border border-outline-variant/50 rounded-xl p-4 bg-surface-bright">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                    <Activity size={16} />
                  </div>
                  <span className="font-medium">সাপ্তাহিক প্রোটিন</span>
                </div>
                <div className="flex items-center justify-between h-[42px]">
                  <span className="text-lg font-bold text-tertiary">{nutritionData.weeklyRating}</span>
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
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-on-surface mb-6 flex items-center gap-2">
              <span>💊</span> ওষুধের রিমাইন্ডার
            </h3>
            
            <div className="space-y-4">
              {medicineReminders.map((rem: any) => (
                <div key={rem.id} className={`p-4 rounded-xl border ${rem.overdue ? 'border-l-4 border-l-error bg-error-container/10 border-outline-variant/30' : 'border-outline-variant/50 bg-surface-bright'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-on-surface">{rem.name}</h4>
                    {rem.taken ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-tertiary bg-tertiary-fixed-dim/30 px-2 py-0.5 rounded-full">
                        <Check size={10} /> নেওয়া হয়েছে
                      </span>
                    ) : rem.overdue ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-error bg-error-container px-2 py-0.5 rounded-full">
                        <AlertCircle size={10} /> বাকেয়া
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                    <div className="flex items-center gap-1"><Clock size={14} /> {rem.time}</div>
                    <div>• {rem.dosage}</div>
                  </div>
                  
                  {rem.overdue && (
                    <button className="mt-3 w-full py-1.5 border border-error text-error text-sm font-medium rounded-lg hover:bg-error-container transition-colors">
                      রিভিউ করুন
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointment */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-on-surface mb-6 flex items-center gap-2">
              <span>📅</span> আসন্ন অ্যাপয়েন্টমেন্ট
            </h3>
            
            <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-outline-variant/50">
              <div className="w-14 h-14 bg-primary-container rounded-xl flex flex-col items-center justify-center text-on-primary-container shrink-0 shadow-sm border border-primary/10">
                <span className="text-xs font-bold uppercase">{upcomingAppointment.date.toLocaleString('bn-BD', { month: 'short' })}</span>
                <span className="text-xl font-black leading-none">{upcomingAppointment.date.getDate()}</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">{upcomingAppointment.doctorName}</h4>
                <p className="text-sm text-on-surface-variant mb-1">{upcomingAppointment.specialty}</p>
                <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary-fixed/50 px-2 py-0.5 rounded inline-flex">
                  <Clock size={12} /> {upcomingAppointment.time}
                </div>
              </div>
            </div>
          </div>

          {/* Small Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-inverse-surface text-inverse-on-surface p-5 rounded-2xl shadow-lg relative overflow-hidden group">
              <Moon size={64} className="absolute -right-4 -bottom-4 text-white opacity-10 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium mb-1 opacity-80">ঘুমের স্কোর</p>
              <p className="text-2xl font-bold">৭.৫ ঘণ্টা</p>
            </div>
            <div className="bg-tertiary-container text-on-tertiary p-5 rounded-2xl shadow-lg relative overflow-hidden group">
              <Dumbbell size={64} className="absolute -right-4 -bottom-4 text-on-tertiary opacity-10 group-hover:scale-110 transition-transform transform -rotate-45" />
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
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-on-surface-variant opacity-50" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
