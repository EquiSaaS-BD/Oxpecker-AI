"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  accentColor: string;
  iconBgColor: string;
}

export function StatsCard({ label, value, change, icon: Icon, accentColor, iconBgColor }: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <div
      className="doctor-stat-card bg-white rounded-xl border border-slate-200/80 p-5 cursor-default"
      style={{ "--stat-accent": accentColor } as React.CSSProperties}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
        <p className="text-[13px] text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
