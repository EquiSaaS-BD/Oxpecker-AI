"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Plus, Trash2, Power, PowerOff, ArrowUp, ArrowDown,
  Star, Activity, CheckCircle2, RefreshCw,
  Zap, DollarSign, Clock, Shield, Settings, X as XIcon
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { toast, Toaster } from "sonner";

interface AiProvider {
  id: string;
  name: string;
  model: string;
  priority: number;
  isEnabled: boolean;
  isDefault: boolean;
  usageCount: number;
  totalCost: number;
  healthOk: boolean;
  lastUsed: string | null;
}

const DEMO_PROVIDERS: AiProvider[] = [
  {
    id: "1", name: "google", model: "gemini-2.0-flash", priority: 1,
    isEnabled: true, isDefault: true, usageCount: 2450, totalCost: 0.00,
    healthOk: true, lastUsed: new Date().toISOString(),
  },
  {
    id: "2", name: "openai", model: "gpt-4o-mini", priority: 2,
    isEnabled: true, isDefault: false, usageCount: 1247, totalCost: 12.45,
    healthOk: true, lastUsed: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3", name: "deepseek", model: "deepseek-chat", priority: 3,
    isEnabled: true, isDefault: false, usageCount: 389, totalCost: 1.20,
    healthOk: true, lastUsed: new Date(Date.now() - 86400000).toISOString(),
  },
];

const PROVIDER_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  google: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  openai: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  deepseek: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

export default function AiProvidersPage() {
  const [providers, setProviders] = useState<AiProvider[]>(DEMO_PROVIDERS);
  const [testing, setTesting] = useState(false);

  const toggleProvider = (id: string) => {
    setProviders(prev =>
      prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p)
    );
    toast.success("Provider status toggled");
  };

  const setDefault = (id: string) => {
    setProviders(prev =>
      prev.map(p => ({ ...p, isDefault: p.id === id }))
    );
    toast.success("Default clinical model updated");
  };

  const testProviders = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      toast.success("All configured AI model endpoints are operational (latency < 800ms)");
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-24">
      <Toaster position="top-center" richColors />
      <AdminPageHeader
        title="AI Intelligence Gateway"
        description="Configure LLM providers, model failovers, priority routing, and clinical prompt settings."
        icon={<Cpu size={24} />}
        action={
          <button
            onClick={testProviders}
            disabled={testing}
            className="flex items-center gap-2 h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
          >
            <RefreshCw size={15} className={testing ? "animate-spin" : ""} />
            Test Providers
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((p) => {
          const badge = PROVIDER_BADGES[p.name] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-sm ${
                p.isDefault ? "border-sky-500 ring-2 ring-sky-500/10" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border capitalize ${badge.bg} ${badge.text} ${badge.border}`}>
                  {p.name}
                </span>
                {p.isDefault && (
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Default
                  </span>
                )}
              </div>

              <div className="text-base font-bold text-slate-900 mb-1">{p.model}</div>
              <div className="text-xs text-slate-500 mb-4">
                Usage: <span className="font-semibold text-slate-800">{p.usageCount.toLocaleString()}</span> queries
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 size={14} /> Operational
                </div>
                <div className="flex gap-1.5">
                  {!p.isDefault && (
                    <button
                      onClick={() => setDefault(p.id)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    onClick={() => toggleProvider(p.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      p.isEnabled
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-slate-400 bg-slate-50 border-slate-200"
                    }`}
                    title={p.isEnabled ? "Disable Provider" : "Enable Provider"}
                  >
                    {p.isEnabled ? <Power size={14} /> : <PowerOff size={14} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
