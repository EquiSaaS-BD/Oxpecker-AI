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
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1 pt-[72px]">
        {/* ── Hero Banner ── */}
        <div className="bg-[#050b14] relative overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#050b14] to-primary/10 opacity-80" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-cyan-400/80 mb-6">
              <Link href="/" className="hover:text-cyan-300 transition-colors">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white/60">{breadcrumb}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-xl mb-4">
              {title}
            </h1>
            
            {lastUpdated && (
              <p className="text-white/40 text-sm mt-6">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
        </div>

        {/* ── Content Card ── */}
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20 pb-20">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-10 lg:p-12 border border-slate-100">
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:text-slate-800 prose-h2:mt-10 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-[#002d75] prose-li:text-slate-600">
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
