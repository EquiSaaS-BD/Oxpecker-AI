"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Edit2,
  Plus,
  X,
  Trash2,
  MapPin,
  Phone,
  Building,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Save,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

// Sample Packages Data
const initialPackages = [
  {
    id: 1,
    title: "Premium ICU & Critical Care Package (24/7)",
    price: "৳ 15,000 / day",
    category: "Critical Care",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
    features: ["Dedicated 1:1 Nursing", "Continuous Oxygen & Ventilator Support", "Cardiac & Arterial Line Monitoring", "Consultant Round 2x Daily"],
  },
  {
    id: 2,
    title: "Maternity & Safe Delivery Package (Comprehensive)",
    price: "৳ 28,000 Total",
    category: "Maternity",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop",
    features: ["2 Days Deluxe Cabin Stay", "Neonatal Pediatric Screening", "Standard Postnatal Medications", "Gynecologist & Anesthetist Team"],
  },
  {
    id: 3,
    title: "Executive Cardiac & Metabolic Health Screening",
    price: "৳ 7,500 Total",
    category: "Diagnostics",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
    features: ["2D Echocardiogram & ECG", "HbA1c & Fasting Lipid Profile", "Chest X-Ray & CBC", "Senior Cardiologist Consultation"],
  }
];

const coverPresets = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=400&fit=crop"
];

export default function HospitalProfilePage() {
  const { user } = useAuth();
  
  // Hospital Facility State
  const [facility, setFacility] = useState({
    name: user?.hospital_name || user?.name || "Oxpecker General Hospital & Diagnostic Centre",
    type: "Tertiary Multi-Specialty Hospital",
    address: user?.address || "House 42, Road 9/A, Dhanmondi, Dhaka 1209",
    phone: "+880 1700-000000",
    emergencyPhone: "10678 / +880 1999-999999",
    hours: "24 Hours Open (Emergency & ICU)",
    dghsReg: "DGHS-REG-2024-9842",
    about: "A premier digital-first healthcare institution committed to delivering international standards of clinical excellence, cutting-edge surgical and critical care, and compassionate patient services."
  });

  const [coverPhoto, setCoverPhoto] = useState(coverPresets[0]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditCoverOpen, setIsEditCoverOpen] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState("");

  // Packages State
  const [packages, setPackages] = useState(initialPackages);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: "",
    category: "Diagnostics",
    price: "",
    features: "",
  });

  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const triggerBanner = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3000);
  };

  const handleUpdateFacility = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditProfileOpen(false);
    triggerBanner("Hospital facility profile updated successfully!");
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresList = newPackage.features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const created = {
      id: Date.now(),
      title: newPackage.title,
      category: newPackage.category || "General",
      price: newPackage.price,
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop",
      features: featuresList.length > 0 ? featuresList : ["Consultation Included", "Standard Report"],
    };

    setPackages([created, ...packages]);
    setIsPackageModalOpen(false);
    setNewPackage({ title: "", category: "Diagnostics", price: "", features: "" });
    triggerBanner("New healthcare package published!");
  };

  const deletePackage = (id: number) => {
    if (confirm("Are you sure you want to remove this service package?")) {
      setPackages(packages.filter((p) => p.id !== id));
      triggerBanner("Package removed successfully.");
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {savedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold"
          >
            <CheckCircle2 size={18} />
            <span>{savedBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Profile Header Section */}
      <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-xs overflow-hidden relative">
        {/* Cover Photo */}
        <div className="relative w-full h-[250px] bg-slate-900 group">
          <Image
            src={coverPhoto}
            alt="Hospital Facility Cover"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-102"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <button
            onClick={() => setIsEditCoverOpen(true)}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 h-9 px-4 rounded-xl flex items-center gap-2 text-xs font-bold shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95"
          >
            <Camera size={15} className="text-emerald-600" />
            Change Cover
          </button>

          <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Verified DGHS Facility: {facility.dghsReg}</span>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 sm:px-8 pb-7 pt-16 relative">
          {/* Profile Logo */}
          <div className="absolute -top-[55px] left-6 sm:left-8 group">
            <div className="w-[110px] h-[110px] rounded-2xl border-4 border-white shadow-xl bg-white relative overflow-hidden flex items-center justify-center p-2 ring-1 ring-slate-100">
              <Image
                src="/images/Oxpecker_Full.png"
                alt="Hospital Logo"
                fill
                className="object-contain p-2"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mt-1">
            <div className="space-y-2.5 max-w-3xl">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
                    {facility.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active Facility
                  </span>
                </div>
                <p className="text-sm font-medium text-emerald-700 mt-1 flex items-center gap-1.5">
                  <Building size={15} />
                  {facility.type}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-rose-500 shrink-0" />
                  {facility.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} className="text-blue-500 shrink-0" />
                  {facility.hours}
                </span>
                <span className="flex items-center gap-1.5">
                  <PhoneCall size={16} className="text-emerald-600 shrink-0" />
                  Hotline: <strong className="text-slate-800">{facility.emergencyPhone}</strong>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 line-clamp-2">
                {facility.about}
              </p>
            </div>

            {/* Edit Button */}
            <div className="shrink-0 pt-2 lg:pt-0">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="h-[42px] px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-md active:scale-95"
              >
                <Edit2 size={16} />
                Edit Facility Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Facility Packages & Clinical Services Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Hospital Packages & Clinical Services
              </h2>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                {packages.length} Active
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Curated medical packages and inpatient services available for patient booking.
            </p>
          </div>

          <button
            onClick={() => setIsPackageModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-md active:scale-95 self-start sm:self-auto"
          >
            <Plus size={18} />
            <span>Add New Package</span>
          </button>
        </div>

        {/* Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Create New Package Quick Card */}
          <button
            onClick={() => setIsPackageModalOpen(true)}
            className="w-full min-h-[360px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center gap-3 group cursor-pointer p-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
              <Plus size={26} className="text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-base font-bold text-slate-800 group-hover:text-emerald-700">
              Create New Package
            </span>
            <p className="text-xs text-slate-500 text-center max-w-xs">
              Add health checkups, surgical bundles, or ICU admission offerings.
            </p>
          </button>

          {/* Existing Packages */}
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full min-h-[360px] rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
            >
              <div className="w-full h-[180px] bg-slate-100 relative overflow-hidden">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  {pkg.category}
                </span>

                <button
                  onClick={() => deletePackage(pkg.id)}
                  title="Remove package"
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-xs text-emerald-300 font-semibold tracking-wide uppercase">Rate</span>
                  <p className="text-xl font-extrabold text-white tracking-tight">{pkg.price}</p>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug mb-3">
                    {pkg.title}
                  </h3>

                  <ul className="space-y-1.5">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                    Instant Booking Eligible
                  </span>
                  <button
                    onClick={() => triggerBanner(`Package "${pkg.title}" status is active.`)}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Edit Facility Profile Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditProfileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50 p-6 custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Facility Profile Info</h3>
                  <p className="text-xs text-slate-500">Update your hospital legal details, hotline, and operating hours</p>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateFacility} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facility / Hospital Legal Name</label>
                  <input
                    required
                    type="text"
                    value={facility.name}
                    onChange={(e) => setFacility({ ...facility, name: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facility Category / Type</label>
                    <input
                      required
                      type="text"
                      value={facility.type}
                      onChange={(e) => setFacility({ ...facility, type: e.target.value })}
                      placeholder="e.g. Tertiary Hospital / Specialized Clinic"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">DGHS Registration No.</label>
                    <input
                      required
                      type="text"
                      value={facility.dghsReg}
                      onChange={(e) => setFacility({ ...facility, dghsReg: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Hotline (24/7)</label>
                    <input
                      required
                      type="text"
                      value={facility.emergencyPhone}
                      onChange={(e) => setFacility({ ...facility, emergencyPhone: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Operating Hours</label>
                    <input
                      required
                      type="text"
                      value={facility.hours}
                      onChange={(e) => setFacility({ ...facility, hours: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address & Location</label>
                  <input
                    required
                    type="text"
                    value={facility.address}
                    onChange={(e) => setFacility({ ...facility, address: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">About Hospital</label>
                  <textarea
                    rows={3}
                    value={facility.about}
                    onChange={(e) => setFacility({ ...facility, about: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 resize-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="h-10 px-4 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Change Cover Modal */}
      <AnimatePresence>
        {isEditCoverOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditCoverOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Select Facility Cover Image</h3>
                <button
                  onClick={() => setIsEditCoverOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-xs text-slate-500">Choose from hospital presets or enter an image URL:</p>
                <div className="grid grid-cols-2 gap-3">
                  {coverPresets.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCoverPhoto(imgUrl);
                        setIsEditCoverOpen(false);
                        triggerBanner("Cover photo updated!");
                      }}
                      className={`relative h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        coverPhoto === imgUrl ? "border-emerald-600 ring-2 ring-emerald-200" : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <Image src={imgUrl} alt={`Preset ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Or Custom Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={coverUrlInput}
                      onChange={(e) => setCoverUrlInput(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (coverUrlInput) {
                          setCoverPhoto(coverUrlInput);
                          setIsEditCoverOpen(false);
                          setCoverUrlInput("");
                          triggerBanner("Custom cover image updated!");
                        }
                      }}
                      className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. Create Package Modal */}
      <AnimatePresence>
        {isPackageModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPackageModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[560px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50 p-6 custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create Clinical Service Package</h3>
                  <p className="text-xs text-slate-500">Provide package details, transparent fees, and key inclusions</p>
                </div>
                <button
                  onClick={() => setIsPackageModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreatePackage} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Package Title</label>
                  <input
                    required
                    type="text"
                    value={newPackage.title}
                    onChange={(e) => setNewPackage({ ...newPackage, title: e.target.value })}
                    placeholder="e.g. Comprehensive Cardiac Screening & 2D Echo"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={newPackage.category}
                      onChange={(e) => setNewPackage({ ...newPackage, category: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 bg-white"
                    >
                      <option value="Diagnostics">Diagnostics & Health Checkup</option>
                      <option value="Critical Care">Critical Care & ICU</option>
                      <option value="Maternity">Maternity & Neonatal</option>
                      <option value="Surgical">Surgical Packages</option>
                      <option value="Rehabilitation">Physiotherapy & Rehab</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price / Fee (BDT)</label>
                    <input
                      required
                      type="text"
                      value={newPackage.price}
                      onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                      placeholder="e.g. ৳ 8,500 Total or ৳ 12,000 / day"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Features / Inclusions (Comma separated)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newPackage.features}
                    onChange={(e) => setNewPackage({ ...newPackage, features: e.target.value })}
                    placeholder="e.g. ECG, Fasting Glucose, Lipid Profile, Doctor Consultation, Report Delivery"
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 resize-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Separate each feature with a comma.</p>
                </div>

                <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPackageModalOpen(false)}
                    className="h-10 px-4 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Publish Package
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
