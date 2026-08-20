import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface PageLayoutProps {
  title: string;
  breadcrumb: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function PageLayout({ title, breadcrumb, lastUpdated, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-slate-200 selection:text-slate-900">
      <Navbar />

      <main className="flex-1 pt-[72px]">
        {/* ── Light Mode Hero Banner ── */}
        <div className="bg-slate-100 relative overflow-hidden py-16 sm:py-24 border-b border-slate-200">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 mb-6 uppercase tracking-wide">
              <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-slate-900">{breadcrumb}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tighter mb-4 drop-shadow-sm">
              {title}
            </h1>
            
            {lastUpdated && (
              <p className="text-slate-500 font-medium text-sm mt-6">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
        </div>

        {/* ── Content Card ── */}
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20 pb-20">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-8 sm:p-12 lg:p-16 border border-slate-200">
            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-3xl prose-h2:text-slate-900 prose-h2:mt-10 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-sky-600 hover:prose-a:text-sky-700 prose-li:text-slate-600">
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
