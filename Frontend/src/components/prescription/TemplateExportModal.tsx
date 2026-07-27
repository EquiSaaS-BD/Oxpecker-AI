import React from "react";
import { X, FileDown, Printer, LayoutTemplate, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface TemplateExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateExportModal({ isOpen, onClose }: TemplateExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Export & Print Prescription</h2>
            <p className="text-sm text-slate-500 mt-1">Choose a template format to generate the final document.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Action Area (Left 2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <LayoutTemplate size={18} className="text-[#2F80ED]" />
              Select Template
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Shustota Default */}
              <div className="border-2 border-[#6DDA6E] bg-white rounded-xl p-4 cursor-pointer relative shadow-sm">
                <div className="absolute top-3 right-3 text-[#6DDA6E]">
                  <CheckCircle2 size={20} className="fill-[#6DDA6E]/20" />
                </div>
                <div className="w-full h-32 bg-slate-50 border border-slate-100 rounded-lg mb-3 flex items-center justify-center">
                  <Image src="/images/shustota icon.png" width={32} height={32} alt="Logo" className="opacity-50 grayscale" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Shustota Standard</h4>
                <p className="text-xs text-slate-500 mt-1">Clean, AI-optimized format.</p>
              </div>

              {/* Hospital Custom */}
              <div className="border border-slate-200 bg-white rounded-xl p-4 cursor-pointer hover:border-[#2F80ED] transition-colors relative">
                <div className="w-full h-32 bg-slate-50 border border-slate-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute top-0 w-full h-6 bg-blue-900/10" />
                  <span className="text-xs font-bold text-slate-400">Green View Hospital</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Hospital Template</h4>
                <p className="text-xs text-slate-500 mt-1">Uses connected hospital header.</p>
              </div>

              {/* Personal Template */}
              <div className="border border-slate-200 bg-white rounded-xl p-4 cursor-pointer hover:border-[#2F80ED] transition-colors relative">
                <div className="w-full h-32 bg-slate-50 border border-slate-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-400">Dr. Rafin's Pad</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Personal Prescription</h4>
                <p className="text-xs text-slate-500 mt-1">Your own custom letterhead.</p>
              </div>

              {/* Upload New */}
              <div className="border-2 border-dashed border-slate-200 bg-white rounded-xl p-4 cursor-pointer hover:border-[#2F80ED]/50 hover:bg-blue-50/50 transition-colors flex flex-col items-center justify-center text-center h-full min-h-[180px]">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#2F80ED] mb-2">
                  <Plus size={20} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Upload New</h4>
                <p className="text-xs text-slate-500 mt-1 px-4">Upload a custom PDF or Image template.</p>
              </div>
            </div>
          </div>

          {/* Sidebar Actions (Right col) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col h-full shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Export Options</h3>
            
            <div className="flex-1 flex flex-col gap-3">
              <button className="w-full bg-[#6DDA6E] hover:bg-[#5bc95c] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95">
                <FileDown size={20} />
                Download PDF
              </button>
              
              <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95">
                <Printer size={20} />
                Direct Print
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">After Export</h4>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="w-5 h-5 rounded-md border-2 border-slate-300 group-hover:border-[#6DDA6E] peer-checked:bg-[#6DDA6E] peer-checked:border-[#6DDA6E] transition-all" />
                  <CheckCircle2 size={14} className="text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm text-slate-600 font-medium leading-tight">Attach PDF to Patient's Timeline</span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group mt-3">
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="w-5 h-5 rounded-md border-2 border-slate-300 group-hover:border-[#6DDA6E] peer-checked:bg-[#6DDA6E] peer-checked:border-[#6DDA6E] transition-all" />
                  <CheckCircle2 size={14} className="text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm text-slate-600 font-medium leading-tight">Send copy to Patient App</span>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Quick Plus icon component for this file
const Plus = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
