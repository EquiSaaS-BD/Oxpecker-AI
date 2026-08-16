"use client";

import { useState } from "react";
import { FileText, Download, Eye, File, Calendar, User, Search, Filter, Stethoscope, FlaskConical, Receipt, X, Activity, Pill } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mockReports = [
  { id: 1, title: "Complete Blood Count (CBC)", date: "10 Jul 2026", doctor: "Dr. Sarah Rahman", type: "Lab Result", size: "2.4 MB" },
  { id: 2, title: "Chest X-Ray Report", date: "05 Jul 2026", doctor: "Dr. Ahmed Khan", type: "Lab Result", size: "5.1 MB" },
  { id: 3, title: "Prescription - Viral Fever", date: "28 Jun 2026", doctor: "Dr. Farah Islam", type: "Prescription", size: "1.2 MB" },
  { id: 4, title: "Hospital Discharge Bill", date: "15 Jun 2026", doctor: "Square Hospital", type: "Bill", size: "800 KB" },
  { id: 5, title: "Lipid Profile Test", date: "02 May 2026", doctor: "Labaid Diagnostic", type: "Lab Result", size: "1.8 MB" },
  { id: 6, title: "Dermatology Prescription", date: "20 Apr 2026", doctor: "Dr. Tarek Hasan", type: "Prescription", size: "1.1 MB" },
];

const categories = ["All", "Lab Result", "Prescription", "Bill"];

export function ReportsView({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(null);

  const filteredReports = mockReports.filter(report => 
    (activeTab === "All" || report.type === activeTab) &&
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch(type) {
      case "Lab Result": return <FlaskConical className="text-purple-500" />;
      case "Prescription": return <Stethoscope className="text-blue-500" />;
      case "Bill": return <Receipt className="text-orange-500" />;
      default: return <FileText className="text-[#00C2A8]" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch(type) {
      case "Lab Result": return "bg-purple-50 text-purple-600 border-purple-100";
      case "Prescription": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Bill": return "bg-orange-50 text-orange-600 border-orange-100";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className={`w-full h-full font-sans relative ${isEmbedded ? '' : 'bg-[#F8FAFC]'}`}>
      
      {/* Header Section */}
      <div className={`bg-white border-b border-slate-200 py-6 md:py-8 sticky top-0 z-20 shadow-sm px-4 md:px-6 lg:px-12 overflow-hidden relative ${isEmbedded ? '' : 'rounded-t-3xl md:rounded-none'}`}>
        
        {/* Decorative Background Icons */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0 overflow-hidden">
          <Activity size={200} className="absolute -left-10 -top-10 text-[#00C2A8] rotate-12" />
          <FlaskConical size={160} className="absolute right-4 -bottom-10 text-blue-500 -rotate-12" />
          <Stethoscope size={180} className="absolute left-1/3 -top-16 text-purple-500 rotate-[30deg]" />
          <Pill size={120} className="absolute right-1/3 top-4 text-rose-500 rotate-45 hidden md:block" />
        </div>

        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 relative z-10">
          <div className="text-center md:text-left">
            <h1 className="text-[26px] md:text-[34px] font-[900] bg-gradient-to-r from-[#00C2A8] via-[#00a89d] to-blue-600 bg-clip-text text-transparent leading-tight tracking-tight font-serif drop-shadow-sm">
              My Medical Reports
            </h1>
            <p className="text-[14px] md:text-[15px] text-slate-500 font-medium mt-1">Access all your test results, prescriptions, and bills in one place.</p>
          </div>
          
          <div className="relative w-full md:w-[350px] shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-[14px] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/20 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1200px] mx-auto flex overflow-x-auto gap-2 mt-6 md:mt-8 scrollbar-hide pb-2">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 md:py-2.5 rounded-full text-[13px] md:text-[14px] font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === cat 
                  ? "bg-[#00C2A8] text-white shadow-md shadow-[#00C2A8]/20" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-[1200px] mx-auto py-6 md:py-10 pb-[100px] px-4 md:px-6 lg:px-12">
        
        {filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[24px] border border-slate-200 shadow-sm">
            <File size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-[18px] font-bold text-slate-900 mb-1">No reports found</h3>
            <p className="text-[14px] text-slate-500">We couldn't find any documents matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            {filteredReports.map(report => (
              <div key={report.id} className="bg-white rounded-[20px] p-4 md:p-5 lg:p-6 border border-slate-200/80 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-[#00C2A8]/30 transition-all duration-300 flex flex-col sm:flex-row gap-4 md:gap-5 group">
                
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-[16px] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#00C2A8]/5 group-hover:border-[#00C2A8]/20 transition-colors">
                  {getIcon(report.type)}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                      <h3 className="text-[16px] md:text-[18px] font-bold text-slate-900 leading-tight group-hover:text-[#00C2A8] transition-colors">{report.title}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-[800] uppercase tracking-wide border w-fit shrink-0 ${getBadgeColor(report.type)}`}>
                        {report.type}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-[12px] md:text-[13px] font-medium text-slate-500 mt-2 md:mt-3 mb-4">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <Calendar size={14} className="text-slate-400" /> {report.date}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <User size={14} className="text-slate-400" /> {report.doctor}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-100 mt-auto">
                    <span className="text-[12px] md:text-[13px] font-bold text-slate-400">{report.size} • PDF</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="h-9 md:h-10 px-3 md:px-4 bg-[#00C2A8]/5 hover:bg-[#00C2A8]/10 text-[#00C2A8] rounded-xl font-[800] text-[13px] transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} /> <span className="hidden sm:inline">View</span>
                      </button>
                      <button className="h-9 md:h-10 px-3 md:px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-[800] text-[13px] shadow-sm transition-colors flex items-center gap-2">
                        <Download size={16} /> <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Report Viewer Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6 lg:p-12"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full h-full max-w-[1000px] bg-white rounded-none sm:rounded-[24px] md:rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="h-[72px] md:h-[80px] bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#00C2A8]/10 flex items-center justify-center text-[#00C2A8] shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[16px] md:text-[20px] font-[900] text-slate-900 truncate">{selectedReport.title}</h2>
                    <p className="text-[12px] md:text-[14px] text-slate-500 font-medium truncate">{selectedReport.date} • {selectedReport.doctor}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4 shrink-0 pl-4">
                  <button className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-[800] text-[13px] transition-colors hidden sm:flex items-center gap-2">
                    <Download size={16} /> Download
                  </button>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="w-10 h-10 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body / Report Viewer */}
              <div className="flex-1 bg-slate-100 p-4 md:p-8 overflow-y-auto flex justify-center custom-scrollbar">
                <div className="w-full max-w-[700px] h-fit min-h-[800px] bg-white shadow-md border border-slate-200 rounded-[12px] p-8 md:p-12 relative">
                  
                  {/* Mock Medical Document Content */}
                  <div className="border-b-2 border-slate-200 pb-8 mb-8 flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-[900] text-[#00C2A8] uppercase tracking-wider">Oxpecker AI</h1>
                      <p className="text-slate-500 text-sm mt-1">Advanced Digital Health</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-[800] text-slate-800">{selectedReport.type}</h2>
                      <p className="text-slate-500 text-sm">{selectedReport.date}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Patient Name</p>
                        <p className="font-bold text-slate-800">Rafin Hossain</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Referred By</p>
                        <p className="font-bold text-slate-800">{selectedReport.doctor}</p>
                      </div>
                    </div>

                    <div className="h-64 w-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                      <FileText size={48} className="mb-4 opacity-50" />
                      <p className="font-medium">Document Preview generated by AI</p>
                      <p className="text-xs mt-2">End of mock content</p>
                    </div>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
