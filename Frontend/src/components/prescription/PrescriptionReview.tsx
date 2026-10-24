"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { PrescriptionTranscription } from "@/lib/prescription-ocr";

const FIELDS = [
  ["brandName", "ওষুধের নাম (যেভাবে লেখা)"],
  ["genericName", "জেনেরিক (শুধু লেখা থাকলে)"],
  ["strength", "শক্তি"],
  ["dosageForm", "ওষুধের ধরন"],
  ["packageSize", "প্যাকেটের পরিমাণ (লেখা থাকলে)"],
  ["dose", "প্রতি বারের ডোজ"],
  ["frequency", "কতবার / সময়সূচি"],
  ["duration", "কতদিন"],
  ["route", "সেবনের পথ"],
  ["instructionsTranscribed", "অতিরিক্ত নির্দেশনা"],
] as const;

function editableText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function PrescriptionReview({
  documentId,
  initialTranscription,
  imageUrl,
  onSaved,
}: {
  documentId: string;
  initialTranscription: PrescriptionTranscription;
  imageUrl?: string | null;
  onSaved?: (result: { analysis: string; medicineComparisons: any[]; priceSnapshot: any }) => void;
}) {
  const [transcription, setTranscription] = useState(initialTranscription);
  const [checkedAgainstImage, setCheckedAgainstImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean((initialTranscription as any).userReview?.verifiedAgainstImage));

  const updateTopLevel = (field: "prescriptionDate" | "patientName" | "doctorName", value: string) => {
    setTranscription((current) => ({ ...current, [field]: value || null }));
    setSaved(false);
    setCheckedAgainstImage(false);
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    setTranscription((current) => ({
      ...current,
      medicines: current.medicines.map((medicine, medicineIndex) => medicineIndex === index
        ? { ...medicine, [field]: value || null }
        : medicine),
    }));
    setSaved(false);
    setCheckedAgainstImage(false);
  };

  const addMedicine = () => {
    if (transcription.medicines.length >= 30) {
      toast.error("A prescription can contain up to 30 medicine entries in this form.");
      return;
    }
    setTranscription((current) => ({
      ...current,
      medicines: [...current.medicines, {
        brandName: null,
        genericName: null,
        strength: null,
        dosageForm: null,
        packageSize: null,
        dose: null,
        frequency: null,
        duration: null,
        route: null,
        instructionsTranscribed: null,
        confidence: "uncertain",
        fieldConfidence: Object.fromEntries(FIELDS.map(([field]) => [field, "uncertain"])) as Record<string, "uncertain">,
      }],
    }));
    setSaved(false);
    setCheckedAgainstImage(false);
  };

  const removeMedicine = (index: number) => {
    setTranscription((current) => ({ ...current, medicines: current.medicines.filter((_, medicineIndex) => medicineIndex !== index) }));
    setSaved(false);
    setCheckedAgainstImage(false);
  };

  const saveCorrections = async () => {
    if (!checkedAgainstImage) {
      toast.error("Please compare the extracted text with the original image first.");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.access_token) throw new Error("Sign in to save transcription corrections.");
      const response = await fetch("/api/medical-documents", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId, transcription: { ...transcription, userReview: { verifiedAgainstImage: true } } }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not save transcription corrections.");
      setTranscription(result.transcription);
      setSaved(true);
      onSaved?.(result);
      toast.success("Transcription corrections saved. This does not approve the prescription clinically.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save transcription corrections.");
    } finally {
      setSaving(false);
    }
  };

  const textInputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100";

  return (
    <div className="space-y-4">
      {imageUrl && (
        <figure className="bg-white rounded-2xl border border-slate-200 p-3">
          <figcaption className="text-sm font-bold text-slate-700 mb-2">মূল প্রেসক্রিপশন—প্রতিটি ঘর মিলিয়ে দেখুন</figcaption>
          <Image src={imageUrl} alt="Original prescription for manual OCR verification" width={1200} height={1600} unoptimized className="w-full h-auto max-h-[680px] object-contain rounded-xl bg-slate-50" />
        </figure>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <p className="font-bold">OCR খসড়া—অনিশ্চিত লেখা নিজে ঠিক করে নিন।</p>
          <p className="mt-1">এটি শুধু ছবির লেখা যাচাই; প্রেসক্রিপশন বা চিকিৎসার সিদ্ধান্ত অনুমোদন নয়। AI confidence দৃশ্যভিত্তিক আনুমানিকতা, নির্ভুলতার মাপ নয়।</p>
          <p className="mt-1">ছবির অবস্থা: {transcription.imageQuality.status.replaceAll("_", " ")}{transcription.imageQuality.reasons.length ? ` · ${transcription.imageQuality.reasons.join("; ")}` : ""}</p>
          {transcription.uncertainFields.length > 0 && <p className="mt-1">যাচাই দরকার: {transcription.uncertainFields.join(" · ")}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            ["patientName", "রোগীর নাম"], ["doctorName", "ডাক্তারের নাম"], ["prescriptionDate", "তারিখ"],
          ] as const).map(([field, label]) => (
            <label key={field} className="text-xs font-semibold text-slate-600">{label}
              <input className={`${textInputClass} mt-1`} value={editableText(transcription[field])} onChange={(event) => updateTopLevel(field, event.target.value)} placeholder="পড়া যায়নি / সংশোধন করুন" />
            </label>
          ))}
        </div>

        {transcription.medicines.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold">ওষুধের তথ্য স্বয়ংক্রিয়ভাবে আলাদা করা যায়নি।</p>
            {transcription.rawOcrText && <pre className="mt-2 whitespace-pre-wrap font-sans">{transcription.rawOcrText}</pre>}
          </div>
        ) : transcription.medicines.map((medicine, index) => (
          <fieldset key={index} className="rounded-xl border border-slate-200 p-3 space-y-3">
            <legend className="px-1 text-sm font-bold text-slate-800">ওষুধ {index + 1} · OCR confidence: {medicine.confidence}</legend>
            <button type="button" onClick={() => removeMedicine(index)} className="text-xs font-semibold text-rose-700 hover:underline">এই ঘর সরান</button>
            {medicine.evidence && <p className="text-xs text-slate-500">ছবিতে পড়া অংশ: “{medicine.evidence}”</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELDS.map(([field, label]) => (
                <label key={field} className="text-xs font-semibold text-slate-600">{label} · {medicine.fieldConfidence?.[field] || "uncertain"}
                  <input className={`${textInputClass} mt-1`} value={editableText(medicine[field])} onChange={(event) => updateMedicine(index, field, event.target.value)} placeholder="পড়া যায়নি / সংশোধন করুন" />
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <button type="button" onClick={addMedicine} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">+ ওষুধের ঘর যোগ করুন</button>

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={checkedAgainstImage} onChange={(event) => setCheckedAgainstImage(event.target.checked)} className="mt-1" />
          আমি মূল ছবির সঙ্গে পড়া লেখা মিলিয়ে দেখেছি।
        </label>
        <button type="button" onClick={() => void saveCorrections()} disabled={saving || !checkedAgainstImage} className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saving ? "সংরক্ষণ হচ্ছে…" : saved ? "সংশোধন সংরক্ষিত" : "সংশোধন সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}
