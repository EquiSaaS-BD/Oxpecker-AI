"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Pill, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, ChevronRight,
  Info, Activity, HeartPulse, Stethoscope, Droplet, Star, ArrowRightLeft,
  Share2, Heart, Search, FileText, Baby, PersonStanding, ShoppingCart, MessageSquareText, MapPin, Clock
} from "lucide-react";

// --- MOCK DATA ---
const medicine = {
  id: "med_1",
  name: "Napa Extend",
  genericName: "Paracetamol",
  type: "Tablet",
  strength: "665mg",
  manufacturer: "Beximco Pharmaceuticals Ltd.",
  price: 20, // Per strip
  packSize: "12 Tablets / Strip",
  availability: "In Stock",
  prescriptionRequired: false,
  image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop",
  category: "Analgesic & Antipyretic",
  dosageForm: "Extended Release Tablet",
  storage: "Store below 30°C",
  expiry: "24 Months",
  country: "Bangladesh",
  
  description: "Napa Extend is an extended-release formulation of Paracetamol designed to provide long-lasting pain relief. It works by blocking chemical messengers in the brain that tell us we have pain and reduces fever by affecting the chemical messengers in an area of the brain that regulates body temperature.",
  uses: ["Fever", "Headache", "Muscle Ache", "Arthritis Pain", "Toothache", "Back Pain"],
  benefits: ["Long lasting 8-hour relief", "Gentle on the stomach", "Fast-acting formulation"],
  
  dosage: {
    when: "After meal",
    frequency: "2 times a day (Every 8-12 hours)",
    duration: "As directed by physician",
    adults: "2 tablets per dose, maximum 6 tablets in 24 hours.",
    children: "Not recommended for children under 12 years."
  },
  
  sideEffects: [
    { symptom: "Nausea", level: "Low" },
    { symptom: "Stomach Pain", level: "Low" },
    { symptom: "Allergic Skin Reaction", level: "Low" },
    { symptom: "Liver Damage (if overdosed)", level: "High" }
  ],
  
  safety: {
    pregnancy: { status: "Safe", text: "Generally considered safe to use during pregnancy if prescribed by a doctor." },
    breastfeeding: { status: "Safe", text: "Safe to use. Passes into breast milk in very small amounts." },
    kidney: { status: "Consult Doctor", text: "Dose adjustment may be needed in severe kidney disease." },
    liver: { status: "Consult Doctor", text: "Use with extreme caution in severe liver disease." }
  },

  interactions: {
    food: [
      { interaction: "Alcohol", risk: "High", desc: "Taking paracetamol with alcohol increases the risk of severe liver damage." }
    ],
    drug: [
      { interaction: "Blood Thinners (Warfarin)", risk: "Moderate", desc: "May increase the risk of bleeding if taken regularly for a long time." },
      { interaction: "Ketoconazole", risk: "Low", desc: "May slightly alter the effectiveness of the medication." }
    ]
  },

  alternatives: [
    { name: "Ace XR", manufacturer: "Square Pharmaceuticals", price: 20.00, img: "https://images.unsplash.com/photo-1550572017-edb73cefb180?w=150&h=150&fit=crop" },
    { name: "Fast Plus", manufacturer: "ACME Laboratories", price: 18.50, img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=150&h=150&fit=crop" },
    { name: "Reset ER", manufacturer: "Incepta Pharmaceuticals", price: 19.00, img: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=150&h=150&fit=crop" }
  ],

  reviews: {
    average: 4.8,
    total: 324,
    items: [
      { name: "Rafiqul Islam", date: "12 Nov 2026", rating: 5, text: "Very effective for my back pain. Lasts longer than normal paracetamol." },
      { name: "Nusrat Jahan", date: "05 Nov 2026", rating: 4, text: "Good medicine, but pills are a bit large to swallow." }
    ]
  }
};


// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};


export default function MedicineDetailsPage() {
  const [activeInteractionTab, setActiveInteractionTab] = useState<"food" | "drug">("food");

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-[100px] md:pb-12">
      
      {/* Top Navigation */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 md:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Link href="/medicines" className="hover:text-primary transition-colors">Medicines</Link>
          <ChevronRight size={14} />
          <Link href="#" className="hover:text-primary transition-colors">{medicine.category}</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-bold truncate">{medicine.name}</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pt-8 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Section 1: Header Card */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} 
            className="bg-white rounded-[18px] p-6 shadow-sm border border-[#E5E7EB] flex flex-col sm:flex-row gap-6 md:h-[220px]"
          >
            <div className="w-[160px] h-[160px] rounded-[16px] bg-slate-50 border border-slate-100 shrink-0 relative overflow-hidden mx-auto sm:mx-0">
              <Image src={medicine.image} alt={medicine.name} fill className="object-cover p-2 hover:scale-110 transition-transform duration-300" />
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h1 className="text-[32px] font-bold text-slate-900 leading-none mb-2">{medicine.name}</h1>
                  <h2 className="text-[22px] font-medium text-slate-500 leading-none">{medicine.genericName}</h2>
                </div>
                <div className="hidden sm:flex gap-2">
                  <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-colors">
                    <Heart size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="h-[34px] px-3 bg-slate-100 text-slate-700 font-semibold text-sm rounded-lg flex items-center gap-1.5 border border-slate-200">
                  <Pill size={16} /> {medicine.type}
                </span>
                <span className="h-[34px] px-3 bg-primary/10 text-primary font-bold text-sm rounded-lg flex items-center border border-primary/20">
                  {medicine.strength}
                </span>
                {medicine.prescriptionRequired && (
                  <span className="h-[34px] px-3 bg-rose-50 text-rose-600 font-bold text-sm rounded-lg flex items-center gap-1.5 border border-rose-200">
                    <FileText size={16} /> Rx Required
                  </span>
                )}
              </div>

              <div className="mt-auto flex justify-between items-end">
                <div>
                  <p className="text-[18px] text-slate-600 font-medium">{medicine.manufacturer}</p>
                </div>
                <div className="lg:hidden text-right">
                  {/* Mobile price indicator */}
                  <div className="text-[24px] font-bold text-slate-900">৳{medicine.price}</div>
                  <div className="text-xs font-bold text-primary">{medicine.availability}</div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 12: AI Medicine Analysis (Highlight Card) */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} 
            className="bg-[#ecfdf5] rounded-[18px] p-7 border border-[#a7f3d0] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="text-[20px] font-bold text-[#065f46] mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-[#059669]" /> AI Analysis Summary
              </h2>
              <p className="text-[16px] text-[#064e3b] leading-relaxed mb-4">
                <strong>{medicine.name}</strong> is primarily used to treat fever and mild-to-moderate pain. Its extended-release formula makes it suitable for long-lasting relief (up to 8 hours), meaning you have to take fewer pills a day. 
              </p>
              <ul className="text-[15px] text-[#064e3b] font-medium space-y-2">
                <li className="flex gap-2 items-start"><CheckCircle2 size={18} className="text-[#10b981] mt-0.5 shrink-0" /> Best taken after food to avoid mild stomach upset.</li>
                <li className="flex gap-2 items-start"><ShieldAlert size={18} className="text-rose-500 mt-0.5 shrink-0" /> Do not combine with alcohol or other cold medicines containing Paracetamol to avoid liver toxicity.</li>
              </ul>
            </div>
          </motion.section>

          {/* Section 2: Quick Information */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { label: "Dosage Form", value: medicine.dosageForm, icon: Pill },
                { label: "Pack Size", value: medicine.packSize, icon: Activity },
                { label: "Storage", value: medicine.storage, icon: Info },
                { label: "Country", value: medicine.country, icon: MapPin },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-[18px] p-6 h-[100px] border border-[#E5E7EB] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 flex items-center gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{item.label}</p>
                    <p className="text-[14px] font-bold text-slate-800 line-clamp-1">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section 3: Overview */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} 
            className="bg-white rounded-[18px] p-6 shadow-sm border border-[#E5E7EB]"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Medicine Overview</h2>
            
            <div className="mb-6">
              <h3 className="text-[15px] font-bold text-slate-900 mb-2">Description</h3>
              <p className="text-[18px] text-slate-600 leading-[1.8]">{medicine.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-3">Primary Uses</h3>
                <div className="flex flex-wrap gap-2">
                  {medicine.uses.map(use => (
                    <span key={use} className="px-3 py-1.5 bg-slate-50 text-slate-700 font-medium text-[14px] rounded-lg border border-slate-200">{use}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-3">Key Benefits</h3>
                <ul className="space-y-2">
                  {medicine.benefits.map((ben, i) => (
                    <li key={i} className="flex gap-2 items-start text-[15px] text-slate-600 font-medium">
                      <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" /> {ben}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Section 4: Dosage & Usage */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} 
            className="bg-white rounded-[18px] p-6 shadow-sm border border-[#E5E7EB]"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Dosage & Usage</h2>
            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
              {[
                { label: "When to take", value: medicine.dosage.when, icon: Clock },
                { label: "Frequency", value: medicine.dosage.frequency, icon: Activity },
                { label: "Adult Dose", value: medicine.dosage.adults, icon: PersonStanding },
                { label: "Child Dose", value: medicine.dosage.children, icon: Baby },
              ].map((row, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center p-4 sm:h-[60px] hover:bg-slate-50 transition-colors">
                  <div className="sm:w-1/3 flex items-center gap-2 mb-1 sm:mb-0">
                    <row.icon size={16} className="text-slate-400" />
                    <span className="text-[14px] font-bold text-slate-600">{row.label}</span>
                  </div>
                  <div className="sm:w-2/3 text-[15px] font-medium text-slate-900">{row.value}</div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section 5: Side Effects */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-xl font-bold text-slate-900 mb-4 px-1">Common Side Effects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicine.sideEffects.map((se, i) => (
                <div key={i} className="bg-white rounded-[18px] p-4 h-[80px] shadow-sm border border-[#E5E7EB] flex items-center justify-between hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={24} className="text-slate-400" />
                    <span className="text-[15px] font-bold text-slate-700">{se.symptom}</span>
                  </div>
                  {se.level === "Low" ? (
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 font-bold text-[12px] rounded-full">Low Risk</span>
                  ) : se.level === "Moderate" ? (
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 font-bold text-[12px] rounded-full">Moderate</span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-50 text-rose-600 font-bold text-[12px] rounded-full">High Risk</span>
                  )}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section 6: Safety Information */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} 
            className="bg-white rounded-[18px] p-6 shadow-sm border border-[#E5E7EB]"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Safety Advice</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { title: "Pregnancy", data: medicine.safety.pregnancy, icon: Baby },
                { title: "Breastfeeding", data: medicine.safety.breastfeeding, icon: Droplet },
                { title: "Kidney Disease", data: medicine.safety.kidney, icon: Activity },
                { title: "Liver Disease", data: medicine.safety.liver, icon: HeartPulse },
              ].map((safe, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-[16px] bg-slate-50 border border-slate-100 h-auto sm:h-[110px]">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                    <safe.icon size={20} className={safe.data.status === 'Safe' ? 'text-primary' : safe.data.status === 'Consult Doctor' ? 'text-amber-500' : 'text-rose-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[14px] text-slate-900">{safe.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${safe.data.status === 'Safe' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{safe.data.status}</span>
                    </div>
                    <p className="text-[13px] font-medium text-slate-600 leading-snug">{safe.data.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section 7: Food & Drug Interaction */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} 
            className="bg-white rounded-[18px] p-6 shadow-sm border border-[#E5E7EB]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Interactions</h2>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setActiveInteractionTab("food")} className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${activeInteractionTab === 'food' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Food</button>
                <button onClick={() => setActiveInteractionTab("drug")} className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${activeInteractionTab === 'drug' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Drug</button>
              </div>
            </div>
            
            <div className="space-y-3">
              {(activeInteractionTab === 'food' ? medicine.interactions.food : medicine.interactions.drug).map((int, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-[12px] bg-slate-50 border border-slate-100 items-center">
                  <ShieldAlert size={24} className={int.risk === 'High' ? 'text-rose-500' : int.risk === 'Moderate' ? 'text-amber-500' : 'text-slate-400'} shrink-0 />
                  <div className="flex-1">
                    <h4 className="text-[15px] font-bold text-slate-900">{int.interaction}</h4>
                    <p className="text-[13px] font-medium text-slate-600">{int.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section 8 & 9: Alternatives & Price Comparison */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} 
            className="bg-white rounded-[18px] p-6 shadow-sm border border-[#E5E7EB]"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Alternatives & Price Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Medicine Name</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Manufacturer</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Price/Strip</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="h-[60px] bg-primary/5">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white overflow-hidden relative shrink-0"><Image src={medicine.image} alt="" fill className="object-cover" /></div>
                      {medicine.name} (Current)
                    </td>
                    <td className="py-3 px-4 text-[14px] text-slate-600 font-medium">{medicine.manufacturer}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">৳{medicine.price}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-bold text-primary">Selected</span>
                    </td>
                  </tr>
                  {medicine.alternatives.map((alt, i) => (
                    <tr key={i} className="h-[60px] hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-700 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden relative shrink-0"><Image src={alt.img} alt="" fill className="object-cover" /></div>
                        {alt.name}
                      </td>
                      <td className="py-3 px-4 text-[14px] text-slate-500 font-medium">{alt.manufacturer}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">৳{alt.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="px-4 py-1.5 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 hover:border-primary hover:text-primary transition-colors">Compare</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Section 10: Patient Reviews */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-xl font-bold text-slate-900 mb-6 px-1">Patient Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {medicine.reviews.items.map((rev, i) => (
                <div key={i} className="bg-white rounded-[18px] p-6 h-[160px] shadow-sm border border-[#E5E7EB] flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{rev.name.charAt(0)}</div>
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900 leading-tight">{rev.name}</h4>
                        <span className="text-[11px] text-slate-400 font-medium">{rev.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded text-amber-600 font-bold text-xs">
                      <Star size={12} className="fill-amber-500" /> {rev.rating}
                    </div>
                  </div>
                  <p className="text-[14px] text-slate-600 font-medium line-clamp-3">{rev.text}</p>
                </div>
              ))}
            </div>
          </motion.section>

        </div>

        {/* RIGHT COLUMN: Sticky Action Panel (Desktop) */}
        <div className="hidden lg:block w-[340px] shrink-0">
          <div className="sticky top-[100px] bg-white rounded-[18px] p-6 shadow-md border border-[#E5E7EB]">
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[36px] font-[800] text-slate-900 leading-none">৳{medicine.price}</span>
              <span className="text-[14px] text-slate-500 font-medium mt-2">/ strip</span>
            </div>
            
            <p className="text-[14px] font-bold text-primary mb-6 flex items-center gap-2">
              <CheckCircle2 size={16} /> {medicine.availability}
            </p>

            <div className="space-y-3 mb-6 border-y border-slate-100 py-6">
              <button className="w-full h-[52px] bg-primary hover:bg-[#5bc95c] text-white rounded-[14px] font-bold text-[16px] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                <ShoppingCart size={20} /> Add to Cart
              </button>
              <button className="w-full h-[52px] bg-slate-900 hover:bg-slate-800 text-white rounded-[14px] font-bold text-[16px] transition-colors flex items-center justify-center gap-2">
                <Stethoscope size={20} /> Consult Doctor
              </button>
              <button className="w-full h-[52px] bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-[14px] font-bold text-[16px] transition-colors flex items-center justify-center gap-2">
                <ArrowRightLeft size={20} /> Compare Price
              </button>
            </div>

            {medicine.prescriptionRequired ? (
              <div className="bg-rose-50 rounded-xl p-4 flex gap-3 text-rose-700">
                <FileText size={24} className="shrink-0" />
                <p className="text-[13px] font-bold">A valid doctor's prescription is mandatory to purchase this medicine.</p>
              </div>
            ) : (
              <div className="bg-green-50 rounded-xl p-4 flex gap-3 text-green-700">
                <ShieldAlert size={24} className="shrink-0" />
                <p className="text-[13px] font-bold">OTC Medicine. Can be bought without a prescription safely.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full h-[72px] bg-white border-t border-slate-200 px-4 flex items-center justify-between z-50 shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
        <div>
          <div className="text-[20px] font-[800] text-slate-900 leading-none">৳{medicine.price}</div>
          <div className="text-[11px] font-bold text-primary">{medicine.availability}</div>
        </div>
        <div className="flex gap-2">
          <button className="h-[48px] px-6 bg-slate-900 text-white rounded-xl font-bold text-[14px] shadow-sm flex items-center justify-center gap-2">
            Consult
          </button>
          <button className="h-[48px] px-6 bg-primary text-white rounded-xl font-bold text-[14px] shadow-sm shadow-primary/20 flex items-center justify-center gap-2">
            Buy
          </button>
        </div>
      </div>

    </div>
  );
}
