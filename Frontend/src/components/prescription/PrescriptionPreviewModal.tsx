"use client";

import React, { useRef, useState } from "react";
import {
  X,
  Download,
  ImagePlus,
  Printer,
  Loader2,
  ChevronLeft,
  Palette,
  ZoomIn,
  ZoomOut,
  Globe,
  Check,
  Sliders,
  Building2,
  ShieldCheck,
  FileText,
  Sparkles,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toJpeg } from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";
import { usePrescription } from "@/context/PrescriptionContext";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  PRESCRIPTION_LANGUAGES,
  PrescriptionLanguage,
  getPrescriptionUILabels,
  translateClinicalText,
  translateDosageTriplet,
  toLocalizedDigits,
} from "@/lib/prescription-translator";

interface PrescriptionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROFESSIONAL_TEMPLATES = [
  {
    id: "corporate",
    name: "Corporate Hospital",
    subtitle: "Square / Evercare Standard",
    accent: "border-slate-800 bg-slate-50",
    badge: "Default Pro",
  },
  {
    id: "govt",
    name: "National DGHS Official",
    subtitle: "Govt Medical College Style",
    accent: "border-emerald-700 bg-emerald-50/40",
    badge: "DGHS Ready",
  },
  {
    id: "specialist",
    name: "Senior Consultant Pad",
    subtitle: "Executive Chamber Serif",
    accent: "border-sky-800 bg-sky-50/40",
    badge: "Chamber",
  },
  {
    id: "minimal",
    name: "International Minimal",
    subtitle: "Clean Monochrome Clinical",
    accent: "border-slate-400 bg-white",
    badge: "Minimal",
  },
] as const;

export function PrescriptionPreviewModal({ isOpen, onClose }: PrescriptionPreviewModalProps) {
  const { data, updateData } = usePrescription();
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingJPG, setIsDownloadingJPG] = useState(false);
  const [activeView, setActiveView] = useState<"preview" | "theme-settings">("preview");
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(0.95);
  const [langPopupOpen, setLangPopupOpen] = useState(false);

  const lang: PrescriptionLanguage = data.language || "en";
  const labels = getPrescriptionUILabels(lang);
  const currentLangMeta =
    PRESCRIPTION_LANGUAGES.find((l) => l.code === lang) || PRESCRIPTION_LANGUAGES[0];
  const isRtl = currentLangMeta.dir === "rtl";

  const chunkedMedicines = React.useMemo(() => {
    const chunks = [];
    const chunkSize = 10;
    if (!data.medicines || data.medicines.length === 0) return [[]];
    for (let i = 0; i < data.medicines.length; i += chunkSize) {
      chunks.push(data.medicines.slice(i, i + chunkSize));
    }
    return chunks;
  }, [data.medicines]);

  const handleDownloadPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Prescription_${new Date().getTime()}`,
    onBeforePrint: async () => {
      setIsDownloading(true);
      return new Promise<void>((resolve) => setTimeout(resolve, 400));
    },
    onAfterPrint: () => {
      setIsDownloading(false);
      toast.success("Print dialog opened. Save as PDF or print directly.");
    },
    onPrintError: () => {
      setIsDownloading(false);
      toast.error("Failed to initialize printing.");
    },
  });

  const handleDownloadJPG = async () => {
    if (!printRef.current) return;
    setIsDownloadingJPG(true);

    const originalOpacity = printRef.current.style.opacity;
    const originalTop = printRef.current.style.top;
    const originalPosition = printRef.current.style.position;
    const originalZIndex = printRef.current.style.zIndex;

    printRef.current.style.opacity = "1";
    printRef.current.style.top = "0";
    printRef.current.style.position = "fixed";
    printRef.current.style.zIndex = "-9999";

    try {
      const dataUrl = await toJpeg(printRef.current, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `Prescription_${lang.toUpperCase()}_${new Date().getTime()}.jpg`;
      link.href = dataUrl;
      link.click();
      toast.success("Prescription downloaded as high-resolution JPG!");
    } catch (err) {
      console.error("Error generating JPG:", err);
      toast.error("Failed to download JPG");
    } finally {
      printRef.current.style.opacity = originalOpacity;
      printRef.current.style.top = originalTop;
      printRef.current.style.position = originalPosition;
      printRef.current.style.zIndex = originalZIndex;
      setIsDownloadingJPG(false);
    }
  };

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "theme" | "watermark") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Please upload an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === "theme") {
          updateData({
            theme: "custom",
            customThemeImage: base64String,
            customPadTopOffset: data.customPadTopOffset ?? 140,
            customPadBottomOffset: data.customPadBottomOffset ?? 70,
          });
          toast.success("Custom Canva / Hospital Pad applied! Text auto-populated.");
          setActiveView("preview");
        } else {
          updateData({ watermarkImage: base64String });
          toast.success("Clinic Watermark applied!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activeTheme = data.theme || "corporate";
  const topOffset = data.customPadTopOffset ?? 140;
  const bottomOffset = data.customPadBottomOffset ?? 70;

  const renderHeaderByTemplate = (rawId: string, qrData: string) => {
    if (activeTheme === "custom") {
      return <div style={{ height: `${topOffset}px` }} className="w-full shrink-0" />;
    }

    if (activeTheme === "govt") {
      return (
        <div className="border-b-[3px] border-double border-emerald-800 pb-5 mb-5">
          <div className="flex items-center justify-between bg-emerald-900 text-white px-4 py-1.5 rounded-t-md text-[11px] font-bold tracking-wider uppercase mb-3">
            <span>National eHealth & DGHS Standardized Clinical Prescription</span>
            <span>HL7 FHIR / OpenMRS Verified</span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">
                PROF. DR. AHMED RAHMAN
              </h1>
              <p className="text-[13px] font-bold text-emerald-800 mt-0.5">
                MBBS (DMC), FCPS (Medicine), MD (Cardiology), FRCP (Edin)
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Senior Consultant & Head, Dept. of Cardiology • BMDC Reg. No: A-48291
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                National Institute of Cardiovascular Diseases & Hospital, Dhaka
              </p>
            </div>
            <div className="flex items-start gap-3 text-right">
              <div>
                <p className="text-sm font-extrabold text-slate-900">ডা. আহমেদ রহমান</p>
                <p className="text-xs text-slate-600 mt-0.5">এমবিবিএস, এফসিপিএস, এমডি (কার্ডিওলজি)</p>
                <p className="text-xs text-slate-600">হৃদরোগ ও মেডিসিন বিশেষজ্ঞ</p>
                <div className="mt-2 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded text-xs">
                  <span className="font-bold text-emerald-800">{labels.mrnLabel}:</span>
                  <span className="font-mono font-bold text-slate-900">{rawId}</span>
                </div>
              </div>
              <div className="bg-white p-1.5 border border-slate-300 rounded shrink-0">
                <QRCodeSVG value={qrData} size={68} level="L" includeMargin={false} />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTheme === "specialist") {
      return (
        <div className="border-b-2 border-slate-800 pb-5 mb-5 font-serif">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-wide uppercase">
                Prof. Dr. Ahmed Rahman
              </h1>
              <p className="text-sm font-bold text-slate-700 mt-1">
                MBBS, FCPS (Medicine), MD (Cardiology)
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Fellow, American College of Cardiology (FACC)
              </p>
              <p className="text-xs text-slate-600 mt-0.5">BMDC Reg: A-48291</p>
            </div>
            <div className="flex items-start gap-4 text-right font-sans">
              <div>
                <p className="text-sm font-bold text-slate-900">Specialists Consultation Center</p>
                <p className="text-xs text-slate-600 mt-0.5">House 42, Road 10/A, Dhanmondi, Dhaka</p>
                <p className="text-xs text-slate-600">Visiting Hours: 4:00 PM – 9:00 PM (Fri Closed)</p>
                <p className="text-xs font-bold text-slate-800 mt-1">Serial: +880 1711-223344</p>
              </div>
              <div className="bg-white p-1.5 border border-slate-300 rounded shrink-0">
                <QRCodeSVG value={qrData} size={68} level="L" includeMargin={false} />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTheme === "minimal") {
      return (
        <div className="border-b border-slate-200 pb-5 mb-5 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Prof. Dr. Ahmed Rahman
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              MBBS, FCPS, MD (Cardiology) • BMDC Reg: A-48291
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">Oxpecker Medical Center</p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">ID: {rawId}</p>
            </div>
            <div className="bg-white p-1 border border-slate-200 rounded">
              <QRCodeSVG value={qrData} size={56} level="L" includeMargin={false} />
            </div>
          </div>
        </div>
      );
    }

    // Default: "corporate" (Hospital-Grade Corporate Multi-Specialty Pad)
    return (
      <div className="pb-5 mb-5 border-b-2 border-slate-800">
        <div className="h-2 w-full bg-slate-900 rounded-t-sm mb-4" />
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">
                Prof. Dr. Ahmed Rahman
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 rounded">
                BMDC #A-48291
              </span>
            </div>
            <p className="text-[13px] font-bold text-slate-700">
              MBBS (DMC), FCPS (Internal Medicine), MD (Cardiology)
            </p>
            <p className="text-xs text-slate-600">
              Senior Consultant — Interventional Cardiology & Medicine
            </p>
            <p className="text-xs text-slate-500">
              ডা. আহমেদ রহমান • হৃদরোগ, বাতজ্বর, উচ্চ রক্তচাপ ও মেডিসিন বিশেষজ্ঞ
            </p>
          </div>

          <div className="flex items-start gap-3.5 text-right">
            <div>
              <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">
                OXPECKER SPECIALIZED HOSPITAL
              </p>
              <p className="text-xs text-slate-600 mt-0.5">Plot 14, Panthapath, Dhanmondi, Dhaka-1205</p>
              <p className="text-xs text-slate-600">24/7 Emergency & Serial: +880 1711-000000</p>
              <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1 rounded">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {labels.mrnLabel}:
                </span>
                <span className="font-mono text-xs font-extrabold text-slate-900">{rawId}</span>
              </div>
            </div>
            <div className="bg-white p-1.5 border border-slate-300 rounded-lg shadow-2xs shrink-0">
              <QRCodeSVG value={qrData} size={72} level="L" includeMargin={false} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPage = (
    pageMedicines: any[],
    pageIndex: number,
    totalPages: number,
    isPrintMode: boolean
  ) => {
    const pName =
      new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get(
        "patientName"
      ) ||
      data.patientName ||
      "Rahim Uddin";
    let rawId =
      new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get(
        "patientId"
      ) || data.patientId;
    if (!rawId || rawId.includes("-")) {
      const firstLetter = pName.charAt(0).toUpperCase();
      let hash = 0;
      for (let i = 0; i < pName.length; i++) hash = pName.charCodeAt(i) + ((hash << 5) - hash);
      const num = Math.abs(hash).toString().padStart(6, "0");
      rawId = `${firstLetter} ${num.slice(0, 2)} ${num.slice(2, 4)} ${num.slice(4, 6)}`;
    }

    const qrData = `OxpeckerVerifiedRx|ID:${rawId}|Pt:${pName}|Date:${new Date().toLocaleDateString(
      "en-GB"
    )}|Dx:${data.diagnosis || "Clinical"}|Meds:${data.medicines.length}`;

    const formattedDate = toLocalizedDigits(
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      lang
    );

    return (
      <div
        key={`page-${pageIndex}`}
        dir={isRtl ? "rtl" : "ltr"}
        className={`w-[794px] min-h-[1123px] bg-white shadow-md px-10 py-8 flex flex-col relative transition-all duration-300 ${
          activeTheme === "specialist" ? "font-serif" : "font-sans"
        }`}
        style={{
          ...(activeTheme === "custom" && data.customThemeImage
            ? {
                backgroundImage: `url(${data.customThemeImage})`,
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : {}),
          pageBreakAfter: isPrintMode ? "always" : "auto",
        }}
      >
        {/* Optional Centered Watermark */}
        {data.watermarkImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img
              src={data.watermarkImage}
              alt="Watermark"
              className="w-[260px] h-[260px] object-contain opacity-10"
            />
          </div>
        )}

        <div className="relative z-10 flex flex-col flex-1 h-full">
          {/* Header Section (or Top Offset spacer for Custom Uploaded Pad) */}
          {renderHeaderByTemplate(rawId, qrData)}

          {/* Patient Clinical Metadata Bar */}
          <div className="grid grid-cols-4 gap-3 px-4 py-2.5 mb-6 bg-slate-50 border-y border-slate-300 text-xs">
            <div className="col-span-2 flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase">{labels.patientName}:</span>
              <span className="font-extrabold text-slate-900 text-[13px]">{pName}</span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <span className="font-bold text-slate-500 uppercase">{labels.age}:</span>
                <span className="ml-1 font-bold text-slate-900">
                  {toLocalizedDigits("45", lang)} {labels.years}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase">{labels.gender}:</span>
                <span className="ml-1 font-bold text-slate-900">{labels.male}</span>
              </div>
            </div>
            <div className="text-right flex items-center justify-end gap-1.5">
              <span className="font-bold text-slate-500 uppercase">{labels.date}:</span>
              <span className="font-bold text-slate-900" suppressHydrationWarning>
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Main 2-Column Clinical Grid */}
          <div className="flex-1 flex gap-7">
            {/* Left Column: Clinical Notes, Vitals, Diagnosis, Investigations */}
            <div
              className={`w-[34%] flex flex-col gap-5 ${
                isRtl ? "border-l pl-6" : "border-r pr-6"
              } border-slate-300`}
            >
              {/* Chief Complaints */}
              {data.chiefComplaint && (
                <div>
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
                    {labels.chiefComplaint}
                  </h3>
                  <p className="text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {translateClinicalText(data.chiefComplaint, lang)}
                  </p>
                </div>
              )}

              {/* Vitals Table */}
              {(data.vitals.bp ||
                data.vitals.pulse ||
                data.vitals.temp ||
                data.vitals.weight ||
                data.vitals.spo2 ||
                data.vitals.bloodSugar) && (
                <div>
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
                    {labels.vitals}
                  </h3>
                  <div className="grid grid-cols-1 gap-1.5 text-[12px] text-slate-800 bg-slate-50/80 p-2.5 rounded border border-slate-200">
                    {data.vitals.bp && (
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-600">{labels.bp}:</span>
                        <span className="font-bold">{toLocalizedDigits(data.vitals.bp, lang)} mmHg</span>
                      </div>
                    )}
                    {data.vitals.pulse && (
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-600">{labels.pulse}:</span>
                        <span className="font-bold">{toLocalizedDigits(data.vitals.pulse, lang)} bpm</span>
                      </div>
                    )}
                    {data.vitals.temp && (
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-600">{labels.temp}:</span>
                        <span className="font-bold">{toLocalizedDigits(data.vitals.temp, lang)} °F</span>
                      </div>
                    )}
                    {data.vitals.weight && (
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-600">{labels.weight}:</span>
                        <span className="font-bold">{toLocalizedDigits(data.vitals.weight, lang)} kg</span>
                      </div>
                    )}
                    {data.vitals.spo2 && (
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-600">{labels.spo2}:</span>
                        <span className="font-bold">{toLocalizedDigits(data.vitals.spo2, lang)}%</span>
                      </div>
                    )}
                    {data.vitals.bloodSugar && (
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-600">{labels.bloodSugar}:</span>
                        <span className="font-bold">
                          {toLocalizedDigits(data.vitals.bloodSugar, lang)} mg/dL
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Physical Examination */}
              {data.physicalExam && (
                <div>
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
                    {labels.physicalExam}
                  </h3>
                  <p className="text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {translateClinicalText(data.physicalExam, lang)}
                  </p>
                </div>
              )}

              {/* Clinical Diagnosis */}
              {data.diagnosis && (
                <div className="bg-slate-50 border-l-4 border-slate-800 p-2.5 rounded-r">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    {labels.diagnosis}
                  </h3>
                  <p className="text-[13px] text-slate-900 font-bold leading-snug whitespace-pre-wrap">
                    {translateClinicalText(data.diagnosis, lang)}
                  </p>
                </div>
              )}

              {/* Investigations */}
              {((data.investigationsList && data.investigationsList.length > 0) ||
                data.investigations) && (
                <div>
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
                    {labels.investigations}
                  </h3>
                  {data.investigationsList && data.investigationsList.length > 0 ? (
                    <ol className="text-[12.5px] text-slate-800 font-semibold leading-relaxed list-decimal pl-4 space-y-1">
                      {data.investigationsList.map((test: string, idx: number) => (
                        <li key={idx} className="pl-1">
                          {translateClinicalText(test, lang)}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-[12.5px] text-slate-800 font-semibold leading-relaxed whitespace-pre-wrap">
                      {translateClinicalText(data.investigations, lang)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Rx Medications, Advice, Follow-Up */}
            <div className="w-[66%] flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-2 mb-4">
                  <span className="text-3xl font-serif font-extrabold text-slate-900 tracking-tight">
                    ℞
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {lang === "en"
                      ? "Prescribed Medications"
                      : `${currentLangMeta.nativeLabel} সংস্করণ / Translated Rx`}
                  </span>
                </div>

                {pageMedicines && pageMedicines.length > 0 ? (
                  <div className="divide-y divide-slate-200/80">
                    {pageMedicines.map((med: any, index: number) => {
                      const globalIndex = pageIndex * 10 + index + 1;
                      const localizedIdx = toLocalizedDigits(String(globalIndex), lang);
                      const localizedDose = translateDosageTriplet(
                        med.dosageM,
                        med.dosageN,
                        med.dosageE,
                        lang
                      );
                      const localizedNotes = translateClinicalText(
                        med.notes || med.frequency || "After meal",
                        lang
                      );
                      const localizedDuration = translateClinicalText(
                        med.duration || "Continue",
                        lang
                      );

                      return (
                        <div key={index} className="py-3 first:pt-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-2.5">
                              <span className="text-xs font-extrabold text-slate-500 min-w-[20px]">
                                {localizedIdx}.
                              </span>
                              <div>
                                <span className="text-[14.5px] font-extrabold text-slate-900">
                                  {med.type && !med.name.toLowerCase().startsWith(med.type.slice(0, 3).toLowerCase())
                                    ? `${med.type}. `
                                    : ""}
                                  {med.name}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 shrink-0">
                              {localizedDuration}
                            </span>
                          </div>

                          <div className="mt-1.5 pl-7 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-slate-700">
                            <span className="font-mono font-extrabold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              {localizedDose}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-semibold text-slate-700">{localizedNotes}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic py-6">{labels.noMedicines}</p>
                )}
              </div>

              {/* Advice & Follow-up Block on Last Page */}
              {pageIndex === totalPages - 1 && (
                <div className="mt-8 pt-4 border-t border-slate-200 space-y-4">
                  {data.advice && (
                    <div>
                      <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                        {labels.advice}
                      </h3>
                      <p className="text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {translateClinicalText(data.advice, lang)}
                      </p>
                    </div>
                  )}

                  {data.followUp && (
                    <div className="inline-block bg-slate-100 border border-slate-300 px-3.5 py-2 rounded-md">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mr-2">
                        {labels.followUp}:
                      </span>
                      <span className="text-[13px] font-extrabold text-slate-900">
                        {translateClinicalText(data.followUp, lang)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Signature & Custom Bottom Offset */}
          <div
            className="mt-auto pt-6 border-t border-slate-300 flex items-end justify-between"
            style={
              activeTheme === "custom" ? { paddingBottom: `${bottomOffset}px` } : undefined
            }
          >
            <div className="text-[10px] text-slate-500 space-y-0.5">
              <p className="font-bold text-slate-700">
                Generated via Oxpecker AI Clinical Workspace • DGDA & WHO ATC Verified
              </p>
              {totalPages > 1 && <p>{labels.pageOf(pageIndex + 1, totalPages)}</p>}
            </div>

            <div className="text-center">
              <div className="w-44 border-b border-slate-400 mb-1.5" />
              <p className="text-[11px] font-bold text-slate-700 uppercase">
                {labels.doctorSignature}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-0 md:p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          className="bg-slate-50 w-full max-w-6xl h-[100dvh] md:h-[92vh] rounded-none md:rounded-2xl shadow-2xl border border-slate-200 flex flex-col md:flex-row overflow-hidden"
        >
          {/* Main Preview / Template Studio Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-base md:text-lg font-extrabold text-slate-800">
                  {activeView === "theme-settings"
                    ? "Prescription Templates & Custom Pad Upload"
                    : "Professional Prescription Preview"}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {activeTheme === "custom" ? "Custom Uploaded Pad" : activeTheme.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* 1-Click Language Translator Popup inside Preview */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLangPopupOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    <Globe size={14} />
                    <span>Translate: {currentLangMeta.nativeLabel}</span>
                  </button>

                  {langPopupOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
                      <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Select Prescription Language
                      </div>
                      {PRESCRIPTION_LANGUAGES.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            updateData({ language: l.code });
                            setLangPopupOpen(false);
                            toast.success(`Prescription translated to ${l.nativeLabel} (${l.label})`);
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 text-xs ${
                            lang === l.code ? "bg-slate-100 font-bold text-slate-900" : "text-slate-700"
                          }`}
                        >
                          <span>
                            {l.nativeLabel} <span className="text-slate-400">({l.label})</span>
                          </span>
                          {lang === l.code && <Check size={14} className="text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Zoom Controls */}
                {activeView === "preview" && (
                  <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                      className="p-1 text-slate-600 hover:text-slate-900 rounded"
                      title="Zoom Out"
                    >
                      <ZoomOut size={15} />
                    </button>
                    <span className="text-[11px] font-bold text-slate-700 w-11 text-center select-none">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() => setZoom((z) => Math.min(1.5, z + 0.15))}
                      className="p-1 text-slate-600 hover:text-slate-900 rounded"
                      title="Zoom In"
                    >
                      <ZoomIn size={15} />
                    </button>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Template & Custom Margin Bar when Custom Pad is active */}
            {activeView === "preview" && activeTheme === "custom" && (
              <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <Sliders size={14} className="text-slate-600" />
                  <span>Custom Pad Auto-Fit Calibration:</span>
                </div>
                <div className="flex flex-wrap items-center gap-5">
                  <label className="flex items-center gap-2 font-semibold text-slate-600">
                    <span>Header Space ({topOffset}px):</span>
                    <input
                      type="range"
                      min={60}
                      max={300}
                      step={10}
                      value={topOffset}
                      onChange={(e) => updateData({ customPadTopOffset: Number(e.target.value) })}
                      className="w-28 accent-slate-900"
                    />
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-slate-600">
                    <span>Footer Space ({bottomOffset}px):</span>
                    <input
                      type="range"
                      min={20}
                      max={220}
                      step={10}
                      value={bottomOffset}
                      onChange={(e) =>
                        updateData({ customPadBottomOffset: Number(e.target.value) })
                      }
                      className="w-28 accent-slate-900"
                    />
                  </label>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "theme")}
            />
            <input
              type="file"
              ref={watermarkInputRef}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "watermark")}
            />

            {/* Body Content */}
            {activeView === "theme-settings" ? (
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-8">
                  {/* Built-in Hospital-Grade Templates */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-1">
                      1. Select Built-in Hospital & Chamber Template
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Designed to match standard Bangladeshi & international hospital letterheads.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {PROFESSIONAL_TEMPLATES.map((tpl) => {
                        const selected = activeTheme === tpl.id;
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => {
                              updateData({ theme: tpl.id });
                              toast.success(`Template changed to ${tpl.name}`);
                            }}
                            className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between h-32 ${
                              selected
                                ? "border-slate-900 bg-slate-900 text-white shadow-md"
                                : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-lg font-serif font-extrabold">℞</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  selected
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {tpl.badge}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-sm">{tpl.name}</p>
                              <p
                                className={`text-[11px] mt-0.5 ${
                                  selected ? "text-slate-300" : "text-slate-500"
                                }`}
                              >
                                {tpl.subtitle}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Canva / Hospital Pad Upload */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-200 pt-6">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                        2. Upload Custom Canva / Hospital Pad (Auto-Populate)
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Upload any pre-designed A4 prescription pad (from Canva, Photoshop, or your Hospital). Oxpecker will automatically write patient details and medicines into the blank area.
                      </p>

                      {data.customThemeImage ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                            <img
                              src={data.customThemeImage}
                              alt="Custom Pad"
                              className="w-14 h-20 object-cover rounded border border-slate-200"
                            />
                            <div className="flex-1 space-y-2">
                              <p className="text-xs font-bold text-emerald-700">
                                Custom Template Active
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateData({ theme: "custom" })}
                                  className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg"
                                >
                                  Use Custom Pad
                                </button>
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                                >
                                  Replace Image
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateData({ theme: "corporate", customThemeImage: null })
                                  }
                                  className="px-3 py-1.5 text-xs font-bold bg-white text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-36 border-2 border-dashed border-slate-300 bg-white rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-900 transition-all"
                        >
                          <ImagePlus size={22} className="text-slate-600 mb-2" />
                          <p className="font-bold text-slate-800 text-xs">
                            Click to Upload Pre-Designed Canva / Hospital Pad
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Supports A4 PNG / JPG (up to 5MB) • Auto-populates Rx fields
                          </p>
                        </button>
                      )}
                    </div>

                    {/* Watermark Upload */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                        3. Hospital / Chamber Center Watermark
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Optional hospital crest or medical emblem rendered softly in the center of the prescription.
                      </p>

                      {data.watermarkImage ? (
                        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                          <img
                            src={data.watermarkImage}
                            alt="Watermark"
                            className="w-16 h-16 object-contain rounded border border-slate-200 p-1"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => watermarkInputRef.current?.click()}
                              className="px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-lg"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => updateData({ watermarkImage: null })}
                              className="px-3 py-1.5 text-xs font-bold bg-white text-rose-600 border border-rose-200 rounded-lg"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => watermarkInputRef.current?.click()}
                          className="w-full h-36 border-2 border-dashed border-slate-300 bg-white rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-900 transition-all"
                        >
                          <ImagePlus size={22} className="text-slate-600 mb-2" />
                          <p className="font-bold text-slate-800 text-xs">
                            Upload Hospital Logo Watermark
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">PNG / JPG (up to 5MB)</p>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 relative flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto custom-scrollbar bg-slate-100 flex flex-col relative">
                  <div className="p-4 sm:p-8 flex justify-center min-w-max pb-8 mx-auto">
                    <div
                      className="shrink-0 shadow-lg ring-1 ring-slate-300 rounded-xs overflow-hidden bg-white transition-all duration-200 ease-out"
                      style={{
                        width: `${794 * zoom}px`,
                        height: `${1123 * zoom}px`,
                      }}
                    >
                      <div
                        style={{
                          transform: `scale(${zoom})`,
                          transformOrigin: "top left",
                          width: "794px",
                          height: "1123px",
                        }}
                      >
                        {renderPage(
                          chunkedMedicines[currentPage - 1],
                          currentPage - 1,
                          chunkedMedicines.length,
                          false
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hidden Print Container */}
                <div
                  className="absolute top-[-9999px] opacity-0 pointer-events-none"
                  aria-hidden="true"
                  ref={printRef}
                >
                  {chunkedMedicines.map((pageMeds, idx) => (
                    <div key={idx} className="print-page-wrapper">
                      {renderPage(pageMeds, idx, chunkedMedicines.length, true)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Controls */}
          <div className="w-full md:w-[270px] bg-white border-t md:border-t-0 md:border-l border-slate-200 shrink-0 flex flex-row md:flex-col p-4 md:p-5 gap-3 z-20 justify-between md:justify-start">
            <div className="hidden md:block mb-1">
              <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Template & Export
              </h3>
            </div>

            {activeView === "preview" ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveView("theme-settings")}
                  className="flex flex-1 md:flex-none items-center justify-center md:justify-start gap-2.5 text-xs md:text-[13px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 md:px-4 py-3 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <Palette size={17} className="text-slate-700" />
                  <span>Templates & Custom Pad</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hidden md:flex items-center justify-start gap-2.5 text-[13px] font-bold text-slate-700 bg-white border border-slate-200 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <ImagePlus size={17} className="text-slate-600" />
                  <span>Upload Canva / Clinic Pad</span>
                </button>

                {/* Quick Language Switcher Pills in Sidebar */}
                <div className="hidden md:block border-y border-slate-100 py-3 my-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    1-Click Language
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESCRIPTION_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          updateData({ language: l.code });
                          toast.success(`Translated to ${l.nativeLabel}`);
                        }}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                          lang === l.code
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {l.nativeLabel}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF()}
                  className="flex flex-1 md:flex-none items-center justify-center md:justify-start gap-2.5 text-xs md:text-[13px] font-bold text-slate-700 bg-white border border-slate-200 px-3 md:px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Printer size={17} />
                  <span>Print Pad</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF()}
                  disabled={isDownloading}
                  className="flex flex-1 md:flex-none items-center justify-center md:justify-start gap-2.5 text-xs md:text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 md:px-4 py-3 rounded-xl transition-all disabled:opacity-60"
                >
                  {isDownloading ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
                  <span>{isDownloading ? "Preparing..." : "Download PDF"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadJPG()}
                  disabled={isDownloadingJPG}
                  className="flex flex-1 md:flex-none items-center justify-center md:justify-start gap-2.5 text-xs md:text-[13px] font-bold text-slate-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 md:px-4 py-3 rounded-xl transition-all disabled:opacity-60"
                >
                  {isDownloadingJPG ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Download size={17} className="text-emerald-700" />
                  )}
                  <span>{isDownloadingJPG ? "Saving..." : "Download Image (JPG)"}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className="flex flex-1 md:flex-none items-center justify-center md:justify-start gap-2.5 text-xs md:text-[13px] font-bold text-white bg-slate-900 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={17} />
                <span>Back to Live Preview</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
