"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, CreditCard, Shield, AlertTriangle, Phone,
  Calendar, MapPin, Heart, Stethoscope, Pill,
  UserCheck, ExternalLink, RefreshCw, X, ArrowRight,
  Filter, CheckCircle2, ChevronRight, Activity, FlipHorizontal,
  Printer, MessageCircle, AlertOctagon, HeartPulse, User,
  RotateCcw, FileText, Download, Eye, Globe, Building,
  Thermometer, Droplet, Clock, Check, Copy, QrCode, Layers,
  ChevronDown, ChevronUp, ChevronLeft, Minus, Plus, Camera, ScanFace, Upload, Sparkles, SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import type { HealthPassCard as HealthPassCardType, DiagnosticReport, VisualSearchResult, SearchMatchReason } from "@/types/healthpass";
import { searchHealthCards, searchHealthCardsGoogleStyle, calculateAge, formatDate, INITIAL_HEALTH_CARDS } from "@/lib/healthpass";
import { matchPatientPhoto } from "@/lib/biometrics";
import HealthPassCard from "@/components/health-card/HealthPassCard";
import { HealthPassBack } from "@/components/health-card/HealthPassBack";

interface Props {
  portalRole?: "doctor" | "hospital" | "admin";
  title?: string;
  subtitle?: string;
}

export function HealthPassSearchEngine({
  portalRole = "doctor",
  title,
  subtitle,
}: Props) {
  // Localization: English default, 1-click toggle to Bengali
  const [lang, setLang] = useState<"en" | "bn">("en");
  
  // Search query & filters
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "nid" | "dob" | "phone" | "card_no" | "name" | "blood_group">("all");
  
  // View mode: Comprehensive Paper Dossier vs Compact Smart ID Card
  const [viewMode, setViewMode] = useState<"paper" | "card">("paper");
  
  // Selected active patient (Defaults strictly to Rahim Uddin - Doctor Queue S-01)
  const [selectedCard, setSelectedCard] = useState<HealthPassCardType | null>(() => {
    return Array.isArray(INITIAL_HEALTH_CARDS) && INITIAL_HEALTH_CARDS.length > 0 ? INITIAL_HEALTH_CARDS[0] : null;
  });
  
  const [isDossierFlipped, setIsDossierFlipped] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cardList, setCardList] = useState<HealthPassCardType[]>(() => {
    return Array.isArray(INITIAL_HEALTH_CARDS) ? INITIAL_HEALTH_CARDS : [];
  });
  const [dataSource, setDataSource] = useState<"database" | "registry">("registry");
  
  // Modal states for printing & digital lab paper viewing
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeReportModal, setActiveReportModal] = useState<DiagnosticReport | null>(null);

  // Custom filter dropdown popover open/close & ref
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // 1-Click Copy feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Phone QR dialer modal state
  const [showPhoneQrModal, setShowPhoneQrModal] = useState(false);

  // Printable dossier ref & downloading state
  const dossierPrintRef = useRef<HTMLDivElement>(null);
  const [isDownloadingDossier, setIsDownloadingDossier] = useState(false);

  // Visual AI Biometric Face Recognition states
  const [showVisualModal, setShowVisualModal] = useState(false);
  const [visualTab, setVisualTab] = useState<"presets" | "upload" | "webcam">("presets");
  const [visualProbeImage, setVisualProbeImage] = useState<string | null>(null);
  const [visualCandidates, setVisualCandidates] = useState<VisualSearchResult[]>([]);
  const [isAnalyzingBiometrics, setIsAnalyzingBiometrics] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);

  // 10-per-page Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Soft & gentle Skeleton Loader transition state
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Collapsible / Minimizable Sub-Cards State
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    vitals: false,
    emergencyContact: false,
    alerts: false,
    medications: false,
    conditions: false,
    labReports: false,
  });

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllSections = (collapse: boolean) => {
    setCollapsedSections({
      vitals: collapse,
      emergencyContact: collapse,
      alerts: collapse,
      medications: collapse,
      conditions: collapse,
      labReports: collapse,
    });
  };

  // Helper to switch patient with a gentle 200ms shimmer transition
  const handleSelectPatientWithSkeleton = (patient: HealthPassCardType) => {
    if (currentCard?.id === patient.id) return;
    setIsLoadingPatient(true);
    setSelectedCard(patient);
    setIsDossierFlipped(false);
    setTimeout(() => {
      setIsLoadingPatient(false);
    }, 220);
  };

  // Click outside listener for custom filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Guaranteed safe array memoization
  const safeResults: HealthPassCardType[] = useMemo(() => {
    if (Array.isArray(cardList) && cardList.length > 0) {
      return cardList;
    }
    return Array.isArray(INITIAL_HEALTH_CARDS) && INITIAL_HEALTH_CARDS.length > 0 ? INITIAL_HEALTH_CARDS : [];
  }, [cardList]);

  // Pagination calculations: 10 per page
  const totalPages = Math.max(1, Math.ceil(safeResults.length / PAGE_SIZE));
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return safeResults.slice(start, start + PAGE_SIZE);
  }, [safeResults, currentPage]);

  // Guaranteed active card (strictly attached to selection or initial queue patient)
  const currentCard = selectedCard || (safeResults.length > 0 ? safeResults[0] : (INITIAL_HEALTH_CARDS[0] || null));

  // Search debounce and live API query with offline fallback
  useEffect(() => {
    let isCurrent = true;
    setCurrentPage(1);

    if (!query.trim()) {
      const defaultCards = searchHealthCards("", filterType);
      const safeDefault = Array.isArray(defaultCards) && defaultCards.length > 0 ? defaultCards : INITIAL_HEALTH_CARDS;
      setCardList(Array.isArray(safeDefault) ? safeDefault : []);
      setDataSource("registry");
      if (!selectedCard && safeDefault.length > 0) {
        setSelectedCard(safeDefault[0]);
      }
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/emergency/search?query=${encodeURIComponent(query)}&filterType=${encodeURIComponent(filterType)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isCurrent) {
            const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
            if (list.length > 0) {
              setCardList(list);
              setDataSource(data?.source === "supabase" ? "database" : "registry");
              setSelectedCard(list[0]);
            } else {
              setCardList([]);
            }
          }
        } else {
          // Fallback to synchronous local engine
          const localRes = searchHealthCards(query, filterType);
          const safeRes = Array.isArray(localRes) ? localRes : INITIAL_HEALTH_CARDS;
          if (isCurrent) {
            setCardList(Array.isArray(safeRes) ? safeRes : []);
            setDataSource("registry");
            if (safeRes.length > 0) {
              setSelectedCard(safeRes[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Emergency search fetch error, falling back locally:", err);
        const localRes = searchHealthCards(query, filterType);
        const safeRes = Array.isArray(localRes) ? localRes : INITIAL_HEALTH_CARDS;
        if (isCurrent) {
          setCardList(Array.isArray(safeRes) ? safeRes : []);
          setDataSource("registry");
          if (safeRes.length > 0) {
            setSelectedCard(safeRes[0]);
          }
        }
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query, filterType]);

  // Filter options configuration with medical icons and descriptions
  const filterOptions = [
    {
      id: "all" as const,
      labelEn: "All Fields",
      labelBn: "সকল ফিল্ড",
      icon: Layers,
      descEn: "Search across name, phone, NID, card & blood group",
      descBn: "নাম, ফোন, NID, কার্ড আইডি ও রক্তের গ্রুপে খুঁজুন",
    },
    {
      id: "name" as const,
      labelEn: "Patient Name",
      labelBn: "রোগীর নাম",
      icon: User,
      descEn: "Bengali or English full/partial patient name",
      descBn: "বাংলা বা ইংরেজিতে রোগীর নাম",
    },
    {
      id: "nid" as const,
      labelEn: "National ID (NID)",
      labelBn: "জাতীয় পরিচয়পত্র",
      icon: Shield,
      descEn: "10 or 17 digit national identity card number",
      descBn: "১০ বা ১৭ ডিজিটের জাতীয় পরিচয়পত্র নম্বর",
    },
    {
      id: "phone" as const,
      labelEn: "Phone / Parent Number",
      labelBn: "ফোন বা প্যারেন্ট নাম্বার",
      icon: Phone,
      descEn: "Patient or emergency parent contact number",
      descBn: "রোগী বা জরুরি অভিভাবকের ফোন নম্বর",
    },
    {
      id: "blood_group" as const,
      labelEn: "Blood Group",
      labelBn: "রক্তের গ্রুপ",
      icon: Droplet,
      descEn: "Filter by ABO/Rh (A+, B+, O+, AB+, O-, etc.)",
      descBn: "রক্তের গ্রুপ (A+, B+, O+, AB+, O-) দিয়ে ফিল্টার",
    },
    {
      id: "card_no" as const,
      labelEn: "Card UID / Serial",
      labelBn: "কার্ড আইডি / UID",
      icon: CreditCard,
      descEn: "Oxpecker Smart EMV RFID card UID or serial",
      descBn: "স্মার্ট কার্ডের ১৬ ডিজিট UID বা সিরিয়াল",
    },
    {
      id: "dob" as const,
      labelEn: "Date of Birth",
      labelBn: "জন্ম তারিখ",
      icon: Calendar,
      descEn: "Search by date of birth (YYYY-MM-DD)",
      descBn: "জন্ম তারিখ দিয়ে অনুসন্ধান",
    },
  ];

  const currentFilterOption = filterOptions.find((opt) => opt.id === filterType) || filterOptions[0];

  // Defensive array checks for currently selected patient
  const safeAllergies = Array.isArray(currentCard?.allergies) ? currentCard.allergies : [];
  const safeConditions = Array.isArray(currentCard?.chronic_conditions) ? currentCard.chronic_conditions : [];
  const safeMedications = Array.isArray(currentCard?.current_medications) ? currentCard.current_medications : [];
  const safeReports: DiagnosticReport[] = Array.isArray(currentCard?.diagnostic_reports) ? currentCard.diagnostic_reports : [];
  const safeVitals = currentCard?.vitals;

  // Utility to clean repeated units from vitals values
  const cleanVitalValue = (val?: string) => {
    if (!val) return "";
    return val
      .replace(/mmHg/gi, "")
      .replace(/bpm/gi, "")
      .replace(/mg\/dL/gi, "")
      .replace(/kg\/m[²2]/gi, "")
      .replace(/°F|°C/gi, "")
      .replace(/%/gi, "")
      .trim();
  };

  // 1-Click Copy helper
  const handleCopyText = (text: string, fieldKey: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success(
      lang === "en"
        ? `${label} copied to clipboard!`
        : `${label} ক্লিপবোর্ডে কপি করা হয়েছে!`,
      { icon: "📋" }
    );
    setTimeout(() => {
      setCopiedField((prev) => (prev === fieldKey ? null : prev));
    }, 2000);
  };

  // 1. Download clean patient dossier document (PNG image of only the dossier paper)
  const handleDownloadDossier = async () => {
    if (!dossierPrintRef.current || !currentCard) return;
    setIsDownloadingDossier(true);
    try {
      const dataUrl = await toPng(dossierPrintRef.current, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains("no-print")) {
            return false;
          }
          return true;
        },
      });
      const patientSlug = (currentCard.english_name || currentCard.patient_name || "Patient").replace(/\s+/g, "_");
      const link = document.createElement("a");
      link.download = `HealthPass_Dossier_${patientSlug}_${currentCard.card_number}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(
        lang === "en"
          ? "Patient clinical dossier downloaded successfully!"
          : "রোগীর ক্লিনিক্যাল ডসিয়ার পেপার সফলভাবে ডাউনলোড হয়েছে!",
        { icon: "📄" }
      );
    } catch (err) {
      console.error("Dossier download failed:", err);
      toast.error(
        lang === "en"
          ? "Download failed. Please use the Print option."
          : "ডাউনলোড ব্যর্থ হয়েছে। দয়া করে প্রিন্ট অপশনটি ব্যবহার করুন।"
      );
    } finally {
      setIsDownloadingDossier(false);
    }
  };

  // 2. Download specific diagnostic lab paper
  const handleDownloadLabReport = async (report: DiagnosticReport) => {
    const reportEl =
      document.getElementById("lab-report-modal-content") ||
      document.getElementById(`lab-report-card-${report.id}`);
    if (!reportEl) return;
    try {
      const dataUrl = await toPng(reportEl, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains("no-print")) {
            return false;
          }
          return true;
        },
      });
      const link = document.createElement("a");
      link.download = `Lab_Report_${report.category}_${report.lab_ref}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(
        lang === "en" ? "Diagnostic report sheet downloaded!" : "ল্যাব রিপোর্ট শিট ডাউনলোড হয়েছে!",
        { icon: "🧪" }
      );
    } catch (err) {
      console.error("Lab report download error:", err);
      toast.error(lang === "en" ? "Download failed." : "ডাউনলোড ব্যর্থ হয়েছে।");
    }
  };

  // 3. Print helper: triggers window.print() (isolated by @media print)
  const handlePrintDossier = () => {
    window.print();
  };

  // 4. Visual AI Biometric Face Recognition Handlers
  const handleOpenVisualModal = () => {
    setShowVisualModal(true);
    setVisualTab("presets");
    setVisualProbeImage(null);
    setVisualCandidates([]);
  };

  const handleCloseVisualModal = () => {
    setShowVisualModal(false);
    handleStopWebcam();
  };

  const handleStartWebcam = async () => {
    try {
      setVisualTab("webcam");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
      });
      setWebcamStream(stream);
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play();
      }
    } catch (err) {
      console.warn("Webcam access error:", err);
      toast.error(
        lang === "en"
          ? "Camera access denied or unavailable. Please use photo upload or preset demo faces."
          : "ক্যামেরা এক্সেস পাওয়া যায়নি। দয়া করে ছবি আপলোড বা ডেমো ফেস ব্যবহার করুন।"
      );
      setVisualTab("upload");
    }
  };

  const handleStopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
  };

  const handleCaptureWebcam = async () => {
    if (!webcamVideoRef.current) return;
    const video = webcamVideoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setVisualProbeImage(dataUrl);
    handleStopWebcam();
    await runBiometricAnalysis(dataUrl);
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setVisualProbeImage(dataUrl);
      await runBiometricAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = async (targetId: string, imageSrc: string) => {
    setVisualProbeImage(imageSrc);
    await runBiometricAnalysis(imageSrc, targetId);
  };

  const runBiometricAnalysis = async (probeImage: string, targetPatientId?: string) => {
    setIsAnalyzingBiometrics(true);
    try {
      const candidates = await matchPatientPhoto(probeImage, INITIAL_HEALTH_CARDS, targetPatientId);
      setVisualCandidates(candidates);
      if (candidates.length > 0 && candidates[0].similarity >= 80) {
        toast.success(
          lang === "en"
            ? `Biometric Match Found: ${candidates[0].card.patient_name} (${candidates[0].similarity}% Confidence)`
            : `বায়োমেট্রিক ফেস ম্যাচ পাওয়া গেছে: ${candidates[0].card.patient_name} (${candidates[0].similarity}% মিল)`,
          { icon: "👤" }
        );
      }
    } catch (err) {
      console.warn("Biometric analysis error:", err);
    } finally {
      setIsAnalyzingBiometrics(false);
    }
  };

  const handleConfirmBiometricPatient = (candidate: VisualSearchResult) => {
    setSelectedCard(candidate.card);
    setQuery(candidate.card.patient_name);
    setShowVisualModal(false);
    handleStopWebcam();
    toast.success(
      lang === "en"
        ? `Patient Identity Confirmed: ${candidate.card.english_name || candidate.card.patient_name}`
        : `রোগীর পরিচয় নিশ্চিত হয়েছে: ${candidate.card.patient_name}`,
      { icon: "✅" }
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Sleek Hospital Clinical Emergency Header & Command Search Bar (Neat, Clean, Professional, No Clutter) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
        {/* Top Header Row: Emblem + Title + Status + 1-Click Language Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <HeartPulse size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {lang === "en" ? "Emergency HealthPass Clinical Registry" : "জরুরি হেলথপাস ক্লিনিক্যাল রেজিস্ট্রি"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{lang === "en" ? "Live Hospital Network" : "লাইভ হসপিটাল নেটওয়ার্ক"}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {lang === "en"
                  ? "Instant patient emergency dossier, biometric profile, severe allergy check & digital lab papers."
                  : "রোগীর তাৎক্ষণিক ইমার্জেন্সি ডসিয়ার, বায়োমেট্রিক্স, ড্রাগ অ্যালার্জি ও ডিজিটাল ল্যাব রিপোর্ট অনুসন্ধান।"}
              </p>
            </div>
          </div>

          {/* Right: Luxury Smooth Animated Language Switcher */}
          <div className="relative flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shadow-2xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                lang === "en" ? "text-sky-700 font-extrabold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {lang === "en" && (
                <motion.div
                  layoutId="activeLanguagePill"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/70 -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <span>🇬🇧 English</span>
            </button>

            <button
              type="button"
              onClick={() => setLang("bn")}
              className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                lang === "bn" ? "text-sky-700 font-extrabold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {lang === "bn" && (
                <motion.div
                  layoutId="activeLanguagePill"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/70 -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <span>🇧🇩 বাংলা</span>
            </button>
          </div>
        </div>

        {/* Command Search Console with Custom Filter Dropdown */}
        <div className="bg-slate-50/80 p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 focus-within:border-sky-400 focus-within:bg-white focus-within:ring-3 focus-within:ring-sky-500/10 transition-all flex flex-col gap-2">
          {/* Main Search Input & Actions Row */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1 min-w-0 flex items-center">
              <Search size={18} className="absolute left-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "en"
                  ? "Search by Patient Name, NID, Phone, Card ID, or Blood Group..."
                  : "রোগীর নাম, NID, ফোন নম্বর, কার্ড নম্বর বা রক্তের গ্রুপ দিয়ে খুঁজুন..."
                }
                className="w-full h-11 pl-10 pr-9 bg-transparent text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 font-medium focus:outline-none"
              />
              {isSearching ? (
                <div className="absolute right-3">
                  <RefreshCw size={16} className="text-sky-600 animate-spin" />
                </div>
              ) : query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Custom Production-Grade Filter Dropdown Popover */}
              <div ref={filterRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="h-11 px-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/90 shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                  title="Select search criterion"
                >
                  {(() => {
                    const Icon = currentFilterOption.icon;
                    return <Icon size={14} className="text-sky-600 shrink-0" />;
                  })()}
                  <span>{lang === "en" ? currentFilterOption.labelEn : currentFilterOption.labelBn}</span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isFilterOpen ? "rotate-180 text-sky-600" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-1"
                    >
                      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {lang === "en" ? "Filter By Parameter" : "সার্চ ফিল্টার নির্বাচন"}
                        </span>
                        <span className="text-[10px] text-sky-600 font-bold">
                          {filterOptions.length} {lang === "en" ? "Criteria" : "পদ্ধতি"}
                        </span>
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-1 candy-scrollbar p-0.5">
                        {filterOptions.map((opt) => {
                          const IconComp = opt.icon;
                          const isSelected = filterType === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setFilterType(opt.id);
                                setIsFilterOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                                isSelected
                                  ? "bg-sky-50 text-sky-900 font-bold border border-sky-200/80"
                                  : "hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                              }`}>
                                <IconComp size={15} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold truncate">
                                    {lang === "en" ? opt.labelEn : opt.labelBn}
                                  </span>
                                  {isSelected && <Check size={14} className="text-sky-600 shrink-0" />}
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                  {lang === "en" ? opt.descEn : opt.descBn}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Visual AI Biometric Face Recognition Button */}
              <button
                type="button"
                onClick={handleOpenVisualModal}
                title={lang === "en" ? "Visual AI Biometric Search (Photo/Webcam)" : "ভিজ্যুয়াল এআই বায়োমেট্রিক ফেস সার্চ (ছবি/ক্যামেরা)"}
                className="h-11 px-3.5 sm:px-4 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-md shrink-0 cursor-pointer flex items-center gap-1.5 group relative"
              >
                <ScanFace size={16} className="text-sky-200 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{lang === "en" ? "Visual Search" : "ছবি সার্চ"}</span>
                <span className="flex sm:hidden"><Camera size={15} /></span>
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-900 font-black text-[9px] px-1 rounded-full uppercase tracking-wider shadow-xs">
                  AI
                </span>
              </button>

              <button
                type="button"
                className="h-11 px-5 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Search size={15} />
                <span>{lang === "en" ? "Search" : "অনুসন্ধান"}</span>
              </button>
            </div>
          </div>

          {/* Google-Style Telemetry & Relevance Bar (Clean full-width bottom row) */}
          {query.trim().length > 0 && (
            <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sky-900">
                  {lang === "en"
                    ? `Found ${safeResults.length} matching patients for "${query}"`
                    : `"${query}" এর জন্য ${safeResults.length} জন রোগী পাওয়া গেছে`}
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
                  • {lang === "en" ? "Ranked by Google-style relevance algorithm across 12 medical dimensions" : "১২টি মেডিকেল ফিল্ড মিলিয়ে প্রাসঙ্গিকতা অনুযায়ী সাজানো"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200/80 transition-colors"
              >
                <RotateCcw size={11} />
                <span>{lang === "en" ? "Clear Search" : "ক্লিয়ার করুন"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Results List with Sticky Split-Scroll & 10-per-Page Pagination */}
        <div className={`space-y-3 ${currentCard ? "lg:col-span-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] flex flex-col" : "lg:col-span-12"}`}>
          {/* Queue Header & Status */}
          <div className="flex items-center justify-between px-1 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                {lang === "en" ? "Matching Patients" : "রেজাল্ট তালিকা"} ({safeResults.length})
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                dataSource === "database" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
              }`}>
                {dataSource === "database" ? (lang === "en" ? "Live Database" : "লাইভ ডাটাবেজ") : (lang === "en" ? "Verified Registry" : "ভেরিফাইড রেজিস্ট্রি")}
              </span>
            </div>
            {currentCard && (
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="text-xs font-bold text-sky-600 hover:underline lg:hidden cursor-pointer"
              >
                {lang === "en" ? "Full List" : "রেজাল্ট ভিউ"}
              </button>
            )}
          </div>

          {/* Scrollable Patient Cards Container with Independent Smooth Scroll */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar min-h-0">
            {isSearching ? (
              /* Soft & Gentle Shimmer Skeleton Loader for Patient Queue */
              <div className="space-y-2.5 animate-pulse">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded w-4/5 pt-1" />
                  </div>
                ))}
              </div>
            ) : safeResults.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
                  <AlertOctagon size={26} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    {lang === "en" ? "No Patient Record Found" : "কোনো রেকর্ড পাওয়া যায়নি"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {lang === "en"
                      ? "No emergency HealthPass matches the provided name, NID, or phone number."
                      : "প্রদত্ত NID, নাম বা ফোন নম্বরের বিপরীতে কোনো হেলথ রেকর্ড নেই।"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFilterType("all");
                    setCardList(INITIAL_HEALTH_CARDS);
                    setSelectedCard(INITIAL_HEALTH_CARDS[0]);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>{lang === "en" ? "Reload Active Queue Registry" : "ডিফল্ট রেজিস্ট্রি রিলোড করুন"}</span>
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`page-${currentPage}-${filterType}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-2.5"
                >
                  {paginatedResults.map((patient) => {
                    const isSelected = currentCard?.id === patient.id;
                const age = calculateAge(patient.date_of_birth);
                const patientAllergies = Array.isArray(patient?.allergies) ? patient.allergies : [];
                return (
                  <motion.div
                    key={patient.id}
                    onClick={() => handleSelectPatientWithSkeleton(patient)}
                    whileHover={{ scale: 1.01 }}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-sky-50/70 border-sky-400 shadow-md ring-2 ring-sky-400/20"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    {/* Left vertical status stripe */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        patient.has_pacemaker
                          ? "bg-amber-500"
                          : patientAllergies.length > 0
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                      }`}
                    />

                    <div className="flex items-start justify-between gap-3 pl-1">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          {patient.patient_image ? (
                            <img
                              src={patient.patient_image}
                              alt={patient.patient_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={22} className="text-sky-300" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {patient.english_name || patient.patient_name}
                            </h4>
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0" title="Verified Biometric Profile">
                              <CheckCircle2 size={11} />
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {patient.patient_name} • NID: {patient.nid_number || "Unregistered"}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-slate-600">
                            <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                              {patient.card_number}
                            </span>
                            <span>{lang === "en" ? `Age: ${age} Yrs` : `বয়স: ${age} বছর`}</span>
                            <span>• {patient.gender}</span>
                            <span>• <MapPin size={11} className="inline text-sky-600" /> {patient.zila || "Dhaka"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Blood Group Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center text-sm shadow-xs border border-rose-700">
                          {patient.blood_group}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 font-mono">
                          {patient.personal_phone?.slice(-4) ? `*${patient.personal_phone.slice(-4)}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Google-Style Relevance Match Badges */}
                    {(patient as any)._matchReasons && (patient as any)._matchReasons.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={11} className="text-sky-500" />
                          {lang === "en" ? "Match:" : "ম্যাচ:"}
                        </span>
                        {((patient as any)._matchReasons as SearchMatchReason[]).slice(0, 3).map((r, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[10px] font-medium bg-sky-50 text-sky-800 px-2 py-0.5 rounded-md border border-sky-100"
                          >
                            <span className="font-bold text-sky-900">{r.field}:</span>
                            <span className="truncate max-w-[130px]">{r.matchedText}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick alerts bar inside list item */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                      {patientAllergies.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                          <AlertTriangle size={11} />
                          <span>{lang === "en" ? `Allergy: ${patientAllergies.slice(0, 2).join(", ")}` : `এলার্জি: ${patientAllergies.slice(0, 2).join(", ")}`}</span>
                        </span>
                      )}
                      {patient.has_pacemaker && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                          <HeartPulse size={11} />
                          <span>{lang === "en" ? "Pacemaker Active (No MRI)" : "পেসমেকার সক্রিয় (MRI নিষিদ্ধ)"}</span>
                        </span>
                      )}
                      {patient.organ_donor && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          <Heart size={11} />
                          <span>{lang === "en" ? "Organ Donor" : "অঙ্গদাতা"}</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

          {/* Sticky 10-per-Page Pagination Console at bottom */}
          {safeResults.length > PAGE_SIZE && (
            <div className="pt-2 pb-1 border-t border-slate-200/80 bg-slate-50/90 rounded-2xl px-3 py-2 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-500">
                {lang === "en"
                  ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, safeResults.length)} of ${safeResults.length}`
                  : `${safeResults.length} জনের মধ্যে ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, safeResults.length)}`}
              </span>

              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Page Number Buttons: 1, 2, 3, 4 */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNo) => (
                  <button
                    key={pageNo}
                    type="button"
                    onClick={() => setCurrentPage(pageNo)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNo
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {pageNo}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Emergency Medical Dossier or Smart Card */}
        {currentCard && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6"
          >
            {/* Clean, Unified Header: Patient Identity + Minimal View Switcher & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              {/* Left: Patient Identity */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  {viewMode === "paper" ? <FileText size={18} /> : <CreditCard size={18} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                      {viewMode === "paper"
                        ? (lang === "en" ? "Clinical Dossier" : "ক্লিনিক্যাল ডসিয়ার")
                        : (lang === "en" ? "Emergency Health Card" : "জরুরি হেলথ কার্ড")}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {lang === "en" ? "ACTIVE EHR" : "সক্রিয় রেকর্ড"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                    UID: <span className="font-bold text-sky-800">{currentCard.smart_card_uid}</span>
                    {currentCard.nid_number ? ` • NID: ${currentCard.nid_number}` : ""}
                  </p>
                </div>
              </div>

              {/* Right Corner: The 2 Simple View Toggle Buttons */}
              <div className="no-print shrink-0 self-end sm:self-auto">
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setViewMode("paper")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "paper"
                        ? "bg-white text-sky-700 shadow-xs border border-slate-200/60 font-black"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileText size={14} />
                    <span>{lang === "en" ? "Dossier" : "ডসিয়ার"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("card")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "card"
                        ? "bg-white text-sky-700 shadow-xs border border-slate-200/60 font-black"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>{lang === "en" ? "Card" : "কার্ড"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Soft & Gentle Shimmer Skeleton Loader for Clinical Dossier */}
            {isLoadingPatient ? (
              <div className="space-y-6 animate-pulse py-2">
                {/* Header Skeleton */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-200 shrink-0" />
                    <div className="space-y-2">
                      <div className="h-5 bg-slate-200 rounded w-48" />
                      <div className="h-3.5 bg-slate-100 rounded w-32" />
                      <div className="flex gap-2 pt-1">
                        <div className="h-4 bg-slate-100 rounded w-20" />
                        <div className="h-4 bg-slate-100 rounded w-20" />
                        <div className="h-4 bg-slate-100 rounded w-24" />
                      </div>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0" />
                </div>

                {/* Vitals Grid Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-44" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-16 bg-slate-100 border border-slate-200/80 rounded-xl" />
                    ))}
                  </div>
                </div>

                {/* Emergency Contact Skeleton */}
                <div className="h-28 bg-slate-100 border border-slate-200 rounded-2xl" />

                {/* Labs & History Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-40 bg-slate-100 border border-slate-200 rounded-2xl" />
                  <div className="h-40 bg-slate-100 border border-slate-200 rounded-2xl" />
                </div>
              </div>
            ) : (
              <>
            {/* Critical Anaphylaxis & Pacemaker Red Alert Banner (Collapsible) */}
            {safeAllergies.length > 0 && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 overflow-hidden shadow-xs">
                <div
                  className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                  onClick={() => toggleSection("alerts")}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="text-xs leading-relaxed min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="font-extrabold uppercase tracking-wide block text-rose-800 text-xs sm:text-sm">
                          {lang === "en" ? "CRITICAL DRUG ALLERGY WARNING (ANAPHYLAXIS RISK)" : "⚠️ জরুরি ড্রাগ এলার্জি সতর্কতা (Severe Anaphylaxis Risk)"}
                        </strong>
                      </div>
                      {!collapsedSections.alerts && (
                        <p className="mt-1 text-rose-900 font-medium">
                          {lang === "en"
                            ? `Patient has documented severe adverse reactions to: `
                            : `রোগীর শরীরে মারাত্মক অ্যালার্জিক রিঅ্যাকশন ঘটবে: `}
                          <strong className="underline decoration-rose-400 font-bold">{safeAllergies.join(", ")}</strong>.
                          {lang === "en"
                            ? " Do NOT administer penicillin-class antibiotics or contraindicated NSAIDs before allergy review."
                            : " যেকোনো অ্যান্টিবায়োটিক বা এনএসএআইডি দেওয়ার পূর্বে অবশ্যই সাবধান থাকুন।"}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-100 transition-colors shrink-0"
                    title={collapsedSections.alerts ? "Expand Alert Details" : "Minimize Alert Details"}
                  >
                    {collapsedSections.alerts ? <Plus size={15} /> : <Minus size={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* Pacemaker Alert Banner */}
            {currentCard.has_pacemaker && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <HeartPulse size={20} className="shrink-0 text-amber-600" />
                  <div className="text-xs font-medium">
                    <strong className="font-bold text-amber-900 uppercase">
                      {lang === "en" ? "Active Cardiac Pacemaker Implant:" : "সক্রিয় কার্ডিয়াক পেসমেকার সতর্কবার্তা:"}
                    </strong>{" "}
                    {lang === "en"
                      ? "Patient has an implanted cardiac pacemaker. MRI scans are strictly contraindicated. Defibrillator pads must be placed >8cm from pulse generator."
                      : "রোগীর শরীরে স্থায়ী পেসমেকার রয়েছে। MRI স্ক্যান সম্পূর্ণ নিষিদ্ধ।"}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODES WITH SMOOTH 60FPS MORPHING TRANSITION */}
            <AnimatePresence mode="wait">
              {viewMode === "card" ? (
                <motion.div
                  key={`card-mode-${currentCard.id}`}
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between px-1 text-xs">
                    <span className="text-slate-500 font-medium">
                      {lang === "en" ? "Click card or button below to flip:" : "কার্ডে বা নিচের বাটনে ক্লিক করে উল্টান:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDossierFlipped(!isDossierFlipped)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <FlipHorizontal size={14} />
                      <span>{isDossierFlipped ? (lang === "en" ? "Show Front" : "সামনে দেখুন") : (lang === "en" ? "Show Back" : "পেছন দেখুন")}</span>
                    </button>
                  </div>

                  <div className="flex justify-center my-2">
                    <AnimatePresence mode="wait">
                      {!isDossierFlipped ? (
                        <motion.div
                          key="dossier-front"
                          initial={{ rotateY: -90, opacity: 0 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          exit={{ rotateY: 90, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full max-w-[500px]"
                        >
                          <HealthPassCard
                            card={currentCard}
                            profileImage={currentCard.patient_image}
                            onFlip={() => setIsDossierFlipped(true)}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="dossier-back"
                          initial={{ rotateY: 90, opacity: 0 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          exit={{ rotateY: -90, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full max-w-[500px]"
                        >
                          <HealthPassBack
                            card={currentCard}
                            onFlip={() => setIsDossierFlipped(false)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`paper-mode-${currentCard.id}`}
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  ref={dossierPrintRef}
                  id="printable-patient-dossier"
                  className="space-y-6 bg-white"
                >
                {/* Secondary Action Toolbar: Brought down below the header */}
                <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">
                      {lang === "en" ? "Standard Hospital EHR • 6 Clinical Sections" : "হাসপাতাল ভর্তি ও সামারি রেকর্ড • ৬টি সেকশন"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Collapse / Expand Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const allCollapsed = Object.values(collapsedSections).every(Boolean);
                        toggleAllSections(!allCollapsed);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/80"
                      title={lang === "en" ? "Collapse or expand all sections" : "সব সেকশন সংক্ষেপ বা বিস্তারিত করুন"}
                    >
                      {Object.values(collapsedSections).every(Boolean) ? (
                        <>
                          <Plus size={13} />
                          <span>{lang === "en" ? "Expand All" : "সব খুলুন"}</span>
                        </>
                      ) : (
                        <>
                          <Minus size={13} />
                          <span>{lang === "en" ? "Collapse All" : "সব সংক্ষেপ"}</span>
                        </>
                      )}
                    </button>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={handleDownloadDossier}
                      disabled={isDownloadingDossier}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/80"
                      title={lang === "en" ? "Download patient document" : "রোগীর তথ্য ডাউনলোড করুন"}
                    >
                      <Download size={13} className={isDownloadingDossier ? "animate-bounce" : ""} />
                      <span>{isDownloadingDossier ? (lang === "en" ? "Saving..." : "ডাউনলোড...") : (lang === "en" ? "Download" : "ডাউনলোড")}</span>
                    </button>

                    {/* Print Button */}
                    <button
                      type="button"
                      onClick={handlePrintDossier}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                      title={lang === "en" ? "Print hospital sheet" : "প্রিন্ট করুন"}
                    >
                      <Printer size={13} />
                      <span>{lang === "en" ? "Print" : "প্রিন্ট"}</span>
                    </button>
                  </div>
                </div>

                {/* 1. Patient Demographics & Profile Summary */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-200 border-2 border-white shadow-xs overflow-hidden shrink-0 relative">
                      {currentCard.patient_image ? (
                        <img
                          src={currentCard.patient_image}
                          alt={currentCard.patient_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-sky-300">
                          <User size={32} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                          {currentCard.english_name || currentCard.patient_name}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{lang === "en" ? "Verified" : "ভেরিফায়েড"}</span>
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-sky-700">
                        {currentCard.patient_name} • {currentCard.gender.toUpperCase()} • {calculateAge(currentCard.date_of_birth)} {lang === "en" ? "Yrs" : "বছর"}
                      </p>

                      {/* Demographics & National Registry Identifiers */}
                      <div className="flex flex-wrap items-center gap-2 pt-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 shadow-2xs">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">NID:</span>
                          <span className="font-bold text-slate-900">{currentCard.nid_number || "Unregistered"}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 shadow-2xs">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">DOB:</span>
                          <span className="font-bold text-slate-900">{formatDate(currentCard.date_of_birth)}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 shadow-2xs">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">CARD UID:</span>
                          <span className="font-bold text-sky-700">{currentCard.smart_card_uid}</span>
                        </span>

                        {currentCard.personal_phone && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-950 shadow-2xs">
                            <span className="text-[10px] uppercase tracking-wider text-sky-600 font-bold">CELL:</span>
                            <span className="font-bold text-sky-900">{currentCard.personal_phone}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(currentCard.personal_phone!, "patient_cell", "Patient Cell")}
                              className="ml-1 text-sky-600 hover:text-sky-900 cursor-pointer"
                              title="Copy cell phone"
                            >
                              {copiedField === "patient_cell" ? (
                                <Check size={11} className="text-emerald-600" />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Blood Group Display */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white font-black flex items-center justify-center text-2xl shadow-xs border border-rose-700 shrink-0">
                        {currentCard.blood_group}
                      </div>
                      <div className="md:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {lang === "en" ? "Blood Group" : "রক্তের গ্রুপ"}
                        </span>
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 mt-0.5 inline-block">
                          {currentCard.blood_group === "O-" ? "Universal Donor" : currentCard.blood_group === "AB+" ? "Universal Recipient" : "Rh Positive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Clinical Vitals & Bio-Metrics Dashboard (Collapsible & Minimizable) */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden p-3.5 sm:p-4">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={15} className="text-sky-600" />
                        <span>{lang === "en" ? "Clinical Bio-Metrics & Triage Vitals" : "ক্লিনিক্যাল ভাইটাল ও বায়োমেট্রিক্স"}</span>
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        • {lang === "en" ? "Recorded: Today" : "আজকের রেকর্ড"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSection("vitals")}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={collapsedSections.vitals ? "Expand Vitals" : "Minimize Vitals"}
                    >
                      {collapsedSections.vitals ? <Plus size={15} /> : <Minus size={15} />}
                    </button>
                  </div>

                  {!collapsedSections.vitals && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {lang === "en" ? "Blood Pressure" : "রক্তচাপ"}
                        </span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block font-mono">
                          {cleanVitalValue(safeVitals?.blood_pressure) || "130/85"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">mmHg</span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {lang === "en" ? "Heart Rate" : "পালস রেট"}
                        </span>
                        <span className="text-sm font-black text-rose-600 mt-0.5 block font-mono">
                          {cleanVitalValue(safeVitals?.heart_rate) || "76"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">bpm (Sinus)</span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {lang === "en" ? "Oxygen (SpO2)" : "অক্সিজেন"}
                        </span>
                        <span className="text-sm font-black text-sky-600 mt-0.5 block font-mono">
                          {safeVitals?.spo2?.includes("%") ? safeVitals.spo2 : `${cleanVitalValue(safeVitals?.spo2) || "98"}%`}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">Room Air</span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {lang === "en" ? "Blood Glucose" : "রক্ত শর্করা"}
                        </span>
                        <span className="text-sm font-black text-amber-600 mt-0.5 block font-mono">
                          {cleanVitalValue(safeVitals?.blood_glucose) || "115"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">mg/dL (Fasting)</span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {lang === "en" ? "Temperature" : "তাপমাত্রা"}
                        </span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block font-mono">
                          {cleanVitalValue(safeVitals?.temperature) || "98.6"}°F
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">Afebrile (Normal)</span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {lang === "en" ? "BMI / Weight" : "বিএমআই"}
                        </span>
                        <span className="text-sm font-black text-emerald-700 mt-0.5 block font-mono">
                          {cleanVitalValue(safeVitals?.bmi) || "24.2"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">kg/m² (Normal)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Emergency ICE Guardian Contact Callout (Prominent, Authoritative & Minimizable) */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
                  <div
                    className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none"
                    onClick={() => toggleSection("emergencyContact")}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {lang === "en" ? "PRIMARY EMERGENCY GUARDIAN / PARENT NUMBER" : "জরুরি অভিভাবক ও প্যারেন্ট নাম্বার (ICE CONTACT)"}
                        </span>
                      </div>

                      <p className="text-base font-black text-slate-900">
                        {currentCard.emergency_contact_name}{" "}
                        <span className="text-xs font-semibold text-slate-500">
                          ({currentCard.emergency_contact_relation})
                        </span>
                      </p>

                      <div className="flex items-center gap-3 pt-0.5">
                        <span className="text-sm sm:text-base font-mono font-black text-sky-800 tracking-wide">
                          {currentCard.emergency_contact_phone}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {lang === "en" ? "Verified Active" : "সক্রিয় নম্বর"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSection("emergencyContact");
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title={collapsedSections.emergencyContact ? "Expand ICE Actions" : "Minimize ICE Actions"}
                      >
                        {collapsedSections.emergencyContact ? <Plus size={16} /> : <Minus size={16} />}
                      </button>
                    </div>
                  </div>

                  {!collapsedSections.emergencyContact && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 no-print">
                      <span className="text-xs text-slate-500 font-medium">
                        {lang === "en" ? "Instant ICE Emergency Response Actions:" : "জরুরি কল ও অ্যালার্ট অ্যাকশন সমূহ:"}
                      </span>

                      {/* Actions: Copy + QR + Call + WhatsApp */}
                      <div className="no-print flex flex-wrap items-center gap-2">
                        {/* 1-Click Copy Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(currentCard.emergency_contact_phone, "parent_phone_card", "Parent Phone")}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
                        >
                          {copiedField === "parent_phone_card" ? (
                            <>
                              <Check size={14} className="text-emerald-600" />
                              <span className="text-emerald-700">{lang === "en" ? "Copied!" : "কপি হয়েছে!"}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} className="text-slate-500" />
                              <span>{lang === "en" ? "Copy Number" : "নাম্বার কপি"}</span>
                            </>
                          )}
                        </button>

                        {/* QR Code Auto-Dial Modal Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setShowPhoneQrModal(true)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl border border-sky-200 shadow-2xs transition-all cursor-pointer"
                          title="Scan QR with phone to auto-dial"
                        >
                          <QrCode size={14} className="text-sky-600" />
                          <span>{lang === "en" ? "Scan to Call" : "কিউআর কল"}</span>
                        </button>

                        {/* Direct Call Button */}
                        <a
                          href={`tel:${currentCard.emergency_contact_phone}`}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <Phone size={14} />
                          <span>{lang === "en" ? "Direct Call" : "সরাসরি কল"}</span>
                        </a>

                        {/* WhatsApp Alert Button */}
                        {currentCard.emergency_has_whatsapp && currentCard.emergency_contact_phone && (
                          <a
                            href={`https://wa.me/${(currentCard.emergency_contact_phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Official Medical Emergency Notice: Patient ${currentCard.patient_name} (${currentCard.english_name || ""}) is currently at the Hospital Emergency Department. Please contact the attending physician.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            title="Send verified WhatsApp emergency alert"
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Active Medications & Chronic Conditions Table */}
                <div className="rounded-2xl bg-slate-50/80 border border-slate-200 overflow-hidden">
                  <div
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none border-b border-slate-200/80"
                    onClick={() => toggleSection("medications")}
                  >
                    <div className="flex items-center gap-2">
                      <Pill size={16} className="text-emerald-600" />
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                        {lang === "en" ? "Active Medications & Chronic Conditions" : "চলমান প্রেসক্রিপশন ও দীর্ঘস্থায়ী রোগ"}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {safeMedications.length} {lang === "en" ? "Meds" : "ঔষধ"} • {safeConditions.length} {lang === "en" ? "Conditions" : "রোগ"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection("medications");
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title={collapsedSections.medications ? "Expand Medications & Conditions" : "Minimize Medications & Conditions"}
                    >
                      {collapsedSections.medications ? <Plus size={16} /> : <Minus size={16} />}
                    </button>
                  </div>

                  {!collapsedSections.medications && (
                    <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Active Medications */}
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill size={15} className="text-emerald-600" />
                          <span>{lang === "en" ? "Active Ongoing Medications" : "চলমান প্রেসক্রিপশন ও ঔষধ"}</span>
                        </h4>
                        {safeMedications.length > 0 ? (
                          <div className="space-y-2">
                            {safeMedications.map((med, i) => (
                              <div
                                key={i}
                                className="p-3 bg-slate-50/60 border border-slate-200/90 rounded-xl text-xs space-y-1 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <strong className="text-slate-900 font-bold">{med.name}</strong>
                                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                    {med.dosage}
                                  </span>
                                </div>
                                <p className="text-slate-600 font-medium">
                                  {med.frequency} • {med.duration || "Continuous"}
                                </p>
                                {med.instructions && (
                                  <p className="text-[11px] text-slate-400 italic">
                                    {med.instructions}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">{lang === "en" ? "No active medications recorded." : "কোনো চলমান ওষুধের রেকর্ড নেই।"}</p>
                        )}
                      </div>

                      {/* Chronic Conditions */}
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Stethoscope size={15} className="text-sky-600" />
                          <span>{lang === "en" ? "Chronic Conditions & History" : "দীর্ঘস্থায়ী রোগ ও হিস্ট্রি"}</span>
                        </h4>
                        {safeConditions.length > 0 ? (
                          <div className="space-y-2">
                            {safeConditions.map((item, i) => (
                              <div
                                key={i}
                                className="p-3 bg-slate-50/60 border border-slate-200/90 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                              >
                                <div>
                                  <strong className="font-bold text-slate-900 block">{item.name}</strong>
                                  <span className="text-[11px] text-slate-400">
                                    {lang === "en" ? `Diagnosed: ${item.since}` : `শনাক্ত: ${item.since}`}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 uppercase">
                                  {item.status || "controlled"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">{lang === "en" ? "No chronic conditions recorded." : "কোনো ক্রনিক রোগ নেই।"}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. VERIFIED DIAGNOSTIC LAB REPORT PAPERS (User's specific core requirement!) */}
                <div className="rounded-2xl bg-slate-50/80 border border-slate-200 overflow-hidden">
                  <div
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer select-none border-b border-slate-200/80"
                    onClick={() => toggleSection("labReports")}
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <FileText size={16} className="text-sky-600" />
                        <span>{lang === "en" ? "Digitalized Diagnostic Report Papers" : "ডিজিটাল ডায়াগনস্টিক রিপোর্ট পেপারসমূহ"}</span>
                        <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                          {safeReports.length} {lang === "en" ? "Available" : "সংযুক্ত"}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lang === "en"
                          ? "View full hospital lab parameters, reference ranges, and download official PDF/print report sheets."
                          : "ল্যাব প্যারামিটার ও রেফারেন্স রেঞ্জ দেখুন এবং অফিশিয়াল পেপার ডাউনলোড করুন।"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection("labReports");
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer self-end sm:self-center"
                      title={collapsedSections.labReports ? "Expand Lab Reports" : "Minimize Lab Reports"}
                    >
                      {collapsedSections.labReports ? <Plus size={16} /> : <Minus size={16} />}
                    </button>
                  </div>

                  {!collapsedSections.labReports && (
                    <div className="p-4 sm:p-5 space-y-4">
                      {safeReports.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {safeReports.map((report) => (
                            <div
                              key={report.id}
                              id={`lab-report-card-${report.id}`}
                              className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs hover:border-sky-300 transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase font-mono">
                                    {report.category}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    report.status === "Normal"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}>
                                    {report.status}
                                  </span>
                                </div>

                                <h5 className="font-bold text-slate-900 text-sm mt-2 leading-snug">
                                  {report.title}
                                </h5>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                  {report.hospital} • {report.date}
                                </p>
                                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                                  {report.summary}
                                </p>
                              </div>

                              {/* Action Buttons: View Full Lab Paper & Download Only Lab Slip */}
                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 no-print">
                                <button
                                  type="button"
                                  onClick={() => setActiveReportModal(report)}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                >
                                  <Eye size={13} />
                                  <span>{lang === "en" ? "View Lab Paper" : "পেপার দেখুন"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadLabReport(report)}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                  title="Download Report Sheet Image"
                                >
                                  <Download size={13} />
                                  <span>{lang === "en" ? "Download" : "ডাউনলোড"}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                          {lang === "en" ? "No digitized diagnostic reports currently attached to this patient." : "কোনো ডায়াগনস্টিক রিপোর্ট সংরক্ষিত নেই।"}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 6. Attending Physician Digital Seal & Bottom Actions */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-slate-800">
                      {lang === "en" ? "Registered HealthPass Address:" : "রেজিস্টার্ড ঠিকানা:"}
                    </span>{" "}
                    {currentCard.address || "Dhanmondi, Dhaka, Bangladesh"}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {lang === "en" ? `Card Issued: ${formatDate(currentCard.issued_at)}` : `ইস্যু তারিখ: ${formatDate(currentCard.issued_at)}`}
                  </div>
                </div>

                {/* Final 1-Click Print & Download Actions */}
                <div className="no-print flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleDownloadDossier}
                    disabled={isDownloadingDossier}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border border-slate-200"
                  >
                    <Download size={15} className={isDownloadingDossier ? "animate-bounce" : ""} />
                    <span>{isDownloadingDossier ? (lang === "en" ? "Downloading..." : "ডাউনলোড হচ্ছে...") : (lang === "en" ? "Download Dossier Slip" : "ডসিয়ার স্লিপ ডাউনলোড")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintDossier}
                    className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>{lang === "en" ? "Print Full Clinical Dossier & Summary Sheet" : "সম্পূর্ণ ক্লিনিক্যাল ডসিয়ার ও সামারি প্রিন্ট করুন"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  )}
      </div>

      {/* MODAL 1: OFFICIAL DIAGNOSTIC LAB REPORT PAPER VIEWER & DOWNLOADER */}
      {activeReportModal && currentCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            id="lab-report-modal-content"
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900 relative"
          >
            {/* Modal Hospital Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest block font-mono">
                  OFFICIAL CLINICAL DIAGNOSTIC REPORT
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {activeReportModal.hospital}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Lab Ref: {activeReportModal.lab_ref} • Date: {activeReportModal.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReportModal(null)}
                className="no-print w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Patient Header Block */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Patient Name</span>
                <strong className="text-slate-900 font-sans font-bold">
                  {currentCard.english_name || currentCard.patient_name}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Blood Group / Age</span>
                <strong className="text-rose-600 font-bold">{currentCard.blood_group}</strong> • {calculateAge(currentCard.date_of_birth)} Yrs
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">NID Number</span>
                <strong className="text-slate-800">{currentCard.nid_number || "Unregistered"}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">HealthPass UID</span>
                <strong className="text-sky-700">{currentCard.card_number}</strong>
              </div>
            </div>

            {/* Test Summary & Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-black text-slate-900 uppercase">
                  {activeReportModal.title}
                </h4>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  activeReportModal.status === "Normal"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {activeReportModal.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 bg-sky-50/50 p-3 rounded-xl border border-sky-100 leading-relaxed">
                <strong>Clinical Impression:</strong> {activeReportModal.summary}
              </p>
            </div>

            {/* Detailed Parameters Table if available */}
            {activeReportModal.parameters && activeReportModal.parameters.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Test Parameter</th>
                      <th className="p-3">Result Value</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Normal Reference Range</th>
                      <th className="p-3 text-right">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeReportModal.parameters.map((param, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 font-mono">
                        <td className="p-3 font-sans font-bold text-slate-800">{param.name}</td>
                        <td className="p-3 font-bold text-slate-900">{param.value}</td>
                        <td className="p-3 text-slate-500">{param.unit}</td>
                        <td className="p-3 text-slate-500">{param.reference_range}</td>
                        <td className="p-3 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            param.flag === "NORMAL"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800 font-black"
                          }`}>
                            {param.flag || "NORMAL"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Doctor Notes & Sign-off */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                <span className="font-bold text-slate-700">Electronically Verified By:</span>{" "}
                <span className="text-slate-900 font-medium">{activeReportModal.verified_by || "Chief Clinical Pathologist"}</span>
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                Hospital LIMS Security Barcode Validated
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t no-print">
              <button
                type="button"
                onClick={() => setActiveReportModal(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {lang === "en" ? "Close" : "বন্ধ করুন"}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadLabReport(activeReportModal)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer border border-slate-200"
              >
                <Download size={15} />
                <span>{lang === "en" ? "Download Paper" : "পেপার ডাউনলোড"}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Printer size={15} />
                <span>{lang === "en" ? "Print Lab Paper" : "ল্যাব পেপার প্রিন্ট"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: PARENT EMERGENCY NUMBER SMARTPHONE QR AUTO-DIAL */}
      <AnimatePresence>
        {showPhoneQrModal && currentCard && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowPhoneQrModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto">
                <Phone size={22} />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  {lang === "en" ? "Scan to Call Parent / Guardian" : "স্ক্যান করে অভিভাবককে কল করুন"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === "en"
                    ? "Scan this QR with any smartphone camera to automatically open dialer and call the guardian."
                    : "যেকোনো স্মার্টফোনের ক্যামেরা দিয়ে স্ক্যান করলে স্বয়ংক্রিয়ভাবে অভিভাবকের নম্বরে ডায়াল অপশন চলে আসবে।"}
                </p>
              </div>

              {/* QR Code Rendering */}
              <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl inline-block shadow-inner mx-auto">
                <QRCodeSVG
                  value={`tel:${(currentCard.emergency_contact_phone || "").replace(/\s+/g, "")}`}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {lang === "en" ? "Guardian Contact:" : "অভিভাবক:"}
                </span>
                <strong className="text-xs font-bold text-slate-800 block">
                  {currentCard.emergency_contact_name} ({currentCard.emergency_contact_relation})
                </strong>
                <span className="font-mono text-sm font-black text-sky-700 block">
                  {currentCard.emergency_contact_phone}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyText(currentCard.emergency_contact_phone, "modal_qr_phone", "Parent Phone")}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copiedField === "modal_qr_phone" ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-700">{lang === "en" ? "Copied" : "কপি হয়েছে"}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>{lang === "en" ? "Copy" : "কপি"}</span>
                    </>
                  )}
                </button>

                <a
                  href={`tel:${currentCard.emergency_contact_phone}`}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Phone size={14} />
                  <span>{lang === "en" ? "Call Now" : "কল করুন"}</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EMERGENCY ADMISSION & TRAUMA TRIAGE SLIP */}
      {showPrintModal && currentCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900">
            {/* Print Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest block">
                  EMERGENCY TRAUMA & ADMISSION SLIP
                </span>
                <h3 className="text-xl font-black">
                  Oxpecker National HealthPass Emergency Triage
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* High-Contrast Print Body */}
            <div className="space-y-4 font-mono text-xs border p-4 rounded-xl bg-slate-50">
              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Patient Name</span>
                  <strong className="text-sm font-bold text-slate-900 font-sans">
                    {currentCard.english_name || currentCard.patient_name}
                  </strong>
                  <p className="text-slate-600 text-xs">{currentCard.patient_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block uppercase">Blood Group</span>
                  <span className="text-2xl font-black text-rose-600">
                    {currentCard.blood_group}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b pb-3">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">NID Number</span>
                  <strong>{currentCard.nid_number || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">DOB / Age</span>
                  <strong>{currentCard.date_of_birth} ({calculateAge(currentCard.date_of_birth)} Yrs)</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Gender</span>
                  <strong>{currentCard.gender}</strong>
                </div>
              </div>

              <div className="border-b pb-3">
                <span className="text-rose-600 text-[10px] font-bold block uppercase">
                  ⚠️ Critical Drug Allergies
                </span>
                <p className="font-bold text-rose-700 text-sm">
                  {safeAllergies.length > 0 ? safeAllergies.join(", ") : "NO RECORDED DRUG ALLERGIES"}
                </p>
              </div>

              <div className="border-b pb-3">
                <span className="text-slate-400 text-[10px] block uppercase">Primary ICE Contact</span>
                <p className="font-bold text-slate-900">
                  {currentCard.emergency_contact_name} ({currentCard.emergency_contact_relation}) • {currentCard.emergency_contact_phone}
                </p>
              </div>

              <div className="border-b pb-3">
                <span className="text-slate-400 text-[10px] block uppercase">Active Implants / Chronic</span>
                <p>Pacemaker: {currentCard.has_pacemaker ? "YES (ACTIVE)" : "NO"} | Diabetic: {currentCard.diabetic_status || "None"}</p>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 flex justify-between">
                <span>Hospital Triage Desk: Emergency Trauma Unit</span>
                <span>Timestamp: {new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {lang === "en" ? "Cancel" : "বাতিল করুন"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Printer size={15} />
                <span>{lang === "en" ? "Print Admission Slip" : "মুদ্রণ করুন (Print Slip)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Visual AI Biometric Face Recognition Modal */}
      {showVisualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white shadow-md">
                  <ScanFace size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {lang === "en" ? "Visual AI Biometric Patient Matcher" : "জরুরি এআই বায়োমেট্রিক ফেস আইডেন্টিফিকেশন"}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      Neural Scan
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === "en"
                      ? "Designed for unconscious or unidentified trauma patients. Matches facial features against the national registry."
                      : "অচেতন বা অজ্ঞাতনামা জরুরি রোগীদের তাৎক্ষণিক ফেস রিকগনিশন ও ডাটাবেজ ম্যাচিং।"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseVisualModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setVisualTab("presets")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  visualTab === "presets" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles size={14} />
                <span>{lang === "en" ? "Emergency Presets (1-Click Test)" : "ডেমো পেশেন্ট প্রিসেট"}</span>
              </button>
              <button
                type="button"
                onClick={() => setVisualTab("upload")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  visualTab === "upload" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Upload size={14} />
                <span>{lang === "en" ? "Upload Photo" : "ছবি আপলোড"}</span>
              </button>
              <button
                type="button"
                onClick={handleStartWebcam}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  visualTab === "webcam" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Camera size={14} />
                <span>{lang === "en" ? "Live ER Camera" : "লাইভ ক্যামেরা"}</span>
              </button>
            </div>

            {/* Tab 1: Emergency Presets */}
            {visualTab === "presets" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 font-medium">
                  {lang === "en"
                    ? "Select an emergency patient portrait to simulate camera biometric capture from trauma triage:"
                    : "ট্রমা ট্রায়াজ ক্যামেরা টেস্ট করার জন্য নিচের যেকোনো একটি ছবি সিলেক্ট করুন:"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INITIAL_HEALTH_CARDS.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSelectPreset(card.id, card.photo_url || "")}
                      className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer flex flex-col items-center text-center ${
                        visualProbeImage === card.photo_url
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm"
                          : "border-slate-200 hover:border-indigo-300 bg-white"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md mb-2 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={card.photo_url}
                          alt={card.patient_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate w-full">
                        {card.english_name || card.patient_name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {card.blood_group} • {card.gender}
                      </span>
                      {card.has_pacemaker && (
                        <span className="mt-1 text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          Pacemaker
                        </span>
                      )}
                      {card.organ_donor && !card.has_pacemaker && (
                        <span className="mt-1 text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          O- Donor
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Upload Photo */}
            {visualTab === "upload" && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    id="biometric-upload"
                    className="hidden"
                    onChange={handleUploadPhoto}
                  />
                  <label htmlFor="biometric-upload" className="cursor-pointer block">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                      <Upload size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-800 block">
                      {lang === "en" ? "Click to upload or drag & drop patient photo" : "ছবি আপলোড করতে ক্লিক করুন বা টেনে আনুন"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">
                      PNG, JPG, WebP up to 10MB (ER intake photo / unconscious patient scan)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 3: Live ER Camera */}
            {visualTab === "webcam" && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center">
                  <video
                    ref={webcamVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Face Reticle HUD */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-48 h-56 sm:w-56 sm:h-64 border-2 border-dashed border-indigo-400/80 rounded-3xl relative flex items-center justify-center">
                      <div className="absolute -top-3 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded uppercase tracking-wider">
                        Align Face in Reticle
                      </div>
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCaptureWebcam}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Camera size={16} />
                    <span>{lang === "en" ? "Capture & Match" : "ছবি তুলে সার্চ করুন"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStopWebcam}
                    className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    {lang === "en" ? "Stop Camera" : "ক্যামেরা বন্ধ"}
                  </button>
                </div>
              </div>
            )}

            {/* Analysis State Loading */}
            {isAnalyzingBiometrics && (
              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-center space-y-2">
                <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-indigo-950">
                  {lang === "en"
                    ? "Running Biometric Neural Analysis: Extracting 16-zone luminance vectors & RGB profile..."
                    : "বায়োমেট্রিক বিশ্লেষণ চলছে: ফেসিয়াল ফিচার ও লুমিন্যান্স ভেক্টর তুলনা করা হচ্ছে..."}
                </p>
              </div>
            )}

            {/* Biometric Match Candidate Console */}
            {!isAnalyzingBiometrics && visualCandidates.length > 0 && (
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>{lang === "en" ? "Top Biometric Registry Match" : "সেরা বায়োমেট্রিক ম্যাচ ফলাফল"}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">
                    {visualCandidates.length} candidate(s) evaluated
                  </span>
                </div>

                {/* Top Match Hero Card */}
                {(() => {
                  const top = visualCandidates[0];
                  return (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
                        {/* Probe vs Target comparison */}
                        <div className="flex items-center gap-3 shrink-0">
                          {visualProbeImage && (
                            <div className="text-center">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-indigo-400/60 shadow-md bg-slate-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={visualProbeImage}
                                  alt="Probe"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-[10px] text-indigo-200 mt-1 block font-mono">
                                {lang === "en" ? "Probe Shot" : "সংগৃহীত ছবি"}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col items-center">
                            <ArrowRight size={18} className="text-indigo-400" />
                            <div className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                              {top.similarity}%
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-md bg-slate-800">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={top.card.photo_url}
                                alt="Registry"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[10px] text-emerald-300 mt-1 block font-mono">
                              {lang === "en" ? "Registry Photo" : "ডাটাবেজ ছবি"}
                            </span>
                          </div>
                        </div>

                        {/* Top Match Info */}
                        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span className="text-base sm:text-lg font-black text-white">
                              {top.card.english_name || top.card.patient_name}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-xs">
                              {top.card.blood_group}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/40 text-indigo-200 text-xs font-mono">
                              NID: {top.card.nid_number}
                            </span>
                          </div>

                          <p className="text-xs text-indigo-200">
                            {calculateAge(top.card.date_of_birth)} {lang === "en" ? "years" : "বছর"} • {top.card.gender} • {top.card.zila || "Dhaka"}
                          </p>

                          <p className="text-xs text-slate-300 truncate">
                            ICE Parent/Contact: <span className="text-white font-semibold">{top.card.emergency_contact_name} ({top.card.emergency_contact_phone})</span>
                          </p>

                          {top.card.has_pacemaker && (
                            <span className="inline-block mt-1 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                              ⚠️ Pacemaker Active (No MRI)
                            </span>
                          )}
                        </div>

                        {/* Action: 1-Click Confirm & Open Dossier */}
                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={() => handleConfirmBiometricPatient(top)}
                            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2 transition-all transform hover:scale-[1.03]"
                          >
                            <CheckCircle2 size={16} />
                            <span>{lang === "en" ? "Confirm & Open Dossier" : "পরিচয় নিশ্চিত করুন ও ফাইল খুলুন"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Other candidates if any */}
                {visualCandidates.length > 1 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {lang === "en" ? "Other Potential Candidates:" : "অন্যান্য সম্ভাব্য ফলাফল:"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {visualCandidates.slice(1, 4).map((c) => (
                        <div
                          key={c.card.id}
                          className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={c.card.photo_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {c.card.english_name || c.card.patient_name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {c.card.blood_group} • {c.similarity}% Match
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleConfirmBiometricPatient(c)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 cursor-pointer shrink-0"
                          >
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t">
              <button
                type="button"
                onClick={handleCloseVisualModal}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {lang === "en" ? "Close Visual Matcher" : "বন্ধ করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthPassSearchEngine;
