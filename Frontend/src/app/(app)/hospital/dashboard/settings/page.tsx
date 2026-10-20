"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  BedDouble, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  Ambulance, 
  FileText, 
  Key, 
  Smartphone,
  Eye,
  EyeOff,
  BellRing,
  Sparkles,
  LogOut
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type TabType = "general" | "beds" | "emergency" | "security" | "billing";

export default function HospitalSettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isSaving, setIsSaving] = useState(false);

  // --- General Hospital Settings ---
  const [hospitalName, setHospitalName] = useState(user?.hospital_name || user?.name || "Oxpecker Specialized Hospital");
  const [regNo, setRegNo] = useState("DGHS-REG-2024-88412");
  const [hospitalType, setHospitalType] = useState("Specialized Tertiary Hospital");
  const [email, setEmail] = useState(user?.email || "admin@oxpeckerhospital.com");
  const [hotline, setHotline] = useState(user?.phone || "+880 1711-000000");
  const [ambulancePhone, setAmbulancePhone] = useState("+880 1700-112233");
  const [address, setAddress] = useState(user?.address || "House 42, Road 9/A, Dhanmondi, Dhaka-1209");
  const [website, setWebsite] = useState("https://oxpecker.ai");

  // --- Bed & ICU Operations Settings ---
  const [totalGeneralBeds, setTotalGeneralBeds] = useState(350);
  const [totalIcuBeds, setTotalIcuBeds] = useState(30);
  const [totalCcuBeds, setTotalCcuBeds] = useState(20);
  const [ventilatorCount, setVentilatorCount] = useState(25);
  const [bedBufferAlert, setBedBufferAlert] = useState(85);
  const [oxygenCentralActive, setOxygenCentralActive] = useState(true);

  // --- Emergency HealthPass Settings ---
  const [healthPassAutoTriage, setHealthPassAutoTriage] = useState(true);
  const [smsCriticalAlert, setSmsCriticalAlert] = useState(true);
  const [emergencyChiefDoctor, setEmergencyChiefDoctor] = useState("Dr. Anisur Rahman (Senior Consultant, Emergency)");
  const [triageProtocolLevel, setTriageProtocolLevel] = useState("Level 1 (Highest Priority)");

  // --- Security Settings ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // --- Billing & Payout Settings ---
  const [bankName, setBankName] = useState("City Bank Limited");
  const [accountNumber, setAccountNumber] = useState("11029837482910");
  const [branchName, setBranchName] = useState("Dhanmondi Branch");
  const [routingNumber, setRoutingNumber] = useState("225271892");
  const [bkashMerchant, setBkashMerchant] = useState("01711998877");
  const [nagadMerchant, setNagadMerchant] = useState("01811998877");
  const [autoInvoice, setAutoInvoice] = useState(true);

  // Load from Supabase or localStorage on mount
  useEffect(() => {
    async function loadData() {
      try {
        if (user?.id) {
          const { data: hosp } = await supabase
            .from("hospitals")
            .select("*")
            .or(`profile_id.eq.${user.id},email.eq.${user.email}`)
            .maybeSingle();

          if (hosp) {
            if (hosp.name) setHospitalName(hosp.name);
            if (hosp.email) setEmail(hosp.email);
            if (hosp.phone) setHotline(hosp.phone);
            if (hosp.address) setAddress(hosp.address);
          }
        }
      } catch (e) {
        console.warn("Could not load hospital settings from DB:", e);
      }
    }
    loadData();
  }, [user]);

  // Save Settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Update Supabase profiles table
      if (user?.id) {
        await supabase
          .from("profiles")
          .update({
            name: hospitalName,
            hospital_name: hospitalName,
            phone: hotline,
            address: address,
          })
          .eq("id", user.id);
      }

      // 2. Update Supabase hospitals table if exists
      try {
        await supabase
          .from("hospitals")
          .update({
            name: hospitalName,
            phone: hotline,
            address: address,
          })
          .or(`profile_id.eq.${user?.id},email.eq.${user?.email}`);
      } catch {}

      // 3. Update User Auth Context
      updateUser({
        ...user,
        name: hospitalName,
        hospital_name: hospitalName,
        phone: hotline,
        address: address,
      } as any);

      toast.success("Hospital configuration updated successfully!");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "general" as const, label: "General & Identity", icon: Building2 },
    { id: "beds" as const, label: "Beds & Capacity", icon: BedDouble },
    { id: "emergency" as const, label: "HealthPass & Emergency", icon: Ambulance },
    { id: "security" as const, label: "Security & Access", icon: Lock },
    { id: "billing" as const, label: "Payouts & Finance", icon: CreditCard },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck size={13} />
              Hospital Portal Settings
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hospital System Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure hospital operational parameters, bed thresholds, emergency protocols, and billing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveSettings()}
          disabled={isSaving}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm shrink-0 disabled:opacity-70 cursor-pointer"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
        </button>
      </div>

      {/* Hospital Administrator Profile Session Card (Relocated from Sidebar) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-extrabold text-2xl shadow-xs shrink-0">
            {user?.name?.charAt(0) || user?.hospital_name?.charAt(0) || "H"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                {user?.hospital_name || user?.name || "Hospital Administrator"}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ShieldCheck size={12} /> Verified
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Role: <strong className="text-slate-700">Administrator</strong> • Email: <span className="text-slate-600">{user?.email || "hospital@oxpecker.ai"}</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Active Hospital Operations Management Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={logout}
            className="h-9 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon size={16} className={isSelected ? "text-emerald-600" : "text-slate-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {/* TAB 1: GENERAL & IDENTITY */}
          {activeTab === "general" && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Hospital General Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">Primary identity, licensing and institutional communication channels.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Hospital Legal Name</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">DGHS License / Registration No</label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Institution Type</label>
                  <select
                    value={hospitalType}
                    onChange={(e) => setHospitalType(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  >
                    <option value="Specialized Tertiary Hospital">Specialized Tertiary Hospital</option>
                    <option value="General Hospital">General Hospital</option>
                    <option value="Medical College & Hospital">Medical College & Hospital</option>
                    <option value="Cardiac & Specialized Center">Cardiac & Specialized Center</option>
                    <option value="Diagnostic & Consultation Center">Diagnostic & Consultation Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Official Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Helpline / Desk Contact Phone</label>
                  <input
                    type="text"
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">24/7 Dedicated Ambulance Hotline</label>
                  <input
                    type="text"
                    value={ambulancePhone}
                    onChange={(e) => setAmbulancePhone(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Physical Location / Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: BEDS & CAPACITY */}
          {activeTab === "beds" && (
            <motion.div
              key="beds"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Bed Allocation & Critical Capacity</h2>
                <p className="text-xs text-slate-500 mt-0.5">Control operational bed units, ICU capabilities, and occupancy warning triggers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">General Inpatient Beds</span>
                  <input
                    type="number"
                    value={totalGeneralBeds}
                    onChange={(e) => setTotalGeneralBeds(Number(e.target.value))}
                    className="w-full h-10 mt-2 px-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total ICU Beds</span>
                  <input
                    type="number"
                    value={totalIcuBeds}
                    onChange={(e) => setTotalIcuBeds(Number(e.target.value))}
                    className="w-full h-10 mt-2 px-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total CCU Beds</span>
                  <input
                    type="number"
                    value={totalCcuBeds}
                    onChange={(e) => setTotalCcuBeds(Number(e.target.value))}
                    className="w-full h-10 mt-2 px-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Ventilator Units</span>
                  <input
                    type="number"
                    value={ventilatorCount}
                    onChange={(e) => setVentilatorCount(Number(e.target.value))}
                    className="w-full h-10 mt-2 px-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Threshold & System status */}
              <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">High Capacity Warning Threshold</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Automatically trigger high-priority alerts to administrative staff when occupancy crosses this mark.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={bedBufferAlert}
                    onChange={(e) => setBedBufferAlert(Number(e.target.value))}
                    className="w-32 accent-emerald-600"
                  />
                  <span className="text-sm font-extrabold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                    {bedBufferAlert}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: EMERGENCY & HEALTHPASS */}
          {activeTab === "emergency" && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Emergency HealthPass & Triage Integration</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure live scan actions for Oxpecker Emergency HealthPass and instant trauma admissions.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Auto-Triage on HealthPass Scan</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Instantly generate emergency admission ticket and pre-fill blood group, allergies, and emergency contacts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHealthPassAutoTriage(!healthPassAutoTriage)}
                    className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                      healthPassAutoTriage ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                      healthPassAutoTriage ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">SMS Alerts for Critical Trauma Cases</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dispatch instantaneous SMS notification to on-duty trauma surgeons when an emergency patient is checked in.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSmsCriticalAlert(!smsCriticalAlert)}
                    className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                      smsCriticalAlert ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                      smsCriticalAlert ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">On-Duty Emergency Medical Officer (In-Charge)</label>
                  <input
                    type="text"
                    value={emergencyChiefDoctor}
                    onChange={(e) => setEmergencyChiefDoctor(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SECURITY & ACCESS */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Hospital Portal Security</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage administrative credentials, two-factor authentication, and portal login protection.</p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Current Admin Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new secure password"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new secure password"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Two-Factor Authentication (2FA)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Require OTP verification upon signing in from unrecognized administrative devices.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                    twoFactorEnabled ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                    twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 5: BILLING & PAYOUTS */}
          {activeTab === "billing" && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Hospital Payout & Financial Accounts</h2>
                <p className="text-xs text-slate-500 mt-0.5">Set up settlement accounts for package (Gig) bookings and patient admissions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Settlement Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bank Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Branch Name</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Electronic Routing Number</label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">bKash Merchant Account Number</label>
                  <input
                    type="text"
                    value={bkashMerchant}
                    onChange={(e) => setBkashMerchant(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nagad Merchant Account Number</label>
                  <input
                    type="text"
                    value={nagadMerchant}
                    onChange={(e) => setNagadMerchant(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Automatic Digital Receipts for Patients</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Send instant verified digital payment invoices via SMS & Email on package booking confirmation.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoInvoice(!autoInvoice)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                    autoInvoice ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                    autoInvoice ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
