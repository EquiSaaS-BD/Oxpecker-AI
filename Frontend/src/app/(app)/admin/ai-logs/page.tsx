"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, Download, ChevronLeft, ChevronRight,
  MessageSquare, AlertTriangle, FileText, Image as ImageIcon,
  Clock, User, Cpu, Eye, Flag, CheckCircle2, XCircle,
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  provider: string;
  model: string;
  mode: string;
  userMessage: string;
  responsePreview: string;
  tokens: number;
  latency: number;
  status: "success" | "error" | "flagged";
  language: string;
  isEmergency: boolean;
}

// Demo log data
const DEMO_LOGS: LogEntry[] = [
  {
    id: "log-001", timestamp: new Date(Date.now() - 120000).toISOString(),
    userId: "u-101", userName: "Rafin Ahmed", provider: "openai", model: "gpt-4o-mini",
    mode: "symptom_checker", userMessage: "আমার মাথা ব্যথা এবং জ্বর হচ্ছে গত ২ দিন ধরে",
    responsePreview: "আপনার লক্ষণগুলো সাধারণ ভাইরাল ফিভারের ইঙ্গিত দিচ্ছে...",
    tokens: 847, latency: 1.2, status: "success", language: "bn", isEmergency: false,
  },
  {
    id: "log-002", timestamp: new Date(Date.now() - 360000).toISOString(),
    userId: "u-102", userName: "Fatima Khatun", provider: "openai", model: "gpt-4o-mini",
    mode: "medicine_search", userMessage: "Napa Extra ওষুধটি কিসের জন্য?",
    responsePreview: "Napa Extra (Paracetamol 500mg + Caffeine 65mg) হলো...",
    tokens: 623, latency: 0.9, status: "success", language: "bn", isEmergency: false,
  },
  {
    id: "log-003", timestamp: new Date(Date.now() - 600000).toISOString(),
    userId: "u-103", userName: "Karim Hasan", provider: "google", model: "gemini-2.0-flash",
    mode: "symptom_checker", userMessage: "I have severe chest pain and difficulty breathing",
    responsePreview: "⚠️ EMERGENCY: Your symptoms suggest a possible cardiac event...",
    tokens: 1245, latency: 1.8, status: "success", language: "en", isEmergency: true,
  },
  {
    id: "log-004", timestamp: new Date(Date.now() - 900000).toISOString(),
    userId: "u-104", userName: "Ayesha Begum", provider: "openai", model: "gpt-4o-mini",
    mode: "prescription", userMessage: "[Uploaded prescription image]",
    responsePreview: "প্রেসক্রিপশন অ্যানালাইসিস: ৩টি ওষুধ পাওয়া গেছে...",
    tokens: 1567, latency: 3.2, status: "success", language: "bn", isEmergency: false,
  },
  {
    id: "log-005", timestamp: new Date(Date.now() - 1200000).toISOString(),
    userId: "u-105", userName: "Rahim Uddin", provider: "deepseek", model: "deepseek-chat",
    mode: "general", userMessage: "How to cook biryani?",
    responsePreview: "I'm sorry. I am a specialised Medical AI Assistant and can only...",
    tokens: 89, latency: 0.4, status: "flagged", language: "en", isEmergency: false,
  },
  {
    id: "log-006", timestamp: new Date(Date.now() - 1500000).toISOString(),
    userId: "u-106", userName: "Nasrin Akter", provider: "openai", model: "gpt-4o-mini",
    mode: "nutrition", userMessage: "[Uploaded food image - rice and curry]",
    responsePreview: "খাবার শনাক্ত করা হয়েছে: ভাত, মুরগির তরকারি, ডাল...",
    tokens: 934, latency: 2.1, status: "success", language: "bn", isEmergency: false,
  },
  {
    id: "log-007", timestamp: new Date(Date.now() - 1800000).toISOString(),
    userId: "u-101", userName: "Rafin Ahmed", provider: "openai", model: "gpt-4o-mini",
    mode: "report", userMessage: "[Uploaded blood report]",
    responsePreview: "CBC Report Analysis: Hemoglobin 11.2 g/dL (Low)...",
    tokens: 1823, latency: 3.8, status: "success", language: "en", isEmergency: false,
  },
  {
    id: "log-008", timestamp: new Date(Date.now() - 2100000).toISOString(),
    userId: "u-107", userName: "Mohammad Ali", provider: "google", model: "gemini-2.0-flash",
    mode: "symptom_checker", userMessage: "আমার বুকে প্রচণ্ড ব্যথা হচ্ছে",
    responsePreview: "⚠️ ইমার্জেন্সি: আপনার লক্ষণগুলো হৃদরোগের ইঙ্গিত...",
    tokens: 1456, latency: 1.5, status: "success", language: "bn", isEmergency: true,
  },
  {
    id: "log-009", timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: "u-108", userName: "Sumaiya Islam", provider: "openai", model: "gpt-4o-mini",
    mode: "general", userMessage: "What is the capital of Bangladesh?",
    responsePreview: "I'm sorry, I can only answer healthcare-related questions...",
    tokens: 67, latency: 0.3, status: "flagged", language: "en", isEmergency: false,
  },
  {
    id: "log-010", timestamp: new Date(Date.now() - 5400000).toISOString(),
    userId: "u-109", userName: "Tanvir Rahman", provider: "openai", model: "gpt-4o-mini",
    mode: "medicine_search", userMessage: "Seclo 20mg vs Losectil 20mg কোনটা ভালো?",
    responsePreview: "উভয়ই Omeprazole 20mg ভিত্তিক ওষুধ। তুলনা করা যাক...",
    tokens: 1102, latency: 1.4, status: "success", language: "bn", isEmergency: false,
  },
];

const MODE_ICONS: Record<string, { icon: any; label: string; color: string }> = {
  symptom_checker: { icon: MessageSquare, label: "Symptom", color: "text-blue-600 bg-blue-50" },
  medicine_search: { icon: FileText, label: "Medicine", color: "text-purple-600 bg-purple-50" },
  nutrition: { icon: FileText, label: "Nutrition", color: "text-green-600 bg-green-50" },
  prescription: { icon: FileText, label: "Prescription", color: "text-indigo-600 bg-indigo-50" },
  report: { icon: FileText, label: "Report", color: "text-rose-600 bg-rose-50" },
  general: { icon: MessageSquare, label: "General", color: "text-slate-600 bg-slate-100" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  success: { bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle2 },
  error: { bg: "bg-rose-50", text: "text-rose-600", icon: XCircle },
  flagged: { bg: "bg-amber-50", text: "text-amber-600", icon: Flag },
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AiLogsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filteredLogs = DEMO_LOGS.filter(log => {
    if (search) {
      const q = search.toLowerCase();
      if (!log.userMessage.toLowerCase().includes(q) && !log.userName.toLowerCase().includes(q)) return false;
    }
    if (filterStatus !== "all" && log.status !== filterStatus) return false;
    if (filterMode !== "all" && log.mode !== filterMode) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-slate-800 tracking-tight">AI Audit Logs</h1>
          <p className="text-[15px] text-slate-500 mt-1">Review all Oxpecker AI interactions</p>
        </div>
        <button className="h-[42px] px-5 bg-white border border-slate-200 rounded-xl text-slate-600 text-[14px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by message or user..."
            className="w-full h-[44px] pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-[44px] px-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-600 font-medium outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="flagged">Flagged</option>
        </select>
        <select
          value={filterMode}
          onChange={e => setFilterMode(e.target.value)}
          className="h-[44px] px-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-600 font-medium outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Modes</option>
          <option value="symptom_checker">Symptom Checker</option>
          <option value="medicine_search">Medicine Search</option>
          <option value="nutrition">Nutrition</option>
          <option value="prescription">Prescription</option>
          <option value="report">Report</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-[13px] text-slate-500 font-medium">
        <span>{filteredLogs.length} entries</span>
        <span>•</span>
        <span className="text-emerald-600">{filteredLogs.filter(l => l.status === 'success').length} success</span>
        <span className="text-amber-600">{filteredLogs.filter(l => l.status === 'flagged').length} flagged</span>
        <span className="text-rose-600">{filteredLogs.filter(l => l.isEmergency).length} emergency</span>
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {filteredLogs.map((log) => {
          const mode = MODE_ICONS[log.mode] || MODE_ICONS.general;
          const status = STATUS_STYLES[log.status];
          const StatusIcon = status.icon;
          const isExpanded = expandedLog === log.id;

          return (
            <motion.div
              key={log.id}
              layout
              className={`bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer hover:shadow-sm ${
                log.isEmergency ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'
              }`}
              onClick={() => setExpandedLog(isExpanded ? null : log.id)}
            >
              {/* Row */}
              <div className="flex items-center gap-3 p-4">
                {/* Status */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${status.bg} ${status.text}`}>
                  <StatusIcon size={16} />
                </div>

                {/* User & Time */}
                <div className="w-[120px] shrink-0 hidden md:block">
                  <p className="text-[13px] font-semibold text-slate-700 truncate">{log.userName}</p>
                  <p className="text-[11px] text-slate-400">{timeAgo(log.timestamp)}</p>
                </div>

                {/* Mode */}
                <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold shrink-0 ${mode.color}`}>
                  {mode.label}
                </div>

                {/* Emergency badge */}
                {log.isEmergency && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-600 shrink-0">
                    <AlertTriangle size={12} /> Emergency
                  </span>
                )}

                {/* Message Preview */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-700 truncate font-medium">{log.userMessage}</p>
                </div>

                {/* Meta */}
                <div className="hidden lg:flex items-center gap-4 text-[12px] text-slate-400 shrink-0">
                  <span className="font-mono">{log.tokens} tok</span>
                  <span>{log.latency}s</span>
                  <span className="uppercase font-bold text-[10px]">{log.provider}</span>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-slate-100 px-4 py-4 bg-slate-50/50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">User Message</p>
                      <p className="text-[14px] text-slate-700 bg-white p-3 rounded-xl border border-slate-100">{log.userMessage}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Response Preview</p>
                      <p className="text-[14px] text-slate-700 bg-white p-3 rounded-xl border border-slate-100">{log.responsePreview}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-[13px]">
                    <span className="text-slate-500"><strong>User:</strong> {log.userName} ({log.userId})</span>
                    <span className="text-slate-500"><strong>Provider:</strong> {log.provider} / {log.model}</span>
                    <span className="text-slate-500"><strong>Tokens:</strong> {log.tokens}</span>
                    <span className="text-slate-500"><strong>Latency:</strong> {log.latency}s</span>
                    <span className="text-slate-500"><strong>Language:</strong> {log.language.toUpperCase()}</span>
                    <span className="text-slate-500"><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-[13px] text-slate-400">Showing 1-{filteredLogs.length} of {filteredLogs.length} entries</p>
        <div className="flex gap-1">
          <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30" disabled>
            <ChevronLeft size={16} />
          </button>
          <button className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-[13px]">1</button>
          <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30" disabled>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
