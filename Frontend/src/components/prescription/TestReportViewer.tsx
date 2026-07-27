"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, Download, Eye, ShieldCheck, Activity, ChevronLeft, ChevronRight, Printer, PenTool, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

type Point = { x: number, y: number };
type Stroke = Point[];

export function TestReportViewer() {
  const [patientName, setPatientName] = useState("New Patient");
  const [mrn, setMrn] = useState("Unknown");
  const [reportFiles, setReportFiles] = useState<{name: string, date: string, type: string, status: string, pages: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // PDF Viewer State
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  
  // Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const pName = params.get('patientName') || "New Patient";
    let rawId = params.get('patientId');
    
    if (!rawId || rawId.includes('-')) {
      const firstLetter = pName.charAt(0).toUpperCase();
      let hash = 0;
      for (let i = 0; i < pName.length; i++) hash = pName.charCodeAt(i) + ((hash << 5) - hash);
      const num = Math.abs(hash).toString().padStart(6, '0');
      rawId = `${firstLetter} ${num.slice(0,2)} ${num.slice(2,4)} ${num.slice(4,6)}`;
    }
    
    setPatientName(pName);
    setMrn(rawId);

    setTimeout(() => {
      setReportFiles([
        { name: "Complete Blood Count (CBC)", date: new Date().toLocaleDateString('en-GB'), type: "Pathology", status: "Verified", pages: 3 },
        { name: "Lipid Profile", date: new Date().toLocaleDateString('en-GB'), type: "Pathology", status: "Verified", pages: 1 },
        { name: "Chest X-Ray (PA View)", date: new Date(Date.now() - 86400000).toLocaleDateString('en-GB'), type: "Radiology", status: "Verified", pages: 2 },
      ]);
      setIsLoading(false);
    }, 1500);
  }, []);
  
  const handleOpenReport = (report: any) => {
    setSelectedReport(report);
    setCurrentPage(1);
    setIsDrawingMode(false);
    setStrokes([]);
  };

  // Re-draw all strokes when strokes array or zoom changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
    
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    allStrokes.forEach(stroke => {
      if (stroke.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * zoom, stroke[0].y * zoom);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x * zoom, stroke[i].y * zoom);
      }
      ctx.stroke();
    });
  }, [strokes, currentStroke, zoom]);

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const x = (clientX - rect.left) / zoom;
    const y = (clientY - rect.top) / zoom;
    
    setCurrentStroke([{ x, y }]);
    
    // Begin immediate drawing path
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x * zoom, y * zoom);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !currentStroke) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const x = (clientX - rect.left) / zoom;
    const y = (clientY - rect.top) / zoom;
    
    const newPoint = { x, y };
    setCurrentStroke(prev => prev ? [...prev, newPoint] : [newPoint]);
    
    // Draw immediately to context for 60fps responsiveness
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x * zoom, y * zoom);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2 * zoom;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    if (!isDrawingMode || !currentStroke) return;
    if (currentStroke.length > 0) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  };
  
  const handleUndo = () => {
    if (strokes.length > 0) {
      setStrokes(strokes.slice(0, -1));
    }
  };
  
  const renderViewer = () => {
    return (
      <div className="fixed inset-0 z-[99999] sm:static sm:z-auto flex-1 flex flex-col bg-slate-100 overflow-hidden sm:h-full">
        <div className="bg-white border-b border-slate-200 p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 shadow-sm z-10 pt-safe-top">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button 
              onClick={() => setSelectedReport(null)}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-100 text-slate-600 hover:text-slate-900 rounded-full transition-colors shrink-0"
            >
              <ChevronLeft size={18} className="sm:w-[20px] sm:h-[20px]" />
            </button>
            <div className="min-w-0">
              <h2 className="text-[15px] sm:text-[16px] font-bold text-slate-800 flex items-center gap-2 truncate">
                {selectedReport.name}
              </h2>
              <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium truncate mt-0.5">
                {selectedReport.date} • {selectedReport.type}
              </p>
            </div>
          </div>
          
          {/* Controls in Header */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-50 p-1 sm:p-1.5 rounded-xl border border-slate-200">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={14} strokeWidth={3} />
              </button>
              <span className="text-[12px] sm:text-[13px] font-bold text-slate-600 min-w-[60px] sm:min-w-[70px] text-center">
                Page {currentPage} / {selectedReport.pages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(selectedReport.pages, p + 1))}
                disabled={currentPage === selectedReport.pages}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              {strokes.length > 0 && (
                <button 
                  onClick={handleUndo}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Undo Last Mark"
                >
                  <Undo2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              )}
              <button 
                onClick={() => {
                  setIsDrawingMode(!isDrawingMode);
                  if (!isDrawingMode) toast.success("Marking Mode Enabled. Draw directly on the report!");
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-colors ${isDrawingMode ? 'bg-red-100 text-red-600 ring-2 ring-red-400' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                title="Mark / Annotate"
              >
                <PenTool size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                <Printer size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="flex-1 overflow-y-auto overflow-x-auto bg-slate-200/80 p-4 sm:p-8 custom-scrollbar flex flex-col relative touch-pan-x touch-pan-y">
          {/* Mobile Zoom Controls (Floating at Top Center) */}
          <div className="sticky top-0 left-0 w-full flex justify-center z-40 px-4 pointer-events-none mb-[-56px]">
            <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full px-1.5 py-1.5 flex items-center gap-1 pointer-events-auto">
              <button 
                onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} 
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:text-[#2F80ED] bg-white/40 hover:bg-white/80 active:scale-95 transition-all"
              >
                <span className="text-xl font-bold leading-none -mt-1">-</span>
              </button>
              <span className="text-[13px] font-bold text-slate-900 w-12 text-center select-none drop-shadow-md">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={() => setZoom(z => Math.min(2.0, z + 0.25))} 
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:text-[#2F80ED] bg-white/40 hover:bg-white/80 active:scale-95 transition-all"
              >
                <span className="text-xl font-bold leading-none -mt-0.5">+</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex sm:justify-center min-w-max pb-32 w-fit mx-auto pt-10 sm:pt-4">
            {/* The Document Canvas */}
            <div 
              className={`bg-white shadow-2xl border border-slate-300/80 ring-1 ring-black/5 rounded-md relative overflow-hidden group origin-top-left sm:origin-top transition-transform duration-200 ease-out ${isDrawingMode ? 'cursor-crosshair touch-none' : ''}`}
              style={{ 
                width: `${794 * zoom}px`, 
                height: `${1123 * zoom}px` 
              }}
            >
              {/* Document Content */}
              <div className="absolute inset-0 p-8 sm:p-12 flex flex-col pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: '794px', height: '1123px' }}>
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                  <div>
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">Lab Report</h1>
                    <p className="text-slate-500 mt-1">{selectedReport.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">Page {currentPage} / {selectedReport.pages}</p>
                    <p className="text-slate-500">{selectedReport.date}</p>
                    <p className="font-bold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded-md mt-2 inline-block">
                      ID: {mrn}
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                  <FileText size={64} className="text-slate-300 mb-4" />
                  <p className="text-xl font-bold text-slate-400">Mock Data / Visual Demo</p>
                  <p className="text-sm text-slate-400 mt-2">Actual PDF rendering goes here</p>
                </div>
              </div>

              {/* Drawing Layer */}
              <canvas
                ref={canvasRef}
                width={794}
                height={1123}
                className="absolute top-0 left-0"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', pointerEvents: isDrawingMode ? 'auto' : 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
              />
            </div>
          </div>
        </div>

        {/* Bottom floating pagination */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-200/50 pb-safe">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-[14px] font-bold text-slate-700 hover:text-[#2F80ED] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={3} />
            Prev
          </button>
          <div className="w-px h-6 bg-slate-300"></div>
          <span className="text-[12px] sm:text-[14px] font-bold text-slate-800 tracking-wide whitespace-nowrap">
            Page {currentPage} of {selectedReport.pages}
          </span>
          <div className="w-px h-6 bg-slate-300"></div>
          <button 
            onClick={() => setCurrentPage(p => Math.min(selectedReport.pages, p + 1))}
            disabled={currentPage === selectedReport.pages}
            className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-[14px] font-bold text-slate-700 hover:text-[#2F80ED] disabled:opacity-40 transition-colors"
          >
            Next
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  };

  if (!mounted) return null;
  
  return (
    <div className="flex flex-col h-auto xl:h-full bg-slate-50 relative border-x border-slate-200">
      
      {/* Header */}
      {!selectedReport && (
        <div className="bg-white border-b border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 transition-all">
          <div>
            <h2 className="text-[18px] sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-[#2F80ED]" size={20} />
              Lab Test Reports
            </h2>
            <p className="text-[12px] sm:text-sm text-slate-500 mt-1 sm:mt-1.5 leading-relaxed">
              Reports are automatically forwarded by the Lab using Patient ID: <br className="sm:hidden" /><span className="font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md mt-1 sm:mt-0 inline-block">{mrn}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#22C55E]/10 text-[#22C55E] px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-[13px] sm:text-sm shrink-0 self-start md:self-auto">
            <ShieldCheck size={16} className="sm:w-[18px] sm:h-[18px]" />
            Lab Synced
          </div>
        </div>
      )}

      {/* Main Content */}
      {!selectedReport ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-24">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-500">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded-md w-3/4 animate-pulse" />
                        <div className="h-3 bg-slate-50 rounded-md w-1/2 animate-pulse" />
                      </div>
                    </div>
                    <div className="w-16 h-6 bg-slate-50 rounded-md animate-pulse shrink-0 ml-4" />
                  </div>
                  <div className="mt-2 pt-4 border-t border-slate-50 flex items-center justify-end gap-2">
                    <div className="w-24 h-9 bg-slate-50 rounded-lg animate-pulse" />
                    <div className="w-32 h-9 bg-blue-50/50 rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : reportFiles.length === 0 ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white p-8">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <FileText size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Reports Available</h3>
              <p className="text-slate-500 max-w-sm">The pathology lab has not synced any reports for Patient ID <strong>{mrn}</strong> yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {reportFiles.map((file, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:border-[#2F80ED]/30 transition-colors group cursor-pointer" onClick={() => handleOpenReport(file)}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-[#2F80ED] rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-[15px]">{file.name}</h4>
                        <p className="text-[13px] text-slate-500 font-medium mt-0.5">{file.type} • {file.date} • {file.pages} {file.pages > 1 ? 'Pages' : 'Page'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md tracking-wide uppercase shrink-0">
                      {file.status}
                    </span>
                  </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 transition-all">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenReport(file); }}
                    className="flex justify-center items-center gap-2 text-[13px] font-bold text-[#2F80ED] bg-white border-2 border-[#2F80ED] hover:border-[#2F80ED] hover:bg-[#2F80ED] hover:text-white active:bg-[#256bbd] active:border-[#256bbd] px-4 py-2.5 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm hover:shadow-[0_4px_12px_rgba(47,128,237,0.3)] active:scale-[0.97]"
                  >
                    <Eye size={16} />
                    View Report
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toast.success("AI is analyzing this report..."); }}
                    className="flex justify-center items-center gap-2 text-[13px] font-bold text-white bg-[#795bff] hover:bg-[#684be3] active:bg-[#5b42c4] px-4 py-2.5 rounded-lg shadow-[0_4px_14px_rgba(121,91,255,0.2)] hover:shadow-[0_0_20px_rgba(121,91,255,0.6)] active:shadow-[0_0_25px_rgba(121,91,255,0.8)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97]"
                  >
                    Analyze with AI
                  </button>
                </div></div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Mobile Portal vs Desktop Inline
        <div className="hidden sm:flex flex-1 overflow-hidden">
          {renderViewer()}
        </div>
      )}
      
      {/* Mobile Portal for Viewer */}
      {selectedReport && mounted && createPortal(
        <div className="sm:hidden block z-[99999]">
          {renderViewer()}
        </div>,
        document.body
      )}
    </div>
  );
}
