"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Plus, Trash2, Power, PowerOff, ArrowUp, ArrowDown,
  Star, Activity, AlertCircle, CheckCircle2, RefreshCw,
  Zap, DollarSign, Clock, Shield, Settings, ChevronDown,
} from "lucide-react";

// Types
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

// Demo providers data
const DEMO_PROVIDERS: AiProvider[] = [
  {
    id: "1", name: "openai", model: "gpt-4o-mini", priority: 1,
    isEnabled: true, isDefault: true, usageCount: 1247, totalCost: 12.45,
    healthOk: true, lastUsed: new Date().toISOString(),
  },
  {
    id: "2", name: "google", model: "gemini-2.0-flash", priority: 2,
    isEnabled: true, isDefault: false, usageCount: 389, totalCost: 3.20,
    healthOk: true, lastUsed: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3", name: "deepseek", model: "deepseek-chat", priority: 3,
    isEnabled: false, isDefault: false, usageCount: 56, totalCost: 0.45,
    healthOk: false, lastUsed: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "4", name: "anthropic", model: "claude-sonnet-4-20250514", priority: 4,
    isEnabled: false, isDefault: false, usageCount: 0, totalCost: 0,
    healthOk: true, lastUsed: null,
  },
];

const PROVIDER_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  openai: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "🟢" },
  google: { bg: "bg-blue-50", text: "text-blue-700", icon: "🔵" },
  deepseek: { bg: "bg-violet-50", text: "text-violet-700", icon: "🟣" },
  anthropic: { bg: "bg-amber-50", text: "text-amber-700", icon: "🟠" },
};

const MODEL_OPTIONS: Record<string, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  google: ["gemini-2.0-flash", "gemini-2.0-pro", "gemini-1.5-flash"],
  deepseek: ["deepseek-chat", "deepseek-coder"],
  anthropic: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
};

export default function AiProvidersPage() {
  const [providers, setProviders] = useState<AiProvider[]>(DEMO_PROVIDERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [checking, setChecking] = useState(false);

  const toggleProvider = (id: string) => {
    setProviders(prev =>
      prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p)
    );
  };

  const setDefault = (id: string) => {
    setProviders(prev =>
      prev.map(p => ({ ...p, isDefault: p.id === id }))
    );
  };

  const removeProvider = (id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
  };

  const movePriority = (id: string, direction: 'up' | 'down') => {
    setProviders(prev => {
      const sorted = [...prev].sort((a, b) => a.priority - b.priority);
      const idx = sorted.findIndex(p => p.id === id);
      if (direction === 'up' && idx > 0) {
        const temp = sorted[idx].priority;
        sorted[idx].priority = sorted[idx - 1].priority;
        sorted[idx - 1].priority = temp;
      } else if (direction === 'down' && idx < sorted.length - 1) {
        const temp = sorted[idx].priority;
        sorted[idx].priority = sorted[idx + 1].priority;
        sorted[idx + 1].priority = temp;
      }
      return sorted.sort((a, b) => a.priority - b.priority);
    });
  };

  const runHealthCheck = async () => {
    setChecking(true);
    await new Promise(r => setTimeout(r, 2000));
    setProviders(prev =>
      prev.map(p => ({
        ...p,
        healthOk: p.isEnabled ? Math.random() > 0.2 : p.healthOk,
      }))
    );
    setChecking(false);
  };

  const totalUsage = providers.reduce((s, p) => s + p.usageCount, 0);
  const totalCost = providers.reduce((s, p) => s + p.totalCost, 0);
  const activeCount = providers.filter(p => p.isEnabled).length;

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-slate-800 tracking-tight">AI Provider Management</h1>
          <p className="text-[15px] text-slate-500 mt-1">Configure and monitor AI providers for Oxpecker AI</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runHealthCheck}
            disabled={checking}
            className="h-[42px] px-4 bg-white border border-slate-200 rounded-xl text-slate-600 text-[14px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={checking ? "animate-spin" : ""} /> Health Check
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-[42px] px-5 bg-primary text-white rounded-xl text-[14px] font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-md"
          >
            <Plus size={16} /> Add Provider
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: totalUsage.toLocaleString(), icon: Zap, color: "text-blue-600 bg-blue-50" },
          { label: "Total Cost", value: `$${totalCost.toFixed(2)}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
          { label: "Active Providers", value: `${activeCount}/${providers.length}`, icon: Activity, color: "text-violet-600 bg-violet-50" },
          { label: "Failover Ready", value: activeCount >= 2 ? "Yes" : "No", icon: Shield, color: activeCount >= 2 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[24px] font-black text-slate-800">{stat.value}</p>
            <p className="text-[13px] text-slate-400 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Provider Cards */}
      <div className="space-y-3">
        <h2 className="text-[18px] font-bold text-slate-700">Providers</h2>
        {providers.sort((a, b) => a.priority - b.priority).map((provider, idx) => {
          const colors = PROVIDER_COLORS[provider.name] || PROVIDER_COLORS.openai;
          return (
            <motion.div
              key={provider.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border rounded-2xl p-5 transition-all ${
                provider.isEnabled ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Provider Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[24px] ${colors.bg} shrink-0`}>
                    {colors.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-[16px] capitalize ${colors.text}`}>{provider.name}</h3>
                      {provider.isDefault && (
                        <span className="text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">DEFAULT</span>
                      )}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        provider.healthOk ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {provider.healthOk ? '● Healthy' : '● Unhealthy'}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-400 font-mono mt-0.5">{provider.model}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <p className="text-[18px] font-black text-slate-800">{provider.usageCount.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Requests</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-black text-slate-800">${provider.totalCost.toFixed(2)}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Cost</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-black text-slate-800">P{provider.priority}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Priority</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => movePriority(provider.id, 'up')} disabled={idx === 0}
                    className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => movePriority(provider.id, 'down')} disabled={idx === providers.length - 1}
                    className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                    <ArrowDown size={16} />
                  </button>
                  <button onClick={() => setDefault(provider.id)}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                      provider.isDefault ? 'bg-primary/10 border-primary/30 text-primary' : 'border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}>
                    <Star size={16} />
                  </button>
                  <button onClick={() => toggleProvider(provider.id)}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                      provider.isEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-slate-200 text-slate-400 hover:text-emerald-500'
                    }`}>
                    {provider.isEnabled ? <Power size={16} /> : <PowerOff size={16} />}
                  </button>
                  <button onClick={() => removeProvider(provider.id)}
                    className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Provider Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-[480px] shadow-2xl"
            >
              <h2 className="text-[22px] font-black text-slate-800 mb-6">Add AI Provider</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Provider</label>
                  <select className="w-full h-[48px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    <option value="openai">OpenAI</option>
                    <option value="google">Google Gemini</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="anthropic">Anthropic Claude</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">API Key</label>
                  <input type="password" placeholder="sk-..." className="w-full h-[48px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Model</label>
                  <select className="w-full h-[48px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 h-[48px] border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => setShowAddModal(false)} className="flex-1 h-[48px] bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md">
                    Add Provider
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
