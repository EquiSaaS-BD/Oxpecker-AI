"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  UserCheck,
  ExternalLink,
  Receipt,
  CalendarDays,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import type { BedGig, BedCategory, BedStatus, BedBooking } from "@/types/hospital-hms";
import {
  getHospitalBeds,
  saveHospitalBed,
  deleteHospitalBed,
  updateBedStatus,
  getHospitalBookings,
} from "@/lib/hospital-hms";
import { CustomSelect, type CustomSelectOption } from "@/components/hospital/CustomSelect";

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
  { value: "Vacant", label: "Vacant (Available)", dotColor: "bg-emerald-500" },
  { value: "Occupied", label: "Occupied (Admitted)", dotColor: "bg-blue-500" },
  { value: "Cleaning", label: "Cleaning Cycle", dotColor: "bg-cyan-500" },
  { value: "Maintenance", label: "Maintenance", dotColor: "bg-rose-500" },
];

const BATHROOM_OPTIONS: CustomSelectOption<"attached" | "shared" | "none">[] = [
  { value: "attached", label: "Attached" },
  { value: "shared", label: "Shared" },
  { value: "none", label: "None" },
];

export default function BedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bedIdParam = (params?.id as string) || "";

  const [bed, setBed] = useState<BedGig | null>(null);
  const [bedBookings, setBedBookings] = useState<BedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Editable Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<BedCategory>("General Ward");
  const [ward, setWard] = useState("");
  const [floor, setFloor] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [bathroomType, setBathroomType] = useState<"attached" | "shared" | "none">("attached");
  const [bedCount, setBedCount] = useState<number>(1);
  const [maxOccupants, setMaxOccupants] = useState<number>(1);
  const [price, setPrice] = useState<number>(3000);
  const [status, setStatus] = useState<BedStatus>("Vacant");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [customFeatureInput, setCustomFeatureInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load Bed and Bookings
  useEffect(() => {
    const allBeds = getHospitalBeds();
    const target = allBeds.find(
      (b) => b.id.toLowerCase() === decodeURIComponent(bedIdParam).toLowerCase()
    );

    if (target) {
      setBed(target);
      setTitle(target.title);
      setCategory(target.category);
      setWard(target.ward);
      setFloor(target.floor || "Level 2");
      setRoomNumber(target.roomNumber || target.id);
      setBathroomType(target.bathroomType || "attached");
      setBedCount(target.bedCount || 1);
      setMaxOccupants(target.maxOccupants || 1);
      setPrice(target.price);
      setStatus(target.status);
      setDescription(target.description);
      const initialImgs =
        Array.isArray(target.images) && target.images.length > 0
          ? target.images
          : target.image
          ? [target.image]
          : [];
      setImages(initialImgs);
      setFeatures(target.features || []);

      // Load related bookings
      const allBookings = getHospitalBookings();
      const related = allBookings.filter(
        (b) => b.bed_id.toLowerCase() === target.id.toLowerCase()
      );
      setBedBookings(related);
    }
    setIsLoading(false);
  }, [bedIdParam]);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!bed) {
    return (
      <div className="w-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Bed Suite Not Found</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          The requested Bed ID <span className="font-bold text-slate-800 font-mono">"{bedIdParam}"</span> was not found in the hospital inventory.
        </p>
        <Link
          href="/hospital/dashboard/beds"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors"
        >
          <ArrowLeft size={16} /> Return to Bed Console
        </Link>
      </div>
    );
  }

  // Multi-image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 6) {
      toast.error("Maximum 6 images allowed per suite");
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

  const removeImage = (index: number) => {
    if (images.length === 1) {
      toast.error("At least one image is required");
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (activePhotoIndex >= index && activePhotoIndex > 0) {
      setActivePhotoIndex((prev) => prev - 1);
    }
  };

  const setCoverImage = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    setImages([target, ...remaining]);
    setActivePhotoIndex(0);
    toast.success("Cover image updated");
  };

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

  // Status Quick Update
  const handleQuickStatusChange = (newStatus: BedStatus) => {
    const updatedBeds = updateBedStatus(bed.id, newStatus);
    const updated = updatedBeds.find((b) => b.id.toLowerCase() === bed.id.toLowerCase());
    if (updated) {
      setBed(updated);
      setStatus(updated.status);
    }
    toast.success(`Bed ${bed.id} status updated to ${newStatus}`);
  };

  // Save changes
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedBed: BedGig = {
      ...bed,
      title: title.trim() || bed.title,
      category,
      ward: ward.trim(),
      floor: floor.trim(),
      roomNumber: roomNumber.trim(),
      price: Number(price) || 2500,
      priceDisplay: `৳ ${Number(price || 0).toLocaleString()} / day`,
      image: images[0] || bed.image,
      images: images,
      description: description.trim(),
      features: features,
      bathroomType,
      bedCount: Number(bedCount) || 1,
      maxOccupants: Number(maxOccupants) || 1,
      status,
    };

    saveHospitalBed(updatedBed);
    setBed(updatedBed);
    setIsSaving(false);
    toast.success(`Bed ${bed.id} changes saved successfully!`);
  };

  // Delete Bed
  const handleDeleteBed = () => {
    if (confirm(`Are you sure you want to remove bed ${bed.id} from hospital inventory?`)) {
      deleteHospitalBed(bed.id);
      toast.success(`Bed ${bed.id} deleted from hospital inventory`);
      router.push("/hospital/dashboard/beds");
    }
  };

  const isOccupied = bed.status === "Occupied";
  const isVacant = bed.status === "Vacant";
  const isCleaning = bed.status === "Cleaning";

  return (
    <div className="w-full space-y-6 pb-20">
      <Toaster position="top-right" richColors />

      {/* Top Header & Breadcrumb Bar */}
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
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bed Console</span>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-xs font-bold text-slate-600">{bed.category}</span>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-xs font-bold text-emerald-600">{bed.id}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {bed.id} • {bed.title}
              </h1>
              <span
                className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                  isVacant
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isOccupied
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : isCleaning
                    ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                ● {bed.status}
              </span>
            </div>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {isVacant && (
            <Link
              href={`/hospital/dashboard/patients?bed=${encodeURIComponent(bed.id)}`}
              className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <UserCheck size={14} /> Admit Patient
            </Link>
          )}

          {isCleaning && (
            <button
              onClick={() => handleQuickStatusChange("Vacant")}
              className="h-11 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 size={14} /> Mark Sanitized & Ready
            </button>
          )}

          <button
            onClick={handleDeleteBed}
            className="h-11 px-3.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Delete Bed"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Occupied Inpatient Banner if Active */}
      {isOccupied && bed.currentPatientName && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-500/10 p-5 rounded-2xl border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl">
              {bed.currentPatientName.charAt(0)}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block">
                Active Inpatient Occupant
              </span>
              <h3 className="text-lg font-black text-slate-900">{bed.currentPatientName}</h3>
              <p className="text-xs text-slate-600">
                Admission ID: <span className="font-mono font-bold text-slate-800">{bed.currentPatientId || "ADM-ACTIVE"}</span> • Stay in progress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/hospital/dashboard/patients"
              className="h-10 px-4 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              Patient Dossier <ExternalLink size={12} />
            </Link>
            <Link
              href="/hospital/dashboard/billing"
              className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Receipt size={14} /> Running Bill & Settle
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid: Gallery & Details (Left 7 cols) + Form Settings (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Multi-Image Photo Viewer & Specs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Gallery */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="relative aspect-video w-full bg-slate-950">
              {images.length > 0 ? (
                <img
                  src={images[activePhotoIndex] || images[0]}
                  alt={bed.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <BedDouble size={48} />
                  <span className="text-xs mt-2">No Room Photos</span>
                </div>
              )}

              {/* Status and Rate badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md shadow-md text-white ${
                    isVacant
                      ? "bg-emerald-600/95"
                      : isOccupied
                      ? "bg-amber-600/95"
                      : isCleaning
                      ? "bg-cyan-600/95"
                      : "bg-rose-600/95"
                  }`}
                >
                  ● {bed.status}
                </span>
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900/90 text-white backdrop-blur-md">
                  {category}
                </span>
              </div>

              <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Camera size={14} />
                {activePhotoIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhotoIndex(i)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activePhotoIndex === i
                      ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-105"
                      : "border-slate-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-black uppercase text-center py-0.5">
                      Cover
                    </span>
                  )}
                </button>
              ))}

              {/* Upload extra photo */}
              {images.length < 6 && (
                <label className="w-20 h-14 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-700 cursor-pointer shrink-0 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Plus size={16} />
                  <span className="text-[9px] font-bold mt-0.5">Add</span>
                </label>
              )}
            </div>
          </div>

          {/* Clinical Specifications Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Suite Amenities & Biomedical Fixtures</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suite Booking & Occupancy History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Bed Allocation & Booking History</h3>
                <p className="text-xs text-slate-500">Historical records of patients allocated to {bed.id}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {bedBookings.length} Recorded
              </span>
            </div>

            {bedBookings.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">No previous bookings recorded for this bed suite.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bedBookings.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{b.patient_name}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {b.booking_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {b.check_in_date} {b.check_out_date ? `to ${b.check_out_date}` : ""} • {b.duration_days} Days Stay
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 block">
                        ৳ {b.total_amount.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600">
                        {b.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full Bed Configuration Form (5 cols) */}
        <form onSubmit={handleSaveChanges} className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Bed Specifications & Edit</h3>
              <span className="text-xs font-bold text-emerald-600">Singapore HMS</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Display Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category
                </label>
                <CustomSelect
                  value={category}
                  onChange={(val) => setCategory(val)}
                  options={CATEGORY_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Current Status
                </label>
                <CustomSelect
                  value={status}
                  onChange={(val) => setStatus(val)}
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Ward / Department
              </label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Floor
                </label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Room No.
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Bath
                </label>
                <CustomSelect
                  value={bathroomType}
                  onChange={(val) => setBathroomType(val)}
                  options={BATHROOM_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Beds
                </label>
                <input
                  type="number"
                  min={1}
                  value={bedCount}
                  onChange={(e) => setBedCount(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Occupants
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxOccupants}
                  onChange={(e) => setMaxOccupants(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Daily Tariff Rate (৳)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-700">৳</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="flex-1 h-11 px-3 rounded-xl border border-emerald-300 text-base font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-400">/ day</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Clinical Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick Feature Toggles */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Amenities Checklist
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {AVAILABLE_FEATURES.map((feat) => {
                  const isChecked = features.includes(feat);
                  return (
                    <label
                      key={feat}
                      onClick={() => toggleFeature(feat)}
                      className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{feat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={18} />
                {isSaving ? "Saving..." : "Save Suite Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
