"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Stethoscope, Building2, AlertTriangle, ArrowRight, UserCheck, ShieldCheck, Search } from "lucide-react";
import { DoctorCard } from "./DoctorCard";
import { HospitalCard } from "./HospitalCard";
import { MedicineCard } from "./MedicineCard";
import { MedicalLoader } from "@/components/shared/MedicalLoader";

export function DoctorRecommendationLoader({ data }: { data: any }) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const speciality = data.speciality || "Medicine";
  const reason = data.reason || "লক্ষণগুলো নিবিড় পর্যবেক্ষণ ও সঠিক চিকিৎসার জন্য বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিন";
  const urgency = (data.urgency || "routine").toLowerCase();
  const isEmergency = urgency === "emergency" || urgency === "critical";

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/doctors/search?speciality=${encodeURIComponent(speciality)}`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted) {
          setDoctors(Array.isArray(d) ? d.slice(0, 2) : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [speciality]);

  if (loading) {
    return (
      <div className="p-4 bg-slate-50/80 rounded-2xl flex items-center justify-center my-3 border border-slate-200/60">
        <MedicalLoader text={`Finding ${speciality} specialists`} iconSize={26} />
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full my-4">
      {/* Visual Clinical Recommendation Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-indigo-50/90 border border-blue-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 mt-0.5">
              <Stethoscope size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 bg-blue-200/70 px-2.5 py-0.5 rounded-full border border-blue-300/80">
                  সুপারিশকৃত বিশেষজ্ঞ
                </span>
                <span className="text-xs font-black text-blue-700">
                  {speciality} Specialist
                </span>
                {isEmergency && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    <AlertTriangle size={12} /> জরুরি পরামর্শ
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {reason}
              </p>
            </div>
          </div>

          <Link
            href={`/doctors?speciality=${encodeURIComponent(speciality)}`}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>ডাক্তারদের প্রোফাইল দেখুন</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Render matched live doctor cards if available */}
      {doctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full pt-1">
          {doctors.map((doc: any, i) => (
            <DoctorCard key={i} doctor={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HospitalRecommendationLoader({ data }: { data: any }) {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const speciality = data.speciality || "General";
  const reason = data.reason || "জরুরি পর্যবেক্ষণ ও ডায়াগনস্টিক পরীক্ষার জন্য নিকটস্থ হাসপাতালে যোগাযোগ করুন";

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/hospitals/search?speciality=${encodeURIComponent(speciality)}`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted) {
          setHospitals(Array.isArray(d) ? d.slice(0, 2) : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [speciality]);

  if (loading) {
    return (
      <div className="p-4 bg-slate-50/80 rounded-2xl flex items-center justify-center my-3 border border-slate-200/60">
        <MedicalLoader text="Locating nearest hospital facilities" iconSize={26} />
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full my-4">
      {/* Visual Hospital Referral Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-sky-50/90 border border-emerald-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 mt-0.5">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/70 px-2.5 py-0.5 rounded-full border border-emerald-300/80">
                  হাসপাতাল ও আইসিইউ গাইড
                </span>
                <span className="text-xs font-black text-emerald-700">
                  {speciality} Department
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {reason}
              </p>
            </div>
          </div>

          <Link
            href="/hospitals"
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>হাসপাতাল খুঁজুন</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {hospitals.length > 0 && (
        <div className="flex flex-col gap-3 w-full pt-1">
          {hospitals.map((hosp: any, i) => (
            <HospitalCard key={i} hospital={hosp} />
          ))}
        </div>
      )}
    </div>
  );
}

export function MedicineRecommendationLoader({ data }: { data: any }) {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const query = data.generic || data.condition || data.name || "";
    fetch(`/api/medicines/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted) {
          setMedicines(Array.isArray(d) ? d.slice(0, 2) : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [data.generic, data.condition, data.name]);

  if (loading) {
    return (
      <div className="p-4 bg-slate-50/80 rounded-2xl flex items-center justify-center my-3 border border-slate-200/60">
        <MedicalLoader text="Verifying OTC pharmacology database" iconSize={26} />
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full my-4">
      {data.condition && (
        <div className="text-sm font-bold text-purple-900 bg-purple-50/80 px-4 py-2.5 rounded-xl border border-purple-200 leading-relaxed">
          {data.condition}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {medicines.map((med: any, i) => (
          <MedicineCard key={i} medicine={med} />
        ))}
      </div>
    </div>
  );
}