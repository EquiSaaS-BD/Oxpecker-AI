"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Download,
  CheckCircle2,
  Filter,
  Eye,
  FlaskConical,
  Printer,
  X,
  Building,
  Sparkles,
  Upload,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";
import {
  getDiagnosticReports,
  runHospitalAiReportScan,
  saveDiagnosticReport,
  verifyAndSignDiagnosticReport,
  type DiagnosticReportItem,
} from "@/lib/hospital-diagnostics";
import { HospitalPrintStudio } from "@/components/hospital/HospitalPrintStudio";
import { getHospitalThemeConfig } from "@/lib/hospital-hms";

interface DraftParamRow {
  name: string;
  value: string;
  unit: string;
  refRange: string;
}

const AI_PRESETS: Record<
  string,
  { title: string; dept: string; specimen: string; rawText: string; params: DraftParamRow[] }
> = {
  diabetic: {
    title: "Diabetic & Renal Follow-Up Panel (HbA1c + Creatinine)",
    dept: "Biochemistry",
    specimen: "Venous Blood (EDTA & Serum)",
    rawText: "HbA1c: 8.2 % (Ref: 4.0-5.6)\nFasting Glucose: 8.9 mmol/L (Ref: 3.9-5.6)\nSerum Creatinine: 1.4 mg/dL (Ref: 0.7-1.3)",
    params: [
      { name: "HbA1c", value: "8.2", unit: "%", refRange: "4.0 - 5.6" },
      { name: "Fasting Glucose", value: "8.9", unit: "mmol/L", refRange: "3.9 - 5.6" },
      { name: "Creatinine", value: "1.4", unit: "mg/dL", refRange: "0.7 - 1.3" },
    ],
  },
  critical_trop: {
    title: "High-Sensitivity Cardiac Troponin I (STAT)",
    dept: "Cardiology",
    specimen: "Venous Serum",
    rawText: "hs-Troponin I: 185 ng/L (Ref: < 14)\nCK-MB: 48 U/L (Ref: < 25)",
    params: [
      { name: "Cardiac Troponin I", value: "185", unit: "ng/L", refRange: "< 14" },
      { name: "CK-MB", value: "48", unit: "U/L", refRange: "0 - 25" },
    ],
  },
  cbc: {
    title: "Complete Blood Count (CBC with ESR)",
    dept: "Hematology",
    specimen: "Whole Blood (EDTA)",
    rawText: "Hemoglobin: 9.8 g/dL (Ref: 12.0-16.0)\nWBC: 14.2 x10^9/L (Ref: 4.0-11.0)\nPlatelets: 280 x10^9/L (Ref: 150-450)",
    params: [
      { name: "Hemoglobin", value: "9.8", unit: "g/dL", refRange: "12.0 - 16.0" },
      { name: "WBC", value: "14.2", unit: "x10^9/L", refRange: "4.0 - 11.0" },
      { name: "Platelets", value: "280", unit: "x10^9/L", refRange: "150 - 450" },
    ],
  },
  hrct: {
    title: "High-Resolution Chest CT (HRCT)",
    dept: "Radiology",
    specimen: "Axial Helical CT Scan",
    rawText: "Patchy ground-glass consolidation noted in right lower lobe. Mild pleural effusion seen on right base. Correlate clinically for pneumonia.",
    params: [],
  },
};

export default function HospitalReportsPage() {
  const [reports, setReports] = useState<DiagnosticReportItem[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activePreview, setActivePreview] = useState<DiagnosticReportItem | null>(null);
  const [printReport, setPrintReport] = useState<DiagnosticReportItem | null>(null);

  // Upload & AI Scan Studio Modal State
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanPatientName, setScanPatientName] = useState("");
  const [scanAge, setScanAge] = useState("45");
  const [scanGender, setScanGender] = useState("Male");
  const [scanSmartCard, setScanSmartCard] = useState("");
  const [scanAccessionId, setScanAccessionId] = useState("");
  const [scanTitle, setScanTitle] = useState("Complete Blood & Metabolic Panel");
  const [scanDept, setScanDept] = useState("Biochemistry");
  const [scanSpecimen, setScanSpecimen] = useState("Venous Blood (Serum & EDTA)");
  const [scanDoctor, setScanDoctor] = useState("Prof. Dr. Ahmed Rahman");
  const [scanRawText, setScanRawText] = useState("");
  const [scanFileName, setScanFileName] = useState("");
  const [draftParams, setDraftParams] = useState<DraftParamRow[]>([
    { name: "Hemoglobin", value: "", unit: "g/dL", refRange: "12.0 - 16.0" },
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [publishHealthPass, setPublishHealthPass] = useState(true);

  useEffect(() => {
    setReports(getDiagnosticReports());
    fetch("/api/hospital/diagnostics/reports")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (Array.isArray(res?.reports) && res.reports.length > 0) {
          setReports(res.reports);
        }
      })
      .catch(() => {});

    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const acc = sp.get("accessionId");
      const pat = sp.get("patient");
      if (acc || pat) {
        if (acc) setScanAccessionId(acc);
        if (pat) setScanPatientName(pat);
        setShowScanModal(true);
      }
    }
  }, []);

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setScanFileName(file.name);
    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
      const txt = await file.text();
      setScanRawText(txt);
      toast.success(`Loaded text from ${file.name}. Ready for AI Scan.`);
      return;
    }

    // Attempt OCR extraction via existing /api/reports/analyze pipeline for images/PDFs
    toast.info(`Uploading ${file.name} for AI OCR & parameter extraction...`);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("mode", scanDept === "Radiology" ? "radiology" : "lab");
      form.append("patientAge", scanAge || "40");
      form.append("patientGender", scanGender.toLowerCase());
      const res = await fetch("/api/reports/analyze", { method: "POST", body: form });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.report) {
        if (Array.isArray(data.report.parameters) && data.report.parameters.length > 0) {
          setDraftParams(
            data.report.parameters.map((p: any) => ({
              name: p.name || p.code,
              value: String(p.value),
              unit: p.unit || "",
              refRange: p.referenceRangeText || "",
            }))
          );
        }
        if (data.report.onePageSummaryBn) {
          setScanRawText((prev) => prev || data.report.onePageSummaryBn);
        }
        toast.success(`AI extracted ${data.report.parameters?.length || 0} parameters from ${file.name}!`);
      } else {
        toast.warning("Image attached. Enter/verify numeric values below and run AI Clinical Scan.");
      }
    } catch {
      toast.warning("File attached. Verify values below and run AI Clinical Scan.");
    }
  };

  const applyPreset = (key: keyof typeof AI_PRESETS) => {
    const preset = AI_PRESETS[key];
    setScanTitle(preset.title);
    setScanDept(preset.dept);
    setScanSpecimen(preset.specimen);
    setScanRawText(preset.rawText);
    setDraftParams(preset.params.length > 0 ? preset.params : []);
    toast.info(`Loaded clinical preset: ${preset.title}`);
  };

  const handleRunAiScanAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanPatientName.trim() || !scanTitle.trim()) {
      toast.error("Patient Name and Test Title are required.");
      return;
    }
    setIsScanning(true);
    try {
      const cleanParams = draftParams
        .filter((p) => p.name.trim() && p.value.trim())
        .map((p) => ({
          name: p.name.trim(),
          value: p.value.trim(),
          unit: p.unit.trim(),
          refRange: p.refRange.trim(),
        }));

      const payload = {
        mode: scanDept === "Radiology" ? ("radiology" as const) : ("lab" as const),
        rawText: scanRawText.trim(),
        parameters: cleanParams,
        patientName: scanPatientName.trim(),
        patientAge: Number(scanAge || 40),
        patientGender: scanGender,
        smartCardUid: scanSmartCard.trim() || undefined,
        accessionId: scanAccessionId.trim() || undefined,
        testTitle: scanTitle.trim(),
        department: scanDept,
        specimen: scanSpecimen.trim(),
        referringDoctor: scanDoctor.trim(),
      };

      let createdReport: DiagnosticReportItem | null = null;
      let isCritical = false;

      const res = await fetch("/api/hospital/diagnostics/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (res?.ok) {
        const json = await res.json();
        createdReport = json.report;
        isCritical = Boolean(json.isCritical);
      }
      if (!createdReport) {
        const localRes = runHospitalAiReportScan(payload);
        saveDiagnosticReport(localRes.report);
        createdReport = localRes.report;
        isCritical = localRes.isCritical;
      }

      setReports((prev) => [createdReport!, ...prev.filter((r) => r.id !== createdReport!.id)]);
      setShowScanModal(false);
      setActivePreview(createdReport);

      if (isCritical) {
        toast.error(`CRITICAL ALERT detected in ${createdReport.reportCode}! Immediate physician review required.`);
      } else {
        toast.success(`AI Scan complete (${createdReport.reportCode}). Ready for Pathologist Sign-Off & Branded Print.`);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleVerifyAndSign = async (rpt: DiagnosticReportItem) => {
    const theme = getHospitalThemeConfig();
    const signatory = {
      name: theme.signatory_name || "Prof. Dr. Selina Akter, MD",
      degrees: theme.signatory_designation || "Chief Consultant Pathologist",
      bmdc: theme.signatory_bmdc || "BMDC-A-21904",
    };

    const updated = verifyAndSignDiagnosticReport(rpt.id, signatory, publishHealthPass);
    if (updated) {
      setReports((prev) => prev.map((r) => (r.id === rpt.id ? updated : r)));
      if (activePreview?.id === rpt.id) setActivePreview(updated);
    }

    fetch("/api/hospital/diagnostics/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: rpt.id,
        signedBy: signatory.name,
        signedByDegrees: signatory.degrees,
        signedByBmdc: signatory.bmdc,
        publishToHealthPass: publishHealthPass,
      }),
    }).catch(() => {});

    toast.success(
      `Report ${rpt.reportCode} digitally verified${publishHealthPass ? " & published to Patient HealthPass" : ""}!`
    );
  };

  const filtered = reports.filter((rpt) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      rpt.id.toLowerCase().includes(q) ||
      rpt.patient.toLowerCase().includes(q) ||
      rpt.test.toLowerCase().includes(q) ||
      rpt.doctor.toLowerCase().includes(q) ||
      (rpt.accessionId || "").toLowerCase().includes(q);
    const matchesDept = deptFilter === "All" || rpt.dept === deptFilter;
    const matchesStatus = statusFilter === "All" || rpt.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalCount = reports.length;
  const verifiedCount = reports.filter((r) => r.status === "Verified").length;
  const alertCount = reports.filter((r) => r.status === "Critical Alert").length;
  const pendingCount = reports.filter((r) => r.status === "Processing" || r.status === "Pending Verification").length;

  const deptOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Laboratories", count: totalCount },
    { value: "Cardiology", label: "Cardiology Center", count: reports.filter((r) => r.dept === "Cardiology").length },
    { value: "Biochemistry", label: "Clinical Biochemistry", count: reports.filter((r) => r.dept === "Biochemistry").length },
    { value: "Hematology", label: "Hematology", count: reports.filter((r) => r.dept === "Hematology").length },
    { value: "Pathology", label: "Clinical Pathology", count: reports.filter((r) => r.dept === "Pathology").length },
    { value: "Radiology", label: "Diagnostic Radiology", count: reports.filter((r) => r.dept === "Radiology").length },
  ];

  const statusOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Statuses", count: totalCount },
    { value: "Verified", label: "Verified & Signed", dotColor: "bg-emerald-500", count: verifiedCount },
    { value: "Critical Alert", label: "Critical Path Alerts", dotColor: "bg-rose-500", count: alertCount },
    { value: "Pending Verification", label: "AI Ready / Pending", dotColor: "bg-amber-500", count: pendingCount },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              AI Diagnostic Reports & Branded Print Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              AI + Pathologist LIS
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Upload & AI-scan lab printouts, enter structured LIS parameters, sign off digitally, and direct-print with your hospital theme.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowScanModal(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Sparkles size={17} /> Upload & AI Scan Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Reports</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Archived & AI-indexed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Verified & Signed</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{verifiedCount}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Synced to HealthPass QR</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20">
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">Critical Alerts</span>
          <div className="text-2xl font-black text-rose-700 mt-1">{alertCount}</div>
          <span className="text-[11px] text-rose-600 font-medium">Immediate clinical escalation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">Pending Sign-Off</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{pendingCount}</div>
          <span className="text-[11px] text-blue-600 font-medium">Awaiting consultant release</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by test name, patient, report ID, accession ID, or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <CustomSelect
            options={deptOptions}
            value={deptFilter}
            onChange={setDeptFilter}
            prefix="Dept:"
            icon={Building}
            menuWidth="w-56"
          />

          <CustomSelect
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            prefix="Status:"
            icon={Filter}
            menuWidth="w-52"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Report & Accession</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Investigation</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions & Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No diagnostic reports match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((rpt) => (
                  <tr key={rpt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">{rpt.reportCode}</div>
                      {rpt.accessionId && (
                        <div className="text-[10px] font-mono text-slate-400">{rpt.accessionId}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rpt.patient}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {rpt.age} yrs • {rpt.gender} {rpt.smartCardUid ? `• ${rpt.smartCardUid}` : ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 text-xs font-semibold flex items-center gap-1.5">
                        {rpt.test}
                        {rpt.aiAnalyzed && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-black">
                            AI
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[220px]">{rpt.specimen}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {rpt.dept}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{rpt.date}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                          rpt.status === "Verified"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : rpt.status === "Critical Alert"
                            ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rpt.status === "Verified"
                              ? "bg-emerald-600"
                              : rpt.status === "Critical Alert"
                              ? "bg-rose-600"
                              : "bg-amber-600"
                          }`}
                        />
                        {rpt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActivePreview(rpt)}
                          className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={13} /> Inspect
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrintReport(rpt)}
                          className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Printer size={13} /> Branded Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Inspection & Sign-Off Modal */}
      <AnimatePresence>
        {activePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">{activePreview.test}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {activePreview.reportCode} • {activePreview.dept} {activePreview.accessionId ? `• ${activePreview.accessionId}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePreview(null)}
                  className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-bold block">Patient</span>
                    <span className="text-slate-900 font-extrabold text-sm">{activePreview.patient}</span>
                    <span className="text-slate-500 block">{activePreview.age} yrs • {activePreview.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Referring Doctor</span>
                    <span className="text-slate-900 font-bold">{activePreview.doctor}</span>
                    <span className="text-slate-500 block">Date: {activePreview.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">HealthPass Sync</span>
                    <span className={`font-black ${activePreview.publishedToHealthPass ? "text-emerald-700" : "text-amber-700"}`}>
                      {activePreview.publishedToHealthPass ? "Published to Patient Card" : "Hospital Draft Only"}
                    </span>
                  </div>
                </div>

                {activePreview.parameters.length > 0 && (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="py-2.5 px-3">Parameter</th>
                          <th className="py-2.5 px-3">Value</th>
                          <th className="py-2.5 px-3">Unit</th>
                          <th className="py-2.5 px-3">Reference Range</th>
                          <th className="py-2.5 px-3 text-right">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activePreview.parameters.map((p, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                            <td className="py-2.5 px-3 font-mono font-black text-slate-900">{p.value}</td>
                            <td className="py-2.5 px-3 text-slate-500">{p.unit}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{p.refRange}</td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  p.flag === "Critical"
                                    ? "bg-rose-100 text-rose-800"
                                    : p.flag === "High"
                                    ? "bg-amber-100 text-amber-800"
                                    : p.flag === "Low"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {p.flag}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl border leading-relaxed ${
                    activePreview.status === "Critical Alert"
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : "bg-emerald-50/40 border-emerald-100 text-slate-800"
                  }`}
                >
                  <div className="font-black uppercase text-[10px] mb-1 flex items-center gap-1.5">
                    {activePreview.status === "Critical Alert" && <AlertTriangle size={13} className="text-rose-600" />}
                    Clinical Findings
                  </div>
                  <p>{activePreview.keyFindings}</p>
                </div>

                {activePreview.bengaliSummary && (
                  <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1">
                    <div className="font-black text-sky-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-sky-600" /> AI Bengali Summary (Patient Friendly)
                    </div>
                    <p className="whitespace-pre-line text-slate-700 leading-relaxed">{activePreview.bengaliSummary}</p>
                  </div>
                )}

                {activePreview.status !== "Verified" && (
                  <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishHealthPass}
                      onChange={(e) => setPublishHealthPass(e.target.checked)}
                    />
                    <span className="font-bold text-slate-700">
                      Publish signed report directly to Patient HealthPass Timeline & QR
                    </span>
                  </label>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={15} />
                  {activePreview.signedBy
                    ? `Signed by ${activePreview.signedBy} (${activePreview.signedByBmdc || "BMDC"})`
                    : "Awaiting Pathologist Digital Verification"}
                </div>
                <div className="flex items-center gap-2">
                  {activePreview.status !== "Verified" && (
                    <button
                      type="button"
                      onClick={() => handleVerifyAndSign(activePreview)}
                      className="h-9 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck size={14} /> Verify & Digitally Sign
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPrintReport(activePreview)}
                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} /> Print / Save Branded PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload & AI Scan Report Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <FlaskConical size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Upload, Scan & AI-Analyze Diagnostic Report</h3>
                  <p className="text-xs text-slate-500">
                    Upload photo/PDF or enter LIS values — deterministic reference ranges & Bengali summary auto-generated.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScanModal(false)}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRunAiScanAndSave} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Quick Clinical Presets */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-black text-slate-500 uppercase text-[10px]">Quick Sample Presets:</span>
                <button type="button" onClick={() => applyPreset("diabetic")} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold hover:border-emerald-400 cursor-pointer">
                  HbA1c + Renal
                </button>
                <button type="button" onClick={() => applyPreset("critical_trop")} className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold hover:bg-rose-100 cursor-pointer">
                  Critical Troponin-I
                </button>
                <button type="button" onClick={() => applyPreset("cbc")} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold hover:border-emerald-400 cursor-pointer">
                  CBC + WBC
                </button>
                <button type="button" onClick={() => applyPreset("hrct")} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold hover:border-emerald-400 cursor-pointer">
                  Chest HRCT Radiology
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Patient Name *</label>
                  <input
                    required
                    value={scanPatientName}
                    onChange={(e) => setScanPatientName(e.target.value)}
                    placeholder="e.g. Rahim Uddin"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Age / Gender</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={scanAge}
                      onChange={(e) => setScanAge(e.target.value)}
                      className="w-20 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                    <select
                      value={scanGender}
                      onChange={(e) => setScanGender(e.target.value)}
                      className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Accession / HealthPass ID</label>
                  <input
                    value={scanAccessionId || scanSmartCard}
                    onChange={(e) => {
                      if (e.target.value.startsWith("HP-")) setScanSmartCard(e.target.value);
                      else setScanAccessionId(e.target.value);
                    }}
                    placeholder="ACC-2026-... or HP-2026-..."
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-600 block mb-1">Test / Investigation Title *</label>
                  <input
                    required
                    value={scanTitle}
                    onChange={(e) => setScanTitle(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Department</label>
                  <select
                    value={scanDept}
                    onChange={(e) => setScanDept(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option>Biochemistry</option>
                    <option>Hematology</option>
                    <option>Pathology</option>
                    <option>Cardiology</option>
                    <option>Radiology</option>
                    <option>Immunology</option>
                  </select>
                </div>
              </div>

              {/* File Upload Box */}
              <label className="flex flex-col items-center justify-center gap-1.5 p-4 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors cursor-pointer">
                <Upload size={20} className="text-emerald-600" />
                <span className="font-bold text-slate-800">
                  {scanFileName ? `Attached: ${scanFileName}` : "Upload Lab Machine Printout, Photo or PDF for AI OCR"}
                </span>
                <span className="text-[11px] text-slate-500">Supports JPG, PNG, PDF, TXT — or edit parameters manually below</span>
                <input
                  type="file"
                  accept="image/*,.pdf,.txt,.csv"
                  className="sr-only"
                  onChange={(e) => handleFileSelected(e.target.files?.[0])}
                />
              </label>

              {/* Raw Report Text / Radiology Impression */}
              <div>
                <label className="font-bold text-slate-600 block mb-1">Raw Lab Text / Radiology Impression (Optional)</label>
                <textarea
                  rows={2}
                  value={scanRawText}
                  onChange={(e) => setScanRawText(e.target.value)}
                  placeholder="Paste analyzer text or radiology impression for automatic AI extraction..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              {/* Structured Parameters Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-700">Structured Numeric Analytes</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftParams((prev) => [...prev, { name: "", value: "", unit: "", refRange: "" }])
                    }
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Analyte Row
                  </button>
                </div>
                {draftParams.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      value={row.name}
                      onChange={(e) => {
                        const copy = [...draftParams];
                        copy[idx].name = e.target.value;
                        setDraftParams(copy);
                      }}
                      placeholder="Parameter (e.g. HbA1c)"
                      className="col-span-4 h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                    />
                    <input
                      value={row.value}
                      onChange={(e) => {
                        const copy = [...draftParams];
                        copy[idx].value = e.target.value;
                        setDraftParams(copy);
                      }}
                      placeholder="Value"
                      className="col-span-2 h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                    <input
                      value={row.unit}
                      onChange={(e) => {
                        const copy = [...draftParams];
                        copy[idx].unit = e.target.value;
                        setDraftParams(copy);
                      }}
                      placeholder="Unit"
                      className="col-span-2 h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                    <input
                      value={row.refRange}
                      onChange={(e) => {
                        const copy = [...draftParams];
                        copy[idx].refRange = e.target.value;
                        setDraftParams(copy);
                      }}
                      placeholder="Ref Range"
                      className="col-span-3 h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setDraftParams((prev) => prev.filter((_, i) => i !== idx))}
                      className="col-span-1 h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScanModal(false)}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={15} />
                  {isScanning ? "Running AI Clinical Check..." : "Run AI Analysis & Save Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branded Print Studio */}
      <HospitalPrintStudio
        isOpen={Boolean(printReport)}
        onClose={() => setPrintReport(null)}
        documentType="lab_report"
        data={printReport}
      />
    </div>
  );
}
