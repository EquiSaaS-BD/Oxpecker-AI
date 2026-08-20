"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Edit2, Plus, X, Trash2, MapPin, Phone, Mail, Building, Clock } from "lucide-react";
import Image from "next/image";

// Sample Gig Data
const initialGigs = [
  {
    id: 1,
    title: "Premium ICU Package (24/7 Monitoring)",
    price: "৳ 15,000 / day",
    image: "/images/hospital-placeholder.jpg",
    features: ["Dedicated Nurse", "Oxygen Support", "Cardiac Monitor"],
  },
  {
    id: 2,
    title: "Maternity & Delivery Package (Normal)",
    price: "৳ 25,000 Total",
    image: "/images/hospital-placeholder.jpg",
    features: ["2 Days Cabin Stay", "Baby Care", "Medicine Included"],
  }
];

export default function HospitalProfilePage() {
  const [gigs, setGigs] = useState(initialGigs);
  const [isGigModalOpen, setIsGigModalOpen] = useState(false);
  const [newGig, setNewGig] = useState({ title: "", price: "", features: "" });

  const handleCreateGig = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresList = newGig.features.split(",").map(f => f.trim()).filter(Boolean);
    const created = {
      id: Date.now(),
      title: newGig.title,
      price: newGig.price,
      image: "/images/hospital-placeholder.jpg",
      features: featuresList.length > 0 ? featuresList : ["Standard Features"],
    };
    setGigs([...gigs, created]);
    setIsGigModalOpen(false);
    setNewGig({ title: "", price: "", features: "" });
  };

  const deleteGig = (id: number) => {
    setGigs(gigs.filter((g) => g.id !== id));
  };

  return (
    <div className="w-full space-y-8 pb-10">
      {/* 1. Profile Header Section */}
      <div className="bg-white rounded-[20px] border border-slate-200/60 shadow-sm overflow-hidden relative">
        {/* Cover Photo */}
        <div className="relative w-full h-[240px] bg-slate-200 group">
          <Image
            src="/images/hospital-placeholder.jpg" // Placeholders for now
            alt="Cover"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          <button className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 h-9 px-4 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all">
            <Camera size={16} />
            Edit Cover
          </button>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6 pt-16 relative">
          {/* Profile Picture (Absolute Positioning) */}
          <div className="absolute -top-[60px] left-8 group cursor-pointer">
            <div className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-md bg-white relative overflow-hidden">
              <Image
                src="/images/Oxpecker_Full.png"
                alt="Profile"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
            <div>
              <h1 className="text-[24px] font-bold text-slate-800">Oxpecker General Hospital</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Building size={16} className="text-slate-400" />
                  Multi-Specialty Hospital
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate-400" />
                  Dhanmondi, Dhaka
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} className="text-slate-400" />
                  24/7 Open
                </span>
              </div>
            </div>
            
            <button className="h-[44px] px-5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-medium text-[14px] flex items-center gap-2 transition-colors">
              <Edit2 size={16} />
              Edit Profile Info
            </button>
          </div>
        </div>
      </div>

      {/* 2. Gig Creation Section (Services & Packages) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-[20px] font-bold text-slate-800">Hospital Services & Packages</h2>
          <p className="text-[14px] text-slate-500 mt-1">
            Create attractive service packages (Gigs) that patients can book directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Create New Gig Button (Dashed Box) */}
          <button
            onClick={() => setIsGigModalOpen(true)}
            className="w-full h-[380px] rounded-[16px] border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
              <Plus size={24} className="text-slate-500 group-hover:text-emerald-600" />
            </div>
            <span className="text-[16px] font-bold text-slate-600 group-hover:text-emerald-700">
              Create New Package
            </span>
          </button>

          {/* Render Existing Gigs */}
          {gigs.map((gig) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-[380px] rounded-[16px] border border-slate-200 bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
            >
              <div className="w-full h-[180px] bg-slate-100 relative">
                <Image src={gig.image} alt={gig.title} fill className="object-cover" />
                <button
                  onClick={() => deleteGig(gig.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-500 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-[16px] font-bold text-slate-800 line-clamp-2 mb-2 leading-[24px]">
                  {gig.title}
                </h3>
                
                <ul className="space-y-1 mb-auto">
                  {gig.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="text-[13px] text-slate-500 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {feature}
                    </li>
                  ))}
                  {gig.features.length > 3 && (
                    <li className="text-[12px] text-slate-400 italic">+{gig.features.length - 3} more</li>
                  )}
                </ul>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">Starting At</span>
                  <span className="text-[18px] font-bold text-emerald-600">{gig.price}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Gig Editor Modal */}
      <AnimatePresence>
        {isGigModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGigModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] max-h-[90vh] overflow-y-auto bg-white rounded-[20px] shadow-2xl z-50 p-6 custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-bold text-slate-800">Create New Package (Gig)</h3>
                <button
                  onClick={() => setIsGigModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateGig} className="space-y-5">
                <div>
                  <label className="block text-[14px] font-medium text-slate-700 mb-1">Package Title</label>
                  <input
                    required
                    type="text"
                    value={newGig.title}
                    onChange={(e) => setNewGig({ ...newGig, title: e.target.value })}
                    placeholder="e.g. Executive Health Checkup"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-[15px]"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-slate-700 mb-1">Price (৳)</label>
                  <input
                    required
                    type="text"
                    value={newGig.price}
                    onChange={(e) => setNewGig({ ...newGig, price: e.target.value })}
                    placeholder="e.g. ৳ 5,000"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-[15px]"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-slate-700 mb-1">Features (Comma separated)</label>
                  <textarea
                    required
                    rows={3}
                    value={newGig.features}
                    onChange={(e) => setNewGig({ ...newGig, features: e.target.value })}
                    placeholder="CBC Test, ECG, Doctor Consultation, Breakfast Included"
                    className="w-full p-4 rounded-[12px] border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-[15px] resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsGigModalOpen(false)}
                    className="h-[44px] px-6 rounded-[12px] text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-[44px] px-6 rounded-[12px] bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm"
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
