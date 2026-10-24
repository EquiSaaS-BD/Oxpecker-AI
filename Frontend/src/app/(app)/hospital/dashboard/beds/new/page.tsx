"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BedDouble,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building,
  DollarSign,
  Maximize2,
  Bath,
  Users,
  Eye,
  Camera,
  Layers,
  HeartPulse,
  Info,
  ChevronRight,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import type { BedGig, BedCategory, BedStatus } from "@/types/hospital-hms";
import { saveHospitalBed } from "@/lib/hospital-hms";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";

// Clinical Room Photo Presets
const IMAGE_PRESETS = [
  {
    name: "ICU Pod Suite",
    category: "ICU",
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop",
  },
  {
    name: "VIP Deluxe Suite",
    category: "VIP Suite",
    url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=500&fit=crop",
  },
  {
    name: "Cardiac CCU Ward",
    category: "CCU",
    url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop",
  },
  {
    name: "Deluxe Single Cabin",
    category: "Deluxe Cabin",
    url: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&h=500&fit=crop",
  },
  {
    name: "Neonatal NICU",
    category: "NICU",
    url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=500&fit=crop",
  },
  {
    name: "General Surgical Ward",
    category: "General Ward",
    url: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop",
  },
  {
    name: "Executive Patient Lounge",
    category: "VIP Suite",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=500&fit=crop",
  },
];

// Biomedical & Hospital Amenities Checklist
const AVAILABLE_FEATURES = [
  "Mechanical Ventilator",
  "Dedicated ICU Nurse 1:1",
  "Central Oxygen Support",
  "Cardiac Telemetry 12-Lead",
  "Defibrillator Ready",
  "Negative Pressure Filtration",
  "Private Attendant Room",
  "Smart Electric Bed",
  "Private En-Suite Bath",
  "Smart Nurse Intercom",
  "Wall Oxygen & Suction",
  "Continuous Hemodynamic Monitor",
  "High-Speed WiFi & Smart TV",
  "Daily Doctor Rounds",
  "Dietary Meal Plan",
];

const BED_CATEGORIES: BedCategory[] = [
  "ICU",
  "CCU",
  "VIP Suite",
  "Deluxe Cabin",
  "General Ward",
  "NICU",
  "HDU",
  "Isolation",
];

const CATEGORY_OPTIONS: CustomSelectOption<BedCategory>[] = BED_CATEGORIES.map((cat) => ({
  value: cat,
  label: cat,
}));

const STATUS_OPTIONS: CustomSelectOption<BedStatus>[] = [
  { value: "Vacant", label: "Vacant (Ready)", dotColor: "bg-emerald-500" },
  { value: "Cleaning", label: "Cleaning Cycle", dotColor: "bg-cyan-500" },
  { value: "Maintenance", label: "Maintenance", dotColor: "bg-rose-500" },
];

const BATHROOM_OPTIONS: CustomSelectOption<"attached" | "shared" | "none">[] = [
  { value: "attached", label: "En-suite Attached Bath" },
  { value: "shared", label: "Shared Floor Washroom" },
  { value: "none", label: "None / Ward Standard" },
];

export default function NewBedPage() {
  const router = useRouter();

  // Form State
  const [bedId, setBedId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<BedCategory>("Deluxe Cabin");
  const [ward, setWard] = useState("Level 3 - Inpatient Deluxe Wing");
  const [floor, setFloor] = useState("Level 3");
  const [roomNumber, setRoomNumber] = useState("Room 305");
  const [bathroomType, setBathroomType] = useState<"attached" | "shared" | "none">("attached");
  const [bedCount, setBedCount] = useState<number>(1);
  const [maxOccupants, setMaxOccupants] = useState<number>(2);
  const [price, setPrice] = useState<number>(8500);
  const [status, setStatus] = useState<BedStatus>("Vacant");
  const [description, setDescription] = useState(
    "Singapore-grade inpatient private suite featuring electronically adjustable clinical bed, central medical gas pipelines, dedicated attendant rest area, and 24/7 nursing supervision."
  );

  // Multi-Image Gallery State (Up to 6 images)
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&h=500&fit=crop",
  ]);
  const [activePreviewImageIndex, setActivePreviewImageIndex] = useState<number>(0);

  // Features Checklist State
  const [features, setFeatures] = useState<string[]>([
    "Central Oxygen Support",
    "Smart Nurse Intercom",
    "Private En-Suite Bath",
    "Smart Electric Bed",
  ]);
  const [customFeatureInput, setCustomFeatureInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle Features
  const toggleFeature = (feat: string) => {
    if (features.includes(feat)) {
      setFeatures(features.filter((f) => f !== feat));
    } else {
      setFeatures([...features, feat]);
    }
  };

  const handleAddCustomFeature = () => {
    if (customFeatureInput.trim()) {
      const trimmed = customFeatureInput.trim();
      if (!features.includes(trimmed)) {
        setFeatures([...features, trimmed]);
        setCustomFeatureInput("");
      }
    }
  };

  // Image Management
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 6) {
      toast.error("Maximum 6 images allowed per clinical bed suite");
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is larger than 5MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImages((prev) => [...prev, reader.result as string]);
          toast.success(`Uploaded ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addPresetImage = (url: string) => {
    if (images.includes(url)) {
      toast.info("Image already in gallery");
      return;
    }
    if (images.length >= 6) {
      toast.error("Maximum 6 images reached");
      return;
    }
    setImages((prev) => [...prev, url]);
    toast.success("Preset image added to suite gallery");
  };

  const removeImage = (index: number) => {
    if (images.length === 1) {
      toast.error("At least one image is required for Singapore-standard listing");
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (activePreviewImageIndex >= index && activePreviewImageIndex > 0) {
      setActivePreviewImageIndex((prev) => prev - 1);
    }
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    setImages([target, ...remaining]);
    setActivePreviewImageIndex(0);
    toast.success("Cover image updated");
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bedId.trim()) {
      toast.error("Please enter a unique Bed / Suite ID (e.g. VIP-501)");
      return;
    }
    if (images.length === 0) {
      toast.error("Please provide at least one room photo");
      return;
    }

    setIsSubmitting(true);

    const generatedTitle =
      title.trim() ||
      `${category} Suite ${bedId.trim()} (${ward.split("-")[0]?.trim() || "Inpatient"})`;

    const newBed: BedGig = {
      id: bedId.trim().toUpperCase(),
      title: generatedTitle,
      category,
      ward: ward.trim(),
      floor: floor.trim(),
      roomNumber: roomNumber.trim(),
      price: Number(price) || 2500,
      priceDisplay: `৳ ${Number(price || 0).toLocaleString()} / day`,
      image: images[0],
      images: images,
      description: description.trim(),
      features: features.length > 0 ? features : ["Central Oxygen Support", "Standard Clinical Care"],
      bathroomType,
      bedCount: Number(bedCount) || 1,
      maxOccupants: Number(maxOccupants) || 1,
      status,
      created_at: new Date().toISOString().split("T")[0],
    };

    saveHospitalBed(newBed);
    toast.success(`Bed ${newBed.id} successfully published to Hospital Registry!`);

    setTimeout(() => {
      router.push("/hospital/dashboard/beds");
    }, 600);
  };

  return (
    <div className="w-full space-y-6 pb-20">
      <Toaster position="top-right" richColors />

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/hospital/dashboard/beds"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Back to Beds List"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital Console</span>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-xs font-bold text-emerald-600">Bed Inventory</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Add New Bed / Clinical Suite
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => router.push("/hospital/dashboard/beds")}
            className="h-11 px-5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={18} />
            {isSubmitting ? "Publishing..." : "Publish Bed Suite"}
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Form (Left 60%) + Live Preview (Right 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Identification & Location */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">1. Identification & Hospital Location</h3>
                <p className="text-xs text-slate-500">Physical ward address and unique bed code for nursing routing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Bed / Suite Code <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={bedId}
                  onChange={(e) => setBedId(e.target.value.toUpperCase())}
                  placeholder="e.g. VIP-501, ICU-04, CAB-202"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 placeholder:font-normal placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Clinical Category <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  value={category}
                  onChange={(val) => setCategory(val)}
                  options={CATEGORY_OPTIONS}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Bed / Suite Display Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g. Mount Elizabeth Royal ${category} Suite`}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                If left empty, will automatically generate from Category and Bed ID.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Floor / Level <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="e.g. Level 4"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Room Number <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 402"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Initial Status
                </label>
                <CustomSelect
                  value={status}
                  onChange={(val) => setStatus(val)}
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Ward / Department Block <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="e.g. Level 4 - Royal Executive Wing"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Clinical Specifications & Capacity */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">2. Room Capacity & Hygiene Facilities</h3>
                <p className="text-xs text-slate-500">Bathroom layout and caregiver accommodation allowances</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Bathroom Type
                </label>
                <CustomSelect
                  value={bathroomType}
                  onChange={(val) => setBathroomType(val)}
                  options={BATHROOM_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Number of Beds
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={bedCount}
                  onChange={(e) => setBedCount(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Max Occupants / Attendants
                </label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={maxOccupants}
                  onChange={(e) => setMaxOccupants(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Daily Pricing Tariff */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Daily Inpatient Tariff (24h Inpatient Stay)
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Includes basic nursing monitoring, bed linen sanitization, and facility charges.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-base font-black text-slate-700">৳</span>
                <input
                  required
                  type="number"
                  min={500}
                  step={100}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-36 h-11 px-3 rounded-xl border border-emerald-300 bg-white text-base font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-500">/ day</span>
              </div>
            </div>
          </div>

          {/* Section 3: Multi-Image Room Gallery */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">3. Multi-Image Room Gallery</h3>
                  <p className="text-xs text-slate-500">Upload up to 6 high-definition clinical suite photos</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {images.length} / 6 Photos
              </span>
            </div>

            {/* Current Image Gallery Thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((imgUrl, index) => (
                <div
                  key={index}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all group aspect-video bg-slate-100 ${
                    index === 0
                      ? "border-emerald-500 ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Bed Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Badges & Actions Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      {index === 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                          Primary Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="px-2 py-0.5 rounded-md bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold shadow-xs cursor-pointer"
                        >
                          Set Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <span className="text-[10px] text-white/80 font-medium truncate">
                      Photo #{index + 1}
                    </span>
                  </div>

                  {index === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider group-hover:hidden">
                      Primary Cover
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Dropzone */}
              {images.length < 6 && (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all aspect-video">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload size={20} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Upload Photo</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG up to 5MB</span>
                </label>
              )}
            </div>

            {/* Presets Library */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Or pick from Singapore Clinical Image Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {IMAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addPresetImage(preset.url)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={12} className="text-emerald-600" />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Amenities & Biomedical Features */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <HeartPulse size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">4. Biomedical & Clinical Amenities</h3>
                <p className="text-xs text-slate-500">Select standard equipment verified for this suite</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_FEATURES.map((feat) => {
                const isChecked = features.includes(feat);
                return (
                  <label
                    key={feat}
                    onClick={() => toggleFeature(feat)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isChecked
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-2xs"
                        : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/60"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <CheckCircle2 size={12} />}
                    </div>
                    <span>{feat}</span>
                  </label>
                );
              })}
            </div>

            {/* Custom Feature Adder */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={customFeatureInput}
                onChange={(e) => setCustomFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomFeature();
                  }
                }}
                placeholder="Add custom medical fixture or amenity (e.g. Infusion Pump Ready)..."
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Add Feature
              </button>
            </div>
          </div>

          {/* Section 5: Clinical Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Info size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">5. Clinical & Caregiver Description</h3>
                <p className="text-xs text-slate-500">Provide an authentic summary of the room atmosphere, ventilation, and clinical support</p>
              </div>
            </div>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the medical capabilities, nurse ratio, privacy level, and attendant comforts..."
              className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/hospital/dashboard/beds")}
              className="h-12 px-6 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              {isSubmitting ? "Saving to Registry..." : "Publish Bed Suite"}
            </button>
          </div>
        </form>

        {/* Right Column: Real-Time Live Preview (40%) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-emerald-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                Real-Time Live Preview
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Staff & Inpatient View
            </span>
          </div>

          {/* Live Rendered Bed Gig Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            {/* Primary Image & Multi-Image Gallery Slider */}
            <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[activePreviewImageIndex] || images[0]}
                  alt="Suite Preview"
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <BedDouble size={40} />
                  <span className="text-xs mt-2">No Room Photos Uploaded</span>
                </div>
              )}

              {/* Status Pill Over Photo */}
              <div className="absolute top-3.5 left-3.5">
                <span
                  className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md backdrop-blur-md ${
                    status === "Vacant"
                      ? "bg-emerald-600/95 text-white"
                      : status === "Cleaning"
                      ? "bg-cyan-600/95 text-white"
                      : "bg-rose-600/95 text-white"
                  }`}
                >
                  ● {status}
                </span>
              </div>

              {/* Category Pill */}
              <div className="absolute top-3.5 right-3.5">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900/90 text-white shadow-md backdrop-blur-md">
                  {category}
                </span>
              </div>

              {/* Bottom Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Camera size={12} />
                  {activePreviewImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Gallery Thumbnail Strip */}
            {images.length > 1 && (
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePreviewImageIndex(idx)}
                    className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePreviewImageIndex === idx
                        ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-105"
                        : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Card Content Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-black text-slate-900">
                    {bedId || "SUITE-CODE"}
                  </h3>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Tariff</span>
                    <span className="text-lg font-black text-emerald-700">
                      ৳ {Number(price || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500"> /day</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-800 mt-1">
                  {title || `${category} Suite ${bedId || "Code"}`}
                </h4>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Building size={13} className="text-slate-400 shrink-0" />
                  {ward} • {floor} • {roomNumber}
                </p>
              </div>

              {/* Physical Spec Badges */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <BedDouble size={13} className="text-slate-500" />
                  {bedCount} Clinical Bed{bedCount > 1 ? "s" : ""}
                </span>
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Users size={13} className="text-slate-500" />
                  Max {maxOccupants} Occupant{maxOccupants > 1 ? "s" : ""}
                </span>
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Bath size={13} className="text-slate-500" />
                  {bathroomType === "attached"
                    ? "Private En-Suite Bath"
                    : bathroomType === "shared"
                    ? "Shared Washroom"
                    : "Ward Standard"}
                </span>
              </div>

              {/* Description Preview */}
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {description || "No description provided."}
              </p>

              {/* Features Chips */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Included Amenities ({features.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {features.slice(0, 5).map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md"
                    >
                      ✓ {f}
                    </span>
                  ))}
                  {features.length > 5 && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      +{features.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Simulated Action */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled
                  className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 opacity-90 cursor-not-allowed shadow-xs"
                >
                  <Sparkles size={14} />
                  Book / Admit Patient (Simulated Button)
                </button>
              </div>
            </div>
          </div>

          {/* Revenue Projection Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              Singapore HMS Financial Yield
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-300">7-Day Occupancy Revenue:</span>
              <span className="text-lg font-black text-white">
                ৳ {(Number(price || 0) * 7).toLocaleString()}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-700/60 pt-2 text-xs text-slate-400">
              <span>30-Day Monthly Yield:</span>
              <span className="font-bold text-emerald-300">
                ৳ {(Number(price || 0) * 30).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
