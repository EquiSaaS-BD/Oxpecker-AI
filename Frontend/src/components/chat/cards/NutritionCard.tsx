"use client";

import { motion } from "framer-motion";
import { Utensils, Flame, Beef, Wheat, Droplets, Leaf, TrendingUp } from "lucide-react";

interface NutritionData {
  foods?: { name: string; portion: string; calories: number }[];
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  totalFiber?: number;
  healthScore?: number;
  mealType?: string;
  cuisineType?: string;
}

export function NutritionCard({ data }: { data: NutritionData }) {
  const scoreColor = (data.healthScore || 0) >= 7 
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
    : (data.healthScore || 0) >= 4 
      ? 'text-amber-600 bg-amber-50 border-amber-200' 
      : 'text-rose-600 bg-rose-50 border-rose-200';

  const macros = [
    { label: 'Calories', value: `${data.totalCalories || 0}`, unit: 'kcal', icon: Flame, color: 'text-orange-500 bg-orange-50' },
    { label: 'Protein', value: `${data.totalProtein || 0}`, unit: 'g', icon: Beef, color: 'text-rose-500 bg-rose-50' },
    { label: 'Carbs', value: `${data.totalCarbs || 0}`, unit: 'g', icon: Wheat, color: 'text-amber-500 bg-amber-50' },
    { label: 'Fat', value: `${data.totalFat || 0}`, unit: 'g', icon: Droplets, color: 'text-blue-500 bg-blue-50' },
    { label: 'Fiber', value: `${data.totalFiber || 0}`, unit: 'g', icon: Leaf, color: 'text-green-500 bg-green-50' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-[480px]"
    >
      {/* Header */}
      <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-800">
          <Utensils size={18} />
          <span className="font-bold text-[15px]">Nutrition Analysis</span>
        </div>
        {data.mealType && (
          <span className="text-[12px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-semibold capitalize">
            {data.mealType}
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Health Score */}
        {data.healthScore !== undefined && (
          <div className={`flex items-center justify-between p-3 rounded-xl border mb-4 ${scoreColor}`}>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              <span className="font-bold text-[14px]">Health Score</span>
            </div>
            <span className="text-[24px] font-black">{data.healthScore}/10</span>
          </div>
        )}

        {/* Macro Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {macros.map((m, i) => (
            <div key={i} className="text-center">
              <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center ${m.color} mb-1.5`}>
                <m.icon size={18} />
              </div>
              <p className="text-[16px] font-black text-slate-800">{m.value}</p>
              <p className="text-[10px] text-slate-500 font-medium">{m.unit}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Food Items */}
        {data.foods && data.foods.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Identified Foods</p>
            <div className="space-y-1.5">
              {data.foods.map((food, i) => (
                <div key={i} className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-700 font-medium">{food.name} <span className="text-slate-500">({food.portion})</span></span>
                  <span className="font-bold text-slate-600">{food.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
