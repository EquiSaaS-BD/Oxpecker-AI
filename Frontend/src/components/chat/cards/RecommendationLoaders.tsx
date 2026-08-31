"use client";

import React, { useEffect, useState } from "react";
import { DoctorCard } from "./DoctorCard";
import { HospitalCard } from "./HospitalCard";
import { MedicineCard } from "./MedicineCard";

export function DoctorRecommendationLoader({ data }: { data: any }) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // data.speciality could be "Cardiology", etc.
    fetch(`/api/doctors/search?speciality=${encodeURIComponent(data.speciality || '')}`)
      .then(r => r.json())
      .then(d => {
        setDoctors(Array.isArray(d) ? d.slice(0, 2) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [data.speciality]);

  if (loading) {
    return <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500 animate-pulse flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span> Finding best doctors...</div>;
  }

  return (
    <div className="space-y-3 w-full my-4">
      {data.reason && (
        <div className="text-[14px] font-medium text-blue-800 bg-blue-50/80 px-4 py-2.5 rounded-xl border border-blue-100 leading-relaxed">
          {data.reason}
          {data.urgency === 'emergency' && <span className="text-red-600 font-bold ml-2 uppercase text-[12px] tracking-wide">Urgent Action Required</span>}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {doctors.map((doc: any, i) => <DoctorCard key={i} doctor={doc} />)}
      </div>
      {doctors.length === 0 && <div className="text-sm text-slate-500">No recommended doctors found nearby.</div>}
    </div>
  );
}

export function HospitalRecommendationLoader({ data }: { data: any }) {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hospitals/search?speciality=${encodeURIComponent(data.speciality || '')}`)
      .then(r => r.json())
      .then(d => {
        setHospitals(Array.isArray(d) ? d.slice(0, 2) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [data.speciality]);

  if (loading) {
    return <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500 animate-pulse flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span> Finding best hospitals...</div>;
  }

  return (
    <div className="space-y-3 w-full my-4">
      {data.reason && (
        <div className="text-[14px] font-medium text-emerald-800 bg-emerald-50/80 px-4 py-2.5 rounded-xl border border-emerald-100 leading-relaxed">
           {data.reason}
        </div>
      )}
      <div className="flex flex-col gap-3 w-full">
        {hospitals.map((hosp: any, i) => <HospitalCard key={i} hospital={hosp} />)}
      </div>
      {hospitals.length === 0 && <div className="text-sm text-slate-500">No suitable hospitals found nearby.</div>}
    </div>
  );
}

export function MedicineRecommendationLoader({ data }: { data: any }) {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to search by generic name or condition
    const query = data.generic || data.condition || data.name || '';
    fetch(`/api/medicines/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(d => {
        setMedicines(Array.isArray(d) ? d.slice(0, 2) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [data.generic, data.condition, data.name]);

  if (loading) {
    return <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500 animate-pulse flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span> Looking up medicines...</div>;
  }

  return (
    <div className="space-y-3 w-full my-4">
      {data.reason && (
        <div className="text-[14px] font-medium text-purple-800 bg-purple-50/80 px-4 py-2.5 rounded-xl border border-purple-100 leading-relaxed">
           {data.reason}
        </div>
      )}
      <div className="flex flex-col gap-3 w-full">
        {medicines.map((med: any, i) => <MedicineCard key={i} medicine={med} />)}
      </div>
      {medicines.length === 0 && <div className="text-sm text-slate-500">Medicine details not found in our directory.</div>}
    </div>
  );
}
