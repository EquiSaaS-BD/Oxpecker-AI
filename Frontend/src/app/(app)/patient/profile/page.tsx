"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Heart, 
  Activity, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  MapPin,
  User
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGetProfile } from "@/lib/api";

export default function PatientProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiGetProfile();
        if (res?.data?.profile) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error("Failed to load patient profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const p = profile || user || {};
  const displayName = p.name || p.full_name || "Patient";
  const displayEmail = p.email || "patient@oxpecker.ai";
  const displayPhone = p.phone || "Not added yet";
  const displayBlood = p.blood_group || p.bloodGroup || "O+";
  const displayGender = p.gender || "Not specified";
  const displayDob = p.date_of_birth || p.dob || "Not specified";
  const displayAddress = p.address || "Not specified";
  const displayImage = p.image || p.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300";

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
              src={displayImage}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>
          <div className="px-6 pb-8 w-full flex flex-col items-center">
            <h2 className="text-2xl font-black mt-4 text-slate-900">{displayName}</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 bg-slate-100 px-3 py-1 rounded-full">
              {p.id ? `ID: #${p.id.substring(0, 7).toUpperCase()}` : "ID: #OX-USER"}
            </p>

            <div className="mt-8 w-full flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Gender / DOB</span>
                <span className="text-sm font-bold text-slate-800">{displayGender} / {displayDob}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Blood Group</span>
                <span className="text-sm font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-lg shadow-xs">{displayBlood}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Phone</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  {displayPhone}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Email</span>
                <span className="text-sm font-bold text-slate-800 truncate max-w-[180px]">
                  {displayEmail}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Health ID Status</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  Verified <CheckCircle2 size={16} className="text-emerald-600" />
                </span>
              </div>
            </div>

            <Link 
              href="/profile"
              className="mt-8 w-full btn-clay text-sm py-3.5 px-4 rounded-2xl text-center flex justify-center items-center gap-2"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Actions & Recent Health Data (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/appointments" className="bento-card p-5 hover:border-sky-300 transition-all group flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Calendar size={20} />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Appointments</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track and view scheduled doctor visits</p>
              </div>
            </Link>

            <Link href="/chat" className="bento-card p-5 hover:border-emerald-300 transition-all group flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Activity size={20} />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">AI Health Chat</h3>
                <p className="text-xs text-slate-500 mt-0.5">Get 24/7 symptom guidance and insights</p>
              </div>
            </Link>

            <Link href="/medicines" className="bento-card p-5 hover:border-indigo-300 transition-all group flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Prescriptions & Meds</h3>
                <p className="text-xs text-slate-500 mt-0.5">DGDA verified medication guides</p>
              </div>
            </Link>
          </div>

          <div className="bento-card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Patient Address & Location</h3>
            <div className="flex items-start gap-3 text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <MapPin size={20} className="text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{displayAddress}</p>
                <p className="text-xs text-slate-500 mt-1">To update your address or emergency contacts, visit your profile settings.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
