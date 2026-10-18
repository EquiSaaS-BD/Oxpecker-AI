"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Bell,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function HospitalSettingsPage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    hospitalName: user?.name || "Dhaka Central Hospital",
    regNo: "DGHS-REG-2024-8902",
    contactPhone: user?.phone || "+880 2-9876543",
    emergencyHotline: "+880 1711-999111",
    ambulanceHotline: "+880 1711-999222",
    email: user?.email || "admin@dhakacentral.com",
    address: user?.address || "House 42, Road 9/A, Dhanmondi, Dhaka-1209",
    totalCapacityBeds: 500,
    icuBeds: 35,
    autoAlertOnIcuCapacity: true,
    smsAlertsEmergency: true,
    emailDailyDigest: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Hospital configuration updated successfully!");
    }, 600);
  };

  return (
    <div className="w-full space-y-6 pb-12 max-w-4xl">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hospital Settings & Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">Manage institutional credentials, hotlines, capacity thresholds, and alerts.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Facility Information Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 size={20} className="text-emerald-600" />
            <h2 className="text-base font-bold text-slate-800">Facility Credentials</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Hospital / Clinic Legal Name</label>
              <input
                type="text"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">DGHS Registration / License #</label>
              <input
                type="text"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Hospital Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">General Reception Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Physical Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Emergency Hotlines Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Phone size={20} className="text-emerald-600" />
            <h2 className="text-base font-bold text-slate-800">24/7 Emergency Hotlines</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Emergency Triage Hotline</label>
              <input
                type="tel"
                value={formData.emergencyHotline}
                onChange={(e) => setFormData({ ...formData, emergencyHotline: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-bold text-rose-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Ambulance Dispatch Helpline</label>
              <input
                type="tel"
                value={formData.ambulanceHotline}
                onChange={(e) => setFormData({ ...formData, ambulanceHotline: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-bold text-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Capacity & Notification Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Bell size={20} className="text-emerald-600" />
            <h2 className="text-base font-bold text-slate-800">Capacity & Alert Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Total Bed Capacity</label>
              <input
                type="number"
                value={formData.totalCapacityBeds}
                onChange={(e) => setFormData({ ...formData, totalCapacityBeds: Number(e.target.value) })}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Total ICU Bed Allocation</label>
              <input
                type="number"
                value={formData.icuBeds}
                onChange={(e) => setFormData({ ...formData, icuBeds: Number(e.target.value) })}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoAlertOnIcuCapacity}
                onChange={(e) => setFormData({ ...formData, autoAlertOnIcuCapacity: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">
                Trigger high-priority alert when ICU occupancy exceeds 90%
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.smsAlertsEmergency}
                onChange={(e) => setFormData({ ...formData, smsAlertsEmergency: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">
                Send SMS notifications to Head of Emergency for critical break-glass records
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailDailyDigest}
                onChange={(e) => setFormData({ ...formData, emailDailyDigest: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">
                Email daily summary digest of admissions and financial collections
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
