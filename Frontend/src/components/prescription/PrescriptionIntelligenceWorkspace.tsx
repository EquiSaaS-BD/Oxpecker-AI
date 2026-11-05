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
  ExternalLink,
  ShieldCheck,
  Calculator,
  FileCheck2,
  Crop,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { requestMedicalDocumentConsent, getPrescriptionAuthToken } from "@/lib/medical-document-client";
import type {
  PrescriptionIntelligenceResult,
  PrescriptionMedicineIntelligenceItem,
  MatchStatus,
} from "@/lib/prescription-intelligence";

export interface PrescriptionIntelligenceWorkspaceProps {
  onSelectMedicineDetail?: (medicine: any) => void;
  initialPrescriptionId?: string | null;
  defaultExpanded?: boolean;
  externalUploadedFile?: File | null;
  onExternalFileHandled?: () => void;
  hideInlineUploader?: boolean;
  onTriggerNewUpload?: () => void;
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
    label: "VERIFIED MATCH",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    icon: ShieldCheck,
  },
  POSSIBLE_MATCH: {
    label: "POSSIBLE MATCH",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    icon: HelpCircle,
  },
  NEEDS_MANUAL_VERIFICATION: {
    label: "REQUIRES VERIFICATION",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
    icon: AlertTriangle,
  },
  NOT_FOUND: {
    label: "NOT FOUND IN DATABASE",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};

const PROCESSING_STAGES = [
  "Uploading document",
  "Detecting prescription",
  "Extracting medicine information",
  "Matching medicines with the database",
  "Retrieving verified prices",
  "Calculating the medicine summary",
] as const;

const SESSION_STORAGE_KEY = "oxpecker_active_rx_session_v2";

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
        if (options.enhanceContrast) filters.push("contrast(1.25) brightness(1.03)");
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
  initialPrescriptionId = null,
  defaultExpanded = false,
  externalUploadedFile = null,
  onExternalFileHandled,
  hideInlineUploader = false,
  onTriggerNewUpload,
}: PrescriptionIntelligenceWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [activeFileHash, setActiveFileHash] = useState<string | null>(null);
  const [processingHash, setProcessingHash] = useState<string | null>(null);

  // Image preprocessing states
  const [rotation, setRotation] = useState(0);
  const [enhanceContrast, setEnhanceContrast] = useState(true);
  const [grayscale, setGrayscale] = useState(false);
  const [cropMarginPct, setCropMarginPct] = useState(0);
  const [showPreprocessControls, setShowPreprocessControls] = useState(false);

  // Real-time processing & stage states
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Intelligence Result State (Strictly real uploaded results only; never demo data)
  const [intelligence, setIntelligence] = useState<PrescriptionIntelligenceResult | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<"cards" | "summary">("cards");
  const [showOriginalImageModal, setShowOriginalImageModal] = useState(false);

  // Inline editing & Manual DB Search Modal
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, any>>({});
  const [searchingForItemId, setSearchingForItemId] = useState<string | null>(null);
  const [dbSearchQuery, setDbSearchQuery] = useState("");
  const [dbSearchResults, setDbSearchResults] = useState<any[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [expandedAlternatives, setExpandedAlternatives] = useState<Set<string>>(new Set());

  // Clean up any legacy demo/sample keys in localStorage on mount; load only if explicit initialPrescriptionId is passed
  useEffect(() => {
    try {
      window.localStorage.removeItem("oxpecker_rx_intelligence_history_v1");
      if (initialPrescriptionId) {
        const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.prescriptionId === initialPrescriptionId) {
            setIntelligence(parsed);
            setActiveViewTab("summary");
          }
        }
      }
    } catch {}
  }, [initialPrescriptionId]);

  const persistActiveSession = useCallback((result: PrescriptionIntelligenceResult | null) => {
    try {
      if (result) {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result));
      } else {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {}
  }, []);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      if (originalPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(originalPreviewUrl);
    };
  }, [previewUrl, originalPreviewUrl]);

  const executePrescriptionPipeline = useCallback(
    async (
      fileToProcess: File,
      preprocessOpts = { rotation: 0, enhanceContrast: true, grayscale: false, cropMarginPct: 0 },
      fileHash?: string
    ) => {
      const currentHash = fileHash || (await computeFileHash(fileToProcess));
      if (isProcessing && processingHash === currentHash) {
        return; // Prevent duplicate concurrent processing of the exact same upload
      }

      setProcessingHash(currentHash);
      setErrorMessage(null);
      setIsProcessing(true);

      // Stage 1: Uploading document
      setActiveStageIndex(0);
      setUploadProgress(15);
      setProcessingStage(PROCESSING_STAGES[0]);

      try {
        const accessToken = await requestMedicalDocumentConsent(true);
        if (!accessToken) {
          setIsProcessing(false);
          setProcessingHash(null);
          return;
        }

        // Stage 2: Detecting prescription & preprocessing
        setActiveStageIndex(1);
        setUploadProgress(30);
        setProcessingStage(PROCESSING_STAGES[1]);

        const formData = new FormData();
        formData.append("consent", "true");

        const processedFile = await preprocessPrescriptionImage(fileToProcess, preprocessOpts);
        if (processedFile !== fileToProcess && processedFile.type.startsWith("image/")) {
          setPreviewUrl(URL.createObjectURL(processedFile));
        }
        formData.append("image", processedFile);

        // Stage 3: Extracting medicine information via AI Vision & OCR
        setActiveStageIndex(2);
        setUploadProgress(50);
        setProcessingStage(PROCESSING_STAGES[2]);

        const response = await fetch("/api/ai/analyze-prescription", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });

        // Stage 4: Matching medicines with the database
        setActiveStageIndex(3);
        setUploadProgress(75);
        setProcessingStage(PROCESSING_STAGES[3]);

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || `Prescription analysis failed (HTTP ${response.status}).`);
        }

        if (data.category === "non_medical") {
          throw new Error(
            "The uploaded image does not appear to be a medical prescription, medicine label, or medicine packaging. Please upload a valid prescription image or PDF."
          );
        }

        // Stage 5 & 6: Retrieving verified prices & Calculating the medicine summary
        setActiveStageIndex(4);
        setUploadProgress(90);
        setProcessingStage(PROCESSING_STAGES[4]);

        await new Promise((r) => setTimeout(r, 180));
        setActiveStageIndex(5);
        setUploadProgress(100);
        setProcessingStage(PROCESSING_STAGES[5]);

        if (data.intelligence) {
          setIntelligence(data.intelligence);
          persistActiveSession(data.intelligence);
          setActiveViewTab("cards");
          const extractedCount = data.intelligence.summary.totalExtractedCount;
          const matchedCount = data.intelligence.summary.matchedCount;
          if (extractedCount > 0) {
            toast.success(
              `Detected ${extractedCount} medicine(s) and matched ${matchedCount} in the verified database.`
            );
          } else {
            toast.warning(
              "Prescription detected, but handwriting/text could not be confirmed automatically. Please review or adjust image."
            );
          }
        } else {
          throw new Error(
            "No structured prescription data could be extracted from this document. Please ensure the prescription is clearly visible and well-lit."
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Prescription processing failed.";
        setErrorMessage(msg);
        setIntelligence(null);
        persistActiveSession(null);
        toast.error(msg);
      } finally {
        setIsProcessing(false);
        setProcessingStage("");
        setUploadProgress(0);
        setProcessingHash(null);
      }
    },
    [isProcessing, processingHash, persistActiveSession]
  );

  const validateAndStageFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
      const normType = file.type.toLowerCase();
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const allowedExts = ["jpg", "jpeg", "png", "webp", "pdf"];

      if (!allowedTypes.includes(normType) && !allowedExts.includes(ext)) {
        const msg = `Unsupported file format (${file.name}). Please upload a JPG, JPEG, PNG, WEBP, or PDF file.`;
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
      if (isProcessing && processingHash === hash) {
        return;
      }
      setActiveFileHash(hash);
      setSelectedFile(file);
      setRotation(0);
      setCropMarginPct(0);

      if (file.type !== "application/pdf" && ext !== "pdf") {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setOriginalPreviewUrl(url);
      } else {
        setPreviewUrl(null);
        setOriginalPreviewUrl(null);
      }

      await executePrescriptionPipeline(
        file,
        {
          rotation: 0,
          enhanceContrast,
          grayscale,
          cropMarginPct: 0,
        },
        hash
      );
    },
    [enhanceContrast, grayscale, isProcessing, processingHash, executePrescriptionPipeline]
  );

  // Automatically process file when uploaded from the top Hero Upload interface on /medicines
  useEffect(() => {
    if (externalUploadedFile) {
      void validateAndStageFile(externalUploadedFile);
      onExternalFileHandled?.();
    }
  }, [externalUploadedFile, validateAndStageFile, onExternalFileHandled]);

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
      persistActiveSession(data.intelligence);
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
    if (!editDraft.brandName?.trim() && !editDraft.genericName?.trim()) {
      toast.error("Please enter a medicine brand or generic name.");
      return;
    }
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
    toast.success("Medicine verified & prescription summary updated.");
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!intelligence) return;
    const remaining = intelligence.items
      .filter((it) => it.itemId !== itemId)
      .map((it) => it.extracted);
    await syncAndRecalculateBackend(remaining);
    toast.success("Medicine removed from prescription.");
  };

  // Add an empty row for human verification of a missed line on an uploaded prescription (NEVER pre-filled with demo data)
  const handleAddVerificationMedicineRow = async () => {
    if (!intelligence) return;
    const baseItems = intelligence.items.map((it) => it.extracted);
    const newId = `verify-${Date.now()}`;
    const newMed = {
      id: newId,
      brandName: null,
      genericName: null,
      strength: null,
      dosageForm: "Tablet",
      frequency: null,
      duration: null,
      quantity: null,
      dosageInstructions: null,
      ocrConfidence: 1.0,
      medicineNameConfidence: 1.0,
      strengthConfidence: 1.0,
      extractionStatus: "MANUAL_ENTRY",
      requiresManualVerification: true,
    };

    await syncAndRecalculateBackend([...baseItems, newMed]);
    setEditingItemId(newId);
    setEditDraft({
      brandName: "",
      genericName: "",
      strength: "",
      dosageForm: "Tablet",
      frequency: "",
      duration: "",
      quantity: "",
      dosageInstructions: "",
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

  const handleClearAnalysis = () => {
    setIntelligence(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setOriginalPreviewUrl(null);
    setErrorMessage(null);
    setActiveFileHash(null);
    persistActiveSession(null);
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

  // Export Official PDF Summary
  const handleDownloadPdfSummary = () => {
    if (!intelligence) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 44;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text("OXPECKER AI — PRESCRIPTION ANALYSIS & VERIFIED PRICE SUMMARY", 40, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Prescription Reference: ${intelligence.prescriptionId}`, 40, y);
    if (intelligence.prescriptionMetadata.prescriptionDate) {
      doc.text(`Prescribed Date: ${intelligence.prescriptionMetadata.prescriptionDate}`, pageW - 220, y);
    }
    y += 15;
    if (intelligence.prescriptionMetadata.patientName || intelligence.prescriptionMetadata.doctorName) {
      doc.text(
        `Patient: ${intelligence.prescriptionMetadata.patientName || "Not specified on Rx"}   |   Doctor: ${intelligence.prescriptionMetadata.doctorName || "Not specified on Rx"}`,
        40,
        y
      );
      y += 16;
    }

    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, y, pageW - 80, 44, 6, 6, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    doc.text(
      `Total Detected: ${intelligence.summary.totalExtractedCount}   |   Matched: ${intelligence.summary.matchedCount}   |   Verified Prices: ${intelligence.summary.pricedMedicinesCount}   |   Unavailable Prices: ${intelligence.summary.unpricedMedicinesCount}`,
      52,
      y + 18
    );
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Price Source: ${intelligence.summary.priceSource}`, 52, y + 33);
    y += 60;

    // Table Header
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(229, 231, 235);
    doc.rect(40, y, pageW - 80, 24, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text("Extracted / Matched Medicine", 48, y + 15);
    doc.text("Strength & Form", 225, y + 15);
    doc.text("Schedule & Duration", 330, y + 15);
    doc.text("Qty", 415, y + 15);
    doc.text("Unit Price", 450, y + 15);
    doc.text("Subtotal", 508, y + 15);
    y += 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    for (const item of intelligence.items) {
      if (y > 740) {
        doc.addPage();
        y = 44;
      }
      const medTitle = item.matchedMedicine
        ? `${item.matchedMedicine.brandName} (${item.matchedMedicine.genericName.slice(0, 16)})`
        : `${item.extracted.brandName || "Unknown"} [Medicine Not Found in Database]`;
      const strengthForm = `${item.matchedMedicine?.strength || item.extracted.strength || "-"} ${item.matchedMedicine?.dosageForm || item.extracted.dosageForm || ""}`.trim();
      const schedule = `${item.extracted.frequency || "-"} (${item.extracted.duration || "-"})`;
      const qtyStr = item.pricing.requiredQuantity !== null ? String(item.pricing.requiredQuantity) : "Req.";
      const unitStr = item.pricing.unitPriceBdt !== null ? `Tk ${item.pricing.unitPriceBdt.toFixed(2)}` : "Price Unavailable";
      const totalStr = item.pricing.lineTotalBdt !== null ? `Tk ${item.pricing.lineTotalBdt.toFixed(2)}` : "Unavailable";

      doc.setTextColor(17, 24, 39);
      doc.text(medTitle.slice(0, 34), 48, y + 15);
      doc.text(strengthForm.slice(0, 20), 225, y + 15);
      doc.text(schedule.slice(0, 16), 330, y + 15);
      doc.text(qtyStr, 415, y + 15);
      doc.text(unitStr.slice(0, 12), 450, y + 15);
      doc.text(totalStr.slice(0, 12), 508, y + 15);

      doc.setDrawColor(229, 231, 235);
      doc.line(40, y + 22, pageW - 40, y + 22);
      y += 24;
    }

    y += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    const totalLabel = intelligence.summary.isCompleteCalculation
      ? `Total Verified Medicine Cost (${intelligence.summary.pricedMedicinesCount} medicines): BDT ${intelligence.summary.verifiedTotalBdt.toFixed(2)}`
      : `Subtotal of Medicines with Verified Prices (${intelligence.summary.pricedMedicinesCount} of ${intelligence.summary.totalExtractedCount}): BDT ${intelligence.summary.verifiedTotalBdt.toFixed(2)}`;
    doc.text(totalLabel, 40, y);
    y += 16;

    if (!intelligence.summary.isCompleteCalculation) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(180, 83, 9);
      doc.text(
        `Incomplete Pricing Warning: ${intelligence.summary.unpricedMedicinesCount} medicine(s) have unavailable prices or require verification and are excluded from the confirmed subtotal.`,
        40,
        y
      );
      y += 16;
    }

    doc.save(`Oxpecker-Prescription-Analysis-${intelligence.prescriptionId}.pdf`);
    toast.success("Downloaded Prescription Analysis PDF.");
  };

  // If hideInlineUploader is true and there is no active upload, processing, error, or result, render nothing
  if (hideInlineUploader && !isProcessing && !errorMessage && !intelligence && !defaultExpanded) {
    return null;
  }

  return (
    <section className="w-full space-y-6">
      {/* INLINE UPLOADER (Only rendered on standalone summary route when defaultExpanded is true and hideInlineUploader is false) */}
      {!hideInlineUploader && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs p-5 sm:p-6">
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
            className={`rounded-2xl border-2 border-dashed p-6 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isDragging
                ? "border-sky-500 bg-sky-50/40"
                : "border-[#E5E7EB] hover:border-sky-400 bg-[#F8FAFC] hover:bg-white"
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
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-sky-600 shadow-2xs shrink-0">
                <UploadCloud size={24} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#111827]">
                  Upload Prescription Image or PDF for Automatic Recognition
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Drag & drop or click to upload JPG, JPEG, PNG, WEBP, or multi-page PDF (up to 15 MB).
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs shrink-0">
              <UploadCloud size={15} />
              <span>Select Prescription</span>
            </span>
          </div>
        </div>
      )}

      {/* REAL-TIME PROCESSING STAGES PANEL (Pure White Design System) */}
      {isProcessing && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  {processingStage || "Analyzing Prescription Document..."}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {selectedFile ? `Document: ${selectedFile.name}` : "Running AI Vision OCR & Database Matching"}
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full self-start sm:self-center">
              {uploadProgress}% Complete
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {previewUrl && (
              <div className="md:col-span-4 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] p-3 flex flex-col items-center">
                <Image
                  src={previewUrl}
                  alt="Uploading prescription preview"
                  width={400}
                  height={520}
                  unoptimized
                  className="max-h-48 w-auto object-contain rounded-lg bg-white border border-[#E5E7EB]"
                />
                <span className="text-[11px] font-semibold text-[#64748B] mt-2">
                  Uploaded Prescription Preview
                </span>
              </div>
            )}

            <div className={`${previewUrl ? "md:col-span-8" : "md:col-span-12"} space-y-3`}>
              <div className="w-full h-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                {PROCESSING_STAGES.map((stageLabel, idx) => {
                  const isDone = idx < activeStageIndex;
                  const isCurrent = idx === activeStageIndex;
                  return (
                    <div
                      key={stageLabel}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        isCurrent
                          ? "bg-sky-50/70 border-sky-300 text-[#111827]"
                          : isDone
                            ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                            : "bg-[#F8FAFC] border-[#E5E7EB] text-[#64748B]"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 size={15} className="text-sky-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className="truncate">{stageLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTUAL ERROR STATE WITH RETRY & IMAGE ADJUSTMENT (Never converts error into fake success) */}
      {errorMessage && !isProcessing && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#111827]">
                  Prescription Detection or Processing Error
                </h3>
                <p className="text-xs sm:text-sm text-rose-700 font-medium mt-0.5">{errorMessage}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {selectedFile && (
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Retry Analysis</span>
                </button>
              )}
              {onTriggerNewUpload && (
                <button
                  type="button"
                  onClick={onTriggerNewUpload}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:border-sky-300 text-[#111827] text-xs font-bold cursor-pointer"
                >
                  <UploadCloud size={13} />
                  <span>Upload Another File</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAnalysis}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#64748B] text-xs font-bold border border-[#E5E7EB] cursor-pointer"
              >
                <X size={13} />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE PRESCRIPTION INTELLIGENCE RESULTS & SUMMARY (100% Pure White Enterprise SaaS UI) */}
      {intelligence && !isProcessing && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          {/* CLEAN WHITE HEADER BAR */}
          <div className="bg-white border-b border-[#E5E7EB] p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Reference: {intelligence.prescriptionId}
                  </span>
                  {intelligence.prescriptionMetadata.prescriptionDate && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8FAFC] text-[#111827] border border-[#E5E7EB]">
                      Prescribed Date: {intelligence.prescriptionMetadata.prescriptionDate}
                    </span>
                  )}
                  {intelligence.prescriptionMetadata.doctorName && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8FAFC] text-[#111827] border border-[#E5E7EB]">
                      Doctor: {intelligence.prescriptionMetadata.doctorName}
                    </span>
                  )}
                  {intelligence.prescriptionMetadata.patientName && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8FAFC] text-[#111827] border border-[#E5E7EB]">
                      Patient: {intelligence.prescriptionMetadata.patientName}
                    </span>
                  )}
                  {isRecalculating && (
                    <span className="inline-flex items-center gap-1 text-xs text-sky-600 font-bold">
                      <RefreshCw size={12} className="animate-spin" /> Recalculating verified prices...
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
                  Prescription Medicine Analysis & Verified Price Summary
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                  {intelligence.summary.summaryBannerText}
                </p>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="inline-flex rounded-xl bg-[#F8FAFC] p-1 border border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setActiveViewTab("cards")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeViewTab === "cards"
                        ? "bg-white text-[#111827] shadow-2xs border border-[#E5E7EB]"
                        : "text-[#64748B] hover:text-[#111827]"
                    }`}
                  >
                    Detected Medicines ({intelligence.items.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewTab("summary")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeViewTab === "summary"
                        ? "bg-white text-[#111827] shadow-2xs border border-[#E5E7EB]"
                        : "text-[#64748B] hover:text-[#111827]"
                    }`}
                  >
                    Price Summary Table
                  </button>
                </div>

                {selectedFile && selectedFile.type !== "application/pdf" && (
                  <button
                    type="button"
                    onClick={() => setShowPreprocessControls((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#111827] text-xs font-bold border border-[#E5E7EB] cursor-pointer"
                    title="Rotate or adjust image contrast"
                  >
                    <Sliders size={14} className="text-sky-600" />
                    <span>Image Tools</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadPdfSummary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer shadow-2xs"
                >
                  <Download size={14} />
                  <span>Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#111827] text-xs font-bold border border-[#E5E7EB] cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAnalysis}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-[#64748B] hover:text-rose-600 text-xs font-bold border border-[#E5E7EB] cursor-pointer"
                  title="Close prescription analysis"
                >
                  <X size={14} />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* OPTIONAL IMAGE ROTATION & CONTRAST BAR */}
            {selectedFile && showPreprocessControls && selectedFile.type !== "application/pdf" && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-bold text-[#111827] hover:border-sky-300 cursor-pointer"
                  >
                    <RotateCw size={13} />
                    <span>Rotate ({rotation}°)</span>
                  </button>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-bold text-[#111827] cursor-pointer">
                    <Crop size={13} />
                    <span>Border Trim:</span>
                    <select
                      value={cropMarginPct}
                      onChange={(e) => setCropMarginPct(Number(e.target.value))}
                      className="bg-transparent font-extrabold text-sky-700 outline-none"
                    >
                      <option value={0}>0% (Full)</option>
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                      <option value={15}>15%</option>
                    </select>
                  </label>

                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111827] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enhanceContrast}
                      onChange={(e) => setEnhanceContrast(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600"
                    />
                    <span>Enhance Contrast</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111827] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={grayscale}
                      onChange={(e) => setGrayscale(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600"
                    />
                    <span>B&W Filter</span>
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
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
                >
                  Re-Analyze Image
                </button>
              </div>
            )}

            {/* CLEAN WHITE OVERVIEW METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5 pt-5 border-t border-[#E5E7EB]">
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E5E7EB]">
                <span className="text-[11px] font-bold uppercase text-[#64748B] block">
                  Total Detected Medicines
                </span>
                <span className="text-xl font-black text-[#111827] mt-0.5 block">
                  {intelligence.summary.totalExtractedCount}
                </span>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E5E7EB]">
                <span className="text-[11px] font-bold uppercase text-emerald-700 block">
                  Successfully Matched
                </span>
                <span className="text-xl font-black text-emerald-700 mt-0.5 block">
                  {intelligence.summary.matchedCount}
                </span>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E5E7EB]">
                <span className="text-[11px] font-bold uppercase text-sky-700 block">
                  Verified Prices Available
                </span>
                <span className="text-xl font-black text-sky-700 mt-0.5 block">
                  {intelligence.summary.pricedMedicinesCount}
                </span>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E5E7EB]">
                <span className="text-[11px] font-bold uppercase text-amber-700 block">
                  Unavailable / Unverified Prices
                </span>
                <span className="text-xl font-black text-amber-700 mt-0.5 block">
                  {intelligence.summary.unpricedMedicinesCount}
                </span>
              </div>

              <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 block truncate">
                  {intelligence.summary.isCompleteCalculation
                    ? "Total Verified Medicine Cost"
                    : "Subtotal (Verified Prices)"}
                </span>
                <span className="text-xl font-black text-[#111827] mt-0.5 block">
                  ৳{intelligence.summary.verifiedTotalBdt.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="p-5 sm:p-6 space-y-6 bg-white">
            {activeViewTab === "cards" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Side-by-Side Uploaded Prescription Preview */}
                {previewUrl && (
                  <div className="lg:col-span-4 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] p-4 sticky top-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#111827]">
                        Uploaded Document
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowOriginalImageModal(true)}
                        className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={13} /> Inspect Full Size
                      </button>
                    </div>
                    <Image
                      src={previewUrl}
                      alt="Uploaded prescription preview"
                      width={900}
                      height={1200}
                      unoptimized
                      className="w-full h-auto max-h-[520px] object-contain rounded-xl bg-white border border-[#E5E7EB]"
                    />
                  </div>
                )}

                {/* Detected Medicine Analysis List */}
                <div className={`${previewUrl ? "lg:col-span-8" : "lg:col-span-12"} space-y-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-extrabold text-[#111827]">
                      Extracted Prescription Medicines & Verified Database Matches ({intelligence.items.length})
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddVerificationMedicineRow}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#111827] font-bold text-xs border border-[#E5E7EB] cursor-pointer"
                      >
                        <Plus size={14} className="text-sky-600" /> Add Missed Medicine Line
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void syncAndRecalculateBackend(intelligence.items.map((i) => i.extracted))
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#111827] font-bold text-xs border border-[#E5E7EB] cursor-pointer"
                      >
                        <Calculator size={14} className="text-sky-600" /> Recalculate Totals
                      </button>
                    </div>
                  </div>

                  {intelligence.items.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] text-center space-y-3">
                      <AlertTriangle size={28} className="mx-auto text-amber-600" />
                      <p className="text-sm font-bold text-[#111827]">
                        No readable medicine lines could be confirmed from this document.
                      </p>
                      <p className="text-xs text-[#64748B] max-w-md mx-auto">
                        {intelligence.imageQuality?.reasons?.[0] ||
                          "The image may be blurry, low-contrast, or handwritten text is illegible. We never guess or fabricate medicine names."}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleAddVerificationMedicineRow}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
                        >
                          <Plus size={14} /> Transcribe Medicine Line Manually
                        </button>
                      </div>
                    </div>
                  ) : (
                    intelligence.items.map((item, idx) => {
                      const statusCfg = MATCH_STATUS_CONFIG[item.matchStatus];
                      const StatusIcon = statusCfg.icon;
                      const isEditing = editingItemId === item.itemId;
                      const med = item.matchedMedicine;
                      const showAlts = expandedAlternatives.has(item.itemId);
                      const isUncertain =
                        item.matchStatus === "NEEDS_MANUAL_VERIFICATION" ||
                        item.extracted.requiresManualVerification ||
                        item.extracted.ocrConfidence < 0.75;

                      return (
                        <div
                          key={item.itemId}
                          className={`rounded-2xl border p-4 sm:p-5 transition-all bg-white ${
                            item.matchStatus === "NOT_FOUND"
                              ? "border-rose-200"
                              : isUncertain
                                ? "border-amber-300"
                                : "border-[#E5E7EB] hover:border-sky-300"
                          }`}
                        >
                          {/* Top Row: Item Number, Match Status Badge, Confidence, Price & Subtotal */}
                          <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-[#E5E7EB]">
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs font-black flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${statusCfg.badgeClass}`}
                                >
                                  <StatusIcon size={12} />
                                  {statusCfg.label}
                                </span>
                                <span className="text-[11px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E5E7EB] px-2 py-0.5 rounded-md">
                                  Match Confidence: {Math.round(item.matchConfidence * 100)}%
                                </span>
                                <span className="text-[11px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E5E7EB] px-2 py-0.5 rounded-md">
                                  OCR Readability: {Math.round(item.extracted.ocrConfidence * 100)}%
                                </span>
                                {isUncertain && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                    <AlertTriangle size={11} /> Human Verification Required
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Verified Unit Price & Subtotal Box */}
                            <div className="text-left sm:text-right bg-[#F8FAFC] px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] shrink-0">
                              {item.pricing.lineTotalBdt !== null ? (
                                <>
                                  <div className="text-[10px] font-bold uppercase text-[#64748B]">
                                    {item.pricing.pricingStatus === "VERIFIED_PRICED"
                                      ? "Verified Medicine Subtotal"
                                      : "Unverified Estimate (Excluded)"}
                                  </div>
                                  <div className="text-xl font-black text-[#111827]">
                                    ৳{item.pricing.lineTotalBdt.toFixed(2)}
                                  </div>
                                  <div className="text-[11px] font-semibold text-[#64748B]">
                                    Unit Price: ৳{item.pricing.unitPriceBdt?.toFixed(2)}/{item.pricing.pricingBasisUsed} × Qty:{" "}
                                    {item.pricing.requiredQuantity} {item.pricing.quantityUnit}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-[10px] font-bold uppercase text-amber-700">
                                    Pricing Status
                                  </div>
                                  <div className="text-xs font-extrabold text-[#111827] max-w-[210px]">
                                    {item.pricing.pricingStatus === "PRICE_UNAVAILABLE" ||
                                    (med && item.pricing.unitPriceBdt === null)
                                      ? "Price Unavailable"
                                      : item.matchStatus === "NOT_FOUND"
                                        ? "Medicine Not Found in Database"
                                        : item.pricing.statusMessage}
                                  </div>
                                  {med && item.pricing.unitPriceBdt !== null && (
                                    <div className="text-[11px] font-semibold text-[#64748B] mt-0.5">
                                      Verified Unit Price: ৳{item.pricing.unitPriceBdt.toFixed(2)}/{item.pricing.pricingBasisUsed}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* SEPARATE DISPLAY: (1) Original Extracted Prescription Text vs (2) Matched Database Medicine */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3.5">
                            {/* Column 1: Original Extracted Prescription Text */}
                            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                                  1. Extracted Prescription Text
                                </span>
                                {item.extracted.notes && (
                                  <span className="text-[10px] font-medium text-[#64748B] truncate max-w-[180px]" title={item.extracted.notes}>
                                    Line: &ldquo;{item.extracted.notes}&rdquo;
                                  </span>
                                )}
                              </div>
                              <div className="text-sm font-bold text-[#111827]">
                                {item.extracted.brandName || item.extracted.genericName || (
                                  <span className="text-amber-700 italic">Unclear medicine name — verify below</span>
                                )}
                                {item.extracted.strength ? ` • ${item.extracted.strength}` : ""}
                                {item.extracted.dosageForm ? ` (${item.extracted.dosageForm})` : ""}
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                                <div>
                                  <span className="text-[10px] font-semibold text-[#64748B] block">Frequency & Timing</span>
                                  <span className="font-bold text-[#111827]">
                                    {item.extracted.frequency || "Not specified"}
                                    {item.extracted.dosageInstructions ? ` · ${item.extracted.dosageInstructions}` : ""}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-semibold text-[#64748B] block">Duration & Quantity</span>
                                  <span className="font-bold text-[#111827]">
                                    {item.extracted.duration || "Not specified"}
                                    {item.pricing.requiredQuantity !== null
                                      ? ` (${item.pricing.requiredQuantity} ${item.pricing.quantityUnit})`
                                      : " (Qty requires verification)"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Column 2: Matched Oxpecker AI Database Medicine */}
                            <div
                              className={`p-3.5 rounded-xl border space-y-2 ${
                                med
                                  ? "bg-white border-[#E5E7EB]"
                                  : "bg-rose-50/40 border-rose-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                                  2. Matched Database Medicine
                                </span>
                                {med && (
                                  <span className="text-[10px] font-mono font-bold text-[#64748B]">
                                    Record #{med.id}
                                  </span>
                                )}
                              </div>

                              {med ? (
                                <>
                                  <div className="text-sm font-black text-[#111827]">
                                    {med.brandName}{" "}
                                    <span className="text-xs font-bold text-sky-700">
                                      {med.strength} · {med.dosageForm}
                                    </span>
                                  </div>
                                  <div className="text-xs text-[#64748B] font-medium">
                                    Generic: <span className="font-bold text-[#111827]">{med.genericName}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs pt-0.5">
                                    <span className="text-[#64748B]">
                                      Manufacturer: <strong className="text-[#111827]">{med.manufacturer}</strong>
                                    </span>
                                    <span className="font-bold text-emerald-700">
                                      {med.effectiveUnitPrice !== null
                                        ? `৳${med.effectiveUnitPrice.toFixed(2)}/${med.priceBasis || "unit"}`
                                        : "Price Unavailable"}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="py-2 space-y-1">
                                  <p className="text-sm font-extrabold text-rose-700">
                                    Medicine Not Found in Database
                                  </p>
                                  <p className="text-xs text-[#64748B]">
                                    No reliable match in the verified catalog. Use &ldquo;Search Database&rdquo; below to locate manually or verify spelling.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Candidate Formulations Selector when multiple strengths/forms exist */}
                          {item.candidateMatches.length > 1 && (
                            <div className="mb-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                              <span className="text-[11px] font-bold text-amber-900 block mb-1.5">
                                Multiple Database Strengths/Formulations Available — Select Exact Prescribed Match:
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
                                          ? "bg-sky-600 text-white border-sky-600"
                                          : "bg-white text-[#111827] border-[#E5E7EB] hover:border-sky-400"
                                      }`}
                                    >
                                      {cand.brandName} {cand.strength} ({cand.dosageForm}) —{" "}
                                      {cand.effectiveUnitPrice !== null
                                        ? `৳${cand.effectiveUnitPrice.toFixed(2)}`
                                        : "Price Unavailable"}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* INLINE HUMAN VERIFICATION & EDIT FORM */}
                          {isEditing && (
                            <div className="my-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold uppercase text-[#111827]">
                                  Verify / Correct Extracted Prescription Line
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="text-xs font-bold text-[#64748B] hover:text-[#111827]"
                                >
                                  Cancel
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label className="text-xs font-bold text-[#111827]">
                                  Medicine / Brand Name
                                  <input
                                    type="text"
                                    value={editDraft.brandName}
                                    onChange={(e) => setEditDraft({ ...editDraft, brandName: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827]"
                                    placeholder="Enter prescribed brand name"
                                  />
                                </label>
                                <label className="text-xs font-bold text-[#111827]">
                                  Strength
                                  <input
                                    type="text"
                                    value={editDraft.strength}
                                    onChange={(e) => setEditDraft({ ...editDraft, strength: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827]"
                                    placeholder="e.g. 500 mg, 20 mg"
                                  />
                                </label>
                                <label className="text-xs font-bold text-[#111827]">
                                  Dosage Form
                                  <input
                                    type="text"
                                    value={editDraft.dosageForm}
                                    onChange={(e) => setEditDraft({ ...editDraft, dosageForm: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827]"
                                    placeholder="Tablet / Capsule / Syrup"
                                  />
                                </label>
                                <label className="text-xs font-bold text-[#111827]">
                                  Frequency (e.g. 1+0+1)
                                  <input
                                    type="text"
                                    value={editDraft.frequency}
                                    onChange={(e) =>
                                      setEditDraft({ ...editDraft, frequency: e.target.value, quantity: "" })
                                    }
                                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827]"
                                    placeholder="As written on Rx"
                                  />
                                </label>
                                <label className="text-xs font-bold text-[#111827]">
                                  Duration (e.g. 7 days)
                                  <input
                                    type="text"
                                    value={editDraft.duration}
                                    onChange={(e) =>
                                      setEditDraft({ ...editDraft, duration: e.target.value, quantity: "" })
                                    }
                                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827]"
                                    placeholder="As written on Rx"
                                  />
                                </label>
                                <label className="text-xs font-bold text-[#111827]">
                                  Prescribed Quantity
                                  <input
                                    type="number"
                                    min={1}
                                    value={editDraft.quantity}
                                    onChange={(e) => setEditDraft({ ...editDraft, quantity: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827]"
                                    placeholder="Auto-computed from schedule"
                                  />
                                </label>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleSaveEditItem(item.itemId)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
                                >
                                  <Check size={14} /> Confirm & Recalculate
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Card Footer Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E5E7EB] text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditItem(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#111827] border border-[#E5E7EB] font-bold cursor-pointer"
                              >
                                <Edit3 size={12} /> Verify / Edit Line
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSearchingForItemId(item.itemId);
                                  setDbSearchQuery(item.extracted.brandName || item.extracted.genericName || "");
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold border border-sky-200 cursor-pointer"
                              >
                                <Search size={12} /> Search Database
                              </button>

                              {med && (
                                <Link
                                  href={`/medicines/${med.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#111827] border border-[#E5E7EB] font-bold"
                                >
                                  <ExternalLink size={12} /> Medicine Details
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
                                  <span>Verified Generic Alternatives ({item.genericAlternatives.length})</span>
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

                          {/* Verified Generic Alternatives Drawer (Never auto-substituted) */}
                          {showAlts && item.genericAlternatives.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-2">
                              <p className="text-[11px] font-semibold text-[#64748B]">
                                Verified same-generic, same-strength, same-form brands in database (for reference only; never auto-substituted):
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {item.genericAlternatives.map((alt) => (
                                  <div
                                    key={alt.id}
                                    className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-2"
                                  >
                                    <div>
                                      <p className="text-xs font-extrabold text-[#111827]">
                                        {alt.brandName} · <span className="font-semibold text-[#64748B]">{alt.strength}</span>
                                      </p>
                                      <p className="text-[11px] text-[#64748B]">{alt.manufacturer}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-black text-sky-700">
                                        {alt.unitPrice ?? alt.packPrice
                                          ? `৳${(alt.unitPrice ?? alt.packPrice ?? 0).toFixed(2)}/${alt.priceBasis || "unit"}`
                                          : "Price Unavailable"}
                                      </p>
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

            {/* COMPLETE MEDICINE PRICE SUMMARY & FINANCIAL BREAKDOWN (Pure White UI) */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-lg font-extrabold text-[#111827]">
                    Medicine Price Summary & Financial Calculation
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    Price Source: {intelligence.summary.priceSource}
                    {intelligence.summary.catalogLastUpdated
                      ? ` · Verified Snapshot: ${intelligence.summary.catalogLastUpdated}`
                      : ""}
                  </p>
                </div>
              </div>

              {/* Financial Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#111827] font-bold border-b border-[#E5E7EB]">
                      <th className="py-3 px-4">Extracted Rx Name</th>
                      <th className="py-3 px-4">Matched Database Medicine</th>
                      <th className="py-3 px-4">Strength & Form</th>
                      <th className="py-3 px-4">Schedule & Duration</th>
                      <th className="py-3 px-4 text-right">Prescribed Qty</th>
                      <th className="py-3 px-4 text-right">Verified Unit Price</th>
                      <th className="py-3 px-4 text-right">Calculated Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] bg-white">
                    {intelligence.items.map((item) => {
                      const med = item.matchedMedicine;
                      return (
                        <tr key={item.itemId} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-4 font-bold text-[#111827]">
                            {item.extracted.brandName || item.extracted.genericName || "Unspecified"}
                          </td>
                          <td className="py-3 px-4 text-[#64748B] font-medium">
                            {med ? (
                              <div>
                                <span className="font-bold text-[#111827]">{med.brandName}</span>{" "}
                                <span className="text-xs">({med.genericName} · {med.manufacturer})</span>
                              </div>
                            ) : (
                              <span className="text-rose-700 font-bold">Medicine Not Found in Database</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[#111827] font-semibold">
                            {med
                              ? `${med.strength} · ${med.dosageForm}`
                              : `${item.extracted.strength || "—"} · ${item.extracted.dosageForm || "—"}`}
                          </td>
                          <td className="py-3 px-4 text-[#64748B]">
                            {item.extracted.frequency || "—"} · {item.extracted.duration || "—"}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#111827]">
                            {item.pricing.requiredQuantity !== null
                              ? `${item.pricing.requiredQuantity} ${item.pricing.quantityUnit}`
                              : "Verification Req."}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#111827]">
                            {item.pricing.unitPriceBdt !== null
                              ? `৳${item.pricing.unitPriceBdt.toFixed(2)}`
                              : "Price Unavailable"}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-[#111827]">
                            {item.pricing.lineTotalBdt !== null ? (
                              `৳${item.pricing.lineTotalBdt.toFixed(2)}`
                            ) : (
                              <span className="text-xs font-bold text-amber-700">
                                {item.matchStatus === "NOT_FOUND"
                                  ? "Medicine Not Found in Database"
                                  : item.pricing.unitPriceBdt === null
                                    ? "Price Unavailable"
                                    : item.pricing.statusMessage}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary Cards (Pure White / Soft Off-White) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2.5">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Prescription Verification Summary
                  </h5>
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#64748B] font-medium">Total Detected Medicines:</span>
                      <span className="font-bold text-[#111827]">{intelligence.summary.totalExtractedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] font-medium">Successfully Matched Medicines:</span>
                      <span className="font-bold text-[#111827]">{intelligence.summary.matchedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] font-medium">Medicines with Verified Prices:</span>
                      <span className="font-bold text-emerald-700">{intelligence.summary.pricedMedicinesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] font-medium">Medicines with Unavailable Prices / Unverified:</span>
                      <span className="font-bold text-amber-700">{intelligence.summary.unpricedMedicinesCount}</span>
                    </div>
                  </div>
                  {intelligence.summary.unpricedItems.length > 0 && (
                    <div className="pt-2.5 border-t border-[#E5E7EB] space-y-1">
                      <span className="text-[11px] font-bold text-amber-800 block">
                        Incomplete Pricing Warning — Excluded from Verified Subtotal:
                      </span>
                      {intelligence.summary.unpricedItems.map((u) => (
                        <p key={u.itemId} className="text-xs text-amber-900">
                          • <strong>{u.extractedName}:</strong> {u.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-white border-2 border-emerald-200 flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCheck2 size={16} className="text-emerald-600" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                        {intelligence.summary.isCompleteCalculation
                          ? "Total Verified Medicine Cost"
                          : "Subtotal of Medicines with Verified Prices"}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-[#111827] tracking-tight mt-1.5">
                      ৳{intelligence.summary.verifiedTotalBdt.toFixed(2)}
                    </div>
                    <p className="text-xs font-semibold text-[#64748B] mt-1">
                      Confirmed across {intelligence.summary.pricedMedicinesCount} of{" "}
                      {intelligence.summary.totalExtractedCount} detected medicine(s)
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[11px] text-[#64748B] leading-relaxed">
                    {intelligence.summary.isCompleteCalculation
                      ? "All detected medicines are matched against verified Oxpecker AI database records with confirmed unit prices and prescribed quantities."
                      : `Incomplete pricing warning: ${intelligence.summary.unpricedMedicinesCount} medicine(s) do not have a confirmed price or quantity and are excluded from this verified subtotal.`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL DATABASE SEARCH & MATCH MODAL */}
      {searchingForItemId && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSearchingForItemId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl max-w-xl w-full p-5 space-y-4 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-[#111827]">
                Search Verified Oxpecker AI Medicine Database
              </h4>
              <button
                type="button"
                onClick={() => setSearchingForItemId(null)}
                className="p-1.5 rounded-full hover:bg-[#F8FAFC] text-[#64748B]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={dbSearchQuery}
                onChange={(e) => setDbSearchQuery(e.target.value)}
                placeholder="Search by brand name, generic name, or strength..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#111827] focus:border-sky-500 outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[220px]">
              {isSearchingDb ? (
                <p className="text-xs text-[#64748B] text-center py-8">Searching verified medicine catalog...</p>
              ) : dbSearchResults.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-8">
                  Medicine Not Found in Database. Try another brand or generic name.
                </p>
              ) : (
                dbSearchResults.map((med) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl border border-[#E5E7EB] hover:border-sky-400 bg-white flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-extrabold text-[#111827]">
                        {med.brandName} <span className="text-xs font-bold text-sky-700">{med.strength}</span> ·{" "}
                        <span className="text-xs text-[#64748B]">{med.dosageForm}</span>
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {med.genericName} · {med.manufacturer}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-[#111827]">
                        {med.price !== null
                          ? `৳${Number(med.price).toFixed(2)}/${med.priceBasis || "unit"}`
                          : "Price Unavailable"}
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
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowOriginalImageModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-4 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-[#111827]">Original Uploaded Prescription Document</span>
              <button
                type="button"
                onClick={() => setShowOriginalImageModal(false)}
                className="p-1.5 rounded-full bg-[#F8FAFC] hover:bg-slate-100 text-[#111827]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] p-2 flex items-center justify-center">
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
