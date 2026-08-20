"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Dynamically import the LeafletMap component with no SSR because Leaflet requires the window object
const LeafletMap = dynamic(() => import("./LeafletMap"), { 
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full min-h-[300px] bg-slate-50 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center animate-pulse">
        <MapPin size={32} />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">Loading Map...</p>
    </div>
  )
});

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
  className?: string;
}

// We kept the name "GoogleMap" to avoid breaking existing imports across the project,
// but it now renders an OpenStreetMap using Leaflet.js
export function GoogleMap(props: GoogleMapProps) {
  return <LeafletMap {...props} />;
}
