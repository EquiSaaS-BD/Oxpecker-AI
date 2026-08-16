"use client";

import { useState } from "react";
import Image from "next/image";
import { Bookmark, Search, Star, MapPin, Map, Stethoscope, Bed, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

const mockSaved = [
  { id: 1, type: "Doctor", name: "Dr. Sarah Rahman", sub: "Cardiologist", rating: 4.9, img: "https://images.unsplash.com/photo-1594824432258-2022d4f3b14b?w=200&h=200&fit=crop" },
  { id: 2, type: "Hospital", name: "Square Hospitals Ltd.", sub: "Panthapath, Dhaka", rating: 4.8, img: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop" },
  { id: 3, type: "Medicine", name: "Napa Extend", sub: "Paracetamol 665mg", price: "৳ 2.50", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop" },
  { id: 4, type: "Doctor", name: "Dr. Ahmed Khan", sub: "Neurologist", rating: 4.7, img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop" },
  { id: 5, type: "Article", name: "10 Superfoods for a Healthy Heart", sub: "Nutrition Guide", readTime: "5 min read", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop" },
];

const categories = ["All", "Doctor", "Hospital", "Medicine", "Article"];

export default function SavedItemsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = mockSaved.filter(item => 
    (activeTab === "All" || item.type === activeTab) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F8FAFC] font-sans">
      
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 lg:px-12 py-8 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-[800] text-slate-900 leading-tight flex items-center gap-3">
              <Bookmark className="text-primary fill-primary/10" size={32} /> Saved Items
            </h1>
            <p className="text-[15px] text-slate-500 font-medium mt-2">Manage your bookmarked doctors, hospitals, medicines, and health articles.</p>
          </div>
          
          <div className="relative w-full md:w-[350px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search saved items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-[14px] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1200px] mx-auto flex overflow-x-auto gap-2 mt-8 scrollbar-hide pb-2">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full text-[14px] font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === cat 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-10 pb-[120px]">
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[24px] border border-slate-200 shadow-sm">
            <Bookmark size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-[18px] font-bold text-slate-900 mb-1">No saved items found</h3>
            <p className="text-[14px] text-slate-500">You haven't bookmarked any {activeTab !== "All" ? activeTab.toLowerCase() + "s" : "items"} yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-[20px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 flex flex-col group">
                
                {/* Image Area */}
                <div className="h-[180px] w-full bg-slate-100 relative overflow-hidden">
                  <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 uppercase tracking-widest shadow-sm">
                    {item.type}
                  </div>
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shadow-sm">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-[18px] font-bold text-slate-900 leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                  <p className="text-[13px] text-slate-500 font-medium line-clamp-1 mb-4">{item.sub}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    {item.rating && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg text-[13px] font-bold text-yellow-600">
                        <Star size={14} className="fill-current" /> {item.rating}
                      </div>
                    )}
                    {item.price && (
                      <span className="text-[16px] font-[800] text-slate-900">{item.price}</span>
                    )}
                    {item.readTime && (
                      <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{item.readTime}</span>
                    )}
                    
                    <button className="h-9 px-4 bg-slate-50 hover:bg-primary text-slate-600 hover:text-white rounded-xl font-bold text-[13px] transition-colors flex items-center gap-1.5 ml-auto">
                      View <ExternalLink size={14} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
