"use client";

import React, { Suspense, Component, type ReactNode } from "react";
import { CreditCard, Stethoscope, ShieldCheck, HeartPulse, RefreshCw } from "lucide-react";
import { HealthPassSearchEngine } from "@/components/health-card/HealthPassSearchEngine";
import { MedicalLoader } from "@/components/shared/MedicalLoader";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class HealthPassErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("HealthPass crash captured by boundary:", error, errorInfo);
  }

  handleReset = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("oxpecker_healthpass_cards");
      } catch {}
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto my-12 bg-white border border-rose-200 rounded-3xl text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-lg font-black text-slate-900">ইমার্জেন্সি হেলথপাস ডিসপ্লে রিফ্রেশ প্রয়োজন</h2>
          <p className="text-xs text-slate-500">
            ব্রাউজারের সাময়িক স্ক্রিপ্ট ক্যাশের কারণে পৃষ্ঠাটি রিফ্রেশ করা প্রয়োজন। নিচের বাটনে ক্লিক করুন।
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>ক্যাশ ক্লিয়ার ও রিফ্রেশ করুন (Reload)</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DoctorHealthPassContent() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Emergency HealthPass Portal
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              রোগীর NID, ফোন নম্বর, জন্ম তারিখ বা কার্ড আইডি দিয়ে জরুরি ক্লিনিক্যাল হিস্ট্রি ও এলার্জি চেক করুন
            </p>
          </div>
        </div>
      </div>

      <HealthPassSearchEngine
        portalRole="doctor"
        title="Doctor Clinical Emergency Lookup"
        subtitle="প্রেসক্রিপশন লেখার পূর্বে অথবা জরুরি বিভাগে রোগীর এনআইডি, ফোন বা জন্মতারিখ দিয়ে তাৎক্ষণিক কার্ড ডসিয়ার চেক করুন"
      />
    </div>
  );
}

export default function DoctorHealthPassPage() {
  return (
    <HealthPassErrorBoundary>
      <Suspense fallback={<div className="p-8 flex justify-center"><MedicalLoader text="লোড হচ্ছে..." /></div>}>
        <DoctorHealthPassContent />
      </Suspense>
    </HealthPassErrorBoundary>
  );
}
