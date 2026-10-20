"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  BedDouble,
  Activity,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  CalendarDays,
  Plus,
  ClipboardCheck,
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
      <div className="w-full space-y-6">
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
    <div className="w-full">
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
            <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200" suppressHydrationWarning>
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
                <div className={`absolute top-0 right-0 w-32 h-32   to-${stat.bg.split('-')[1]}-100 rounded-bl-full -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110`} />
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
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Hospital Doctors Roster</h2>
                  <p className="text-xs text-slate-500">6 Registered Specialists • 4 On Duty</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/hospital/dashboard/doctors?add=true"
                    className="text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Plus size={14} /> Add Doctor
                  </Link>
                  <Link
                    href="/hospital/dashboard/doctors"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    View All <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Dr. Ayesha Rahman", dept: "Cardiology Dept. (Room 304)", status: "On Duty", badge: "bg-emerald-50 text-emerald-700" },
                  { name: "Dr. Tariqul Islam", dept: "Orthopedics Dept. (OT-2)", status: "In Surgery", badge: "bg-amber-50 text-amber-700" },
                  { name: "Dr. Nusrat Jahan", dept: "Pediatrics Dept. (Room 108)", status: "On Duty", badge: "bg-emerald-50 text-emerald-700" },
                ].map((doc, i) => (
                  <Link href="/hospital/dashboard/doctors" key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                        {doc.name.replace("Dr. ", "").charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{doc.name}</h4>
                        <p className="text-xs text-slate-500">{doc.dept}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${doc.badge}`}>
                        {doc.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar Widget */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-emerald-600 rounded-2xl shadow-md p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-lg font-bold mb-2">Hospital Capacity</h2>
                <p className="text-emerald-100 text-sm mb-6 leading-relaxed font-medium">
                  ICU and Emergency wards are nearing capacity. Please review bed allocations and admissions.
                </p>
                <Link href="/hospital/dashboard/beds" className="w-full bg-white text-emerald-800 font-bold py-2.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <BedDouble size={16} />
                  Manage Beds & Wards
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Doctors Roster", href: "/hospital/dashboard/doctors", icon: Users },
                  { label: "Manage Beds", href: "/hospital/dashboard/beds", icon: BedDouble },
                  { label: "Bookings", href: "/hospital/dashboard/bookings", icon: ClipboardCheck },
                  { label: "Appointments", href: "/hospital/dashboard/appointments", icon: CalendarDays },
                  { label: "Billing & Finances", href: "/hospital/dashboard/billing", icon: CreditCard },
                  { label: "Hospital Settings", href: "/hospital/dashboard/settings", icon: Activity },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                    >
                      <Icon className="text-slate-500 group-hover:text-emerald-600 transition-colors" size={22} />
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-emerald-700 text-center">{item.label}</span>
                    </Link>
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
