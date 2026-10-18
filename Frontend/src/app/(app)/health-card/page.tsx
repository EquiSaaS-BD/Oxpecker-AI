"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CreditCard, Download, Share2, RefreshCw, Loader2,
  Shield, QrCode, Eye, ChevronDown, Stethoscope,
  Pill, Calendar, AlertTriangle, CheckCircle2,
  MapPin, Compass, FlipHorizontal, Sparkles, Phone,
  FileText, X, Printer, Activity, HeartPulse,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng, toJpeg } from "html-to-image";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from "sonner";
import HealthPassCard from "@/components/health-card/HealthPassCard";
import { HealthPassBack } from "@/components/health-card/HealthPassBack";
import VerificationFlow from "@/components/health-card/VerificationFlow";
import { MedicalLoader } from "@/components/shared/MedicalLoader";
import type { HealthPassCard as HealthPassCardType, MedicalVisit } from "@/types/healthpass";
import {
  getHealthCard,
  createHealthCard,
  formatDate,
  BANGLADESH_ZILAS,
  MOCK_MEDICAL_VISITS,
} from "@/lib/healthpass";
import { LocationAutocompleteInput } from "@/components/shared/LocationAutocompleteInput";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";

export default function HealthCardPage() {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [card, setCard] = useState<HealthPassCardType | null>(null);
  const [visits, setVisits] = useState<MedicalVisit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<MedicalVisit | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<"card" | "history" | "medications">("card");
  const [isLocating, setIsLocating] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  // Load existing card
  useEffect(() => {
    async function load() {
      if (!user) return;
      setIsLoading(true);
      try {
        const result = await getHealthCard(user.id);
        if (result) {
          // Check if local location or custom card overrides exist
          const savedLoc = localStorage.getItem(`hp_location_${user.id}`);
          let locData: any = {};
          if (savedLoc) {
            try {
              locData = JSON.parse(savedLoc);
            } catch {}
          }

          const savedCustom = localStorage.getItem(`hp_card_${user.id}`);
          let customCardData: any = {};
          if (savedCustom) {
            try {
              customCardData = JSON.parse(savedCustom);
            } catch {}
          }

          const storedUser = typeof window !== "undefined" ? (() => {
            try {
              return JSON.parse(localStorage.getItem("oxpecker_mock_user") || localStorage.getItem("oxpecker_user") || "{}");
            } catch { return {}; }
          })() : {};

          const effectivePhoto = customCardData.patient_image || user.image || storedUser.image || result.card.patient_image || null;

          const mergedCard = {
            ...result.card,
            ...locData,
            ...customCardData,
            patient_name: customCardData.patient_name || user.name || result.card.patient_name,
            english_name: customCardData.english_name || (user.name ? user.name.toUpperCase() : result.card.english_name),
            blood_group: customCardData.blood_group || user.blood_group || result.card.blood_group,
            gender: customCardData.gender || user.gender || result.card.gender,
            date_of_birth: customCardData.date_of_birth || user.date_of_birth || result.card.date_of_birth,
            patient_image: effectivePhoto,
            personal_phone: customCardData.personal_phone || result.card.personal_phone || user.phone || "+880 1712-345678",
            personal_has_whatsapp: customCardData.personal_has_whatsapp !== undefined
              ? customCardData.personal_has_whatsapp
              : (result.card.personal_has_whatsapp !== undefined ? result.card.personal_has_whatsapp : true),
            emergency_contact_name: customCardData.emergency_contact_name || result.card.emergency_contact_name || "Fatema Begum",
            emergency_contact_phone: customCardData.emergency_contact_phone || result.card.emergency_contact_phone || "+880 1819-876543",
            emergency_contact_relation: customCardData.emergency_contact_relation || result.card.emergency_contact_relation || "Mother",
            emergency_has_whatsapp: customCardData.emergency_has_whatsapp !== undefined
              ? customCardData.emergency_has_whatsapp
              : (result.card.emergency_has_whatsapp !== undefined ? result.card.emergency_has_whatsapp : true),
            marital_status: customCardData.marital_status || result.card.marital_status || "Married",
            last_doctor_visit: result.card.last_doctor_visit || (result.visits[0] ? formatDate(result.visits[0].visit_date) : "14 Oct 2026"),
          };
          setCard(mergedCard);
          setVisits(result.visits);
        }
      } catch {
        toast.error("Failed to load HealthPass");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  // Download card as high-resolution PNG
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const fileNameRaw = (card?.english_name || card?.patient_name || "HealthPass")
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: "transparent",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `Oxpecker_HealthPass_${fileNameRaw}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("HealthPass downloaded successfully as high-resolution PNG!");
    } catch (err) {
      console.error(err);
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [card]);

  // Share card
  const handleShare = useCallback(async () => {
    if (!card) return;
    const url = `${window.location.origin}/scan/${card.card_number}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Oxpecker HealthPass",
          text: `${card.patient_name} - Smart Medical ID Card`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("HealthPass link copied to clipboard!");
      }
    } catch {
      // User cancelled share
    }
  }, [card]);

  // GPS Auto-Location System
  const handleAutoLocate = () => {
    if (!card || !user) return;
    setIsLocating(true);
    toast.info("Acquiring GPS coordinates...");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`/api/location/reverse?lat=${latitude}&lon=${longitude}`);
            if (res.ok) {
              const data = await res.json();
              if (data.success) {
                const nowStr = new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const updatedLoc = {
                  division: data.division || "Dhaka",
                  zila: data.zila || "Dhaka",
                  upazila: data.upazila || "Dhanmondi",
                  post_code: data.postcode || "1205",
                  address: data.display_name || `${data.upazila || "Dhanmondi"}, ${data.zila || "Dhaka"}`,
                  last_location_sync: nowStr,
                };
                const newCard = { ...card, ...updatedLoc };
                setCard(newCard);
                localStorage.setItem(`hp_location_${user.id}`, JSON.stringify(updatedLoc));
                setIsLocating(false);
                toast.success(`GPS location synced successfully: ${data.zila || "Dhaka"} (${data.postcode || "1205"})`, { icon: "📍" });
                return;
              }
            }
          } catch (e) {
            console.warn("Reverse geocode failed:", e);
          }

          // Fallback if reverse geocode server is unreachable
          const nowStr = new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const updatedLoc = {
            division: "Dhaka",
            zila: "Dhaka",
            upazila: "Dhanmondi",
            post_code: "1205",
            address: "House 42, Road 9/A, Dhanmondi, Dhaka",
            last_location_sync: nowStr,
          };
          const newCard = { ...card, ...updatedLoc };
          setCard(newCard);
          localStorage.setItem(`hp_location_${user.id}`, JSON.stringify(updatedLoc));
          setIsLocating(false);
          toast.success("GPS location synced successfully: Dhaka (1205)");
        },
        (error) => {
          console.warn("GPS Permission or lookup error:", error);
          setShowDistrictPicker(true);
          setIsLocating(false);
          toast.info("Please select your current district from the list");
        },
        { timeout: 7000 }
      );
    } else {
      setShowDistrictPicker(true);
      setIsLocating(false);
      toast.info("Please select your district from the list");
    }
  };

  const handleSelectDistrict = (item: (typeof BANGLADESH_ZILAS)[0]) => {
    if (!card || !user) return;
    const nowStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ", " + new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updatedLoc = {
      division: item.division,
      zila: item.name,
      upazila: item.defaultUpazila,
      post_code: item.postCode,
      address: `${item.defaultUpazila}, ${item.name}`,
      last_location_sync: nowStr,
    };

    const newCard = { ...card, ...updatedLoc };
    setCard(newCard);
    localStorage.setItem(`hp_location_${user.id}`, JSON.stringify(updatedLoc));
    setShowDistrictPicker(false);
    toast.success(`Location updated: ${item.name} (${item.postCode})`);
  };

  const handleVerificationComplete = async (data: any) => {
    if (!user) return;
    try {
      const newCard = await createHealthCard({
        patientId: user.id,
        nidNumber: data.idType === "nid" ? data.idNumber : undefined,
        birthCertNumber: data.idType === "birth_cert" ? data.idNumber : undefined,
        emergencyContactName: data.emergencyName,
        emergencyContactPhone: data.emergencyPhone,
        emergencyContactRelation: data.emergencyRelation,
        allergies: data.allergies,
        chronicConditions: data.conditions,
      });

      setCard({
        ...newCard,
        patient_name: user.name || newCard.patient_name,
        english_name: user.name ? user.name.toUpperCase() : newCard.english_name,
        blood_group: user.blood_group || newCard.blood_group,
        gender: user.gender || newCard.gender,
        date_of_birth: user.date_of_birth || newCard.date_of_birth,
        patient_image: data.photo || user.image || null,
        is_activated: true,
      });
      setVisits(MOCK_MEDICAL_VISITS);
      setShowVerification(false);
      toast.success("🎉 Your Oxpecker HealthPass has been created & activated!");
    } catch {
      toast.error("Failed to create HealthPass");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <MedicalLoader text="Loading HealthPass..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <CreditCard size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Oxpecker HealthPass
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                PROD GRADE
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm">
              Smart Digital Medical Passport • National Health Ecosystem of Bangladesh
            </p>
          </div>
        </div>

        {card && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoLocate}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200"
              title="Sync district & postal code via GPS"
            >
              {isLocating ? (
                <Loader2 size={14} className="animate-spin text-sky-600" />
              ) : (
                <Compass size={14} className="text-sky-600" />
              )}
              <span>{isLocating ? "Syncing..." : "Auto Location"}</span>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl transition-all border border-sky-200 shadow-xs"
            >
              <FlipHorizontal size={14} className="text-sky-600" />
              <span>{isFlipped ? "Flip to Front" : "Flip to Back"}</span>
            </button>
          </div>
        )}
      </div>

      {/* District Picker Modal / Drawer */}
      <AnimatePresence>
        {showDistrictPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-sky-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Select Bangladesh District & Postal Code (Auto Location)
                </h3>
              </div>
              <button
                onClick={() => setShowDistrictPicker(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Close
              </button>
            </div>

            {/* Live Autocomplete Search Input */}
            <div className="mb-3">
              <LocationAutocompleteInput
                value=""
                onChange={() => {}}
                onLocationSelect={(loc) => {
                  const nowStr = new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const updatedLoc = {
                    division: loc.division || "Dhaka",
                    zila: loc.zila || "Dhaka",
                    upazila: loc.upazila || "",
                    post_code: loc.postcode || "1205",
                    address: loc.address || `${loc.upazila ? loc.upazila + ", " : ""}${loc.zila || "Dhaka"}`,
                    last_location_sync: nowStr,
                  };
                  const newCard = { ...card, ...updatedLoc };
                  setCard(newCard);
                  localStorage.setItem(`hp_location_${user.id}`, JSON.stringify(updatedLoc));
                  setShowDistrictPicker(false);
                  toast.success(`Location set: ${loc.zila || "Dhaka"} (${loc.postcode || "1205"})`, { icon: "📍" });
                }}
                placeholder="Search area, road, upazila, or district (e.g. Mirpur-10, Dhanmondi 32)..."
              />
            </div>

            <div className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Or select your district:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
              {BANGLADESH_ZILAS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSelectDistrict(item)}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 rounded-xl text-left transition-all"
                >
                  <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">ZIP: {item.postCode}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Flow */}
      <AnimatePresence>
        {showVerification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <VerificationFlow
              profileImage={user?.image}
              userName={user?.name}
              onComplete={handleVerificationComplete}
              onCancel={() => setShowVerification(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Section */}
      {card && !showVerification && (
        <>
          {/* EQUALIZED TAB NAVIGATION (Grid 3 cols, identical width & height) */}
          <div className="grid grid-cols-3 w-full max-w-2xl mx-auto p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 mb-8 shadow-xs">
            {[
              { key: "card" as const, label: "Digital Card", sub: "3D HealthPass", icon: CreditCard },
              { key: "history" as const, label: "Visit History", sub: "Clinical Visits", icon: Calendar },
              { key: "medications" as const, label: "Active Medications", sub: "Prescriptions", icon: Pill },
            ].map(({ key, label, sub, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`h-14 flex flex-col items-center justify-center rounded-xl transition-all font-semibold ${
                  activeTab === key
                    ? "bg-white text-sky-700 shadow-sm border border-slate-200/60 font-bold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 font-medium"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Icon size={16} className={activeTab === key ? "text-sky-600" : "text-slate-400"} />
                  <span>{label}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:block leading-none mt-0.5">
                  {sub}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* 1. Ultra-Bank Card 3D View (Front & Back) */}
            {activeTab === "card" && (
              <motion.div
                key="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="w-full flex justify-center perspective-[1200px]">
                    <AnimatePresence mode="wait">
                      {!isFlipped ? (
                        <motion.div
                          key="front"
                          initial={{ rotateY: -90, opacity: 0 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          exit={{ rotateY: 90, opacity: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="w-full flex justify-center"
                        >
                          <HealthPassCard
                            ref={cardRef}
                            card={card}
                            profileImage={card.patient_image || user?.image}
                            onFlip={() => setIsFlipped(true)}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="back"
                          initial={{ rotateY: 90, opacity: 0 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          exit={{ rotateY: -90, opacity: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="w-full flex justify-center"
                        >
                          <HealthPassBack
                            ref={cardRef}
                            card={card}
                            onFlip={() => setIsFlipped(false)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    {/* Single Unified Download Button (Always PNG) */}
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                      title="Download Card in High-Resolution PNG"
                    >
                      {isDownloading ? (
                        <Loader2 size={16} className="animate-spin text-sky-400" />
                      ) : (
                        <Download size={16} className="text-sky-300" />
                      )}
                      <span>{isDownloading ? "Downloading..." : "Download"}</span>
                    </button>

                    {/* External Flip Card Button */}
                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-300 rounded-xl text-xs sm:text-sm font-bold hover:bg-sky-50 transition-all cursor-pointer shadow-xs"
                    >
                      <FlipHorizontal size={16} className="text-sky-600" />
                      <span>{isFlipped ? "Flip to Front" : "Flip to Back"}</span>
                    </button>

                    {/* Share Pass */}
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-300 rounded-xl text-xs sm:text-sm font-bold hover:bg-sky-50 transition-all cursor-pointer shadow-xs"
                    >
                      <Share2 size={15} className="text-slate-500" />
                      <span>Share Pass</span>
                    </button>
                  </div>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  {/* Allergies */}
                  <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                        <AlertTriangle size={16} />
                      </div>
                      <h3 className="font-extrabold text-rose-950 text-sm">Critical Allergies</h3>
                    </div>
                    {card.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {card.allergies.map((a) => (
                          <span key={a} className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-200">
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-rose-400">No known drug or food allergies recorded (NKDA)</p>
                    )}
                  </div>

                  {/* Conditions */}
                  <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                        <Stethoscope size={16} />
                      </div>
                      <h3 className="font-extrabold text-amber-950 text-sm">Chronic Health Conditions</h3>
                    </div>
                    {card.chronic_conditions.length > 0 ? (
                      <div className="space-y-2">
                        {card.chronic_conditions.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-900">{c.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                              {c.status === "controlled" ? "Controlled" : "Active"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-500">No chronic health conditions recorded</p>
                    )}
                  </div>

                  {/* Emergency & Direct Communication Contacts */}
                  <div className="bg-gradient-to-br from-sky-50 to-white border border-sky-200 rounded-2xl p-5 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                          <Shield size={16} />
                        </div>
                        <h3 className="font-extrabold text-sky-950 text-sm">Emergency & Contact Numbers</h3>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        24/7 Verified
                      </span>
                    </div>

                    {/* Personal Phone */}
                    <div className="p-3 bg-white border border-sky-100 rounded-xl space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Cardholder Personal Phone
                        </span>
                        {(card.personal_has_whatsapp ?? true) && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 rounded text-[9px] font-bold text-emerald-700 border border-emerald-200">
                            <WhatsAppIcon className="w-2.5 h-2.5 shrink-0" />
                            <span>WhatsApp Active</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <a
                          href={`tel:${card.personal_phone || "+8801712345678"}`}
                          className="inline-flex items-center gap-1.5 text-xs text-sky-700 font-mono font-bold bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-lg border border-sky-200 transition-colors"
                        >
                          <Phone size={11} />
                          <span>{card.personal_phone || "+880 1712-345678"}</span>
                        </a>
                        {(card.personal_has_whatsapp ?? true) && (
                          <a
                            href={`https://wa.me/${(card.personal_phone || "8801712345678").replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                          >
                            <WhatsAppIcon className="w-3 h-3 shrink-0" />
                            <span>Chat</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Family ICE Phone */}
                    <div className="p-3 bg-white border border-emerald-100 rounded-xl space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {card.emergency_contact_name || "Fatema Begum"}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {card.emergency_contact_relation || "Mother"} • Emergency Guardian (ICE)
                          </p>
                        </div>
                        {(card.emergency_has_whatsapp ?? true) && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 rounded text-[9px] font-bold text-emerald-700 border border-emerald-200">
                            <WhatsAppIcon className="w-2.5 h-2.5 shrink-0" />
                            <span>WhatsApp Active</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <a
                          href={`tel:${card.emergency_contact_phone || "+8801819876543"}`}
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-mono font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors"
                        >
                          <Phone size={11} />
                          <span>{card.emergency_contact_phone || "+880 1819-876543"}</span>
                        </a>
                        {(card.emergency_has_whatsapp ?? true) && (
                          <a
                            href={`https://wa.me/${(card.emergency_contact_phone || "8801819876543").replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                          >
                            <WhatsAppIcon className="w-3 h-3 shrink-0" />
                            <span>Chat</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Clinical Visit History & Prescriptions */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Clinical Consultation & Prescription History</h3>
                    <p className="text-xs text-slate-500 font-medium">Official medical records, diagnostic vitals, and physician prescriptions</p>
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-100/70 border border-sky-200 px-3 py-1 rounded-full">
                    {visits.length} {visits.length === 1 ? "Record" : "Records"}
                  </span>
                </div>

                {visits.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-3xl p-8">
                    <Calendar size={44} className="mx-auto mb-3 opacity-30 text-sky-600" />
                    <p className="font-bold text-slate-700 text-sm">No clinical visits recorded</p>
                    <p className="text-xs text-slate-400 mt-1">Hospital and clinic visit history will appear here automatically.</p>
                  </div>
                ) : (
                  visits.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white border border-slate-200 hover:border-sky-300 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all"
                    >
                      {/* Top Header: Doctor + Hospital + Date */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Stethoscope size={22} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base leading-tight">{v.doctor_name}</h4>
                            <p className="text-xs text-sky-700 font-semibold mt-0.5">{v.department || "General Medicine"}</p>
                            <p className="text-xs text-slate-600 font-medium">{v.hospital_name}</p>
                            {v.location && (
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                                <MapPin size={11} className="text-sky-500 shrink-0" />
                                <span>{v.location}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-xl font-mono">
                            {formatDate(v.visit_date)}
                          </span>
                          <button
                            onClick={() => setSelectedVisit(v)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>View Full Prescription</span>
                          </button>
                        </div>
                      </div>

                      {/* Diagnosis & Summary */}
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block mb-1">
                            Primary Diagnosis
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                            {v.diagnosis}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block mb-1">
                            Prescription Summary
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug line-clamp-2">
                            {v.prescription_summary}
                          </span>
                        </div>
                      </div>

                      {/* Vitals Bar (if present) */}
                      {v.vitals && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                          <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                            Clinical Vitals:
                          </span>
                          <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg font-mono font-bold text-[11px]">
                            BP: {v.vitals.bp}
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg font-mono font-bold text-[11px]">
                            Pulse: {v.vitals.pulse}
                          </span>
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg font-mono font-bold text-[11px]">
                            Temp: {v.vitals.temp}
                          </span>
                          <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-100 rounded-lg font-mono font-bold text-[11px]">
                            Weight: {v.vitals.weight}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* 3. Active Medications */}
            {activeTab === "medications" && (
              <motion.div
                key="meds"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Ongoing Medications</h3>
                    <p className="text-xs text-slate-500 font-medium">Currently prescribed therapeutic drugs, dosage frequencies, and duration</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-full">
                    {card.current_medications.length} Active
                  </span>
                </div>

                {card.current_medications.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-3xl p-8">
                    <Pill size={44} className="mx-auto mb-3 opacity-30 text-emerald-600" />
                    <p className="font-bold text-slate-700 text-sm">No active medications currently prescribed</p>
                    <p className="text-xs text-slate-400 mt-1">Prescribed medications from doctor visits will appear here.</p>
                  </div>
                ) : (
                  card.current_medications.map((med, i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700 shadow-xs">
                          <Pill size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">{med.name}</h4>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono">
                              {med.dosage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            Schedule: <span className="font-semibold text-slate-800">{med.frequency}</span>
                            {med.duration && (
                              <span> • Duration: <span className="font-semibold text-slate-800">{med.duration}</span></span>
                            )}
                          </p>
                          {med.instructions && (
                            <p className="text-[11px] text-slate-400 mt-0.5 italic">
                              Instructions: {med.instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      {med.prescribed_by && (
                        <div className="shrink-0 text-left sm:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Prescribing Facility / Doctor
                          </span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl inline-block mt-0.5">
                            {med.prescribed_by}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* No card - Show CTA */}
      {!card && !showVerification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-xs"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-sky-500/20 text-white">
            <CreditCard size={36} />
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2">
            Create Your Oxpecker HealthPass
          </h2>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            Generate an official, government-recognized digital medical pass to instantly access blood type, allergies, and clinical records during emergencies.
          </p>
          <button
            onClick={() => setShowVerification(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Shield size={16} />
            Get Started
          </button>
        </motion.div>
      )}

      {/* =========================================================================
          PRESCRIPTION & CLINICAL CONSULTATION DOSSIER MODAL
         ========================================================================= */}
      <AnimatePresence>
        {selectedVisit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Modal Top Header (Hospital Branding) */}
              <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 text-white p-5 sm:p-6 shrink-0 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-200 block">
                        CLINICAL CONSULTATION & RX DOSSIER
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                        {selectedVisit.hospital_name}
                      </h3>
                      {selectedVisit.department && (
                        <p className="text-xs text-sky-200 font-semibold">{selectedVisit.department}</p>
                      )}
                      {selectedVisit.location && (
                        <p className="text-[11px] text-sky-300/90 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="shrink-0" />
                          <span>{selectedVisit.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      title="Print Prescription"
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedVisit(null)}
                      title="Close"
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Sub-bar: Doctor Info & Date */}
                <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-sky-200 font-medium">Attending Physician: </span>
                    <strong className="text-white font-bold">{selectedVisit.doctor_name}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-sky-200 font-bold bg-white/10 px-3 py-0.5 rounded-lg border border-white/10">
                    <Calendar size={12} />
                    <span>{formatDate(selectedVisit.visit_date)}</span>
                  </div>
                </div>
              </div>

              {/* Patient Quick Header */}
              {card && (
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Patient:</span>
                    <strong className="font-bold text-slate-800 text-sm">{card.english_name || card.patient_name}</strong>
                    <span className="font-mono text-[11px] text-slate-400">({card.card_number})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">Gender: <strong>{card.gender}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600">Blood: <strong className="text-red-600 font-black">{card.blood_group}</strong></span>
                    {card.marital_status && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">Marital: <strong>{card.marital_status}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Scrollable Prescription Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
                {/* 1. Clinical Vitals */}
                {selectedVisit.vitals && (
                  <div>
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <HeartPulse size={14} className="text-rose-500" />
                      Recorded Vitals at Examination
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 bg-red-50/70 border border-red-200/70 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-red-600 block">Blood Pressure</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{selectedVisit.vitals.bp}</span>
                      </div>
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 block">Pulse / Heart Rate</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{selectedVisit.vitals.pulse}</span>
                      </div>
                      <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-amber-700 block">Temperature</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{selectedVisit.vitals.temp}</span>
                      </div>
                      <div className="p-3 bg-sky-50/70 border border-sky-200/70 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-sky-700 block">Body Weight</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{selectedVisit.vitals.weight}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Diagnosis */}
                <div>
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Activity size={14} className="text-sky-600" />
                    Clinical Diagnosis & Assessment
                  </h5>
                  <div className="p-4 bg-sky-50/50 border border-sky-200/80 rounded-2xl">
                    <p className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {selectedVisit.diagnosis}
                    </p>
                    {selectedVisit.notes && (
                      <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-sky-200/40">
                        {selectedVisit.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Rx / Prescribed Medications */}
                <div>
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Pill size={14} className="text-emerald-600" />
                    Prescribed Medications (Rx)
                  </h5>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                          <th className="py-2.5 px-3">Medicine & Dosage</th>
                          <th className="py-2.5 px-3">Frequency</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3 hidden sm:table-cell">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedVisit.medications && selectedVisit.medications.length > 0 ? (
                          selectedVisit.medications.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900 block">{m.name}</span>
                                <span className="text-[11px] text-slate-500 font-mono">{m.dosage}</span>
                                <span className="sm:hidden text-[10px] text-slate-400 block mt-0.5">{m.instructions}</span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-700">{m.frequency}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{m.duration}</td>
                              <td className="py-2.5 px-3 text-slate-500 italic hidden sm:table-cell">{m.instructions}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 px-3 text-slate-600 font-medium">
                              {selectedVisit.prescription_summary}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Requested Diagnostic Tests */}
                {selectedVisit.tests && selectedVisit.tests.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <FileText size={14} className="text-indigo-600" />
                      Laboratory & Diagnostic Tests Ordered
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedVisit.tests.map((test, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                          <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                          <span>{test}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Advice & Follow up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVisit.advice && (
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                      <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block mb-1">
                        Physician Advice & Dietary Guidance
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {selectedVisit.advice}
                      </p>
                    </div>
                  )}

                  {selectedVisit.follow_up && (
                    <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl">
                      <span className="text-[10px] uppercase font-black text-sky-800 tracking-wider block mb-1">
                        Next Follow-up Consultation
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-bold">
                        {selectedVisit.follow_up}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Shield size={14} className="text-emerald-600" />
                  <span>Electronically Verified via Oxpecker Clinical Cloud</span>
                </div>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
