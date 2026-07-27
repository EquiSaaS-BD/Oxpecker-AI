import React from "react";
import { X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDoctor } from "@/context/DoctorContext";
import { usePrescription } from "@/context/PrescriptionContext";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface PrescriptionFinalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionFinalizeModal({ isOpen, onClose }: PrescriptionFinalizeModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addPatientToHistory, addPrescriptionToPatient } = useDoctor();
  const { data } = usePrescription();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleFinalize = () => {
    const pName = searchParams?.get('patientName') || "New Patient";
    const pId = searchParams?.get('patientId') || "N/A";

    // Construct patient record from URL params and editor data
    const newPatient = {
      id: pId,
      name: pName,
      age: 30, // Mock age
      gender: "Unknown", // Mock gender
      type: "Appointment",
      date: new Date().toISOString(),
      status: "Completed",
      diagnosis: data.diagnosis || "General Checkup",
      assistant: "System",
      paymentStatus: "Paid",
      avatar: pName.charAt(0).toUpperCase()
    };

    addPatientToHistory(newPatient);
    
    // Save actual prescription data
    addPrescriptionToPatient(pId, {
      date: new Date().toISOString(),
      diagnosis: data.diagnosis,
      medicines: data.medicines,
      advice: data.advice,
      followUp: data.followUp
    });
    
    toast.success("Prescription Finalized!", {
      description: "It has been sent to the patient and saved in history.",
    });

    onClose();
    router.push(`/doctor/dashboard/patients?id=${encodeURIComponent(pId)}&name=${encodeURIComponent(pName)}`);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-100 w-full max-w-4xl h-[100dvh] sm:h-full sm:max-h-[80vh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle className="text-[#6DDA6E]" size={24} />
              Finalize & Send Prescription
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-8 bg-slate-50">
            
            {/* Left Column - Summary */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Prescription Summary</h3>
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 shadow-sm">
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">Patient</p>
                    <p className="font-bold text-slate-800 text-lg">{searchParams?.get('patientName') || "New Patient"}</p>
                    <p className="text-xs text-slate-500">ID: {searchParams?.get('patientId') || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-bold text-slate-800">{new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-1">Chief Complaint & Diagnosis</p>
                  <p className="font-semibold text-slate-800">{data.diagnosis || "Not Specified"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-1">Medicines Prescribed</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-lg">
                      {data.medicines.length}
                    </span>
                    <span className="font-medium text-slate-600">Medication(s)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="w-full md:w-[350px] flex flex-col gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-blue-800">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  <CheckCircle size={18} /> Ready to Finalize
                </h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  By confirming, this prescription will be securely saved to the patient's medical history. 
                  A digital copy will be instantly available in the patient's app.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col gap-3 mt-auto">
                <button 
                  onClick={handleFinalize}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-[#6DDA6E] shadow-[0_4px_16px_rgba(109,218,110,0.25)] hover:bg-[#5bc95c] transition-all hover:-translate-y-0.5 text-base flex justify-center items-center gap-2"
                >
                  <CheckCircle size={20} strokeWidth={2.5} />
                  Confirm & Finalize
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl font-bold text-amber-600 bg-white border-2 border-amber-500/80 hover:bg-amber-50 transition-colors text-base"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
