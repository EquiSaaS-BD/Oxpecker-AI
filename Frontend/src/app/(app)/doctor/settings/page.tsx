"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  MapPin,
  GraduationCap,
  Building2,
  ShieldCheck,
  Bell,
  ArrowRight,
  LogOut,
  BadgeCheck,
  Clock,
  Phone,
  Mail,
  Stethoscope
} from "lucide-react";

export default function DoctorSettingsPage() {
  const { user, logout } = useAuth();

  const settingsCards = [
    {
      title: "Profile Details",
      desc: "Update your full legal name, specialty, biography, and professional BMDC credentials.",
      href: "/doctor/settings/profile",
      icon: User,
      color: "from-sky-500 to-indigo-600",
    },
    {
      title: "Chambers & Schedule",
      desc: "Configure your OPD chambers, consultation timing slots, and daily patient visit limits.",
      href: "/doctor/settings/chambers",
      icon: MapPin,
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Education & Certifications",
      desc: "Manage MBBS/FCPS degrees, postgraduate fellowships, and medical institute affiliations.",
      href: "/doctor/settings/education",
      icon: GraduationCap,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Practice Locations",
      desc: "Add hospital branches, diagnostic center affiliations, and telemetry chambers.",
      href: "/doctor/settings/locations",
      icon: Building2,
      color: "from-violet-500 to-purple-600",
    },
    {
      title: "Account & Security",
      desc: "Manage two-factor authentication, active login devices, password changes, and audit logs.",
      href: "/doctor/settings/security",
      icon: ShieldCheck,
      color: "from-rose-500 to-pink-600",
    },
    {
      title: "Notifications & Preferences",
      desc: "Control SMS alerts for new emergency triage, appointment requests, and patient messages.",
      href: "/doctor/settings/notifications",
      icon: Bell,
      color: "from-blue-500 to-cyan-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Doctor Settings Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          ক্লিনিক্যাল প্রোফাইল, চেম্বার শিডিউল, নিরাপত্তা সেটিংস ও অ্যাকাউন্ট নিয়ন্ত্রণ করুন
        </p>
      </div>

      {/* Doctor Profile Session Card */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-800/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-sky-400/40 relative overflow-hidden shrink-0 shadow-md">
              <Image
                src={user?.image || "/images/signup-doctor.png"}
                alt={user?.name || "Doctor"}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {user?.name || "Dr. Attending Physician"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  <BadgeCheck size={12} />
                  <span>BMDC ভেরিফাইড</span>
                </span>
              </div>
              <p className="text-xs text-sky-300 font-medium mt-0.5 flex items-center gap-2">
                <Stethoscope size={13} />
                <span>Specialist Physician • Oxpecker Medical Network</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1 font-mono">
                  <Mail size={12} className="text-sky-400" />
                  {user?.email || "doctor@oxpecker.ai"}
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone size={12} className="text-emerald-400" />
                    {user?.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/doctor/settings/profile"
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span>প্রোফাইল সম্পাদনা</span>
              <ArrowRight size={14} />
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                <span>কনফিগার করুন</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
