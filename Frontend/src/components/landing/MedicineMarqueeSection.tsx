"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = [
  { id: "All", name: "All", bnName: "সবগুলো" },
  { id: "Painkiller", name: "Fever & Pain", bnName: "জ্বর ও ব্যথা" },
  { id: "Gastric", name: "Gastric & Ulcer", bnName: "গ্যাস্ট্রিক" },
  { id: "Antibiotic", name: "Antibiotics", bnName: "অ্যান্টিবায়োটিক" },
  { id: "Allergy", name: "Asthma & Allergy", bnName: "শ্বাসকষ্ট ও অ্যালার্জি" },
  { id: "Cardiac", name: "Heart & Pressure", bnName: "হৃদরোগ ও প্রেশার" },
  { id: "Vitamins", name: "Vitamins", bnName: "ভিটামিন" },
];

const MEDICINES = [
  {
    id: 1,
    name: "Napa Extend",
    generic: "Paracetamol",
    strength: "665mg",
    type: "Tablet",
    price: "৳ 2.50",
    category: "Painkiller",
    useFor: "Fever, mild-to-moderate pain",
    bnUseFor: "জ্বর ও শরীর ব্যথা",
  },
  {
    id: 2,
    name: "Seclo",
    generic: "Omeprazole",
    strength: "20mg",
    type: "Capsule",
    price: "৳ 6.00",
    category: "Gastric",
    useFor: "Acidity, reflux & heartburn",
    bnUseFor: "গ্যাস্ট্রিক ও বুকজ্বালা",
  },
  {
    id: 3,
    name: "Sergel",
    generic: "Esomeprazole",
    strength: "20mg",
    type: "Capsule",
    price: "৳ 7.00",
    category: "Gastric",
    useFor: "Gastric ulcer & GERD",
    bnUseFor: "আলসার ও অ্যাসিডিটি",
  },
  {
    id: 5,
    name: "Monas",
    generic: "Montelukast",
    strength: "10mg",
    type: "Tablet",
    price: "৳ 17.50",
    category: "Allergy",
    useFor: "Asthma & allergic rhinitis",
    bnUseFor: "অ্যাজমা ও অ্যালার্জি",
  },
  {
    id: 11,
    name: "Azithromycin",
    generic: "Azithromycin",
    strength: "500mg",
    type: "Tablet",
    price: "৳ 35.00",
    category: "Antibiotic",
    useFor: "Prescribed bacterial infections",
    bnUseFor: "চিকিৎসকের পরামর্শে ব্যাকটেরিয়াজনিত সংক্রমণ",
  },
  {
    id: 15,
    name: "Bizoran",
    generic: "Amlodipine + Olmesartan",
    strength: "5mg / 20mg",
    type: "Tablet",
    price: "৳ 14.00",
    category: "Cardiac",
    useFor: "High blood pressure management",
    bnUseFor: "উচ্চ রক্তচাপ নিয়ন্ত্রণ",
  },
  {
    id: 9,
    name: "Ceevit",
    generic: "Ascorbic Acid",
    strength: "250mg",
    type: "Chewable Tablet",
    price: "৳ 2.00",
    category: "Vitamins",
    useFor: "Vitamin C supplementation",
    bnUseFor: "ভিটামিন সি-এর ঘাটতি পূরণ",
  },
  {
    id: 13,
    name: "Napa Syrup",
    generic: "Paracetamol",
    strength: "120mg / 5ml",
    type: "Syrup",
    price: "৳ 20.00",
    category: "Painkiller",
    useFor: "Pediatric fever & mild pain",
    bnUseFor: "শিশুদের জ্বর ও ব্যথা",
  },
  {
    id: 14,
    name: "Ceftriaxone",
    generic: "Ceftriaxone",
    strength: "1g",
    type: "IV / IM Injection",
    price: "৳ 150.00",
    category: "Antibiotic",
    useFor: "Hospital-supervised infection care",
    bnUseFor: "হাসপাতালের তত্ত্বাবধানে জীবাণু সংক্রমণ চিকিৎসা",
  },
];

export function MedicineMarqueeSection() {
  const { t, lang } = useLanguage();
  const isBn = lang === "bn";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredMedicines = MEDICINES.filter((med) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      med.name.toLowerCase().includes(q) ||
      med.generic.toLowerCase().includes(q);
    const matchesCategory =
      activeCategory === "All" || med.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section
      id="medicines"
      className="py-16 lg:py-24 bg-[#F8FAFC] border-y border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Clean Editorial Header */}
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0B6E99] mb-2.5">
            {t("Medicine Guide", "ওষুধের নির্দেশিকা")}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t(
              "Search Common Medicines & Generics",
              "সাধারণ ওষুধ ও জেনেরিক তথ্য খুঁজুন"
            )}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            {t(
              "Check generic compositions, common clinical uses, and indicative unit MRP in Bangladesh. Always confirm dosage with your physician or licensed pharmacist.",
              "বাংলাদেশে প্রচলিত ওষুধের জেনেরিক নাম, সাধারণ ব্যবহার এবং আনুমানিক একক মূল্য দেখুন। ব্যবহারের আগে ডাক্তার বা ফার্মাসিস্টের পরামর্শ নিশ্চিত করুন।"
            )}
          </p>
        </div>

        {/* Inline Search & Clean Category Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                "Search by brand or generic name...",
                "ব্র্যান্ড বা জেনেরিক নাম লিখুন..."
              )}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B6E99] focus:ring-2 focus:ring-[#0B6E99]/15 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const selected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selected
                      ? "bg-slate-900 text-white border border-slate-900"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {isBn ? cat.bnName : cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean 3-Column Medicine Grid */}
        {filteredMedicines.length === 0 ? (
          <div className="py-14 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm font-medium text-slate-600 mb-3">
              {t(
                "No medicines matched your search.",
                "আপনার খোঁজা অনুযায়ী কোনো ওষুধ পাওয়া যায়নি।"
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer hover:bg-slate-800 transition-colors"
            >
              {t("Reset Filters", "ফিল্টার রিসেট করুন")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedicines.map((med) => (
              <Link
                key={med.id}
                href={`/medicines?q=${encodeURIComponent(med.name)}`}
                className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0B6E99] transition-colors truncate">
                        {med.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                        {med.generic}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      {med.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    <span className="font-semibold text-slate-700">
                      {med.strength}
                    </span>
                    <span className="text-slate-300 mx-1.5">·</span>
                    <span>{isBn ? med.bnUseFor : med.useFor}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 tabular-nums">
                    {med.price}
                    <span className="font-normal text-slate-400 ml-1">
                      / {t("unit", "প্রতিটি")}
                    </span>
                  </span>
                  <span className="font-semibold text-[#0B6E99] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{t("Details", "বিস্তারিত")}</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            {t(
              "Indicative unit prices from DGDA reference listings; confirm current retail MRP at your pharmacy.",
              "মূল্যগুলো আনুমানিক একক খুচরা মূল্যের নির্দেশিকা; কেনার সময় ফার্মেসি থেকে বর্তমান মূল্য নিশ্চিত করুন।"
            )}
          </span>
          <Link
            href="/medicines"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B6E99] hover:text-[#09587A] transition-colors shrink-0"
          >
            <span>{t("Open Full Medicine Directory", "সম্পূর্ণ ওষুধ ডিরেক্টরি দেখুন")}</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
