"use client";

import React, { Suspense, Component, type ReactNode } from "react";
import { RefreshCw, QrCode } from "lucide-react";
import Link from "next/link";
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
    console.error("Hospital HealthPass crash captured by boundary:", error, errorInfo);
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
          <h2 className="text-lg font-black text-slate-900">Emergency HealthPass Display Refresh Required</h2>
          <p className="text-xs text-slate-500">
            Please refresh the clinical registry view to reload cached HealthPass verification records.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Clear Cache & Reload View</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function HospitalHealthPassContent() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex justify-end">
        <Link
          href="/emergency-reader"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
        >
          <QrCode size={14} className="text-rose-600" />
          <span>জরুরি অফলাইন ট্রায়াজ রিডার (Emergency Reader)</span>
        </Link>
      </div>
      <HealthPassSearchEngine portalRole="hospital" />
    </div>
  );
}

export default function HospitalHealthPassPage() {
  return (
    <HealthPassErrorBoundary>
      <Suspense fallback={<div className="p-8 flex justify-center"><MedicalLoader text="Connecting to HealthPass Core..." /></div>}>
        <HospitalHealthPassContent />
      </Suspense>
    </HealthPassErrorBoundary>
  );
}
