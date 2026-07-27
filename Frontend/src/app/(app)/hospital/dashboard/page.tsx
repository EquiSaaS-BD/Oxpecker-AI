"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BedDouble,
  Activity,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  CalendarDays
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HospitalDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Doctors", value: "142", icon: Stethoscope, trend: "+12 this month", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Available Beds", value: "48", icon: BedDouble, trend: "Out of 500", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Daily Admissions", value: "85", icon: Activity, trend: "+5% vs yesterday", color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Revenue (Today)", value: "৳2.4L", icon: CreditCard, trend: "+15% vs yesterday", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hospital Overview</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your hospital operations and resources.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
              Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-${stat.bg.split('-')[1]}-100 rounded-bl-full -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110`} />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={stat.color} size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-md">
                    <TrendingUp size={12} className={stat.color} />
                    {stat.trend}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart / List */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Recent Doctor Registrations</h2>
                <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                        Dr
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">Dr. New Doctor {i}</h4>
                        <p className="text-xs text-slate-500">Cardiology Dept.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar Widget */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-lg font-bold mb-2">Hospital Capacity</h2>
                <p className="text-emerald-50 text-sm mb-6 leading-relaxed">
                  ICU and Emergency wards are nearing capacity. Please review bed allocations.
                </p>
                <button className="w-full bg-white text-emerald-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <BedDouble size={16} />
                  Manage Beds
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Departments", icon: Users },
                  { label: "Schedules", icon: CalendarDays },
                  { label: "Invoices", icon: CreditCard },
                  { label: "Settings", icon: Activity },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button key={idx} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group">
                      <Icon className="text-slate-400 group-hover:text-emerald-600 transition-colors" size={24} />
                      <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
