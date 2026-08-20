"use client";

import { X } from "lucide-react";

export function ContextPanel({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <aside className="hidden xl:flex flex-col w-[360px] h-screen bg-white border-l border-slate-200 shrink-0 sticky top-0">
      {/* Header */}
      <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {children}
      </div>
    </aside>
  );
}
