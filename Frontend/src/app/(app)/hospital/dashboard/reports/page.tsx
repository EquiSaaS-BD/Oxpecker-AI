"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Download,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  AlertTriangle,
  FlaskConical,
  Activity,
  Printer,
  X,
  Building,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";

interface DiagnosticReport {
  id: string;
  patient: string;
  age: number;
  gender: string;
  test: string;
  dept: string;
  doctor: string;
  date: string;
  status: "Verified" | "Processing" | "Critical Alert" | "Draft";
  specimen: string;
  keyFindings: string;
}

const initialReports: DiagnosticReport[] = [
  {
    id: "RPT-4401",
    patient: "Kamrul Hasan",
    age: 46,
    gender: "Male",
    test: "Echocardiogram (2D Color Doppler)",
    dept: "Cardiology",
    doctor: "Prof. Dr. Anisur Rahman",
    date: "20 Oct 2026",
    status: "Verified",
    specimen: "Non-Invasive Ultrasound",
    keyFindings: "Ejection Fraction 58%. Mild concentric LVH. Normal diastolic flow pattern.",
  },
  {
    id: "RPT-4402",
    patient: "Al Amin Sheikh",
    age: 52,
    gender: "Male",
    test: "Cardiac Troponin I (High Sensitive)",
    dept: "Pathology",
    doctor: "Dr. Anisur Rahman",
    date: "20 Oct 2026",
    status: "Critical Alert",
    specimen: "Venous Blood (Serum)",
    keyFindings: "hs-cTnI level: 142 ng/L (Normal < 14 ng/L). Urgent acute coronary protocol initiated.",
  },
  {
    id: "RPT-4403",
    patient: "Nasreen Akter",
    age: 32,
    gender: "Female",
    test: "Anomaly Scan (4D Ultrasound)",
    dept: "Radiology",
    doctor: "Dr. Farzana Yasmin",
    date: "19 Oct 2026",
    status: "Verified",
    specimen: "Transabdominal Imaging",
    keyFindings: "Single active fetus, cephalic presentation. Estimated fetal weight 1.85 kg. Amniotic fluid index normal.",
  },
  {
    id: "RPT-4404",
    patient: "Shahidul Islam",
    age: 65,
    gender: "Male",
    test: "Brain MRI with Contrast (1.5T)",
    dept: "Neuro-Radiology",
    doctor: "Dr. Mahmudul Hasan",
    date: "20 Oct 2026",
    status: "Processing",
    specimen: "Gadolinium Enhanced Imaging",
    keyFindings: "Scan completed. Radiologist volumetric slice re-construction in queue.",
  },
  {
    id: "RPT-4405",
    patient: "Sultana Begum",
    age: 29,
    gender: "Female",
    test: "Complete Blood Count (CBC & ESR)",
    dept: "Pathology",
    doctor: "Dr. Nusrat Jahan",
    date: "20 Oct 2026",
    status: "Verified",
    specimen: "Whole Blood (EDTA)",
    keyFindings: "Hb: 11.2 g/dL, WBC: 7,400/uL, Platelets: 245,000/uL. ESR: 18 mm/1st hr.",
  },
  {
    id: "RPT-4406",
    patient: "Farhana Parvin",
    age: 41,
    gender: "Female",
    test: "High-Resolution Chest CT (HRCT)",
    dept: "Radiology",
    doctor: "Dr. Tanvir Ahmed",
    date: "18 Oct 2026",
    status: "Verified",
    specimen: "Axial Helical Scan",
    keyFindings: "Clear lung parenchymal architecture. No pleural effusion or ground-glass opacities.",
  },
];

export default function HospitalReportsPage() {
  const [reports, setReports] = useState<DiagnosticReport[]>(initialReports);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activePreview, setActivePreview] = useState<DiagnosticReport | null>(null);

  const filtered = reports.filter((rpt) => {
    const matchesSearch =
      rpt.id.toLowerCase().includes(search.toLowerCase()) ||
      rpt.patient.toLowerCase().includes(search.toLowerCase()) ||
      rpt.test.toLowerCase().includes(search.toLowerCase()) ||
      rpt.doctor.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === "All" || rpt.dept === deptFilter;
    const matchesStatus = statusFilter === "All" || rpt.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalCount = reports.length;
  const verifiedCount = reports.filter((r) => r.status === "Verified").length;
  const alertCount = reports.filter((r) => r.status === "Critical Alert").length;
  const processingCount = reports.filter((r) => r.status === "Processing").length;

  const deptOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Laboratories", count: totalCount },
    { value: "Cardiology", label: "Cardiology Center", count: reports.filter((r) => r.dept === "Cardiology").length },
    { value: "Pathology", label: "Clinical Pathology", count: reports.filter((r) => r.dept === "Pathology").length },
    { value: "Radiology", label: "Diagnostic Radiology", count: reports.filter((r) => r.dept === "Radiology").length },
    { value: "Neuro-Radiology", label: "Neuro-Radiology", count: reports.filter((r) => r.dept === "Neuro-Radiology").length },
  ];

  const statusOptions: CustomSelectOption<string>[] = [
    { value: "All", label: "All Statuses", count: totalCount },
    { value: "Verified", label: "Verified & Signed", dotColor: "bg-emerald-500", count: verifiedCount },
    { value: "Critical Alert", label: "Critical Path Alerts", dotColor: "bg-rose-500", count: alertCount },
    { value: "Processing", label: "Under Analysis", dotColor: "bg-blue-500", count: processingCount },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Diagnostic Reports & Laboratory Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Verified LIS/PACS
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pathology specimen analysis, radiological cross-sections, and clinical diagnostic verifications.
          </p>
        </div>

        <button
          onClick={() => toast.info("Opening secure laboratory upload portal...")}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <FlaskConical size={18} /> Upload New Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Scans & Tests</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Archived across hospital</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Verified & Released</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{verifiedCount}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Physician signed off</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20">
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">Critical Alerts</span>
          <div className="text-2xl font-black text-rose-700 mt-1">{alertCount}</div>
          <span className="text-[11px] text-rose-600 font-medium">Requires immediate triage</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">Under Analysis</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{processingCount}</div>
          <span className="text-[11px] text-blue-600 font-medium">In lab / sequencer</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by test name, patient, report ID, or doctor..."
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
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Test Title</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Referred By</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    No diagnostic reports match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((rpt) => (
                  <tr key={rpt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-xs">{rpt.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rpt.patient}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{rpt.age} yrs • {rpt.gender}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 text-xs font-semibold">{rpt.test}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{rpt.specimen}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {rpt.dept}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{rpt.doctor}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{rpt.date}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                          rpt.status === "Verified"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : rpt.status === "Critical Alert"
                            ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rpt.status === "Verified"
                              ? "bg-emerald-600"
                              : rpt.status === "Critical Alert"
                              ? "bg-rose-600"
                              : "bg-blue-600"
                          }`}
                        />
                        {rpt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActivePreview(rpt)}
                          className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => toast.success(`Exporting signed PDF for ${rpt.id}`)}
                          className="h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download size={13} /> PDF
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

      {/* Report Preview Modal */}
      <AnimatePresence>
        {activePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{activePreview.test}</h3>
                    <p className="text-xs text-slate-500 font-mono">Report Ref: {activePreview.id} • {activePreview.dept}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePreview(null)}
                  className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Patient Name:</span>
                    <span className="text-slate-900 font-extrabold text-sm">{activePreview.patient}</span>
                    <span className="text-slate-500 block mt-0.5">{activePreview.age} yrs • {activePreview.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Referred By:</span>
                    <span className="text-slate-900 font-extrabold text-sm">{activePreview.doctor}</span>
                    <span className="text-slate-500 block mt-0.5">Date: {activePreview.date}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Specimen & Modality</h4>
                  <p className="text-sm font-semibold text-slate-800 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    {activePreview.specimen}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Clinical Findings & Impression</h4>
                  <div className={`p-4 rounded-2xl text-sm font-medium border leading-relaxed ${
                    activePreview.status === "Critical Alert"
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : "bg-emerald-50/50 border-emerald-100 text-slate-800"
                  }`}>
                    {activePreview.keyFindings}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 size={15} /> Authenticated by Oxpecker Verified LIS
                  </div>
                  <span className="font-mono text-slate-400">QR: SHA256-VERIFIED</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    toast.info("Sending command to department thermal/laser printer...");
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => {
                    toast.success(`PDF successfully exported for ${activePreview.id}`);
                    setActivePreview(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
