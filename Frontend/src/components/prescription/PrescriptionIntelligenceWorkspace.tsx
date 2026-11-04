"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RotateCw,
  Sliders,
  RefreshCw,
  Trash2,
  Plus,
  Search,
  Download,
  Printer,
  Eye,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  History,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Calculator,
  Pill,
  Building2,
  FileCheck2,
  ArrowRight,
  Crop,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { requestMedicalDocumentConsent, getPrescriptionAuthToken } from "@/lib/medical-document-client";
import type {
  PrescriptionIntelligenceResult,
  PrescriptionMedicineIntelligenceItem,
  MatchedDatabaseMedicine,
  MatchStatus,
} from "@/lib/prescription-intelligence";

interface PrescriptionIntelligenceWorkspaceProps {
  onSelectMedicineDetail?: (medicine: any) => void;
  initialPrescriptionId?: string | null;
  defaultExpanded?: boolean;
}

const MATCH_STATUS_CONFIG: Record<
  MatchStatus,
  { label: string; badgeClass: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  EXACT_MATCH: {
    label: "EXACT MATCH",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  STRONG_MATCH: {
    label: "STRONG MATCH",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    icon: ShieldCheck,
  },
  POSSIBLE_MATCH: {
    label: "POSSIBLE MATCH",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    icon: HelpCircle,
  },
  NEEDS_MANUAL_VERIFICATION: {
    label: "NEEDS VERIFICATION",
    badgeClass: "bg-orange-50 text-orange-800 border-orange-200",
    icon: AlertTriangle,
  },
  NOT_FOUND: {
    label: "NOT FOUND",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};

const LOCAL_HISTORY_KEY = "oxpecker_rx_intelligence_history_v1";

async function computeFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }
}

async function preprocessPrescriptionImage(
  file: File,
  options: { rotation: number; enhanceContrast: boolean; grayscale: boolean; cropMarginPct: number }
): Promise<File> {
  if (file.type === "application/pdf") return file;
  if (
    options.rotation === 0 &&
    !options.enhanceContrast &&
    !options.grayscale &&
    options.cropMarginPct === 0 &&
    file.size <= 3 * 1024 * 1024
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const margin = Math.max(0, Math.min(0.25, options.cropMarginPct / 100));
        const sx = Math.round(img.width * margin);
        const sy = Math.round(img.height * margin);
        const sw = Math.max(64, Math.round(img.width * (1 - margin * 2)));
        const sh = Math.max(64, Math.round(img.height * (1 - margin * 2)));

        const maxDim = 2200;
        const scale = Math.min(1, maxDim / Math.max(sw, sh));
        const targetW = Math.round(sw * scale);
        const targetH = Math.round(sh * scale);

        const rot = ((options.rotation % 360) + 360) % 360;
        const swapDims = rot === 90 || rot === 270;
        const canvas = document.createElement("canvas");
        canvas.width = swapDims ? targetH : targetW;
        canvas.height = swapDims ? targetW : targetH;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
          return;
        }

        const filters: string[] = [];
        if (options.enhanceContrast) filters.push("contrast(1.28) brightness(1.04)");
        if (options.grayscale) filters.push("grayscale(1)");
        if (filters.length > 0) {
          ctx.filter = filters.join(" ");
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.drawImage(img, sx, sy, sw, sh, -targetW / 2, -targetH / 2, targetW, targetH);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              resolve(file);
              return;
            }
            const processed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(processed);
          },
          "image/jpeg",
          0.92
        );
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}

export function PrescriptionIntelligenceWorkspace({
  onSelectMedicineDetail,
  initialPrescriptionId = null,
  defaultExpanded = false,
}: PrescriptionIntelligenceWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [uploadedHashes, setUploadedHashes] = useState<Set<string>>(new Set());
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Image preprocessing states
  const [rotation, setRotation] = useState(0);
  const [enhanceContrast, setEnhanceContrast] = useState(true);
  const [grayscale, setGrayscale] = useState(false);
  const [cropMarginPct, setCropMarginPct] = useState(0);
  const [showPreprocessControls, setShowPreprocessControls] = useState(false);

  // Quick text / manual prescription input modal
  const [showTextEntry, setShowTextEntry] = useState(false);
  const [rawTextInput, setRawTextInput] = useState("");

  // Processing & status states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Intelligence Result State
  const [intelligence, setIntelligence] = useState<PrescriptionIntelligenceResult | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<"cards" | "summary" | "history">("cards");
  const [showOriginalImageModal, setShowOriginalImageModal] = useState(false);

  // Inline editing & Manual DB Search Modal
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, any>>({});
  const [searchingForItemId, setSearchingForItemId] = useState<string | null>(null);
  const [dbSearchQuery, setDbSearchQuery] = useState("");
  const [dbSearchResults, setDbSearchResults] = useState<any[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [expandedAlternatives, setExpandedAlternatives] = useState<Set<string>>(new Set());

  // Saved prescription history
  const [savedHistory, setSavedHistory] = useState<PrescriptionIntelligenceResult[]>([]);

  // Load local history and optional initial prescription ID
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedHistory(parsed);
          if (initialPrescriptionId) {
            const found = parsed.find((p: PrescriptionIntelligenceResult) => p.prescriptionId === initialPrescriptionId);
            if (found) {
              setIntelligence(found);
              setActiveViewTab("summary");
            }
          }
        }
      }
    } catch {}
  }, [initialPrescriptionId]);

  const persistToHistory = useCallback((result: PrescriptionIntelligenceResult) => {
    try {
      setSavedHistory((prev) => {
        const filtered = prev.filter((item) => item.prescriptionId !== result.prescriptionId);
        const updated = [result, ...filtered].slice(0, 20);
        window.localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {}
  }, []);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      if (originalPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(originalPreviewUrl);
    };
  }, [previewUrl, originalPreviewUrl]);

  const validateAndStageFile = async (file: File) => {
    setErrorMessage(null);
    setDuplicateWarning(null);

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    const normType = file.type.toLowerCase();
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExts = ["jpg", "jpeg", "png", "webp", "pdf"];

    if (!allowedTypes.includes(normType) && !allowedExts.includes(ext)) {
      const msg = `Unsupported file format (${file.name}). Please upload JPG, JPEG, PNG, WEBP, or PDF.`;
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      const msg = "File exceeds the 15 MB maximum size limit. Please upload a smaller image or PDF.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (file.size < 10) {
      const msg = "The selected file is empty or corrupted.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const hash = await computeFileHash(file);
    if (uploadedHashes.has(hash)) {
      setDuplicateWarning("This exact prescription file was already uploaded in this session. You can still re-process it below.");
    }
    setUploadedHashes((prev) => new Set(prev).add(hash));

    setSelectedFile(file);
    setRotation(0);
    setCropMarginPct(0);

    if (file.type !== "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setOriginalPreviewUrl(url);
    } else {
      setPreviewUrl(null);
      setOriginalPreviewUrl(null);
    }

    // Automatically run OCR & Intelligence pipeline upon selection
    await executePrescriptionPipeline(file, {
      rotation: 0,
      enhanceContrast,
      grayscale,
      cropMarginPct: 0,
    });
  };

  const executePrescriptionPipeline = async (
    fileToProcess?: File | null,
    preprocessOpts = { rotation, enhanceContrast, grayscale, cropMarginPct },
    overrideText?: string
  ) => {
    const targetFile = fileToProcess ?? selectedFile;
    if (!targetFile && !overrideText) {
      setErrorMessage("Please select a prescription image/PDF or enter prescription text first.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setUploadProgress(15);
    setProcessingStage("Validating & preprocessing prescription document...");

    try {
      const accessToken = await requestMedicalDocumentConsent(true);
      if (!accessToken) {
        setIsProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append("consent", "true");

      if (targetFile) {
        const processedFile = await preprocessPrescriptionImage(targetFile, preprocessOpts);
        if (processedFile !== targetFile && processedFile.type.startsWith("image/")) {
          setPreviewUrl(URL.createObjectURL(processedFile));
        }
        formData.append("image", processedFile);
      }

      if (overrideText) {
        formData.append("prescriptionText", overrideText);
      }

      setUploadProgress(45);
      setProcessingStage("Running Clinical OCR & Handwriting Recognition...");

      const response = await fetch("/api/ai/analyze-prescription", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      setUploadProgress(80);
      setProcessingStage("Matching against 21,714 verified DGDA medicines & calculating prices...");

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Prescription analysis failed (HTTP ${response.status}).`);
      }

      if (data.category === "non_medical") {
        throw new Error("The uploaded image does not appear to be a medical prescription or medicine label. Please upload a valid prescription.");
      }

      setUploadProgress(100);

      if (data.intelligence) {
        setIntelligence(data.intelligence);
        persistToHistory(data.intelligence);
        setActiveViewTab("cards");
        toast.success(
          `Extracted ${data.intelligence.summary.totalExtractedCount} medicine(s) and matched ${data.intelligence.summary.matchedCount} in database.`
        );
      } else {
        throw new Error("No structured prescription intelligence was returned. Please try again or use clearer lighting.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Prescription processing failed.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
      setUploadProgress(0);
    }
  };

  // Trigger backend authoritative recalculation & re-matching when any item is edited, added, removed, or matched
  const syncAndRecalculateBackend = async (
    updatedItems: any[],
    updatedMetadata?: PrescriptionIntelligenceResult["prescriptionMetadata"]
  ) => {
    if (!intelligence) return;
    setIsRecalculating(true);
    try {
      const token = await getPrescriptionAuthToken();
      const response = await fetch("/api/prescriptions/intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prescriptionId: intelligence.prescriptionId,
          createdAt: intelligence.createdAt,
          medicines: updatedItems,
          imageQuality: intelligence.imageQuality,
          metadata: updatedMetadata || intelligence.prescriptionMetadata,
          rawOcrText: intelligence.rawOcrText,
          provider: intelligence.provider,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.intelligence) {
        throw new Error(data.error || "Failed to recalculate prescription totals.");
      }
      setIntelligence(data.intelligence);
      persistToHistory(data.intelligence);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not recalculate prices.");
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleStartEditItem = (item: PrescriptionMedicineIntelligenceItem) => {
    setEditingItemId(item.itemId);
    setEditDraft({
      brandName: item.extracted.brandName || "",
      genericName: item.extracted.genericName || "",
      strength: item.extracted.strength || "",
      dosageForm: item.extracted.dosageForm || "Tablet",
      frequency: item.extracted.frequency || "",
      duration: item.extracted.duration || "",
      quantity: item.extracted.quantity ?? "",
      dosageInstructions: item.extracted.dosageInstructions || "",
    });
  };

  const handleSaveEditItem = async (itemId: string) => {
    if (!intelligence) return;
    const updatedMedicines = intelligence.items.map((item) => {
      if (item.itemId !== itemId) return item.extracted;
      const parsedQty =
        editDraft.quantity !== "" && Number.isFinite(Number(editDraft.quantity)) && Number(editDraft.quantity) > 0
          ? Math.ceil(Number(editDraft.quantity))
          : null;
      return {
        ...item.extracted,
        brandName: editDraft.brandName.trim() || null,
        genericName: editDraft.genericName.trim() || null,
        strength: editDraft.strength.trim() || null,
        dosageForm: editDraft.dosageForm.trim() || null,
        frequency: editDraft.frequency.trim() || null,
        duration: editDraft.duration.trim() || null,
        quantity: parsedQty,
        dosageInstructions: editDraft.dosageInstructions.trim() || null,
        // Clear locked DB ID if user changed brand/strength/form so backend re-matches accurately
        selectedDatabaseMedicineId:
          editDraft.brandName.trim() !== (item.extracted.brandName || "") ||
          editDraft.strength.trim() !== (item.extracted.strength || "")
            ? null
            : item.extracted.selectedDatabaseMedicineId,
        requiresManualVerification: false,
        extractionStatus: "EDITED",
      };
    });
    setEditingItemId(null);
    await syncAndRecalculateBackend(updatedMedicines);
    toast.success("Medicine updated & prescription total recalculated.");
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!intelligence) return;
    const remaining = intelligence.items
      .filter((it) => it.itemId !== itemId)
      .map((it) => it.extracted);
    await syncAndRecalculateBackend(remaining);
    toast.success("Medicine removed from prescription.");
  };

  const handleAddManualMedicine = async () => {
    const baseItems = intelligence ? intelligence.items.map((it) => it.extracted) : [];
    const newId = `manual-${Date.now()}`;
    const newMed = {
      id: newId,
      brandName: "Napa",
      genericName: "Paracetamol",
      strength: "500 mg",
      dosageForm: "Tablet",
      frequency: "1+1+1",
      duration: "5 days",
      quantity: 15,
      dosageInstructions: "After meal",
      ocrConfidence: 1.0,
      medicineNameConfidence: 1.0,
      strengthConfidence: 1.0,
      extractionStatus: "MANUAL_ENTRY",
      requiresManualVerification: false,
    };

    if (!intelligence) {
      // Create a fresh prescription intelligence session
      await executePrescriptionPipeline(null, undefined, "Tab. Napa 500mg — 1+1+1 — 5 days");
      return;
    }

    await syncAndRecalculateBackend([...baseItems, newMed]);
    setEditingItemId(newId);
    setEditDraft({
      brandName: "Napa",
      genericName: "Paracetamol",
      strength: "500 mg",
      dosageForm: "Tablet",
      frequency: "1+1+1",
      duration: "5 days",
      quantity: 15,
      dosageInstructions: "After meal",
    });
  };

  const handleSelectCandidateMatch = async (itemId: string, dbMedicineId: string) => {
    if (!intelligence) return;
    const updatedMedicines = intelligence.items.map((item) => {
      if (item.itemId !== itemId) return item.extracted;
      return {
        ...item.extracted,
        selectedDatabaseMedicineId: dbMedicineId,
        requiresManualVerification: false,
        extractionStatus: "EDITED",
      };
    });
    setSearchingForItemId(null);
    await syncAndRecalculateBackend(updatedMedicines);
    toast.success("Database match confirmed and price recalculated.");
  };

  // Manual database search inside modal
  useEffect(() => {
    if (!searchingForItemId || !dbSearchQuery.trim()) {
      setDbSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingDb(true);
      try {
        const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(dbSearchQuery.trim())}&limit=12`);
        const data = await res.json();
        if (Array.isArray(data)) setDbSearchResults(data);
      } catch {
        setDbSearchResults([]);
      } finally {
        setIsSearchingDb(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchingForItemId, dbSearchQuery]);

  // Export Official PDF Summary (Phase 7E)
  const handleDownloadPdfSummary = () => {
    if (!intelligence) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 44;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("OXPECKER AI — PRESCRIPTION INTELLIGENCE & PRICE SUMMARY", 40, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Prescription ID: ${intelligence.prescriptionId}`, 40, y);
    doc.text(`Date: ${new Date(intelligence.createdAt).toLocaleString()}`, pageW - 220, y);
    y += 15;
    doc.text(
      `Patient: ${intelligence.prescriptionMetadata.patientName || "Not specified"}   |   Doctor: ${intelligence.prescriptionMetadata.doctorName || "Not specified"}`,
      40,
      y
    );
    y += 18;

    // Overview box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, y, pageW - 80, 46, 6, 6, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Extracted: ${intelligence.summary.totalExtractedCount}   |   Matched: ${intelligence.summary.matchedCount}   |   Unmatched: ${intelligence.summary.notFoundCount}   |   Needs Verification: ${intelligence.summary.needsVerificationCount}`,
      52,
      y + 18
    );
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(`Price Source: ${intelligence.summary.priceSource}`, 52, y + 34);
    y += 64;

    // Table Header
    doc.setFillColor(15, 23, 42);
    doc.rect(40, y, pageW - 80, 24, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("Medicine (Matched / Extracted)", 48, y + 15);
    doc.text("Strength & Form", 230, y + 15);
    doc.text("Schedule", 335, y + 15);
    doc.text("Qty", 405, y + 15);
    doc.text("Unit Price", 445, y + 15);
    doc.text("Total (BDT)", 505, y + 15);
    y += 24;

    // Table Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const item of intelligence.items) {
      if (y > 740) {
        doc.addPage();
        y = 44;
      }
      const medTitle = item.matchedMedicine
        ? `${item.matchedMedicine.brandName} (${item.matchedMedicine.genericName.slice(0, 18)})`
        : `${item.extracted.brandName || "Unknown"} [UNMATCHED]`;
      const strengthForm = `${item.matchedMedicine?.strength || item.extracted.strength || "-"} ${item.matchedMedicine?.dosageForm || item.extracted.dosageForm || ""}`.trim();
      const schedule = `${item.extracted.frequency || "-"} (${item.extracted.duration || "-"})`;
      const qtyStr = item.pricing.requiredQuantity !== null ? String(item.pricing.requiredQuantity) : "Req.";
      const unitStr = item.pricing.unitPriceBdt !== null ? `Tk ${item.pricing.unitPriceBdt.toFixed(2)}` : "N/A";
      const totalStr = item.pricing.lineTotalBdt !== null ? `Tk ${item.pricing.lineTotalBdt.toFixed(2)}` : item.pricing.pricingStatus;

      doc.setTextColor(15, 23, 42);
      doc.text(medTitle.slice(0, 34), 48, y + 15);
      doc.text(strengthForm.slice(0, 20), 230, y + 15);
      doc.text(schedule.slice(0, 16), 335, y + 15);
      doc.text(qtyStr, 405, y + 15);
      doc.text(unitStr, 445, y + 15);
      doc.text(totalStr.slice(0, 14), 505, y + 15);

      doc.setDrawColor(226, 232, 240);
      doc.line(40, y + 22, pageW - 40, y + 22);
      y += 24;
    }

    y += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(6, 95, 70);
    doc.text(
      `Verified Total (${intelligence.summary.pricedMedicinesCount} priced item(s)): BDT ${intelligence.summary.verifiedTotalBdt.toFixed(2)}`,
      40,
      y
    );
    y += 18;

    if (!intelligence.summary.isCompleteCalculation) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(180, 83, 9);
      doc.text(
        `Note: ${intelligence.summary.unpricedMedicinesCount} medicine(s) are excluded from the verified total (unmatched, unpriced, or pending verification).`,
        40,
        y
      );
      y += 16;
    }

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Clinical Disclaimer: Verify all extracted medicine names, strengths, and dosages with a registered pharmacist before dispensing.",
      40,
      y + 12
    );

    doc.save(`Oxpecker-Prescription-Summary-${intelligence.prescriptionId}.pdf`);
    toast.success("Downloaded official Prescription Summary PDF.");
  };

  return (
    <section className="w-full space-y-6">
      {/* UPLOAD & SCANNER BAR */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-center justify-between">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200/70 text-sky-700 text-xs font-extrabold tracking-wide uppercase">
              <Sparkles size={13} />
              <span>Prescription OCR & Medicine Price Intelligence Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-[900] text-slate-900 tracking-tight">
              Upload Prescription or Medicine Label for Instant Price Calculation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Supports English, বাংলা, and mixed handwritten/printed prescriptions (JPG, PNG, WEBP, PDF). Automatically extracts dosage schedules (<code className="text-slate-700 font-bold">1+1+1 × 5 days = 15 units</code>), matches against <strong>21,714 verified DGDA records</strong>, and computes exact medicine costs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <UploadCloud size={17} />
              <span>{isProcessing ? "Scanning..." : "Upload Image / PDF"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTextEntry((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <FileText size={15} />
              <span>Type / Paste Rx</span>
            </button>

            <button
              type="button"
              onClick={handleAddManualMedicine}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-sky-300 bg-white text-slate-700 hover:text-sky-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Manual Entry</span>
            </button>

            {savedHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveViewTab("history")}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                title="View previous prescription scans"
              >
                <History size={15} />
                <span>History ({savedHistory.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* DRAG AND DROP ZONE */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) void validateAndStageFile(droppedFile);
          }}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`mt-4 rounded-2xl border-2 border-dashed p-5 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDragging
              ? "border-sky-500 bg-sky-50/70"
              : "border-slate-200 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void validateAndStageFile(f);
              e.target.value = "";
            }}
            className="hidden"
          />

          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-sky-600 shadow-2xs shrink-0">
              <UploadCloud size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Drag & drop your prescription image or PDF here, or <span className="text-sky-600 underline">browse files</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Accepted formats: JPG, JPEG, PNG, WEBP, PDF (up to 15 MB) · Automatic orientation, contrast & sharpness optimization
              </p>
            </div>
          </div>

          {selectedFile && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shrink-0"
            >
              <span className="truncate max-w-[160px]">{selectedFile.name}</span>
              <button
                type="button"
                onClick={() => setShowPreprocessControls((prev) => !prev)}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold flex items-center gap-1"
                title="Image rotation, crop & contrast enhancement"
              >
                <Sliders size={12} />
                <span>Adjust Image</span>
              </button>
              <button
                type="button"
                onClick={() => void executePrescriptionPipeline(selectedFile)}
                disabled={isProcessing}
                className="px-2 py-1 rounded-lg bg-sky-600 text-white font-bold flex items-center gap-1 hover:bg-sky-700"
                title="Re-run OCR"
              >
                <RefreshCw size={12} className={isProcessing ? "animate-spin" : ""} />
                <span>Re-Scan</span>
              </button>
            </div>
          )}
        </div>

        {/* IMAGE PREPROCESSING CONTROLS (ROTATION, CROP, CONTRAST, GRAYSCALE) */}
        {selectedFile && showPreprocessControls && selectedFile.type !== "application/pdf" && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-sky-300 cursor-pointer"
              >
                <RotateCw size={14} />
                <span>Rotate ({rotation}°)</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer">
                <Crop size={14} />
                <span>Crop Margin:</span>
                <select
                  value={cropMarginPct}
                  onChange={(e) => setCropMarginPct(Number(e.target.value))}
                  className="bg-transparent font-extrabold text-sky-700 outline-none"
                >
                  <option value={0}>0% (Full Frame)</option>
                  <option value={5}>5% Border Trim</option>
                  <option value={10}>10% Border Trim</option>
                  <option value={15}>15% Center Focus</option>
                </select>
              </label>

              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enhanceContrast}
                  onChange={(e) => setEnhanceContrast(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600"
                />
                <span>Contrast & Sharpness Boost</span>
              </label>

              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={grayscale}
                  onChange={(e) => setGrayscale(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600"
                />
                <span>Document B&W Filter</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() =>
                void executePrescriptionPipeline(selectedFile, {
                  rotation,
                  enhanceContrast,
                  grayscale,
                  cropMarginPct,
                })
              }
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
            >
              Apply Preprocessing & Re-Run OCR
            </button>
          </div>
        )}

        {/* PASTE / TYPE PRESCRIPTION TEXT DRAWER */}
        {showTextEntry && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Paste or Type Prescription Lines (English or বাংলা)
              </span>
              <button
                type="button"
                onClick={() =>
                  setRawTextInput(
                    "Tab. Napa 500mg — 1+1+1 — 5 days\nCap. Seclo 20mg — 1+0+1 — 14 days\nTab. Fexo 120mg — 0+0+1 — 7 days\nTab. Monas 10mg — 0+0+1 — 30 days"
                  )
                }
                className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
              >
                Load Sample Prescription
              </button>
            </div>
            <textarea
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              rows={4}
              placeholder="Example:&#10;Tab. Napa 500mg — 1+1+1 — 5 days&#10;Cap. Sergel 20mg — 1+0+1 — 14 days"
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 font-medium focus:border-sky-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTextEntry(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!rawTextInput.trim()) return;
                  setShowTextEntry(false);
                  void executePrescriptionPipeline(null, undefined, rawTextInput.trim());
                }}
                disabled={isProcessing || !rawTextInput.trim()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Extract Medicines & Calculate Prices
              </button>
            </div>
          </div>
        )}

        {/* DUPLICATE WARNING */}
        {duplicateWarning && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-between gap-2">
            <span>{duplicateWarning}</span>
            <button onClick={() => setDuplicateWarning(null)} className="text-amber-700 hover:text-amber-950">
              <X size={14} />
            </button>
          </div>
        )}

        {/* UPLOAD & OCR PROGRESS */}
        {isProcessing && (
          <div className="mt-4 p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-sky-950">
              <span className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-sky-600" />
                {processingStage || "Processing prescription..."}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-sky-100 overflow-hidden">
              <div
                className="h-full bg-sky-600 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ERROR BANNER WITH RETRY */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-rose-900 text-xs sm:text-sm font-semibold">
              <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            {selectedFile && (
              <button
                type="button"
                onClick={() => void executePrescriptionPipeline(selectedFile)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 cursor-pointer"
              >
                Retry Scan
              </button>
            )}
          </div>
        )}
      </div>

      {/* SAVED HISTORY TAB VIEW */}
      {activeViewTab === "history" && savedHistory.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <History size={18} className="text-sky-600" />
              <span>Saved Prescription Scans ({savedHistory.length})</span>
            </h3>
            {intelligence && (
              <button
                type="button"
                onClick={() => setActiveViewTab("cards")}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                Back to Active Prescription
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedHistory.map((hist) => (
              <div
                key={hist.prescriptionId}
                className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 flex items-center justify-between gap-3 bg-slate-50/50"
              >
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    ID: {hist.prescriptionId}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(hist.createdAt).toLocaleString()} · {hist.summary.totalExtractedCount} medicines ({hist.summary.matchedCount} matched)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-700">
                    ৳{hist.summary.verifiedTotalBdt.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIntelligence(hist);
                      setActiveViewTab("cards");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE PRESCRIPTION INTELLIGENCE RESULTS & SUMMARY */}
      {intelligence && activeViewTab !== "history" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* TOP BAR: OVERVIEW STATS + VIEW SWITCHER + ACTIONS */}
          <div className="bg-slate-900 text-white p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Rx ID: {intelligence.prescriptionId}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    Analyzed {new Date(intelligence.updatedAt).toLocaleString()}
                  </span>
                  {isRecalculating && (
                    <span className="inline-flex items-center gap-1 text-xs text-sky-300 font-bold">
                      <RefreshCw size={12} className="animate-spin" /> Recalculating...
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-[900] tracking-tight">
                  Prescription Intelligence & Verified Price Breakdown
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {intelligence.summary.summaryBannerText}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setActiveViewTab("cards")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeViewTab === "cards" ? "bg-sky-600 text-white" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Interactive Cards ({intelligence.items.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewTab("summary")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeViewTab === "summary" ? "bg-sky-600 text-white" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Full Price Summary
                  </button>
                </div>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => setShowOriginalImageModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>Original Image</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadPdfSummary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* SECTION A: PRESCRIPTION OVERVIEW METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-5 border-t border-slate-800">
              <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80">
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Extracted</span>
                <span className="text-xl font-black text-white">{intelligence.summary.totalExtractedCount}</span>
              </div>
              <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80">
                <span className="text-[11px] font-bold uppercase text-emerald-400 block">Matched in DB</span>
                <span className="text-xl font-black text-emerald-300">{intelligence.summary.matchedCount}</span>
              </div>
              <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80">
                <span className="text-[11px] font-bold uppercase text-rose-400 block">Not Found</span>
                <span className="text-xl font-black text-rose-300">{intelligence.summary.notFoundCount}</span>
              </div>
              <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80">
                <span className="text-[11px] font-bold uppercase text-amber-400 block">Needs Review</span>
                <span className="text-xl font-black text-amber-300">{intelligence.summary.needsVerificationCount}</span>
              </div>
              <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80">
                <span className="text-[11px] font-bold uppercase text-sky-400 block">Priced Items</span>
                <span className="text-xl font-black text-sky-300">
                  {intelligence.summary.pricedMedicinesCount} / {intelligence.summary.totalExtractedCount}
                </span>
              </div>
              <div className="bg-emerald-950/90 rounded-2xl p-3 border border-emerald-500/40">
                <span className="text-[11px] font-bold uppercase text-emerald-300 block">Verified Total</span>
                <span className="text-xl font-black text-white">
                  ৳{intelligence.summary.verifiedTotalBdt.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA: INTERACTIVE CARDS (PHASE 6) OR SUMMARY TABLE (PHASE 7) */}
          <div className="p-5 sm:p-6 space-y-6">
            {activeViewTab === "cards" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Optional Side-by-Side Image Preview */}
                {previewUrl && (
                  <div className="lg:col-span-4 bg-slate-50 rounded-2xl border border-slate-200 p-3.5 sticky top-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Uploaded Prescription
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowOriginalImageModal(true)}
                        className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                      >
                        <Eye size={12} /> Full Zoom
                      </button>
                    </div>
                    <Image
                      src={previewUrl}
                      alt="Uploaded prescription preview"
                      width={900}
                      height={1200}
                      unoptimized
                      className="w-full h-auto max-h-[540px] object-contain rounded-xl bg-white border border-slate-200/80"
                    />
                  </div>
                )}

                {/* Extracted Medicine Cards */}
                <div className={`${previewUrl ? "lg:col-span-8" : "lg:col-span-12"} space-y-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-extrabold text-slate-900">
                      Extracted Medicines & Database Matches ({intelligence.items.length})
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddManualMedicine}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 cursor-pointer"
                      >
                        <Plus size={14} /> Add Missing Medicine
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void syncAndRecalculateBackend(intelligence.items.map((i) => i.extracted))
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        <Calculator size={14} /> Recalculate All
                      </button>
                    </div>
                  </div>

                  {intelligence.items.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-3">
                      <AlertTriangle size={32} className="mx-auto text-amber-500" />
                      <p className="text-sm font-bold text-slate-800">
                        No structured medicine lines could be confirmed automatically from this image.
                      </p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Handwriting may be unclear or low-contrast. Click below to add medicines manually or adjust image contrast and re-scan.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddManualMedicine}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
                      >
                        <Plus size={14} /> Add Medicine Manually
                      </button>
                    </div>
                  ) : (
                    intelligence.items.map((item, idx) => {
                      const statusCfg = MATCH_STATUS_CONFIG[item.matchStatus];
                      const StatusIcon = statusCfg.icon;
                      const isEditing = editingItemId === item.itemId;
                      const med = item.matchedMedicine;
                      const showAlts = expandedAlternatives.has(item.itemId);

                      return (
                        <div
                          key={item.itemId}
                          className={`rounded-2xl border p-4 sm:p-5 transition-all bg-white shadow-2xs ${
                            item.matchStatus === "NOT_FOUND"
                              ? "border-rose-200 bg-rose-50/10"
                              : item.matchStatus === "NEEDS_MANUAL_VERIFICATION"
                                ? "border-orange-200 bg-orange-50/10"
                                : "border-slate-200/90 hover:border-sky-300"
                          }`}
                        >
                          {/* Card Top Header */}
                          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${statusCfg.badgeClass}`}
                                >
                                  <StatusIcon size={12} />
                                  {statusCfg.label}
                                </span>
                                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  Match Confidence: {Math.round(item.matchConfidence * 100)}%
                                </span>
                                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  OCR Confidence: {Math.round(item.extracted.ocrConfidence * 100)}%
                                </span>
                              </div>

                              <h5 className="text-lg font-black text-slate-900 tracking-tight pt-1">
                                {med ? (
                                  <>
                                    {med.brandName}{" "}
                                    <span className="text-sm font-bold text-sky-700">
                                      {med.strength} · {med.dosageForm}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    {item.extracted.brandName || item.extracted.genericName || "Unnamed Medicine"}{" "}
                                    <span className="text-sm font-semibold text-slate-500">
                                      {item.extracted.strength || ""} {item.extracted.dosageForm || ""}
                                    </span>
                                  </>
                                )}
                              </h5>

                              {med ? (
                                <p className="text-xs font-semibold text-slate-600">
                                  Generic: <span className="text-slate-900 font-bold">{med.genericName}</span> · Manufacturer:{" "}
                                  <span className="text-slate-800">{med.manufacturer}</span> · DGDA ID: #{med.id}
                                </p>
                              ) : (
                                <p className="text-xs font-bold text-rose-700">
                                  Medicine not found in the Oxpecker AI database.
                                </p>
                              )}
                              <p className="text-[11px] text-slate-500">{item.matchReason}</p>
                            </div>

                            {/* Price & Line Total Box */}
                            <div className="text-left sm:text-right bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/80 shrink-0">
                              {item.pricing.lineTotalBdt !== null ? (
                                <>
                                  <div className="text-[11px] font-bold uppercase text-slate-400">
                                    {item.pricing.pricingStatus === "VERIFIED_PRICED" ? "Verified Cost" : "Estimated Cost"}
                                  </div>
                                  <div className="text-xl font-black text-slate-900">
                                    ৳{item.pricing.lineTotalBdt.toFixed(2)}
                                  </div>
                                  <div className="text-[11px] font-semibold text-slate-500">
                                    {item.pricing.requiredQuantity} {item.pricing.quantityUnit} × ৳
                                    {item.pricing.unitPriceBdt?.toFixed(2)}/{item.pricing.pricingBasisUsed}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-[11px] font-bold uppercase text-amber-700">
                                    Price Status
                                  </div>
                                  <div className="text-xs font-extrabold text-slate-800 max-w-[200px]">
                                    {item.pricing.statusMessage}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Extracted Regimen Details Row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                Extracted Name
                              </span>
                              <span className="font-bold text-slate-800">
                                {item.extracted.brandName || item.extracted.genericName || "—"} ({item.extracted.strength || "no strength"})
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                Dosage Schedule
                              </span>
                              <span className="font-bold text-slate-800">
                                {item.extracted.frequency || "Not specified"}
                                {item.extracted.dailyDoseUnits ? ` (${item.extracted.dailyDoseUnits}/day)` : ""}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                Treatment Duration
                              </span>
                              <span className="font-bold text-slate-800">
                                {item.extracted.duration || "Not specified"}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                Total Quantity
                              </span>
                              <span className="font-bold text-sky-700">
                                {item.pricing.requiredQuantity !== null
                                  ? `${item.pricing.requiredQuantity} ${item.pricing.quantityUnit}`
                                  : "Enter duration/qty"}
                              </span>
                            </div>
                          </div>

                          {/* Candidate Matches Quick Selector when multiple strengths/forms exist */}
                          {item.candidateMatches.length > 1 && (
                            <div className="mb-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                              <span className="text-[11px] font-extrabold text-amber-900 block mb-1.5">
                                Available Database Formulations (Click to select exact match):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {item.candidateMatches.map((cand) => {
                                  const isSelected = med?.id === cand.id;
                                  return (
                                    <button
                                      key={cand.id}
                                      type="button"
                                      onClick={() => void handleSelectCandidateMatch(item.itemId, cand.id)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                        isSelected
                                          ? "bg-slate-900 text-white border-slate-900"
                                          : "bg-white text-slate-700 border-slate-200 hover:border-sky-400"
                                      }`}
                                    >
                                      {cand.brandName} {cand.strength} ({cand.dosageForm}) —{" "}
                                      {cand.effectiveUnitPrice !== null ? `৳${cand.effectiveUnitPrice.toFixed(2)}` : "No price"}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* INLINE EDIT FORM */}
                          {isEditing && (
                            <div className="my-3 p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold uppercase text-sky-900">
                                  Edit Extracted Medicine & Regimen
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                                >
                                  Cancel
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label className="text-xs font-bold text-slate-700">
                                  Brand Name
                                  <input
                                    type="text"
                                    value={editDraft.brandName}
                                    onChange={(e) => setEditDraft({ ...editDraft, brandName: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                                    placeholder="e.g. Napa"
                                  />
                                </label>
                                <label className="text-xs font-bold text-slate-700">
                                  Strength
                                  <input
                                    type="text"
                                    value={editDraft.strength}
                                    onChange={(e) => setEditDraft({ ...editDraft, strength: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                                    placeholder="e.g. 500 mg"
                                  />
                                </label>
                                <label className="text-xs font-bold text-slate-700">
                                  Dosage Form
                                  <input
                                    type="text"
                                    value={editDraft.dosageForm}
                                    onChange={(e) => setEditDraft({ ...editDraft, dosageForm: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                                    placeholder="Tablet / Capsule / Syrup"
                                  />
                                </label>
                                <label className="text-xs font-bold text-slate-700">
                                  Frequency (e.g. 1+1+1 or 1+0+1)
                                  <input
                                    type="text"
                                    value={editDraft.frequency}
                                    onChange={(e) => setEditDraft({ ...editDraft, frequency: e.target.value, quantity: "" })}
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                                    placeholder="1+1+1"
                                  />
                                </label>
                                <label className="text-xs font-bold text-slate-700">
                                  Duration (e.g. 5 days)
                                  <input
                                    type="text"
                                    value={editDraft.duration}
                                    onChange={(e) => setEditDraft({ ...editDraft, duration: e.target.value, quantity: "" })}
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                                    placeholder="5 days"
                                  />
                                </label>
                                <label className="text-xs font-bold text-slate-700">
                                  Override Total Quantity (optional)
                                  <input
                                    type="number"
                                    min={1}
                                    value={editDraft.quantity}
                                    onChange={(e) => setEditDraft({ ...editDraft, quantity: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                                    placeholder="Auto-calculated from schedule"
                                  />
                                </label>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleSaveEditItem(item.itemId)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
                                >
                                  <Check size={14} /> Save & Recalculate Price
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Interactive Card Footer Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditItem(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                              >
                                <Edit3 size={12} /> Edit Name / Dose / Qty
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSearchingForItemId(item.itemId);
                                  setDbSearchQuery(item.extracted.brandName || item.extracted.genericName || "");
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold border border-sky-200/80 cursor-pointer"
                              >
                                <Search size={12} /> Change DB Match
                              </button>

                              {med && (
                                <Link
                                  href={`/medicines/${med.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                  <ExternalLink size={12} /> View Monograph
                                </Link>
                              )}

                              {item.genericAlternatives.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedAlternatives((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(item.itemId)) next.delete(item.itemId);
                                      else next.add(item.itemId);
                                      return next;
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 cursor-pointer"
                                >
                                  <span>Same-Generic Brands ({item.genericAlternatives.length})</span>
                                  {showAlts ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => void handleRemoveItem(item.itemId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-bold cursor-pointer"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>

                          {/* Same-Generic Verified Alternatives Comparison Drawer */}
                          {showAlts && item.genericAlternatives.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                              <p className="text-[11px] font-bold text-slate-500">
                                Verified same-generic, same-strength, same-form alternatives in the DGDA catalog (never auto-substituted):
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {item.genericAlternatives.map((alt) => (
                                  <div
                                    key={alt.id}
                                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2"
                                  >
                                    <div>
                                      <p className="text-xs font-extrabold text-slate-900">
                                        {alt.brandName} · <span className="font-semibold text-slate-500">{alt.strength}</span>
                                      </p>
                                      <p className="text-[11px] text-slate-500">{alt.manufacturer}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-black text-sky-700">
                                        ৳{(alt.unitPrice ?? alt.packPrice ?? 0).toFixed(2)}/{alt.priceBasis || "unit"}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => void handleSelectCandidateMatch(item.itemId, alt.id)}
                                        className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                      >
                                        Select Brand
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}

            {/* SECTION B, C, D, E: DEDICATED PRESCRIPTION SUMMARY & FINANCIAL TABLE */}
            <div className="pt-4 border-t border-slate-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    Complete Prescription Medicine Price List & Financial Summary
                  </h4>
                  <p className="text-xs text-slate-500">
                    Price Source: {intelligence.summary.priceSource} · Snapshot:{" "}
                    {intelligence.summary.catalogLastUpdated || "Verified"}
                  </p>
                </div>
                <Link
                  href={`/medicines/prescription-summary?id=${encodeURIComponent(intelligence.prescriptionId)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold self-start"
                >
                  <span>Open Dedicated Summary Page</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Section B: Complete Medicine Price Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                      <th className="py-3 px-4">Medicine</th>
                      <th className="py-3 px-4">Brand / Generic</th>
                      <th className="py-3 px-4">Strength & Form</th>
                      <th className="py-3 px-4">Schedule & Duration</th>
                      <th className="py-3 px-4 text-right">Quantity</th>
                      <th className="py-3 px-4 text-right">Unit Price</th>
                      <th className="py-3 px-4 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {intelligence.items.map((item) => {
                      const med = item.matchedMedicine;
                      return (
                        <tr key={item.itemId} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {med ? med.brandName : item.extracted.brandName || "Unmatched Medicine"}
                            <span
                              className={`ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                MATCH_STATUS_CONFIG[item.matchStatus].badgeClass
                              }`}
                            >
                              {item.matchStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {med ? `${med.genericName} (${med.manufacturer})` : item.extracted.genericName || "Not in DB"}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-semibold">
                            {med ? `${med.strength} · ${med.dosageForm}` : `${item.extracted.strength || "—"} · ${item.extracted.dosageForm || "—"}`}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.extracted.frequency || "—"} · {item.extracted.duration || "—"}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">
                            {item.pricing.requiredQuantity !== null
                              ? `${item.pricing.requiredQuantity} ${item.pricing.quantityUnit}`
                              : "Pending"}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">
                            {item.pricing.unitPriceBdt !== null
                              ? `৳${item.pricing.unitPriceBdt.toFixed(2)}`
                              : "Unavailable"}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">
                            {item.pricing.lineTotalBdt !== null ? (
                              `৳${item.pricing.lineTotalBdt.toFixed(2)}`
                            ) : (
                              <span className="text-xs font-bold text-amber-700">
                                {item.pricing.statusMessage}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Section C & D: Financial Summary & Unpriced Transparency */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Prescription Verification Breakdown
                  </h5>
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Total Medicines Extracted:</span>
                      <span className="font-bold text-slate-900">{intelligence.summary.totalExtractedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Priced & Verified Medicines:</span>
                      <span className="font-bold text-emerald-700">{intelligence.summary.pricedMedicinesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Unpriced / Pending Verification:</span>
                      <span className="font-bold text-amber-700">{intelligence.summary.unpricedMedicinesCount}</span>
                    </div>
                  </div>
                  {intelligence.summary.unpricedItems.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1">
                      <span className="text-[11px] font-bold text-amber-900 block">
                        Items Excluded from Verified Total:
                      </span>
                      {intelligence.summary.unpricedItems.map((u) => (
                        <p key={u.itemId} className="text-xs text-amber-800">
                          • <strong>{u.extractedName}:</strong> {u.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-emerald-950 text-white flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 block">
                      {intelligence.summary.isCompleteCalculation
                        ? "Complete Verified Prescription Total"
                        : `Verified Subtotal (${intelligence.summary.pricedMedicinesCount} of ${intelligence.summary.totalExtractedCount} medicines)`}
                    </span>
                    <div className="text-3xl font-black tracking-tight mt-1">
                      ৳{intelligence.summary.verifiedTotalBdt.toFixed(2)}
                    </div>
                    {!intelligence.summary.isCompleteCalculation &&
                      intelligence.summary.estimatedTotalBdt > intelligence.summary.verifiedTotalBdt && (
                        <p className="text-xs text-emerald-200 mt-1">
                          Estimated total including items pending verification: ৳
                          {intelligence.summary.estimatedTotalBdt.toFixed(2)}
                        </p>
                      )}
                  </div>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                    {intelligence.summary.isCompleteCalculation
                      ? "All extracted medicines have been matched to verified DGDA database records with confirmed unit prices and quantities."
                      : "Incomplete calculation: Unpriced or unverified medicines are excluded from the verified total above until confirmed."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL DATABASE SEARCH & MATCH MODAL */}
      {searchingForItemId && (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSearchingForItemId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 space-y-4 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-slate-900">
                Search Oxpecker AI Medicine Database (21,714 Records)
              </h4>
              <button
                type="button"
                onClick={() => setSearchingForItemId(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={dbSearchQuery}
                onChange={(e) => setDbSearchQuery(e.target.value)}
                placeholder="Search by brand name, generic name, or strength..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-sky-500 outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[220px]">
              {isSearchingDb ? (
                <p className="text-xs text-slate-500 text-center py-8">Searching 21,714 medicines...</p>
              ) : dbSearchResults.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No matching medicines found. Try another brand or generic name.
                </p>
              ) : (
                dbSearchResults.map((med) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-sky-400 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        {med.brandName} <span className="text-xs font-bold text-sky-700">{med.strength}</span> ·{" "}
                        <span className="text-xs text-slate-500">{med.dosageForm}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {med.genericName} · {med.manufacturer}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-slate-900">
                        {med.price !== null ? `৳${Number(med.price).toFixed(2)}/${med.priceBasis || "unit"}` : "Price unavailable"}
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleSelectCandidateMatch(searchingForItemId, String(med.id))}
                        className="mt-1 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Select Match
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORIGINAL IMAGE LIGHTBOX MODAL */}
      {showOriginalImageModal && previewUrl && (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowOriginalImageModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 max-w-4xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-slate-900">Original Uploaded Prescription Image</span>
              <button
                type="button"
                onClick={() => setShowOriginalImageModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-900 rounded-2xl p-2 flex items-center justify-center">
              <Image
                src={originalPreviewUrl || previewUrl}
                alt="Original uploaded prescription"
                width={1600}
                height={2000}
                unoptimized
                className="max-h-[78vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
