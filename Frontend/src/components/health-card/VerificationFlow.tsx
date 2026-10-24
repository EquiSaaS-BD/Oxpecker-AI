"use client";

import React, { useState, useRef, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CreditCard, Camera, ScanFace, ClipboardCheck, ChevronRight,
  ChevronLeft, Plus, X, AlertTriangle, CheckCircle2, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { VerificationStep } from "@/types/healthpass";
import { ImageUploadCropper } from "@/components/shared/ImageUploadCropper";
import { BiometricVerificationModal } from "@/components/health-card/BiometricVerificationModal";

interface VerificationData {
  idType: "nid" | "birth_cert";
  idNumber: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  allergies: string[];
  conditions: { name: string; since: string }[];
  photo: string | null;
}

interface Props {
  profileImage?: string | null;
  userName?: string;
  onComplete: (data: VerificationData) => void;
  onCancel: () => void;
}

const STEPS: { key: VerificationStep; label: string; icon: LucideIcon }[] = [
  { key: "identity", label: "পরিচয়", icon: CreditCard },
  { key: "photo", label: "ছবি", icon: Camera },
  { key: "face", label: "ভেরিফাই", icon: ScanFace },
  { key: "review", label: "সম্পন্ন", icon: ClipboardCheck },
];

const COMMON_CONDITIONS = [
  "Diabetes (Type-1)", "Diabetes (Type-2)", "Hypertension", "Asthma",
  "Heart Disease", "Thyroid Disorder", "Kidney Disease", "Liver Disease",
  "Arthritis", "Migraine", "Epilepsy", "Cancer",
];

const COMMON_ALLERGIES = [
  "Penicillin", "Aspirin", "Sulfa Drugs", "Ibuprofen",
  "Latex", "Peanuts", "Shellfish", "Eggs",
];

export default function VerificationFlow({ profileImage, userName, onComplete, onCancel }: Props) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>("identity");
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [faceMatchScore, setFaceMatchScore] = useState<number>(94.5);

  const [data, setData] = useState<VerificationData>({
    idType: "nid",
    idNumber: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    allergies: [],
    conditions: [],
    photo: profileImage || null,
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newConditionSince, setNewConditionSince] = useState("");

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setCurrentStep(next.key);
  };

  const goBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setCurrentStep(prev.key);
  };

  const addAllergy = (allergy: string) => {
    if (allergy && !data.allergies.includes(allergy)) {
      setData((prev) => ({ ...prev, allergies: [...prev.allergies, allergy] }));
    }
    setNewAllergy("");
  };

  const removeAllergy = (a: string) => {
    setData((prev) => ({ ...prev, allergies: prev.allergies.filter((x) => x !== a) }));
  };

  const addCondition = () => {
    if (newCondition) {
      setData((prev) => ({
        ...prev,
        conditions: [...prev.conditions, { name: newCondition, since: newConditionSince || new Date().getFullYear().toString() }],
      }));
      setNewCondition("");
      setNewConditionSince("");
    }
  };

  const removeCondition = (idx: number) => {
    setData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== idx),
    }));
  };

  const handleFaceVerify = async () => {
    setIsProcessing(true);
    // Simulate face verification delay
    await new Promise((r) => setTimeout(r, 2000));
    setFaceVerified(true);
    setIsProcessing(false);
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    onComplete(data);
    setIsProcessing(false);
  };

  const canProceedIdentity =
    data.idNumber.length >= 10 &&
    data.emergencyName.trim() &&
    data.emergencyPhone.trim() &&
    data.emergencyRelation.trim();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Step indicator */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">HealthPass তৈরি করুন</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <React.Fragment key={step.key}>
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive ? "bg-sky-50 text-sky-700" : isDone ? "text-emerald-600" : "text-slate-400"
                }`}>
                  {isDone ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${isDone ? "bg-emerald-300" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6 min-h-[380px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Identity */}
            {currentStep === "identity" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন</h3>
                  <p className="text-sm text-slate-500">আপনার NID নম্বর অথবা জন্ম নিবন্ধন নম্বর দিন</p>
                </div>

                {/* ID Type Toggle */}
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setData((p) => ({ ...p, idType: "nid" }))}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      data.idType === "nid" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    NID নম্বর
                  </button>
                  <button
                    onClick={() => setData((p) => ({ ...p, idType: "birth_cert" }))}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      data.idType === "birth_cert" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    জন্ম নিবন্ধন
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={data.idType === "nid" ? "NID নম্বর (10 or 17 digits)" : "জন্ম নিবন্ধন নম্বর (17 digits)"}
                  value={data.idNumber}
                  onChange={(e) => setData((p) => ({ ...p, idNumber: e.target.value.replace(/[^0-9 ]/g, "") }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all"
                />

                {/* Emergency Contact */}
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm mb-2">জরুরি যোগাযোগ</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      placeholder="নাম"
                      value={data.emergencyName}
                      onChange={(e) => setData((p) => ({ ...p, emergencyName: e.target.value }))}
                      className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all"
                    />
                    <input
                      placeholder="ফোন নম্বর"
                      value={data.emergencyPhone}
                      onChange={(e) => setData((p) => ({ ...p, emergencyPhone: e.target.value }))}
                      className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all"
                    />
                    <input
                      placeholder="সম্পর্ক (মা/বাবা/ভাই)"
                      value={data.emergencyRelation}
                      onChange={(e) => setData((p) => ({ ...p, emergencyRelation: e.target.value }))}
                      className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all"
                    />
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm mb-2">
                    এলার্জি <span className="font-normal text-slate-400">(যদি থাকে)</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {COMMON_ALLERGIES.map((a) => (
                      <button
                        key={a}
                        onClick={() => data.allergies.includes(a) ? removeAllergy(a) : addAllergy(a)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                          data.allergies.includes(a)
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {data.allergies.includes(a) ? "✕ " : ""}
                        {a}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      placeholder="অন্য এলার্জি যোগ করুন..."
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addAllergy(newAllergy)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                    <button
                      onClick={() => addAllergy(newAllergy)}
                      disabled={!newAllergy}
                      className="px-3 py-2 bg-sky-100 text-sky-700 rounded-lg text-sm font-semibold hover:bg-sky-200 disabled:opacity-40 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm mb-2">
                    দীর্ঘস্থায়ী রোগ <span className="font-normal text-slate-400">(যদি থাকে)</span>
                  </h4>
                  {data.conditions.length > 0 && (
                    <div className="space-y-1.5 mb-2">
                      {data.conditions.map((c, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <span className="text-sm font-medium text-amber-800">
                            {c.name} <span className="text-amber-500 text-xs">(since {c.since})</span>
                          </span>
                          <button onClick={() => removeCondition(i)} className="text-amber-400 hover:text-amber-600">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <select
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all appearance-none"
                    >
                      <option value="">রোগ নির্বাচন করুন...</option>
                      {COMMON_CONDITIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="কত সাল থেকে"
                      value={newConditionSince}
                      onChange={(e) => setNewConditionSince(e.target.value)}
                      className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                    <button
                      onClick={addCondition}
                      disabled={!newCondition}
                      className="px-3 py-2 bg-sky-100 text-sky-700 rounded-lg text-sm font-semibold hover:bg-sky-200 disabled:opacity-40 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Photo */}
            {currentStep === "photo" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">প্রোফাইল ছবি</h3>
                  <p className="text-sm text-slate-500">আপনার কার্ডের জন্য একটি পরিষ্কার ছবি আপলোড করুন</p>
                </div>

                <div className="flex flex-col items-center gap-4 py-6">
                  {data.photo ? (
                    <div className="relative">
                      <div className="w-40 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                        <img src={data.photo} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => setData((p) => ({ ...p, photo: null }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-40 h-48 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all group">
                      <Camera size={32} className="text-slate-300 group-hover:text-sky-400 transition-colors mb-2" />
                      <span className="text-xs text-slate-400 font-medium">ছবি আপলোড করুন</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setData((p) => ({ ...p, photo: reader.result as string }));
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                  <p className="text-xs text-slate-400 text-center max-w-xs">
                    পাসপোর্ট সাইজ ছবি ব্যবহার করুন। সরাসরি ক্যামেরার দিকে তাকান।
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Face Verification */}
            {currentStep === "face" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">ফেস ভেরিফিকেশন</h3>
                  <p className="text-sm text-slate-500">আপনার ছবির সাথে মিলিয়ে পরিচয় যাচাই করুন</p>
                </div>

                <div className="flex flex-col items-center gap-6 py-4">
                  {/* Side by side comparison */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100">
                        {data.photo ? (
                          <img src={data.photo} alt="Uploaded" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Camera size={24} />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-1.5">আপলোড করা ছবি</p>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      {faceVerified ? (
                        <CheckCircle2 size={28} className="text-emerald-500" />
                      ) : (
                        <div className="w-7 h-0.5 bg-slate-300 rounded-full" />
                      )}
                      <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                        {faceVerified ? "Match" : "VS"}
                      </span>
                    </div>

                    <div className="text-center">
                      <div className={`w-24 h-28 rounded-xl overflow-hidden border-2 bg-slate-100 ${
                        faceVerified ? "border-emerald-300" : "border-slate-200"
                      }`}>
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : data.photo ? (
                          <img src={data.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ScanFace size={24} />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-1.5">প্রোফাইল ছবি</p>
                    </div>
                  </div>

                  {faceVerified ? (
                    <div className="flex flex-col items-center gap-1 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-800">পরিচয় ও ফেস সফলভাবে যাচাই হয়েছে</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-mono">
                        AI Match Score: {faceMatchScore}% • Biometric Authenticated
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowBiometricModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:from-sky-700 hover:to-indigo-700 transition-all cursor-pointer"
                      >
                        <ScanFace size={16} />
                        <span>স্মার্ট বায়োমেট্রিক ও ফেস ম্যাচিং করুন</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFaceVerify}
                        disabled={isProcessing}
                        className="text-xs text-slate-500 hover:text-slate-700 underline font-semibold py-2 px-3"
                      >
                        {isProcessing ? "যাচাই করা হচ্ছে..." : "কুইক ভেরিফাই (Quick Match)"}
                      </button>
                    </div>
                  )}

                  {/* Biometric Verification Modal */}
                  <BiometricVerificationModal
                    isOpen={showBiometricModal}
                    onClose={() => setShowBiometricModal(false)}
                    userName={userName}
                    initialPhoto={data.photo || profileImage}
                    onVerified={(verified) => {
                      setFaceVerified(true);
                      setFaceMatchScore(verified.faceMatchScore);
                      if (verified.photo) {
                        setData((p) => ({ ...p, photo: verified.photo, idNumber: verified.nid || p.idNumber }));
                      }
                      setShowBiometricModal(false);
                      goNext();
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === "review" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">তথ্য পর্যালোচনা</h3>
                  <p className="text-sm text-slate-500">সব তথ্য ঠিক আছে কিনা দেখুন</p>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">পরিচয়পত্র</span>
                      <span className="font-mono font-semibold text-slate-800">{data.idNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">ধরন</span>
                      <span className="font-semibold text-slate-800">{data.idType === "nid" ? "NID" : "জন্ম নিবন্ধন"}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">জরুরি যোগাযোগ</h4>
                    <p className="text-sm font-semibold text-slate-800">{data.emergencyName} ({data.emergencyRelation})</p>
                    <p className="text-sm text-slate-600">{data.emergencyPhone}</p>
                  </div>

                  {data.allergies.length > 0 && (
                    <div className="bg-red-50 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">এলার্জি</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {data.allergies.map((a) => (
                          <span key={a} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-md">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.conditions.length > 0 && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">দীর্ঘস্থায়ী রোগ</h4>
                      {data.conditions.map((c, i) => (
                        <p key={i} className="text-sm font-medium text-amber-800">
                          {c.name} <span className="text-amber-500">(since {c.since})</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-sky-50 rounded-xl p-4">
                    {faceVerified ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">ফেস ভেরিফিকেশন সম্পন্ন</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} className="text-amber-500" />
                        <span className="text-sm font-medium text-amber-600">ফেস ভেরিফিকেশন স্কিপ করা হয়েছে</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav buttons */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <button
          onClick={stepIndex === 0 ? onCancel : goBack}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft size={16} />
          {stepIndex === 0 ? "বাতিল" : "পিছনে"}
        </button>

        {currentStep === "review" ? (
          <button
            onClick={handleComplete}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-60 transition-all"
          >
            {isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {isProcessing ? "তৈরি হচ্ছে..." : "কার্ড তৈরি করুন"}
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={currentStep === "identity" && !canProceedIdentity}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-sky-700 disabled:opacity-40 transition-all"
          >
            পরবর্তী
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
