"use client";
import React from "react";

export const StatsBento = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 w-full mb-8">
      {/* Primary Stat */}
      <div className="md:col-span-3 md:row-span-2 bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative shadow-lg">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[repeating-linear-gradient(45deg,#475569_0px_1px,transparent_1px_10px)] opacity-10 mask-[radial-gradient(ellipse_80%_50%_at_100%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>
        <div>
          <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-6 border border-white/5">
            Platform Adoption
          </span>
          <h3 className="text-5xl sm:text-6xl tracking-tighter text-slate-900 font-black">
            24,592
          </h3>
        </div>
        <div className="mt-8">
          <p className="text-emerald-600 font-bold mb-1 flex items-center gap-1 text-sm">
            ↑ 12% vs last month
          </p>
          <p className="text-slate-500 text-sm max-w-xs font-medium leading-relaxed">
            Active patients and healthcare providers relying on Oxpecker AI.
          </p>
        </div>
      </div>

      {/* Secondary Stat A */}
      <div className="md:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm">
        <div className="mb-6 sm:mb-0">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Revenue Growth
          </p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">৳ 1.2M</p>
          <p className="text-emerald-600 font-semibold text-sm mt-1">↑ +24% M-o-M</p>
        </div>
        <div className="flex gap-1.5 items-end h-16 sm:h-12 w-full sm:w-auto overflow-hidden">
          {[20, 30, 25, 45, 60, 50, 75, 70, 90, 85, 100].map((h, i) => (
            <div
              key={i}
              className="w-2 sm:w-1.5 bg-sky-600 rounded-full transition-all duration-500 hover:bg-sky-400"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Tertiary Stat B */}
      <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-center text-center shadow-sm">
        <p className="text-3xl font-black text-slate-900 mb-1">99.9%</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Uptime
        </p>
      </div>

      {/* Tertiary Stat C */}
      <div className="md:col-span-2 bg-sky-50 rounded-3xl p-6 flex items-center gap-4 border border-sky-100 shadow-sm">
        <div className="w-12 h-12 text-2xl rounded-full bg-white text-sky-600 flex items-center justify-center shrink-0 shadow-sm border border-sky-100 font-black">
          AI
        </div>
        <div>
          <p className="text-lg font-black text-sky-900 leading-none mb-1.5">3.4M+</p>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-600">
            AI Predictions Made
          </p>
        </div>
      </div>
    </div>
  );
};
