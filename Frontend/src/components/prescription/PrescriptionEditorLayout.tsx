"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Bot, X } from "lucide-react";

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
    <div className="flex flex-col h-full min-h-[calc(100vh-80px)] xl:h-screen xl:overflow-hidden bg-slate-50">
      <div className="flex-1 flex flex-col xl:flex-row w-full relative h-auto xl:h-full max-w-[1920px] mx-auto">
        
        {/* Unified Editor & AI Panel Container */}
        <div className="flex-1 flex flex-col h-auto xl:h-full relative transition-all duration-300 w-full p-0 xl:p-4 gap-4">
          
          {topbar && (
            <div className="w-full shrink-0 z-30 relative">
              {topbar}
            </div>
          )}

          <div className="flex-1 flex flex-col xl:flex-row min-h-0 gap-4">
            {/* Center - Smart Editor */}
            <div className="flex-1 flex flex-col min-w-0 bg-white rounded-none xl:rounded-2xl border-0 xl:border border-slate-200 shadow-sm h-auto xl:h-full min-h-[600px] relative z-10">
            
            <button 
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className="hidden xl:flex absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-14 bg-white border border-slate-200 shadow-md items-center justify-center text-slate-400 hover:text-sky-600 z-20 transition-colors rounded-lg"
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
            className="xl:hidden fixed bottom-[90px] right-4 z-40 w-14 h-14 bg-slate-900 border border-slate-700 shadow-xl rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all"
          >
            <Bot size={24} />
          </button>

          {/* Mobile AI Popup Drawer */}
          {mobileAIOpen && typeof document !== 'undefined' && (
            createPortal(
              <div className="xl:hidden fixed inset-0 z-[9999] flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileAIOpen(false)}>
                <div 
                  className="w-full h-[85dvh] bg-white border-t border-slate-200 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden pb-safe"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Drag Handle & Close Button */}
                  <div className="w-full flex items-center justify-center pt-4 pb-3 relative shrink-0 z-50 bg-white">
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMobileAIOpen(false); }} 
                      className="absolute right-4 top-3 p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 active:scale-95 transition-all z-50"
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
          <div className={`hidden xl:flex transition-all duration-300 ease-in-out flex-shrink-0 flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm z-0 ${
            rightCollapsed ? 'w-0 opacity-0 overflow-hidden border-none mx-0' : 'w-[400px] opacity-100'
          }`}>
            {aiPanel}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
