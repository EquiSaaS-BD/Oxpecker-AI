"use client";

import { motion } from "framer-motion";
import { 
  Utensils, Flame, Beef, Wheat, Droplets, Leaf, 
  TrendingUp, ShieldCheck, ShieldAlert, Sparkles, 
  Globe2, CheckCircle2, AlertTriangle, Info
} from "lucide-react";

export interface NutritionData {
  foodName?: string;
  banglaName?: string;
  englishName?: string;
  category?: string;
  portion?: string;
  servingGrams?: number;
  foods?: { name: string; portion: string; calories: number }[];
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  totalFiber?: number;
  healthScore?: number;
  mealType?: string;
  cuisineType?: string;
  vitamins?: string[];
  safetyAnalysis?: {
    formalinRisk?: "Low" | "Moderate" | "High" | string;
    formalinScore?: number;
    chemicalRisk?: string;
    ripeningType?: string;
    visualIndicators?: string[];
    safetyTips?: string;
  };
  carbonFootprint?: {
    co2Grams?: number;
    ecoGrade?: string;
    ecoLevel?: string;
    explanation?: string;
  };
  healthBenefits?: string[];
  diseaseSuitability?: {
    diabetes?: string;
    hypertension?: string;
    kidney?: string;
    weightLoss?: string;
  };
  storageAdvice?: string;
}

export function NutritionCard({ data }: { data: NutritionData }) {
  const score = data.healthScore || 8;
  const scoreColor = score >= 7 
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
    : score >= 4 
      ? 'text-amber-700 bg-amber-50 border-amber-200' 
      : 'text-rose-700 bg-rose-50 border-rose-200';

  const formalinRisk = data.safetyAnalysis?.formalinRisk || "Low";
  const isFormalinSafe = formalinRisk.toLowerCase().includes("low") || formalinRisk.toLowerCase().includes("কম");
  const formalinColor = isFormalinSafe 
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
    : 'bg-rose-50 border-rose-200 text-rose-800';

  const macros = [
    { label: 'Calories', value: `${data.totalCalories || 0}`, unit: 'kcal', icon: Flame, color: 'text-orange-600 bg-orange-50' },
    { label: 'Protein', value: `${data.totalProtein || 0}`, unit: 'g', icon: Beef, color: 'text-rose-600 bg-rose-50' },
    { label: 'Carbs', value: `${data.totalCarbs || 0}`, unit: 'g', icon: Wheat, color: 'text-amber-600 bg-amber-50' },
    { label: 'Fat', value: `${data.totalFat || 0}`, unit: 'g', icon: Droplets, color: 'text-blue-600 bg-blue-50' },
    { label: 'Fiber', value: `${data.totalFiber || 0}`, unit: 'g', icon: Leaf, color: 'text-emerald-600 bg-emerald-50' },
  ];

  const displayName = data.banglaName 
    ? `${data.banglaName} ${data.englishName ? `(${data.englishName})` : ''}` 
    : (data.foodName || "Food Analysis");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm max-w-[540px] my-2"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-sky-500/10 border-b border-emerald-100/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-900 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Utensils size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-[14px] text-slate-900 truncate">{displayName}</h4>
            <p className="text-[11px] text-slate-500">{data.portion || "১ পরিবেশন (Portion)"}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {data.carbonFootprint && (
            <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Leaf size={11} /> Eco {data.carbonFootprint.ecoGrade || "A+"}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3.5">
        {/* Top Badges: Formalin Safety & Health Score */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Formalin Adulteration Safety */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${formalinColor}`}>
            <div className="shrink-0">
              {isFormalinSafe ? <ShieldCheck size={20} className="text-emerald-600" /> : <ShieldAlert size={20} className="text-rose-600" />}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">ফরমালিন ও রাসায়নিক ঝুঁকি</div>
              <div className="text-xs font-extrabold truncate">
                {isFormalinSafe ? "নিরাপদ / কম ঝুঁকি" : "সতর্কতা প্রয়োজন"} 
                {data.safetyAnalysis?.formalinScore && ` (${data.safetyAnalysis.formalinScore}% Safe)`}
              </div>
            </div>
          </div>

          {/* Health Score */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${scoreColor}`}>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">হেলথ স্কোর</div>
                <div className="text-xs font-extrabold">পুষ্টি সূচক</div>
              </div>
            </div>
            <span className="text-lg font-black">{score}/10</span>
          </div>
        </div>

        {/* Macro Grid */}
        <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-50/80 rounded-xl border border-slate-100">
          {macros.map((m, i) => (
            <div key={i} className="text-center py-1">
              <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center ${m.color} mb-1 shadow-xs`}>
                <m.icon size={15} />
              </div>
              <p className="text-[14px] font-black text-slate-800 leading-tight">{m.value}</p>
              <p className="text-[9px] text-slate-500 font-semibold">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Carbon Footprint Snapshot */}
        {data.carbonFootprint && (
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900">
              <Globe2 size={15} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">কার্বন নির্গমন: {data.carbonFootprint.co2Grams || 220}g CO₂e</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
              {data.carbonFootprint.ecoLevel || "পরিবেশবান্ধব"}
            </span>
          </div>
        )}

        {/* Health Benefits (if any) */}
        {data.healthBenefits && data.healthBenefits.length > 0 && (
          <div className="border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
              <Sparkles size={13} className="text-amber-500" />
              <span>প্রধান স্বাস্থ্য উপকারিতা:</span>
            </div>
            <div className="space-y-1">
              {data.healthBenefits.slice(0, 3).map((benefit, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[12px] text-slate-600 leading-relaxed">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety & Washing Tip */}
        {data.safetyAnalysis?.safetyTips && (
          <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 text-[11px] text-sky-900 flex items-start gap-2">
            <Info size={14} className="text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">ফরমালিন মুক্তকরণ ও ধোয়ার নিয়ম: </span>
              {data.safetyAnalysis.safetyTips}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
