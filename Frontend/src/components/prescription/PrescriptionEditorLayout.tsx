"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Sparkles, X } from "lucide-react";

export function PrescriptionEditorLayout({
  topbar,
  editor,
  aiPanel,
}: {
  topbar?: React.ReactNode;
  editor: React.ReactNode;
  aiPanel: React.ReactNode;
}) {
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [mobileAIOpen, setMobileAIOpen] = useState(false);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-80px)] xl:h-screen xl:overflow-hidden bg-[#F8FAFC]">
      <div className="flex-1 flex flex-col xl:flex-row w-full relative h-auto xl:h-full">
        
        {/* Unified Editor & AI Panel Container */}
        <div className="flex-1 flex flex-col h-auto xl:h-full relative transition-all duration-300 w-full">
          
          {topbar && (
            <div className="w-full shrink-0 z-30 relative">
              {topbar}
            </div>
          )}

          <div className="flex-1 flex flex-col xl:flex-row min-h-0">
            {/* Center - Smart Editor */}
            <div className="flex-1 flex flex-col min-w-0 bg-white h-auto xl:h-full min-h-[600px] relative z-10">
            
            <button 
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className="hidden xl:flex absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-14 bg-white border border-slate-200 rounded-l-lg shadow-sm items-center justify-center text-slate-400 hover:text-purple-500 z-20 transition-colors"
            >
              {rightCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
            </button>

            <div className="flex-1 overflow-visible xl:overflow-hidden h-auto xl:h-full">
              {editor}
            </div>
          </div>

          {/* Mobile AI Floating Button */}
          <button
            onClick={() => setMobileAIOpen(true)}
            className="xl:hidden fixed bottom-[90px] right-4 z-40 w-[52px] h-[52px] bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(168,85,247,0.25)] rounded-full flex items-center justify-center text-purple-600 hover:bg-white hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles size={24} />
          </button>

          {/* Mobile AI Popup Drawer */}
          {mobileAIOpen && typeof document !== 'undefined' && (
            createPortal(
              <div className="xl:hidden fixed inset-0 z-[9999] flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileAIOpen(false)}>
                <div 
                  className="w-full h-[85dvh] bg-white/90 backdrop-blur-2xl border-t border-slate-200/50 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300 pb-safe"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Drag Handle & Close Button */}
                  <div className="w-full flex items-center justify-center pt-4 pb-3 relative shrink-0 z-50">
                    <div className="w-12 h-1.5 bg-slate-300/60 rounded-full" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMobileAIOpen(false); }} 
                      className="absolute right-4 top-3 p-2 bg-slate-200/80 rounded-full text-slate-600 hover:bg-slate-300 active:scale-95 transition-all z-50 shadow-sm"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  {/* Panel Content */}
                  <div className="flex-1 overflow-hidden relative">
                    {aiPanel}
                  </div>
                </div>
              </div>,
              document.body
            )
          )}

          {/* Right - AI Assistance Panel (Attached to Editor on Desktop) */}
          <div className={`hidden xl:flex transition-all duration-300 ease-in-out overflow-y-auto custom-scrollbar flex-shrink-0 flex-col h-full bg-white/70 backdrop-blur-xl border-l border-slate-200 z-0
            ${rightCollapsed ? 'w-0 opacity-0 overflow-hidden border-none' : 'w-[400px] opacity-100'}
          `}>
            {aiPanel}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
