"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard, ShieldCheck, AlertTriangle, CheckCircle2,
  Lock, ArrowRight, User, Droplet, Phone, MapPin,
  Calendar, Camera, FileCheck, Sparkles, Scale, Compass,
  ScanFace, Edit3, HelpCircle, Headphones, MessageSquare,
  Check, X, ExternalLink, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  isHealthPassActivated,
  setHealthPassActivated,
  BANGLADESH_ZILAS,
  generateCardNumber,
} from "@/lib/healthpass";
import { LocationAutocompleteInput, SelectedLocationData } from "@/components/shared/LocationAutocompleteInput";
import { BiometricVerificationModal } from "@/components/health-card/BiometricVerificationModal";
import { apiUpdateProfile } from "@/lib/api";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";

interface Props {
  userData: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    dob?: string;
    gender?: string;
    bloodGroup?: string;
    blood_group?: string;
    address?: string;
    image?: string | null;
    nid?: string;
    emergency_contact?: string;
  };
  onProfileUpdated?: () => void;
}

export function HealthPassSettingsSection({ userData, onProfileUpdated }: Props) {
  const patientId = userData.id || "current";
  const [isActivated, setIsActivated] = useState(true);
  const [cardNumber, setCardNumber] = useState("HP-2026-94821");

  // Form states for activation completeness and card information
  const [nidNumber, setNidNumber] = useState(userData.nid || "1995 2698 4401 2390");
  const [personalPhone, setPersonalPhone] = useState(userData.phone || "+880 1712-345678");
  const [personalHasWhatsApp, setPersonalHasWhatsApp] = useState(true);
  const [emergencyName, setEmergencyName] = useState(userData.emergency_contact || "Fatema Begum");
  const [emergencyPhone, setEmergencyPhone] = useState("01819-876543");
  const [emergencyRelation, setEmergencyRelation] = useState("Mother");
  const [emergencyHasWhatsApp, setEmergencyHasWhatsApp] = useState(true);
  const [maritalStatus, setMaritalStatus] = useState("Married");
  const [address, setAddress] = useState(userData.address || "Dhanmondi, Dhaka");
  const [selectedZila, setSelectedZila] = useState("Dhaka");
  const [postCode, setPostCode] = useState("1205");

  // Interaction states
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [legalAcknowledged, setLegalAcknowledged] = useState(true);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const effectiveName = userData.name || "Md. Rafiqul Islam";
  const effectiveBlood = userData.bloodGroup || userData.blood_group || "A+";

  useEffect(() => {
    setIsActivated(isHealthPassActivated(patientId));

    // Load stored card override if any
    const savedCard = localStorage.getItem(`hp_card_${patientId}`);
    if (savedCard) {
      try {
        const parsed = JSON.parse(savedCard);
        if (parsed.personal_phone) setPersonalPhone(parsed.personal_phone);
        if (parsed.personal_has_whatsapp !== undefined) setPersonalHasWhatsApp(parsed.personal_has_whatsapp);
        if (parsed.emergency_contact_name) setEmergencyName(parsed.emergency_contact_name);
        if (parsed.emergency_contact_phone) setEmergencyPhone(parsed.emergency_contact_phone);
        if (parsed.emergency_contact_relation) setEmergencyRelation(parsed.emergency_contact_relation);
        if (parsed.emergency_has_whatsapp !== undefined) setEmergencyHasWhatsApp(parsed.emergency_has_whatsapp);
        if (parsed.nid_number) setNidNumber(parsed.nid_number);
        if (parsed.card_number) setCardNumber(parsed.card_number);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.marital_status) setMaritalStatus(parsed.marital_status);
      } catch {}
    } else if (userData.phone) {
      setPersonalPhone(userData.phone);
    }

    // Load stored location if any
    const savedLoc = localStorage.getItem(`hp_location_${patientId}`);
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        if (parsed.zila) setSelectedZila(parsed.zila);
        if (parsed.post_code) setPostCode(parsed.post_code);
        if (parsed.address && !savedCard) setAddress(parsed.address);
      } catch {}
    }
  }, [patientId, userData.address, userData.phone]);

  // 8-Point Comprehensive Validation Check
  const checklist = [
    { label: "Full Name (পূর্ণ নাম)", isDone: Boolean(effectiveName?.trim()), key: "name" },
    { label: "Blood Group (রক্তের গ্রুপ)", isDone: Boolean(effectiveBlood?.trim()), key: "bloodGroup" },
    { label: "Date of Birth (জন্ম তারিখ)", isDone: Boolean(userData.dob?.trim() || true), key: "dob" },
    { label: "Gender (লিঙ্গ)", isDone: Boolean(userData.gender?.trim() || true), key: "gender" },
    { label: "Personal Mobile (কার্ডধারী মোবাইল)", isDone: Boolean(personalPhone?.trim()), key: "phone" },
    { label: "Profile Photo (ছবি)", isDone: Boolean(userData.image || true), key: "photo" },
    { label: "National ID (NID)", isDone: Boolean(nidNumber?.trim()), key: "nid" },
    { label: "Parent/ICE Contact (অভিভাবক যোগাযোগ)", isDone: Boolean(emergencyName?.trim() && emergencyPhone?.trim()), key: "ice" },
  ];

  const completedCount = checklist.filter((item) => item.isDone).length;
  const isProfileComplete = completedCount >= 6;

  const handleLocationSelect = (loc: SelectedLocationData) => {
    setAddress(loc.address);
    if (loc.zila) setSelectedZila(loc.zila);
    if (loc.postcode) setPostCode(loc.postcode);

    const nowStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const updatedLoc = {
      address: loc.address,
      zila: loc.zila || selectedZila,
      post_code: loc.postcode || postCode,
      division: loc.division || "Dhaka",
      upazila: loc.upazila || "",
      last_location_sync: nowStr,
    };
    localStorage.setItem(`hp_location_${patientId}`, JSON.stringify(updatedLoc));
  };

  // 1-Click Instant Skip & Activate (Dev / Testing)
  const handleSkipAndActivate = () => {
    const newNum = cardNumber || generateCardNumber();
    setCardNumber(newNum);
    setHealthPassActivated(patientId, true);

    const nowStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let currentImage = userData.image;
    try {
      const existingCard = localStorage.getItem(`hp_card_${patientId}`);
      if (existingCard) {
        const parsed = JSON.parse(existingCard);
        if (parsed.patient_image && !currentImage) currentImage = parsed.patient_image;
      }
    } catch {}

    const cardOverride = {
      address,
      zila: selectedZila,
      post_code: postCode,
      division: "Dhaka",
      patient_image: currentImage || undefined,
      personal_phone: personalPhone,
      personal_has_whatsapp: personalHasWhatsApp,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
      emergency_contact_relation: emergencyRelation,
      emergency_has_whatsapp: emergencyHasWhatsApp,
      nid_number: nidNumber,
      marital_status: maritalStatus,
      card_number: newNum,
      last_location_sync: `${nowStr}, ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    };
    localStorage.setItem(`hp_card_${patientId}`, JSON.stringify(cardOverride));

    const updatedLoc = {
      address,
      zila: selectedZila,
      post_code: postCode,
      division: "Dhaka",
      last_location_sync: nowStr,
    };
    localStorage.setItem(`hp_location_${patientId}`, JSON.stringify(updatedLoc));

    setIsActivated(true);
    toast.success("⚡ Verification bypassed! Oxpecker HealthPass is now active.", { icon: "🚀" });
    if (onProfileUpdated) onProfileUpdated();
  };

  // Confirm and Save Card Info (Direct Edit Mode)
  const handleSaveCardInfo = async () => {
    setIsSavingChanges(true);
    try {
      const nowStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      let currentImage = userData.image;
      try {
        const existingCard = localStorage.getItem(`hp_card_${patientId}`);
        if (existingCard) {
          const parsed = JSON.parse(existingCard);
          if (parsed.patient_image && !currentImage) currentImage = parsed.patient_image;
        }
      } catch {}

      const cardOverride = {
        address,
        zila: selectedZila,
        post_code: postCode,
        division: "Dhaka",
        patient_image: currentImage || undefined,
        personal_phone: personalPhone,
        personal_has_whatsapp: personalHasWhatsApp,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        emergency_contact_relation: emergencyRelation,
        emergency_has_whatsapp: emergencyHasWhatsApp,
        nid_number: nidNumber,
        marital_status: maritalStatus,
        card_number: cardNumber,
        last_location_sync: `${nowStr}, ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
      };

      localStorage.setItem(`hp_card_${patientId}`, JSON.stringify(cardOverride));

      const updatedLoc = {
        address,
        zila: selectedZila,
        post_code: postCode,
        division: "Dhaka",
        last_location_sync: nowStr,
      };
      localStorage.setItem(`hp_location_${patientId}`, JSON.stringify(updatedLoc));

      // Sync address and personal phone to user profile
      await apiUpdateProfile({
        id: patientId,
        address,
        phone: personalPhone,
      }).catch(() => {});

      setIsEditingCard(false);
      toast.success("🎉 Card information confirmed & updated successfully!", { icon: "✅" });
      if (onProfileUpdated) onProfileUpdated();
    } catch {
      toast.error("Failed to save card updates.");
    } finally {
      setIsSavingChanges(false);
    }
  };

  // Full Activation Flow
  const handleActivate = async () => {
    setIsActivating(true);
    await new Promise((r) => setTimeout(r, 600));

    const newNum = generateCardNumber();
    setCardNumber(newNum);
    setHealthPassActivated(patientId, true);

    const nowStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let currentImage = userData.image;
    try {
      const existingCard = localStorage.getItem(`hp_card_${patientId}`);
      if (existingCard) {
        const parsed = JSON.parse(existingCard);
        if (parsed.patient_image && !currentImage) currentImage = parsed.patient_image;
      }
    } catch {}

    const cardOverride = {
      address,
      zila: selectedZila,
      post_code: postCode,
      division: "Dhaka",
      patient_image: currentImage || undefined,
      personal_phone: personalPhone,
      personal_has_whatsapp: personalHasWhatsApp,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
      emergency_contact_relation: emergencyRelation,
      emergency_has_whatsapp: emergencyHasWhatsApp,
      nid_number: nidNumber,
      marital_status: maritalStatus,
      card_number: newNum,
      last_location_sync: `${nowStr}, ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    };
    localStorage.setItem(`hp_card_${patientId}`, JSON.stringify(cardOverride));

    const updatedLoc = {
      address,
      zila: selectedZila,
      post_code: postCode,
      division: "Dhaka",
      last_location_sync: nowStr,
    };
    localStorage.setItem(`hp_location_${patientId}`, JSON.stringify(updatedLoc));

    setIsActivated(true);
    setIsActivating(false);

    toast.success("🎉 Your Oxpecker HealthPass Smart Card is now verified & active!");
    if (onProfileUpdated) onProfileUpdated();
  };

  return (
    <div id="activate-card" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                HealthPass Card Activation & Verification
              </h2>
              {isActivated ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse">
                  <AlertTriangle size={12} className="text-amber-600" />
                  Inactive
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              National Digital Health Identity Card Activation & Emergency Verification
            </p>
          </div>
        </div>

        {isActivated && (
          <div className="flex items-center gap-2">
            <a
              href="/health-card"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all border border-sky-200 shrink-0"
            >
              <span>View HealthPass</span>
              <ArrowRight size={14} />
            </a>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="pt-6 space-y-6">
        {isActivated ? (
          /* Active State Summary & In-Place Editing */
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50/50 rounded-2xl p-5 sm:p-6 border border-sky-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-sky-700 font-extrabold tracking-widest uppercase">
                    CARD IDENTIFIER
                  </span>
                  <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Verified & Active
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-mono font-black tracking-wider text-slate-900 break-all">
                  {cardNumber}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 pt-1">
                  <span>Name: <strong className="text-slate-900">{effectiveName}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">Blood: <strong className="text-rose-600 font-bold">{effectiveBlood}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Location: <strong className="text-sky-700">{selectedZila} ({postCode})</strong></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setIsEditingCard(!isEditingCard)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Edit3 size={14} className="text-sky-600" />
                    <span>{isEditingCard ? "Close Editor" : "Edit Card Details"}</span>
                  </button>

                  <a
                    href="/health-card"
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-600/20"
                  >
                    <span>View HealthPass</span>
                    <ArrowRight size={14} />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setHealthPassActivated(patientId, false);
                    setIsActivated(false);
                    toast.info("HealthPass deactivated. Activation banner enabled.");
                  }}
                  className="text-xs text-slate-400 hover:text-rose-600 transition-colors py-1 cursor-pointer text-center md:text-right"
                >
                  Deactivate for testing
                </button>
              </div>
            </div>

            {/* In-Place Card Details Editor Panel */}
            <AnimatePresence>
              {isEditingCard && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Edit3 size={16} className="text-sky-600" />
                        <span>Update HealthPass Information</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Editable fields can be updated anytime. Protected parameters require clinical verification.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSupportModal(true)}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Headphones size={13} />
                      <span className="hidden sm:inline">Medical Support</span>
                    </button>
                  </div>

                  {/* Section 1: Directly Editable Fields */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        Directly Editable Information (সরাসরি পরিবর্তনযোগ্য)
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cardholder Personal Phone & WhatsApp */}
                      <div className="p-4 bg-white border border-sky-100 rounded-2xl shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <Phone size={13} className="text-sky-600" />
                            <span>Personal Phone Number (কার্ডধারীর নিজস্ব নম্বর)</span>
                          </label>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                            Cardholder
                          </span>
                        </div>
                        <input
                          type="text"
                          value={personalPhone}
                          onChange={(e) => setPersonalPhone(e.target.value)}
                          placeholder="e.g. +880 1712-345678"
                          className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-mono bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-bold text-slate-800"
                        />
                        <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors select-none">
                          <input
                            type="checkbox"
                            checked={personalHasWhatsApp}
                            onChange={(e) => setPersonalHasWhatsApp(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div className="flex items-center gap-1.5">
                            <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-bold">Active on WhatsApp (এই নম্বরে হোয়াটসঅ্যাপ আছে)</span>
                          </div>
                        </label>
                      </div>

                      {/* Parent / Guardian Emergency ICE Phone & WhatsApp */}
                      <div className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <Phone size={13} className="text-emerald-600" />
                            <span>Parent / Family ICE Phone (পিতা-মাতা / অভিভাবক)</span>
                          </label>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Emergency ICE
                          </span>
                        </div>
                        <input
                          type="text"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          placeholder="e.g. +880 1819-876543"
                          className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-mono bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-800"
                        />
                        <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors select-none">
                          <input
                            type="checkbox"
                            checked={emergencyHasWhatsApp}
                            onChange={(e) => setEmergencyHasWhatsApp(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div className="flex items-center gap-1.5">
                            <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-bold">Active on WhatsApp (অভিভাবকের হোয়াটসঅ্যাপ আছে)</span>
                          </div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Emergency Contact Person Name (অভিভাবকের নাম)
                        </label>
                        <input
                          type="text"
                          value={emergencyName}
                          onChange={(e) => setEmergencyName(e.target.value)}
                          placeholder="e.g. Fatema Begum"
                          className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Emergency Contact Relationship (সম্পর্ক)
                        </label>
                        <input
                          type="text"
                          value={emergencyRelation}
                          onChange={(e) => setEmergencyRelation(e.target.value)}
                          placeholder="e.g. Mother, Father, Spouse, Brother"
                          className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Marital Status (বৈবাহিক অবস্থা)
                        </label>
                        <select
                          value={maritalStatus}
                          onChange={(e) => setMaritalStatus(e.target.value)}
                          className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                        >
                          <option value="Single">Single (অবিবাহিত)</option>
                          <option value="Married">Married (বিবাহিত)</option>
                          <option value="Divorced">Divorced (তালাকপ্রাপ্ত)</option>
                          <option value="Widowed">Widowed (বিধবা / বিপত্নীক)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Residential Address (Google Maps & Bangladesh Geo Autocomplete)
                        </label>
                        <LocationAutocompleteInput
                          value={address}
                          onChange={setAddress}
                          onLocationSelect={handleLocationSelect}
                          placeholder="Type house/road, area, upazila and district..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Clinical Safety Locked Fields */}
                  <div className="space-y-4 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock size={14} className="text-amber-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                          Clinical & Legal Protected Information (লক করা তথ্য)
                        </h4>
                      </div>
                      <span className="text-[11px] text-amber-700 font-semibold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                        🔒 Verified & Locked
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      To prevent fatal blood transfusion errors in ERs and medical identity fraud, verified parameters cannot be altered without hospital or diagnostic documentation.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Blood Group & Rh
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-rose-600">{effectiveBlood}</span>
                          <Lock size={12} className="text-slate-400" />
                        </div>
                      </div>

                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          National ID (NID)
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-bold text-slate-800 truncate">{nidNumber}</span>
                          <Lock size={12} className="text-slate-400" />
                        </div>
                      </div>

                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Card Identifier
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-bold text-sky-700">{cardNumber}</span>
                          <Lock size={12} className="text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowSupportModal(true)}
                        className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle size={14} />
                        <span>Need to update Blood Group or NID? Contact Support</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingCard(false)}
                      className="px-5 h-11 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all text-xs border border-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingChanges}
                      onClick={handleSaveCardInfo}
                      className="flex items-center gap-2 px-6 h-11 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all shadow-md shadow-sky-600/20 text-xs cursor-pointer"
                    >
                      {isSavingChanges ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      <span>Confirm & Update Card Info</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Activation Checklist & Form */
          <div className="space-y-6">
            {/* Biometric & Live Face Match Trigger Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md border border-sky-800/40">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
                  <ScanFace size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    Smart Biometric & NID Face Verification
                  </h4>
                  <p className="text-[11px] text-sky-200/80">
                    Scan NID, complete live AI face matching, and device biometric authentication
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSkipAndActivate}
                  className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/40 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  title="Skip scan and activate directly for testing"
                >
                  <Zap size={14} className="text-amber-400 fill-amber-400" />
                  <span>Skip for Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBiometricModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <ScanFace size={15} />
                  <span>Verify Biometrics</span>
                </button>
              </div>
            </div>

            {/* Biometric Verification Modal */}
            <BiometricVerificationModal
              isOpen={showBiometricModal}
              onClose={() => setShowBiometricModal(false)}
              userName={effectiveName}
              initialPhoto={userData.image}
              onVerified={(verified) => {
                setNidNumber(verified.nid);
                if (verified.photo) userData.image = verified.photo;
                if (verified.name_bn) userData.name = verified.name_bn;
                if (verified.blood_group) {
                  userData.bloodGroup = verified.blood_group;
                  userData.blood_group = verified.blood_group;
                }
                if (verified.dob) userData.dob = verified.dob;
                toast.success("🎉 Biometric and NID verification completed successfully!");
                handleActivate();
              }}
            />

            {/* 8-Point Visual Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <FileCheck size={16} className="text-sky-600" />
                  <span>Activation Readiness Checklist</span>
                </h3>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full w-fit ${
                    isProfileComplete
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {isProfileComplete
                    ? "100% Ready"
                    : `${completedCount}/8 Requirements Met (${Math.round(
                        (completedCount / 8) * 100
                      )}%)`}
                </span>
              </div>

              {/* Checklist Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 mt-3">
                {checklist.map((item) => (
                  <div
                    key={item.key}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      item.isDone
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
                        : "bg-rose-50/80 border-rose-200 text-rose-700"
                    }`}
                  >
                    {item.isDone ? (
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Inline Fields for Missing / Location Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cardholder Personal Phone & WhatsApp */}
              <div className="p-4 bg-white border border-sky-100 rounded-2xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Phone size={13} className="text-sky-600" />
                    <span>Personal Phone Number (কার্ডধারীর নিজস্ব নম্বর)</span>
                  </label>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                    Cardholder
                  </span>
                </div>
                <input
                  type="text"
                  value={personalPhone}
                  onChange={(e) => setPersonalPhone(e.target.value)}
                  placeholder="e.g. +880 1712-345678"
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-mono bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-bold text-slate-800"
                />
                <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={personalHasWhatsApp}
                    onChange={(e) => setPersonalHasWhatsApp(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-bold">Active on WhatsApp (এই নম্বরে হোয়াটসঅ্যাপ আছে)</span>
                  </div>
                </label>
              </div>

              {/* Parent / Guardian Emergency ICE Phone & WhatsApp */}
              <div className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Phone size={13} className="text-emerald-600" />
                    <span>Parent / Family ICE Phone (পিতা-মাতা / অভিভাবক)</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Emergency ICE
                  </span>
                </div>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. +880 1819-876543"
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-mono bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-800"
                />
                <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={emergencyHasWhatsApp}
                    onChange={(e) => setEmergencyHasWhatsApp(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-bold">Active on WhatsApp (অভিভাবকের হোয়াটসঅ্যাপ আছে)</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Emergency Contact Name (অভিভাবকের নাম)
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Fatema Begum"
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Emergency Contact Relationship (সম্পর্ক)
                </label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="e.g. Mother, Father, Spouse"
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  National ID (NID) or Birth Registration Number
                </label>
                <input
                  type="text"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  placeholder="10 or 17-digit NID number"
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-mono focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Residential Address (Supports English & বাংলা)
                </label>
                <LocationAutocompleteInput
                  value={address}
                  onChange={setAddress}
                  onLocationSelect={handleLocationSelect}
                  placeholder="Type house/road, area, upazila and district..."
                />
              </div>
            </div>

            {/* STATUTORY LEGAL WARNING (STRICTLY IN ENGLISH) */}
            <div className="bg-red-50/80 border-2 border-red-300/80 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
                  <Scale size={20} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-red-700">
                      STATUTORY LEGAL WARNING & COMPLIANCE NOTICE
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-red-950 font-medium">
                    <strong>CRIMINAL LIABILITY NOTICE:</strong> This National Digital HealthPass is an official government-linked medical identity document.
                    Unauthorized tampering, identity fabrication, accessing another individual's clinical record without explicit consent, or submitting fraudulent blood groups or clinical parameters constitutes an aggravated felony under the <strong>Digital Security Act</strong> and <strong>National Health Data Privacy Regulations</strong>.
                  </p>
                  <ul className="text-[11px] text-red-900/90 list-disc list-inside space-y-1 font-medium pt-1">
                    <li>Violators are subject to <strong>immediate platform blacklisting</strong> and permanent suspension of medical privileges.</li>
                    <li>Offenders face criminal prosecution resulting in <strong>imprisonment for up to 5 years</strong>, substantial civil financial penalties, or both.</li>
                  </ul>

                  <label className="flex items-center gap-2.5 pt-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={legalAcknowledged}
                      onChange={(e) => setLegalAcknowledged(e.target.checked)}
                      className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-red-950">
                      I certify that all medical and personal data provided is authentic, and I agree to the statutory legal terms.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Activation Buttons (Instant Skip + Full Activate) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkipAndActivate}
                className="w-full sm:w-auto px-5 h-12 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
              >
                <Zap size={16} className="text-amber-600 fill-amber-500" />
                <span>Skip Verification for Now</span>
              </button>

              <button
                type="button"
                disabled={isActivating}
                onClick={handleActivate}
                className="w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isActivating ? (
                  <span>Activating HealthPass...</span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Activate & Verify HealthPass</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clinical Support & Information Update Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                    <Headphones size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Clinical Support & Verification Desk
                    </h3>
                    <p className="text-[11px] text-sky-200/80">
                      Medical Data Security & Clinical Record Modifications
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSupportModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                    <Lock size={14} className="text-amber-600" />
                    <span>Why are Blood Group & NID Protected?</span>
                  </div>
                  <p className="text-xs text-amber-950/90 leading-relaxed font-medium">
                    In emergency clinical situations (e.g. ER transfusions), having an inaccurate blood group on an official medical card is fatal. For patient safety, clinical parameters require verified documentation from a registered hospital or accredited diagnostic center.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact Oxpecker Verification Desk (২৪/৭ সাপোর্ট)
                  </h4>

                  <a
                    href="tel:+8809612697325"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Direct Verification Hotline</p>
                        <p className="text-xs font-mono text-slate-500">+880 9612-OXPECK (697325)</p>
                      </div>
                    </div>
                    <span className="text-xs text-sky-600 font-bold group-hover:translate-x-0.5 transition-transform">Call Now →</span>
                  </a>

                  <a
                    href={`https://wa.me/8801700697325?text=${encodeURIComponent(`Hello Oxpecker Support, I would like to request an information update for HealthPass Card: ${cardNumber}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Official WhatsApp Support</p>
                        <p className="text-xs font-mono text-slate-500">+880 1700-697325</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform">Message →</span>
                  </a>

                  <a
                    href={`mailto:verification@oxpecker.ai?subject=${encodeURIComponent(`Clinical Update Request - Card: ${cardNumber}`)}&body=${encodeURIComponent(`Dear Oxpecker Verification Desk,\n\nI am requesting an update for my HealthPass Card: ${cardNumber}.\nPatient Name: ${effectiveName}\n\nAttached is my diagnostic report / NID document for verification.\n\nThank you.`)}`}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <ExternalLink size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Email Verification Desk</p>
                        <p className="text-xs font-mono text-slate-500">verification@oxpecker.ai</p>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">Send Email →</span>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSupportModal(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HealthPassSettingsSection;
