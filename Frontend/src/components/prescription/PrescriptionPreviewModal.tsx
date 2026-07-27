import React, { useRef, useState } from "react";
import { X, Download, ImagePlus, Printer, Loader2, ChevronLeft, Palette, Trash2, AlertCircle, User, Activity, Edit3, Save, ChevronRight, Share2, ScanBarcode, ZoomIn, ZoomOut } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { motion, AnimatePresence } from "framer-motion";
import { usePrescription } from "@/context/PrescriptionContext";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';

interface PrescriptionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionPreviewModal({ isOpen, onClose }: PrescriptionPreviewModalProps) {
  const { data, updateData } = usePrescription();
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'theme-settings'>('preview');
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  
  const chunkedMedicines = React.useMemo(() => {
    const chunks = [];
    const chunkSize = 10;
    if (!data.medicines || data.medicines.length === 0) return [[]];
    for (let i = 0; i < data.medicines.length; i += chunkSize) {
      chunks.push(data.medicines.slice(i, i + chunkSize));
    }
    return chunks;
  }, [data.medicines]);
  
  const handleDownloadPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Prescription_${new Date().getTime()}`,
    onBeforePrint: async () => {
      setIsDownloading(true);
      return new Promise<void>((resolve) => setTimeout(resolve, 500));
    },
    onAfterPrint: () => {
      setIsDownloading(false);
      toast.success("Print dialog opened. You can 'Save as PDF' from there.");
    },
    onPrintError: () => {
      setIsDownloading(false);
      toast.error("Failed to initialize printing.");
    }
  });

  if (!isOpen) return null;


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'theme' | 'watermark') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Please upload an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'theme') {
          updateData({ theme: "custom", customThemeImage: base64String });
          toast.success("Custom Theme Applied!");
        } else {
          updateData({ watermarkImage: base64String });
          toast.success("Watermark Applied!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderPage = (pageMedicines: any[], pageIndex: number, totalPages: number, isPrintMode: boolean) => (
    <div 
      key={`page-${pageIndex}`}
      className={`w-[794px] min-h-[1123px] bg-white shadow-md p-10 flex flex-col relative transition-all duration-300 ${
        data.theme === 'classic' ? 'font-serif' : 'font-sans'
      }`}
      style={{
        ...(data.theme === 'custom' && data.customThemeImage ? {
          backgroundImage: `url(${data.customThemeImage})`,
          backgroundSize: '100% 100%', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}),
        pageBreakAfter: isPrintMode ? 'always' : 'auto'
      }}
    >
      {/* Absolute Centered Watermark */}
      {data.watermarkImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img 
            src={data.watermarkImage} 
            alt="Watermark" 
            className="w-[250px] h-[250px] object-contain opacity-10"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-1 h-full">
        {/* Doctor Header (Hide if Custom Theme) */}
        {data.theme !== 'custom' && (
          <div className={`flex justify-between items-start pb-6 mb-4 ${
            data.theme === 'minimal' ? 'border-b border-slate-200' : 
            data.theme === 'classic' ? 'border-b-[3px] border-slate-800 double' : 
            'border-b-2 border-[#2F80ED]/20'
          }`}>
            <div>
              <h1 className={`text-2xl font-bold uppercase tracking-wide ${
                data.theme === 'classic' ? 'text-slate-900' : 
                data.theme === 'minimal' ? 'text-slate-800 font-medium tracking-widest' : 
                'text-[#2F80ED]'
              }`}>Dr. Rafin</h1>
              <p className={`text-sm mt-1 ${data.theme === 'classic' ? 'font-bold text-slate-700' : 'font-semibold text-slate-600'}`}>MBBS, FCPS (Cardiology), MD</p>
              <p className="text-xs text-slate-500 mt-1">Consultant Cardiologist</p>
              <p className="text-xs text-slate-500">ABC Medical Center</p>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
              <div className="flex gap-4 items-start">
                  {(() => {
                    const pName = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('patientName') || "New Patient";
                    let rawId = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('patientId');
                    if (!rawId || rawId.includes('-')) {
                      const firstLetter = pName.charAt(0).toUpperCase();
                      let hash = 0;
                      for (let i = 0; i < pName.length; i++) hash = pName.charCodeAt(i) + ((hash << 5) - hash);
                      const num = Math.abs(hash).toString().padStart(6, '0');
                      rawId = `${firstLetter} ${num.slice(0,2)} ${num.slice(2,4)} ${num.slice(4,6)}`;
                    }

                    // Generate dynamic QR Data
                    const qrData = `Patient: ${pName}
ID: ${rawId}
Date: ${new Date().toLocaleDateString('en-GB')}
Diagnosis: ${data.diagnosis || 'N/A'}
Medicines: ${data.medicines.map(m => m.brandName).join(', ') || 'None'}
Tests: ${data.investigationsList?.join(', ') || 'None'}`;

                    return (
                      <>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${data.theme === 'classic' ? 'text-slate-900' : 'text-slate-800'}`}>Shustota AI Hospital</p>
                          <p className="text-xs text-slate-500 mt-1">123 Health Avenue, Dhaka</p>
                          <p className="text-xs text-slate-500 mb-3">Phone: +880 1234 567890</p>
                          
                          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MRN:</span>
                            <span className="font-mono text-sm font-bold text-slate-800 tracking-wider">{rawId}</span>
                          </div>
                        </div>

                        {/* Professional Dynamic QR Code */}
                        <div className="bg-white p-1.5 border-2 border-slate-200 rounded-lg shadow-sm shrink-0">
                          <QRCodeSVG value={qrData} size={76} level="L" includeMargin={false} />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
        )}

        {data.theme === 'custom' && <div className="h-[120px]" />}

        {/* Patient Info Bar */}
        <div className={`flex justify-between items-center px-4 py-3 mb-8 ${
          data.theme === 'minimal' ? 'border-y border-slate-100' : 
          data.theme === 'classic' ? 'border-y border-slate-400 bg-slate-50/50' : 
          'bg-slate-50/50 border border-[#2F80ED]/10 rounded-lg'
        }`}>
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold">Patient Name:</span>
            <span className="ml-2 text-sm font-bold text-slate-800">{new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('patientName') || "New Patient"}</span>
          </div>
          <div className="flex gap-4">
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold">Age:</span>
              <span className="ml-2 text-sm font-bold text-slate-800">45 Yrs</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold">Gender:</span>
              <span className="ml-2 text-sm font-bold text-slate-800">Male</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold">Date:</span>
            <span className="ml-2 text-sm font-bold text-slate-800">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Main Prescription Body (2 Columns) */}
        <div className="flex-1 flex gap-8">
          {/* Left Column: Vitals, CC, Diagnosis, Inv */}
          <div className="w-[35%] flex flex-col gap-6 border-r border-slate-200 pr-8">
            {(data.vitals.bp || data.vitals.pulse || data.vitals.temp || data.vitals.weight) && (
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-2">Vitals</h3>
                <ul className="text-[13px] text-slate-700 flex flex-col gap-1.5">
                  {data.vitals.bp && <li><span className="font-semibold">BP:</span> {data.vitals.bp} mmHg</li>}
                  {data.vitals.pulse && <li><span className="font-semibold">Pulse:</span> {data.vitals.pulse} bpm</li>}
                  {data.vitals.temp && <li><span className="font-semibold">Temp:</span> {data.vitals.temp} °F</li>}
                  {data.vitals.weight && <li><span className="font-semibold">Weight:</span> {data.vitals.weight} kg</li>}
                  {data.vitals.height && <li><span className="font-semibold">Height:</span> {data.vitals.height} cm</li>}
                  {data.vitals.bmi && <li><span className="font-semibold">BMI:</span> {data.vitals.bmi} kg/m²</li>}
                  {data.vitals.bloodSugar && <li><span className="font-semibold">Blood Sugar:</span> {data.vitals.bloodSugar} mg/dL</li>}
                  {data.vitals.spo2 && <li><span className="font-semibold">SpO2:</span> {data.vitals.spo2} %</li>}
                </ul>
              </div>
            )}
            
            {data.chiefComplaint && (
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-2">Chief Complaint</h3>
                <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{data.chiefComplaint}</p>
              </div>
            )}

            {data.physicalExam && (
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-2">Physical Exam</h3>
                <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{data.physicalExam}</p>
              </div>
            )}

            {data.diagnosis && (
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-2">Diagnosis</h3>
                <p className="text-[13px] text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">{data.diagnosis}</p>
              </div>
            )}

            {((data.investigationsList && data.investigationsList.length > 0) || data.investigations) && (
              <div className="bg-blue-50/50 border border-[#2F80ED]/20 p-3 rounded-xl mt-2">
                <h3 className="text-xs font-bold uppercase text-[#2F80ED] border-b border-[#2F80ED]/10 pb-1.5 mb-2">Investigations</h3>
                {data.investigationsList && data.investigationsList.length > 0 ? (
                  <ol className="text-[13px] text-slate-800 font-bold leading-relaxed list-decimal pl-4 space-y-1">
                    {data.investigationsList.map((test: string, idx: number) => (
                      <li key={idx} className="pl-1">{test}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-[13px] text-slate-800 font-bold leading-relaxed whitespace-pre-wrap">{data.investigations}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Rx, Advice, Follow-up */}
          <div className="w-[65%] flex flex-col gap-8 pl-8">
            <div className="flex-1">
              <h1 className={`text-4xl font-bold mb-6 relative -left-1 ${
                data.theme === 'classic' ? 'font-serif text-slate-900' :
                data.theme === 'minimal' ? 'font-sans font-light text-slate-700' :
                'font-serif text-[#2F80ED]'
              }`}>Rx</h1>
              
              {pageMedicines && pageMedicines.length > 0 ? (
                <div className={`flex flex-col ${pageMedicines.length > 7 ? 'gap-2' : pageMedicines.length > 4 ? 'gap-4' : 'gap-6'}`}>
                  {pageMedicines.map((med: any, index: number) => {
                    const globalIndex = (pageIndex * 10) + index;
                    return (
                    <div key={index} className={`flex ${pageMedicines.length > 7 ? 'gap-2' : 'gap-4'}`}>
                      <span className={`font-bold text-slate-400 mt-0.5 ${pageMedicines.length > 7 ? 'text-[11px]' : pageMedicines.length > 4 ? 'text-xs' : 'text-sm'}`}>{globalIndex + 1}.</span>
                      <div className="flex-1">
                        <h4 className={`font-bold text-slate-800 ${pageMedicines.length > 7 ? 'text-[12px] mb-0' : pageMedicines.length > 4 ? 'text-[13px] mb-0.5' : 'text-[15px] mb-1'}`}>{med.name}</h4>
                        <div className={`flex items-center gap-3 text-slate-600 ${pageMedicines.length > 7 ? 'text-[10px]' : pageMedicines.length > 4 ? 'text-[11px]' : 'text-[13px]'}`}>
                          <span className="font-semibold text-[#2F80ED]">{med.dosageM}+{med.dosageN}+{med.dosageE}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{med.frequency}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="font-semibold text-slate-800">{med.duration}</span>
                        </div>
                        {med.notes && (
                          <p className={`text-slate-500 italic ${pageMedicines.length > 7 ? 'text-[9px] mt-0.5' : pageMedicines.length > 4 ? 'text-[10px] mt-0.5' : 'text-[12px] mt-1'}`}>{med.notes}</p>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No medicines prescribed.</p>
              )}
            </div>

            {/* Advice & Follow-up (Only on LAST page) */}
            {pageIndex === totalPages - 1 && (
              <div className="flex flex-col gap-6 mt-auto pt-8">
                {data.advice && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-3">Advice</h3>
                    <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{data.advice}</p>
                  </div>
                )}
                {data.followUp && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-2">Follow-up</h3>
                    <p className="text-[13px] text-slate-700 font-semibold text-[#2F80ED] whitespace-pre-wrap">{data.followUp}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer (Fixed to Bottom) */}
        <div className="mt-auto pt-6 border-t border-slate-200 flex flex-col gap-4">
          <div className="flex justify-end w-full">
            <div className="text-center">
              <div className="w-40 border-b border-slate-800 mb-2"></div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Doctor&apos;s Signature</p>
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center w-full pt-4">
              {!isPrintMode ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-full shadow-sm">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-full text-slate-600 hover:bg-slate-200 hover:text-[#2F80ED] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-[11px] font-bold text-slate-600 px-2">
                    Page {pageIndex + 1} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-full text-slate-600 hover:bg-slate-200 hover:text-[#2F80ED] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors rotate-180"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              ) : (
                <div className="mb-2">
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full shadow-sm">
                    Page {pageIndex + 1} of {totalPages}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-0 md:p-6 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-100 w-full max-w-5xl h-[100dvh] md:h-full md:max-h-[90vh] rounded-none md:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
        >
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-4">
                {activeView === 'theme-settings' ? 'Theme Settings' : 'Prescription Preview'}
              </h2>
              
              <div className="flex items-center gap-4">
                {activeView === 'preview' && (
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60 hidden sm:flex">
                    <button 
                      onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} 
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded shadow-sm transition-colors active:scale-95"
                      title="Zoom Out"
                    >
                      <ZoomOut size={16}/>
                    </button>
                    <span className="text-[11px] font-bold text-slate-600 w-12 text-center select-none">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button 
                      onClick={() => setZoom(z => Math.min(2.0, z + 0.25))} 
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded shadow-sm transition-colors active:scale-95"
                      title="Zoom In"
                    >
                      <ZoomIn size={16}/>
                    </button>
                  </div>
                )}
                
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/png, image/jpeg" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, 'theme')}
            />
            <input 
              type="file" 
              ref={watermarkInputRef} 
              accept="image/png, image/jpeg" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, 'watermark')}
            />

            {/* Body Content */}
            {activeView === 'theme-settings' ? (
              <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 flex justify-center">
                <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col gap-10 h-fit">
                  
                  {/* Default Themes */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Default Themes</h3>
                    <div className="flex flex-wrap gap-4 md:gap-6">
                      {['modern', 'classic', 'minimal'].map((t) => (
                        <div 
                          key={t}
                          onClick={() => updateData({ theme: t })}
                          className={`w-28 md:w-32 h-20 md:h-24 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                            data.theme === t ? 'border-[#2F80ED] bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-[80%] h-10 md:h-12 rounded bg-white border border-slate-200 shadow-sm flex items-center justify-center ${t === 'classic' ? 'font-serif' : 'font-sans'}`}>
                            <span className={`text-sm font-bold ${t === 'modern' ? 'text-[#2F80ED]' : 'text-slate-700'}`}>Rx</span>
                          </div>
                          <span className="font-bold text-slate-700 capitalize text-[12px] md:text-[13px]">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upload Sections: Custom Pad & Watermark */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                    
                    {/* Custom Clinic Pad */}
                    <div>
                      <h3 className="text-base font-bold text-slate-800 mb-2">Custom Clinic Pad</h3>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">Upload full A4 background (2480x3508px). Text will print over it.</p>
                      
                      {data.customThemeImage ? (
                        <div className="w-full h-40 border-2 border-dashed border-[#2F80ED] bg-blue-50 rounded-xl p-5 flex flex-col items-center justify-center relative">
                          <div className="w-16 h-24 bg-white rounded shadow-sm overflow-hidden border border-slate-200 mb-3">
                            <img src={data.customThemeImage} alt="Custom Pad" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-[11px] font-bold bg-white text-slate-600 rounded shadow-sm border border-slate-200 hover:bg-slate-50">Change</button>
                            <button onClick={() => updateData({ theme: 'modern', customThemeImage: null })} className="px-3 py-1.5 text-[11px] font-bold bg-white text-red-500 rounded shadow-sm border border-slate-200 hover:bg-red-50">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#2F80ED] hover:bg-blue-50 transition-all group"
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-white transition-colors">
                            <ImagePlus size={18} className="text-slate-400 group-hover:text-[#2F80ED]" />
                          </div>
                          <p className="font-bold text-slate-700 text-[13px]">Upload A4 Pad</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">PNG/JPG max 5MB</p>
                        </div>
                      )}
                    </div>

                    {/* Watermark Logo */}
                    <div>
                      <h3 className="text-base font-bold text-slate-800 mb-2">Watermark Logo</h3>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">Upload a logo (max 250x250px). It will appear faded in the center.</p>
                      
                      {data.watermarkImage ? (
                        <div className="w-full h-40 border-2 border-dashed border-[#2F80ED] bg-blue-50 rounded-xl p-5 flex flex-col items-center justify-center relative">
                          <div className="w-16 h-16 bg-white rounded-full shadow-sm overflow-hidden border border-slate-200 mb-3 flex items-center justify-center p-2">
                            <img src={data.watermarkImage} alt="Watermark" className="w-full h-full object-contain opacity-50" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => watermarkInputRef.current?.click()} className="px-3 py-1.5 text-[11px] font-bold bg-white text-slate-600 rounded shadow-sm border border-slate-200 hover:bg-slate-50">Change</button>
                            <button onClick={() => updateData({ watermarkImage: null })} className="px-3 py-1.5 text-[11px] font-bold bg-white text-red-500 rounded shadow-sm border border-slate-200 hover:bg-red-50">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => watermarkInputRef.current?.click()}
                          className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#2F80ED] hover:bg-blue-50 transition-all group"
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-white transition-colors">
                            <ImagePlus size={18} className="text-slate-400 group-hover:text-[#2F80ED]" />
                          </div>
                          <p className="font-bold text-slate-700 text-[13px]">Upload Logo</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">PNG/JPG max 5MB</p>
                        </div>
                      )}
                    </div>
                    
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex-1 relative flex flex-col overflow-hidden">
                {/* Preview Area (Shows current page only) */}
                <div className="flex-1 overflow-auto custom-scrollbar bg-slate-200/50 flex flex-col relative touch-pan-x touch-pan-y">
                  
                  {/* Mobile Zoom Controls (Floating at Top Center) */}
                  <div className="sm:hidden sticky top-4 left-0 w-full flex justify-center z-40 px-4 pointer-events-none mb-[-56px]">
                    <div className="bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full px-1.5 py-1.5 flex items-center gap-1 pointer-events-auto">
                      <button 
                        onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:text-[#2F80ED] bg-white/20 hover:bg-white/50 active:scale-95 transition-all"
                      >
                        <ZoomOut size={18}/>
                      </button>
                      <span className="text-[13px] font-bold text-slate-900 w-12 text-center select-none drop-shadow-md">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button 
                        onClick={() => setZoom(z => Math.min(2.0, z + 0.25))} 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:text-[#2F80ED] bg-white/20 hover:bg-white/50 active:scale-95 transition-all"
                      >
                        <ZoomIn size={18}/>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-8 flex sm:justify-center min-w-max pb-8 w-fit mx-auto sm:mx-0">
                    <div 
                      className="shrink-0 shadow-lg ring-1 ring-black/5 rounded-sm overflow-hidden bg-white transition-all duration-200 ease-out"
                      style={{ 
                        width: `${794 * zoom}px`, 
                        height: `${1123 * zoom}px` 
                      }}
                    >
                      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: '794px', height: '1123px' }}>
                        {renderPage(chunkedMedicines[currentPage - 1], currentPage - 1, chunkedMedicines.length, false)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-[-9999px] opacity-0 pointer-events-none" aria-hidden="true" ref={printRef}>
                  {chunkedMedicines.map((pageMeds, idx) => (
                    <div key={idx} className="print-page-wrapper">
                      {renderPage(pageMeds, idx, chunkedMedicines.length, true)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Sidebar (Desktop) / Bottom Bar (Mobile) */}
          <div className="w-full md:w-[260px] bg-white border-t md:border-t-0 md:border-l border-slate-200 shrink-0 flex flex-row md:flex-col p-4 md:p-5 gap-3 z-20 justify-center md:justify-start">
            <h3 className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Actions</h3>
            
            {activeView === 'preview' ? (
              <>
                <button 
                  onClick={() => setActiveView('theme-settings')}
                  className="flex flex-1 md:flex-none items-center justify-center md:justify-start gap-3 text-[13px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-0 md:px-4 py-3.5 rounded-xl hover:bg-slate-100 transition-colors shrink-0 group"
                  title="Theme Settings"
                >
                  <Palette size={20} className="text-[#2F80ED] group-hover:scale-110 transition-transform md:w-[18px] md:h-[18px]" /> 
                  <span className="hidden md:inline">Theme Settings</span>
                </button>
                <button 
                  onClick={() => handleDownloadPDF()} 
                  className="flex flex-1 md:flex-none items-center justify-center md:justify-start gap-3 text-[13px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-0 md:px-4 py-3.5 rounded-xl hover:bg-slate-100 transition-colors shrink-0 group"
                  title="Print"
                >
                  <Printer size={20} className="text-slate-500 group-hover:text-slate-700 group-hover:scale-110 transition-all md:w-[18px] md:h-[18px]" /> 
                  <span className="hidden md:inline">Print</span>
                </button>
                <button 
                  onClick={() => handleDownloadPDF()}
                  disabled={isDownloading}
                  className="flex flex-[2] md:flex-none items-center justify-center md:justify-start gap-2 md:gap-3 text-[13px] font-bold text-white bg-[#2F80ED] hover:bg-[#256bbd] px-0 md:px-4 py-3.5 rounded-xl shadow-sm shadow-[#2F80ED]/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait shrink-0 group"
                  title="Download PDF"
                >
                  {isDownloading ? <Loader2 size={20} className="animate-spin md:w-[18px] md:h-[18px]" /> : <Download size={20} className="group-hover:-translate-y-0.5 transition-transform md:w-[18px] md:h-[18px]" />}
                  <span className="hidden md:inline">{isDownloading ? "Generating..." : "Download PDF"}</span>
                  <span className="md:hidden ml-1">{isDownloading ? "..." : "PDF"}</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => setActiveView('preview')}
                className="flex flex-1 md:flex-none items-center justify-center md:justify-start gap-3 text-[13px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-0 md:px-4 py-3.5 rounded-xl hover:bg-slate-100 transition-colors shrink-0 group"
                title="Back to Preview"
              >
                <ChevronLeft size={20} className="text-slate-500 group-hover:-translate-x-0.5 transition-transform md:w-[18px] md:h-[18px]" /> 
                <span className="hidden md:inline">Back to Preview</span>
                <span className="md:hidden">Back</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
