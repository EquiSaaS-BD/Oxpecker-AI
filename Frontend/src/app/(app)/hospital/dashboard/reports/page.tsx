"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Plus,
  X,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  FlaskConical,
  Activity,
} from "lucide-react";

interface TestReport {
  id: string;
  uhid: string;
  patientName: string;
  testName: string;
  category: "Pathology" | "Radiology" | "Cardiology" | "Microbiology";
  date: string;
  orderedBy: string;
  status: "Ready" | "In Lab" | "Pending Approval";
}

const initialReports: TestReport[] = [
  {
    id: "REP-901",
    uhid: "UHID-8801",
    patientName: "Mohammad Rafiq",
    testName: "12-Lead ECG & Troponin-I",
    category: "Cardiology",
    date: "2026-10-12",
    orderedBy: "Dr. Ayesha Rahman",
    status: "Ready",
  },
  {
    id: "REP-902",
    uhid: "UHID-8802",
    patientName: "Nasima Begum",
    testName: "Digital X-Ray Right Femur (AP & Lateral)",
    category: "Radiology",
    date: "2026-10-11",
    orderedBy: "Dr. Tariqul Islam",
    status: "Ready",
  },
  {
    id: "REP-903",
    uhid: "UHID-8803",
    patientName: "Samiul Hasan",
    testName: "Complete Blood Count (CBC) with ESR",
    category: "Pathology",
    date: "2026-10-12",
    orderedBy: "Dr. Nusrat Jahan",
    status: "In Lab",
  },
  {
    id: "REP-904",
    uhid: "UHID-8798",
    patientName: "Hasibul Hasan",
    testName: "Lipid Profile & Serum Creatinine",
    category: "Pathology",
    date: "2026-10-11",
    orderedBy: "Dr. Ayesha Rahman",
    status: "Ready",
  },
  {
    id: "REP-905",
    uhid: "UHID-8804",
    patientName: "Rokeya Khatun",
    testName: "High Resolution CT Abdomen (Contrast)",
    category: "Radiology",
    date: "2026-10-10",
    orderedBy: "Dr. Mahmud Hasan",
    status: "Ready",
  },
  {
    id: "REP-906",
    uhid: "UHID-8806",
    patientName: "Abul Kalam",
    testName: "Blood Culture & Sensitivity",
    category: "Microbiology",
    date: "2026-10-12",
    orderedBy: "Dr. Farhan Chowdhury",
    status: "Pending Approval",
  },
];

export default function HospitalReportsPage() {
  const [reports, setReports] = useState<TestReport[]>(initialReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    patientName: "",
    uhid: "UHID-8807",
    testName: "",
    category: "Pathology" as TestReport["category"],
    orderedBy: "Dr. Ayesha Rahman",
    status: "Ready" as TestReport["status"],
  });

  const categories = ["All", "Pathology", "Radiology", "Cardiology", "Microbiology"];

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "All" || rep.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const stats = [
    { label: "Total Reports", value: reports.length, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Ready for Delivery", value: reports.filter((r) => r.status === "Ready").length, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "In Lab Testing", value: reports.filter((r) => r.status === "In Lab").length, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Pending Approval", value: reports.filter((r) => r.status === "Pending Approval").length, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.patientName || !newReport.testName) return;

    const rep: TestReport = {
      id: `REP-${Math.floor(907 + Math.random() * 100)}`,
      uhid: newReport.uhid,
      patientName: newReport.patientName,
      testName: newReport.testName,
      category: newReport.category,
      date: new Date().toISOString().split("T")[0],
      orderedBy: newReport.orderedBy,
      status: newReport.status,
    };

    setReports([rep, ...reports]);
    setIsModalOpen(false);
    setNewReport({
      patientName: "",
      uhid: "UHID-8807",
      testName: "",
      category: "Pathology",
      orderedBy: "Dr. Ayesha Rahman",
      status: "Ready",
    });
  };

  const getStatusBadge = (status: TestReport["status"]) => {
    switch (status) {
      case "Ready":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Lab":
        return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
      case "Pending Approval":
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Diagnostic Test Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Manage pathology, radiology, imaging, and diagnostic investigations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={16} /> Upload Report
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${st.bg} flex items-center justify-center shrink-0`}>
              <FlaskConical size={22} className={st.color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{st.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{st.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by test name, UHID, or patient name..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Report ID / Date</th>
                <th className="py-3.5 px-5">Patient UHID</th>
                <th className="py-3.5 px-5">Test Investigation</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div>
                      <p className="font-bold text-slate-800">{rep.id}</p>
                      <p className="text-xs text-slate-400">{rep.date}</p>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div>
                      <p className="font-bold text-slate-800">{rep.patientName}</p>
                      <p className="text-xs text-slate-400 font-mono">{rep.uhid}</p>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <p className="font-semibold text-slate-800">{rep.testName}</p>
                    <p className="text-xs text-slate-400">Ref: {rep.orderedBy}</p>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                      {rep.category}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(rep.status)}`}>
                      {rep.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right space-x-1.5">
                    <button
                      onClick={() => alert(`Opening ${rep.testName} for ${rep.patientName}`)}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye size={12} /> View
                    </button>
                    {rep.status === "Ready" && (
                      <button
                        onClick={() => alert(`Downloading PDF for ${rep.id}`)}
                        className="text-xs px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Download size={12} /> PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">No test reports found</h3>
            <p className="text-xs text-slate-400 mt-1">Try another search keyword.</p>
          </div>
        )}
      </div>

      {/* Upload Report Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Upload Diagnostic Report</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddReport} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newReport.patientName}
                    onChange={(e) => setNewReport({ ...newReport, patientName: e.target.value })}
                    placeholder="e.g. Farzana Yeasmin"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Patient UHID</label>
                  <input
                    type="text"
                    value={newReport.uhid}
                    onChange={(e) => setNewReport({ ...newReport, uhid: e.target.value })}
                    placeholder="e.g. UHID-8807"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Investigation / Test Name *</label>
                  <input
                    type="text"
                    required
                    value={newReport.testName}
                    onChange={(e) => setNewReport({ ...newReport, testName: e.target.value })}
                    placeholder="e.g. MRI Lumbar Spine or Blood Glucose"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                    <select
                      value={newReport.category}
                      onChange={(e) => setNewReport({ ...newReport, category: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Pathology">Pathology</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Microbiology">Microbiology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
                    <select
                      value={newReport.status}
                      onChange={(e) => setNewReport({ ...newReport, status: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Ready">Ready</option>
                      <option value="In Lab">In Lab</option>
                      <option value="Pending Approval">Pending Approval</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    Save & Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
