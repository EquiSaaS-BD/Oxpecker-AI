"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, Bookmark, Phone, BadgeCheck, MapPin, Clock, ShieldCheck, 
  Stethoscope, Bed, LayoutGrid, Car, Wifi, Coffee, Star, 
  ChevronRight, X, Building2, Pill, ActivitySquare, AlertCircle, Search, ChevronLeft
} from "lucide-react";

// --- MOCK DATA ---
const hospital = {
  id: "hosp_01",
  name: "Labaid Specialized Hospital",
  type: "Multispecialty Hospital",
  city: "Dhaka, Bangladesh",
  status: "Open 24/7",
  verified: true,
  coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1440&h=400&fit=crop",
  logo: "/images/shustota-icon.png",
  established: "2004",
  ownership: "Private",
  totalDoctors: "150+",
  totalDepartments: "24",
  capacity: "500 Beds",
  icu: "Available (40 Beds)",
  emergency: "24/7 Dedicated",
  opdHours: "08:00 AM - 10:00 PM",
  rating: 4.8,
  mission: "To provide world-class healthcare services with compassion, utilizing advanced technology and expert professionals.",
  vision: "To be the leading healthcare institution in South Asia, recognized for excellence in patient care and medical innovation.",
  specialties: ["Cardiology", "Neurology", "Oncology", "Orthopedics"],
  insurance: ["MetLife", "GreenDelta", "Pragati Life"],
  
  facilities: [
    { icon: Car, name: "Parking" },
    { icon: Pill, name: "Pharmacy" },
    { icon: ActivitySquare, name: "Laboratory" },
    { icon: Bed, name: "ICU" },
    { icon: AlertCircle, name: "Emergency" },
    { icon: Car, name: "Ambulance" },
    { icon: Wifi, name: "WiFi" },
    { icon: Coffee, name: "Cafeteria" },
  ],
  
  beds: [
    { 
      id: "bed_gen_01", type: "General Ward (Male)", price: 2000, available: 12, category: "Economy",
      floor: "2nd Floor", roomNo: "201 - 210",
      features: ["Shared Room", "AC", "Common Washroom", "Standard Care"],
      images: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop"]
    },
    { 
      id: "bed_vip_01", type: "VIP Cabin", price: 5000, available: 4, category: "Premium",
      floor: "4th Floor", roomNo: "401",
      features: ["Private Room", "AC", "Attached Bath", "TV & Sofa", "Premium Care"],
      images: ["https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop"]
    },
    { 
      id: "bed_icu_01", type: "ICU (Intensive Care)", price: 8000, available: 2, category: "Critical",
      floor: "3rd Floor", roomNo: "ICU Unit 1",
      features: ["Life Support", "1-to-1 Nursing", "Patient Monitor", "Ventilator"],
      images: ["https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop"]
    },
    { 
      id: "bed_deluxe_01", type: "Deluxe Cabin", price: 6500, available: 6, category: "Premium",
      floor: "5th Floor", roomNo: "505",
      features: ["Large Private Room", "AC", "Attached Bath", "Patient Monitor", "Attendant Bed"],
      images: ["https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&h=400&fit=crop"]
    },
  ],
  
  departments: [
    "Cardiology", "Neurology", "Orthopedics", "Dermatology", "ENT", 
    "Dentistry", "Pediatrics", "Psychiatry", "Surgery", "Gynecology"
  ],
  
  doctors: [
    { id: "doc_01", name: "Dr. Farzana Alam", spec: "Gynecologist", exp: "15 Years", fee: 1000, img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop" },
    { id: "doc_02", name: "Dr. Shafiqul Islam", spec: "Cardiologist", exp: "20 Years", fee: 1500, img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop" },
    { id: "doc_03", name: "Dr. Ahmed Reza", spec: "Neurologist", exp: "12 Years", fee: 1200, img: "https://i.pravatar.cc/300?u=doc3" },
  ],
  
  gallery: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop",
  ]
};

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function HospitalProfile() {
  const [galleryOpen, setGalleryOpen] = useState<number | null>(null);
  
  // Bed Filters & Pagination State
  const [bedCategory, setBedCategory] = useState("All");
  const [bedSearch, setBedSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState("All Floors");
  const [priceSort, setPriceSort] = useState("none"); 
  const [currentPage, setCurrentPage] = useState(1);
  const bedsPerPage = 3;

  const filteredBeds = hospital.beds
    .filter(b => {
      const matchesCat = bedCategory === "All" || b.category === bedCategory;
      const matchesSearch = b.type.toLowerCase().includes(bedSearch.toLowerCase()) || 
                            b.roomNo.toLowerCase().includes(bedSearch.toLowerCase());
      const matchesFloor = floorFilter === "All Floors" || b.floor === floorFilter;
      return matchesCat && matchesSearch && matchesFloor;
    })
    .sort((a, b) => {
      if (priceSort === "asc") return a.price - b.price;
      if (priceSort === "desc") return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filteredBeds.length / bedsPerPage);
  const paginatedBeds = filteredBeds.slice((currentPage - 1) * bedsPerPage, currentPage * bedsPerPage);
  const floors = ["All Floors", ...Array.from(new Set(hospital.beds.map(b => b.floor)))];

  return (
    <div className="h-full overflow-y-auto bg-slate-50 font-sans pb-24 relative scroll-smooth">
      
      {/* 1. Header & Cover Image (Cleaner design) */}
      <div className="relative w-full h-[280px] md:h-[340px] bg-slate-900">
        <Image src={hospital.coverImage} alt={hospital.name} fill className="object-cover opacity-70" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 flex items-end justify-between max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white p-2 shrink-0 shadow-lg relative overflow-hidden"
            >
              <Image src={hospital.logo} alt="Logo" fill sizes="112px" className="object-contain p-2" />
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-white mb-1 md:mb-2"
            >
              <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-2 tracking-tight">
                {hospital.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-slate-200 font-medium">
                <span className="flex items-center gap-1.5"><MapPin size={16} /> {hospital.city}</span>
                <span className="hidden md:inline w-1 h-1 bg-white/50 rounded-full" />
                <span className="flex items-center gap-1.5 text-blue-300"><Clock size={16} /> {hospital.status}</span>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="hidden md:flex items-center gap-3 mb-2"
          >
            <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors">
              <Share2 size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-white shadow-md transition-colors">
              <Phone size={20} />
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-12">
        
        {/* 2. Quick Statistics */}
        <motion.div 
          variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Star, label: "Rating", value: `${hospital.rating}` },
            { icon: Stethoscope, label: "Doctors", value: hospital.totalDoctors },
            { icon: Bed, label: "Beds", value: hospital.capacity },
            { icon: LayoutGrid, label: "Depts", value: hospital.totalDepartments },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center mb-2">
                <stat.icon size={20} className="text-primary" />
              </div>
              <div className="text-xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. Available Beds & Cabins (Lighter UI) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-white rounded-[24px] shadow-sm p-6 md:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Available Beds</h2>
              <p className="text-sm text-slate-500">Find a comfortable room for your stay.</p>
            </div>

            {/* Simple Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-[220px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search rooms..." 
                  value={bedSearch}
                  onChange={(e) => {setBedSearch(e.target.value); setCurrentPage(1);}}
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
              
              <select 
                value={floorFilter}
                onChange={(e) => {setFloorFilter(e.target.value); setCurrentPage(1);}}
                className="h-10 px-3 bg-slate-50 rounded-xl text-sm text-slate-700 outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
              >
                {floors.map(f => <option key={f} value={f}>{f}</option>)}
              </select>

              <select 
                value={priceSort}
                onChange={(e) => {setPriceSort(e.target.value); setCurrentPage(1);}}
                className="h-10 px-3 bg-slate-50 rounded-xl text-sm text-slate-700 outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
              >
                <option value="none">Sort Price</option>
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {["All", "Economy", "Premium", "Critical"].map(cat => (
              <button 
                key={cat} 
                onClick={() => {setBedCategory(cat); setCurrentPage(1);}}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${bedCategory === cat ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBeds.map((bed, i) => (
              <motion.div 
                key={i} variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm flex flex-col group hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="w-full h-[180px] bg-slate-100 relative overflow-hidden">
                  <Image src={bed.images[0]} alt={bed.type} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-slate-700">
                    {bed.category}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{bed.type}</h3>
                    <div className="bg-primary/5 text-primary px-2 py-1 rounded text-xs font-bold">
                      {bed.available} Left
                    </div>
                  </div>
                  
                  <div className="text-xs font-medium text-slate-500 mb-3 flex items-center gap-2">
                    <span>{bed.floor}</span> • <span>Room {bed.roomNo}</span>
                  </div>

                  <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                    {bed.features.join(" • ")}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Per night</div>
                      <div className="text-lg font-bold text-slate-800">৳{bed.price}</div>
                    </div>
                    
                    <Link href={`/hospitals/${hospital.id}/beds/${bed.id}`} className="px-5 py-2 bg-[#22C55E] hover:bg-[#6DDA6E] text-white rounded-xl text-sm font-semibold transition-colors">
                      Book Room
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredBeds.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                <Bed size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No beds found.</p>
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-full text-sm font-bold ${currentPage === idx + 1 ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </motion.div>

        {/* 4. Details Section (Two Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-4">About Hospital</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{hospital.mission}</p>
            
            <div className="space-y-4">
              {[
                { label: "Established", value: hospital.established },
                { label: "Ownership", value: hospital.ownership },
                { label: "Emergency", value: hospital.emergency },
                { label: "OPD Hours", value: hospital.opdHours },
              ].map((info, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500">{info.label}</span>
                  <span className="text-sm font-bold text-slate-800">{info.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm"
          >
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {hospital.specialties.map(spec => (
                  <span key={spec} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium">{spec}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Insurance Accepted</h3>
              <div className="flex flex-wrap gap-2">
                {hospital.insurance.map(ins => (
                  <span key={ins} className="bg-primary/5 text-primary px-3 py-1.5 rounded-lg text-sm font-bold">{ins}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 5. Facilities Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Facilities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {hospital.facilities.map((fac, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow shadow-sm">
                <fac.icon size={24} className="text-primary mb-2" />
                <span className="text-xs font-semibold text-slate-600">{fac.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 5.5 Collaborating Doctors */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Collaborating Doctors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospital.doctors.map((doc, i) => (
              <Link key={i} href={`/doctors/${doc.id}`} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 group cursor-pointer hover:shadow-md transition-all">
                <div className="w-16 h-16 rounded-full relative overflow-hidden bg-slate-100 shrink-0">
                  <Image src={doc.img} alt={doc.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-primary transition-colors">{doc.name}</h3>
                  <p className="text-[13px] text-slate-500 font-medium mb-1">{doc.spec}</p>
                  <p className="text-[12px] font-bold text-slate-400">{doc.exp}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* 6. Gallery */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Gallery</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {hospital.gallery.map((img, i) => (
              <div key={i} className="relative w-[240px] h-[160px] rounded-2xl overflow-hidden shrink-0 cursor-pointer" onClick={() => setGalleryOpen(i)}>
                <Image src={img} alt={`Gallery ${i}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Fullscreen Gallery */}
      <AnimatePresence>
        {galleryOpen !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <button onClick={() => setGalleryOpen(null)} className="absolute top-6 right-6 text-white p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={28} />
            </button>
            <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden">
              <Image src={hospital.gallery[galleryOpen]} alt="Gallery Full" fill className="object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
