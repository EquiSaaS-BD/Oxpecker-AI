import React from "react";
import { X, Printer, Download, Share2, FileText, CheckCircle2 } from "lucide-react";

interface ReportPreviewPanelProps {
  report: any;
  onClose: () => void;
}

export function ReportPreviewPanel({ report, onClose }: ReportPreviewPanelProps) {
  if (!report) return null;

  return (
    <div className="w-[400px] h-full bg-white border-l border-slate-200 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] flex flex-col absolute right-0 top-0 z-10 transition-transform duration-300 ease-in-out transform">
      {/* Top Actions (Height: 64px, visually structured as 32px actions area) */}
      <div className="h-[64px] shrink-0 border-b border-slate-100 flex items-center justify-between px-6">
        <h3 className="text-[16px] font-bold text-slate-800 truncate pr-4">Report Details</h3>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#2F80ED] hover:bg-blue-50 rounded-lg transition-colors">
            <Printer size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#2F80ED] hover:bg-blue-50 rounded-lg transition-colors">
            <Download size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#2F80ED] hover:bg-blue-50 rounded-lg transition-colors">
            <Share2 size={16} />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
        {/* Patient & Test Quick Info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-bold uppercase text-[#2F80ED] tracking-wider">{report.testName}</span>
            <span className="text-[12px] font-medium text-slate-500">{report.date}</span>
          </div>
          <h2 className="text-[20px] font-bold text-slate-900 leading-tight">{report.patientName}</h2>
          <p className="text-[13px] font-medium text-slate-500">Ref by: {report.refBy || "Self"}</p>
        </div>

        {/* PDF/Image Mockup Area (Aspect Ratio 1:1.4) */}
        <div className="w-full bg-[#F1F5F9] rounded-[12px] border border-slate-200 overflow-hidden relative shadow-sm" style={{ aspectRatio: '1 / 1.4' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
              <FileText size={32} className="text-slate-300" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-600 mb-1">Document Preview</p>
              <p className="text-[12px] text-slate-400">The scanned diagnostic report will appear here in high resolution.</p>
            </div>
            <button className="mt-2 px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-semibold text-[#2F80ED] shadow-sm hover:border-[#2F80ED] transition-colors">
              View Full Screen
            </button>
          </div>
        </div>

        {/* Doctor's Note Textarea (Height: 120px) */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-slate-700">Doctor's Observation</label>
          <textarea 
            placeholder="Write clinical notes based on this report..."
            className="w-full h-[120px] p-3 bg-white border border-slate-200 rounded-[12px] text-[14px] text-slate-700 placeholder:text-slate-400 resize-none outline-none focus:border-[#2F80ED] focus:ring-1 focus:ring-[#2F80ED]/20 transition-all shadow-sm"
          />
        </div>

        {/* Action Button */}
        <button className="w-full h-[48px] bg-[#6DDA6E] hover:bg-[#5bc95c] text-white font-bold text-[14px] rounded-[12px] transition-colors flex items-center justify-center gap-2 shadow-sm">
          <CheckCircle2 size={18} />
          Mark as Reviewed
        </button>
      </div>
    </div>
  );
}
