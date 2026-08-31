"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  Settings, Database, RotateCcw, AlertTriangle, CheckCircle2,
  Download, Shield, Server, RefreshCw, Radio
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/lib/supabase";

export default function AdminSettingsPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");
  const [profileCount, setProfileCount] = useState<number | null>(null);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setDbStatus("checking");
    try {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (error) {
        setDbStatus("error");
      } else {
        setDbStatus("connected");
        setProfileCount(count ?? 0);
      }
    } catch {
      setDbStatus("error");
    }
  };

  const handleExportBackup = () => {
    try {
      let users = [];
      let bookings = [];
      try {
        users = JSON.parse(localStorage.getItem("oxpecker_users") || "[]");
      } catch {
        users = [];
      }
      try {
        bookings = JSON.parse(localStorage.getItem("oxpecker_bookings") || "[]");
      } catch {
        bookings = [];
      }
      const data = {
        users,
        bookings,
        timestamp: new Date().toISOString(),
        platform: "Oxpecker AI",
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `oxpecker-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      toast.success("Database snapshot downloaded successfully.");
    } catch {
      toast.error("Failed to export backup.");
    }
  };

  const handleResetDatabase = () => {
    if (!confirm("Are you sure you want to reset all local cached data? This will re-seed default accounts.")) return;
    setIsResetting(true);

    const keysToRemove = [
      "oxpecker_user",
      "oxpecker_users",
      "oxpecker_bookings",
      "oxpecker_invites",
      "oxpecker_assistants",
      "oxpecker_chat_history"
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));

    setTimeout(() => {
      setIsResetting(false);
      toast.success("Local state reset. Re-seeding defaults...");
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-24">
      <Toaster position="top-center" richColors />
      <AdminPageHeader
        title="System Governance & Settings"
        description="Manage database connections, security parameters, system maintenance, and cloud backups."
        icon={<Settings size={24} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Database Status */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-700 rounded-2xl flex items-center justify-center shrink-0 border border-sky-100">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Cloud PostgreSQL Database</h3>
                {dbStatus === "connected" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 size={12} /> Connected (Supabase)
                  </span>
                ) : dbStatus === "checking" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <RefreshCw size={12} className="animate-spin" /> Checking
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    Local Storage Mode
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed max-w-2xl">
                Active project: <code className="font-mono text-slate-800 font-bold">nisjigguleygbjcvfmbb.supabase.co</code>.
                Synchronizing user profiles, bookings, live queue tokens, and role-based permissions with automatic keep-alive heartbeat.
              </p>
              {profileCount !== null && (
                <div className="mt-3 text-xs font-semibold text-slate-500">
                  Total Synced Profiles: <span className="text-slate-900 font-bold">{profileCount}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={checkDatabase}
              className="flex items-center gap-1.5 px-4 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={14} className={dbStatus === "checking" ? "animate-spin" : ""} />
              Test Connection
            </button>
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-4 h-10 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Download size={14} />
              Export Snapshot
            </button>
          </div>
        </div>

        {/* System Policies */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-sky-700" />
            Security & Registration Controls
          </h3>
          <div className="space-y-4 divide-y divide-slate-100">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-800">Public Patient Registration</h4>
                <p className="text-xs text-slate-500 mt-0.5">Allow public patients to create accounts via portal.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Enabled
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-800">Doctor Verification Requirement</h4>
                <p className="text-xs text-slate-500 mt-0.5">Require BMDC verification before doctor profile listing.</p>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                Active
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-800">Emergency Red Flag Filter</h4>
                <p className="text-xs text-slate-500 mt-0.5">Rule-based clinical intercept for critical patient symptoms.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Enforced
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-800">Automated Supabase Keep-Alive Cron</h4>
                <p className="text-xs text-slate-500 mt-0.5">Scheduled GitHub Actions ping every 3 days.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Running
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="text-rose-600" size={18} />
              Maintenance & Reset
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Factory reset will flush the local storage caches and re-seed default admin, doctor, hospital, and assistant credentials.
            </p>
          </div>
          <button
            onClick={handleResetDatabase}
            disabled={isResetting}
            className="w-full h-11 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-rose-200 hover:border-transparent"
          >
            <RotateCcw size={15} className={isResetting ? "animate-spin" : ""} />
            {isResetting ? "Resetting State..." : "Reset Local Cache"}
          </button>
        </div>
      </div>
    </div>
  );
}
