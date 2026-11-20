"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Star,
  Building2,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { mockDoctors } from "@/lib/mockData";

interface HospitalListing {
  id?: number | string;
  name?: string;
  specialty?: string;
  type?: string;
  address?: string;
}

export function MedicalDirectory() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"doctors" | "hospitals">("doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [hospitals, setHospitals] = useState<HospitalListing[]>([]);

  useEffect(() => {
    fetch("/data/hospitals.json")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        let finalData = data;
        if (Array.isArray(data) && Array.isArray(data[0])) {
          finalData = data.flat();
        }
        setHospitals(Array.isArray(finalData) ? finalData : []);
      })
      .catch((err) => console.error("Error fetching hospitals", err));
  }, []);

  const filteredDoctors = mockDoctors.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const loc = searchLocation.toLowerCase();
    const matchesQuery =
      !q ||
      doc.name.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.hospital.toLowerCase().includes(q);
    const matchesLocation = !loc || doc.location.toLowerCase().includes(loc);
    return matchesQuery && matchesLocation;
  });

  const filteredHospitals = hospitals.filter((hosp) => {
    const q = searchQuery.toLowerCase();
    const loc = searchLocation.toLowerCase();
    const matchesQuery =
      !q ||
      hosp.name?.toLowerCase()?.includes(q) ||
      hosp.specialty?.toLowerCase()?.includes(q) ||
      hosp.type?.toLowerCase()?.includes(q);
    const matchesLocation = !loc || hosp.address?.toLowerCase()?.includes(loc);
    return matchesQuery && matchesLocation;
  });

  const visibleDoctors = filteredDoctors.slice(0, 6);
  const visibleHospitals = filteredHospitals.slice(0, 6);

  return (
    <section id="doctors" className="relative py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Clean Editorial Header */}
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0B6E99] mb-2.5">
            {t("Care Directory", "চিকিৎসা ডিরেক্টরি")}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t(
              "Find Specialist Doctors & Hospitals",
              "বিশেষজ্ঞ ডাক্তার ও হাসপাতাল খুঁজুন"
            )}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {t(
              "Search by name, department, or district to review qualifications, chambers, consultation fees, and facility addresses.",
              "নাম, বিভাগ বা এলাকা অনুযায়ী খুঁজে ডাক্তারের যোগ্যতা, চেম্বারের সময়, ভিজিট ফী ও হাসপাতালের ঠিকানা দেখে নিন।"
            )}
          </p>
        </div>

        {/* Filter Bar + Tab Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/70">
            <button
              type="button"
              onClick={() => setActiveTab("doctors")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === "doctors"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope size={16} />
              <span>{t("Doctors", "ডাক্তার")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hospitals")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === "hospitals"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 size={16} />
              <span>{t("Hospitals", "হাসপাতাল")}</span>
            </button>
          </div>

          <div className="flex-1 max-w-2xl bg-white p-1.5 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-3.5 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0B6E99]/20 transition-all">
              <Search size={17} className="mr-2.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "doctors"
                    ? t("Doctor name or specialty...", "ডাক্তারের নাম বা বিভাগ...")
                    : t("Hospital or diagnostic center...", "হাসপাতাল বা ডায়াগনস্টিক...")
                }
                className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="sm:w-52 flex items-center bg-slate-50 rounded-xl px-3.5 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0B6E99]/20 transition-all">
              <MapPin size={17} className="mr-2.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder={t("District or area (e.g. Dhaka)", "এলাকা (যেমন: ঢাকা)")}
                className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Responsive 3-Column Directory Grid */}
        {activeTab === "doctors" ? (
          visibleDoctors.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl text-slate-500">
              <p className="text-sm font-medium">
                {t("No doctors matched your filter criteria.", "আপনার খোঁজা অনুযায়ী কোনো ডাক্তার পাওয়া যায়নি।")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-slate-50 shrink-0 relative">
                        <Image
                          src={doc.image}
                          alt={doc.name}
                          fill
                          sizes="56px"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base text-slate-900 truncate">
                          {doc.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#0B6E99] mt-0.5 truncate">
                          {doc.specialty}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {doc.title}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{doc.hospital}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{doc.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 tabular-nums">
                      <span>{doc.experienceYears} {t("yrs exp", "বছর অভিজ্ঞতা")}</span>
                      {typeof doc.fee === "number" && doc.fee > 0 && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-semibold text-slate-800">৳{doc.fee}</span>
                        </>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {doc.rating}
                      </span>
                    </div>

                    <Link
                      href={`/doctors/${doc.id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-[#0B6E99] text-slate-800 hover:text-white border border-slate-200 hover:border-[#0B6E99] text-xs font-semibold transition-colors shrink-0"
                    >
                      {t("View Profile", "প্রোফাইল")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : visibleHospitals.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl text-slate-500">
            <p className="text-sm font-medium">
              {t("No hospitals matched your filter criteria.", "আপনার খোঁজা অনুযায়ী কোনো হাসপাতাল পাওয়া যায়নি।")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleHospitals.map((hosp, idx) => (
              <div
                key={`hosp-${hosp.id || idx}`}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Building2 size={20} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                        {hosp.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#0B6E99] mt-0.5 line-clamp-1">
                        {hosp.specialty || hosp.type || t("Multi-Specialty Hospital", "মাল্টি-স্পেশালিটি হাসপাতাল")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 mb-4 text-xs text-slate-600 flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{hosp.address}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <Link
                    href="/hospitals"
                    className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-[#0B6E99] text-slate-800 hover:text-white border border-slate-200 hover:border-[#0B6E99] text-xs font-semibold transition-colors"
                  >
                    {t("View Details", "বিস্তারিত দেখুন")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Directory Full View CTA */}
        <div className="mt-10 flex justify-center sm:justify-end">
          <Link
            href={activeTab === "doctors" ? "/doctors" : "/hospitals"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B6E99] hover:text-[#09587A] transition-colors group"
          >
            <span>
              {activeTab === "doctors"
                ? lang === "bn"
                  ? `সব ${mockDoctors.length} জন বিশেষজ্ঞ ডাক্তার দেখুন`
                  : `Browse all ${mockDoctors.length} Specialists`
                : t("Browse all Hospitals & ICU Status", "সব হাসপাতাল ও আইসিইউ তথ্য দেখুন")}
            </span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
