"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LeafletMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
  className?: string;
}

export default function LeafletMap({ lat, lng, zoom = 15, title = "Location", className = "" }: LeafletMapProps) {
  return (
    <div className={`relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden shadow-md border border-slate-200 z-10 ${className}`}>
      <MapContainer 
        center={[lat, lng]} 
        zoom={zoom} 
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            {title}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
