"use client";

import { MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
  className?: string;
}

export function GoogleMap({ lat, lng, zoom = 15, title = "Location", className = "" }: GoogleMapProps) {
  const { t } = useLanguage();
  
  // Read the API Key from Environment Variables
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    // Beautiful Placeholder when API key is missing
    return (
      <div className={`relative w-full h-full min-h-[300px] bg-slate-50 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-slate-300 ${className}`}>
        
        {/* Placeholder Map Background (Stylized) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', 
               backgroundSize: '30px 30px' 
             }}>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm max-w-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <MapPin size={32} />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">
            {t("Map Integration Ready", "ম্যাপ ইন্টিগ্রেশন প্রস্তুত")}
          </h4>
          <p className="text-sm text-slate-500 mb-4">
            {t(
              "Please add your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to the .env file to activate the live map.", 
              "লাইভ ম্যাপ চালু করতে আপনার .env ফাইলে NEXT_PUBLIC_GOOGLE_MAPS_API_KEY যোগ করুন।"
            )}
          </p>
          <div className="text-xs bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg font-mono">
            {lat}, {lng}
          </div>
        </div>
      </div>
    );
  }

  // Active Map iframe (using Google Maps Embed API)
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=${zoom}`;

  return (
    <div className={`relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden shadow-md border border-slate-200 ${className}`}>
      <iframe
        title={title}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        className="absolute inset-0"
      ></iframe>
    </div>
  );
}
