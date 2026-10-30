"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  Radio, 
  Compass, 
  PhoneCall, 
  ExternalLink, 
  Ambulance, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  LocateFixed, 
  ShieldAlert, 
  Flame, 
  Clock, 
  Activity,
  Layers,
  Search
} from "lucide-react";
import { toast } from "sonner";

export interface TrackedEmergency {
  id: string;
  uhid: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string;
  condition: string;
  urgency: "CRITICAL" | "URGENT" | "MODERATE";
  news2Score: number;
  lat: number;
  lon: number;
  address: string;
  accuracy: number;
  timestamp: string;
  status: "PENDING_DISPATCH" | "AMBULANCE_EN_ROUTE" | "HOSPITAL_ADMITTED" | "RESOLVED";
  assignedHospital?: string;
  ambulanceId?: string;
}

const INITIAL_EMERGENCIES: TrackedEmergency[] = [
  {
    id: "EMG-DH-01",
    uhid: "UHID-BD-982104",
    name: "Mohammad Rafiqul Islam",
    phone: "+8801712984512",
    age: 58,
    gender: "Male",
    bloodGroup: "B+",
    condition: "Acute Myocardial Infarction / Severe Chest Pain",
    urgency: "CRITICAL",
    news2Score: 9,
    lat: 23.7461,
    lon: 90.3742,
    address: "Road 27, Dhanmondi, Dhaka 1209",
    accuracy: 4,
    timestamp: "2 mins ago",
    status: "PENDING_DISPATCH",
    assignedHospital: "Dhaka Medical College Hospital (ICU Bed 04)",
  },
  {
    id: "EMG-DH-02",
    uhid: "UHID-BD-741920",
    name: "Farhana Begum",
    phone: "+8801823901244",
    age: 34,
    gender: "Female",
    bloodGroup: "O+",
    condition: "Dengue Shock Syndrome / Severe Thrombocytopenia",
    urgency: "CRITICAL",
    news2Score: 8,
    lat: 23.8103,
    lon: 90.4125,
    address: "Block D, Bashundhara R/A, Dhaka",
    accuracy: 6,
    timestamp: "6 mins ago",
    status: "AMBULANCE_EN_ROUTE",
    assignedHospital: "Kurmitola General Hospital",
    ambulanceId: "AMB-AZ-09",
  },
  {
    id: "EMG-CTG-03",
    uhid: "UHID-BD-332901",
    name: "Tanvir Hasan",
    phone: "+8801911432890",
    age: 26,
    gender: "Male",
    bloodGroup: "A+",
    condition: "High-Speed Motorcycle Accident / Fractured Femur",
    urgency: "URGENT",
    news2Score: 6,
    lat: 22.3569,
    lon: 91.7832,
    address: "GEC Circle, Nasirabad, Chittagong",
    accuracy: 5,
    timestamp: "11 mins ago",
    status: "AMBULANCE_EN_ROUTE",
    assignedHospital: "Chittagong Medical College Hospital",
    ambulanceId: "AMB-CTG-02",
  },
  {
    id: "EMG-SYL-04",
    uhid: "UHID-BD-551029",
    name: "Ayesha Siddiqua",
    phone: "+8801733890123",
    age: 62,
    gender: "Female",
    bloodGroup: "AB+",
    condition: "Acute Hypoxic Respiratory Distress / COPD Exacerbation",
    urgency: "CRITICAL",
    news2Score: 10,
    lat: 24.8949,
    lon: 91.8687,
    address: "Zindabazar Point, Sylhet",
    accuracy: 3,
    timestamp: "15 mins ago",
    status: "PENDING_DISPATCH",
    assignedHospital: "MAG Osmani Medical College Hospital",
  },
  {
    id: "EMG-DH-05",
    uhid: "UHID-BD-609124",
    name: "Kamrul Ahsan",
    phone: "+8801678129034",
    age: 44,
    gender: "Male",
    bloodGroup: "O-",
    condition: "Severe Diabetic Ketoacidosis (DKA) / Altered Sensorium",
    urgency: "URGENT",
    news2Score: 6,
    lat: 23.8041,
    lon: 90.3687,
    address: "Mirpur-10 Roundabout, Dhaka",
    accuracy: 8,
    timestamp: "24 mins ago",
    status: "HOSPITAL_ADMITTED",
    assignedHospital: "National Institute of Neurosciences (NINS)",
  },
];

export function LiveEmergencyMap() {
  const [emergencies, setEmergencies] = useState<TrackedEmergency[]>(INITIAL_EMERGENCIES);
  const [selectedEmergency, setSelectedEmergency] = useState<TrackedEmergency | null>(INITIAL_EMERGENCIES[0]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; address: string; accuracy: number } | null>(null);
  const [isTrackingLive, setIsTrackingLive] = useState(false);
  const [locating, setLocating] = useState(false);
  const [filterUrgency, setFilterUrgency] = useState<"ALL" | "CRITICAL" | "URGENT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const watchIdRef = useRef<number | null>(null);

  // Request browser geolocation with reverse geocoding
  const handleToggleLiveLocation = () => {
    if (isTrackingLive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTrackingLive(false);
      setUserLocation(null);
      toast.info("Live GPS tracking stopped.");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    toast.loading("Requesting live GPS location permission...", { id: "gps-perm" });

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        let formattedAddress = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;

        try {
          // Attempt high-accuracy reverse geocoding via our Next.js API
          const res = await fetch(`/api/location/reverse?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data.address || data.display_name) {
              formattedAddress = data.address || data.display_name;
            }
          }
        } catch (e) {
          console.warn("Reverse geocode fallback to coords:", e);
        }

        const newLoc = {
          lat: latitude,
          lon: longitude,
          address: formattedAddress,
          accuracy: Math.round(accuracy),
        };

        setUserLocation(newLoc);
        setIsTrackingLive(true);
        setLocating(false);
        toast.dismiss("gps-perm");
        toast.success("Live GPS broadcast active! Your coordinates are now tracked.");

        // Automatically add current user as an emergency / test node
        setEmergencies((prev) => {
          const exists = prev.find((e) => e.id === "EMG-MY-LIVE");
          const myNode: TrackedEmergency = {
            id: "EMG-MY-LIVE",
            uhid: "UHID-ADMIN-LIVE",
            name: "Current Device (Live GPS)",
            phone: "+8801700000000",
            age: 30,
            gender: "Admin/Responder",
            bloodGroup: "Verified",
            condition: "Admin Live Responder Node • Real-Time Satellite Tracking",
            urgency: "CRITICAL",
            news2Score: 0,
            lat: latitude,
            lon: longitude,
            address: formattedAddress,
            accuracy: Math.round(accuracy),
            timestamp: "Just now",
            status: "AMBULANCE_EN_ROUTE",
            assignedHospital: "National Emergency Control Center",
          };
          if (exists) {
            return prev.map((e) => (e.id === "EMG-MY-LIVE" ? myNode : e));
          }
          return [myNode, ...prev];
        });
      },
      (err) => {
        setLocating(false);
        setIsTrackingLive(false);
        toast.dismiss("gps-perm");
        console.error("Geolocation error:", err);
        toast.error(`GPS Error: ${err.message}. Please enable location permissions in browser settings.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Quick Google Maps Open Helper
  const openInGoogleMaps = (lat: number, lon: number, mode: "directions" | "view" = "directions") => {
    const url =
      mode === "directions"
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`
        : `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening turn-by-turn navigation in Google Maps...");
  };

  // Simulate new SOS
  const handleSimulateNewSOS = () => {
    const randomLats = [23.7508, 23.7925, 23.8698, 22.3384, 24.3636];
    const randomLons = [90.3842, 90.4078, 90.3985, 91.8317, 88.6241];
    const areas = [
      "Panthapath, Green Road, Dhaka",
      "Gulshan-1 Circle, Dhaka",
      "Uttara Sector 11, Dhaka",
      "Agrabad Commercial Area, Chittagong",
      "Shaheb Bazar, Rajshahi",
    ];
    const conditions = [
      "Severe Anaphylaxis / Throat Swelling",
      "Acute Ischemic Stroke / Facial Droop",
      "Severe Road Traffic Trauma",
      "Severe Asthmatic Bronchospasm",
    ];

    const idx = Math.floor(Math.random() * areas.length);
    const newEmergency: TrackedEmergency = {
      id: `EMG-SIM-${Date.now().toString().slice(-4)}`,
      uhid: `UHID-BD-${Math.floor(100000 + Math.random() * 900000)}`,
      name: ["Abdur Rahim", "Rokeya Begum", "Shafiqul Alam", "Nusrat Jahan"][idx % 4],
      phone: `+88017${Math.floor(10000000 + Math.random() * 90000000)}`,
      age: Math.floor(25 + Math.random() * 45),
      gender: idx % 2 === 0 ? "Male" : "Female",
      bloodGroup: ["A+", "B+", "O+", "AB+"][idx % 4],
      condition: conditions[idx % conditions.length],
      urgency: "CRITICAL",
      news2Score: Math.floor(7 + Math.random() * 4),
      lat: randomLats[idx],
      lon: randomLons[idx],
      address: areas[idx],
      accuracy: Math.floor(3 + Math.random() * 5),
      timestamp: "Just now",
      status: "PENDING_DISPATCH",
      assignedHospital: "Nearest Apex Hospital (Standby)",
    };

    setEmergencies((prev) => [newEmergency, ...prev]);
    setSelectedEmergency(newEmergency);
    toast.error(`🚨 Incoming SOS Alert: ${newEmergency.name} in ${newEmergency.address}!`, {
      duration: 6000,
    });
  };

  // Dispatch ambulance
  const handleDispatchAmbulance = (id: string) => {
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "AMBULANCE_EN_ROUTE",
              ambulanceId: `AMB-DISPATCH-${Math.floor(10 + Math.random() * 90)}`,
            }
          : e
      )
    );
    toast.success("Ambulance dispatched! High-priority telemetry channel opened.");
  };

  const filteredEmergencies = emergencies.filter((e) => {
    const matchesUrgency = filterUrgency === "ALL" || e.urgency === filterUrgency;
    const matchesQuery =
      searchQuery === "" ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.uhid.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUrgency && matchesQuery;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden my-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Live Emergency Radar & GPS Dispatch
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Radio size={12} className="animate-pulse text-emerald-400" />
                Satellite Telemetry Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Patient Live Location & Google Maps Navigation
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
              Real-time GPS coordination for emergency patients, ambulances, and hospital triage desks with instant 1-click Google Maps turn-by-turn driving routes.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleLiveLocation}
              disabled={locating}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                isTrackingLive
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white ring-2 ring-emerald-300/40"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              }`}
            >
              <LocateFixed size={18} className={isTrackingLive ? "text-white animate-spin" : "text-emerald-400"} />
              {locating ? "Acquiring GPS..." : isTrackingLive ? "Live GPS Active (Broadcast ON)" : "Turn On My Live GPS"}
            </button>

            <button
              onClick={handleSimulateNewSOS}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Flame size={18} />
              Simulate Patient SOS
            </button>
          </div>
        </div>

        {/* Live User Location Bar if active */}
        {userLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-3.5 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-emerald-200">Your Real-Time Coordinates:</span>
              <span className="font-mono text-white bg-slate-900/60 px-2 py-0.5 rounded border border-white/10">
                {userLocation.lat.toFixed(6)}, {userLocation.lon.toFixed(6)} (±{userLocation.accuracy}m)
              </span>
              <span className="text-slate-300 hidden md:inline truncate max-w-md">
                📍 {userLocation.address}
              </span>
            </div>
            <button
              onClick={() => openInGoogleMaps(userLocation.lat, userLocation.lon, "directions")}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation size={13} />
              Open My Location in Google Maps
            </button>
          </motion.div>
        )}
      </div>

      {/* Main Grid: Radar Screen + Patient List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-slate-200">
        
        {/* Left Column: Interactive Radar Map Visualizer (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-950 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
          {/* Radar Background Grids */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          {/* Radar Scanning Display */}
          <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center py-6">
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 rounded-full border border-emerald-500/20 flex items-center justify-center">
              {/* Concentric rings */}
              <div className="absolute w-56 h-56 rounded-full border border-emerald-500/20" />
              <div className="absolute w-36 h-36 rounded-full border border-emerald-500/30" />
              <div className="absolute w-16 h-16 rounded-full border border-emerald-500/40" />

              {/* Crosshairs */}
              <div className="absolute w-full h-px bg-emerald-500/20" />
              <div className="absolute h-full w-px bg-emerald-500/20" />

              {/* Radar sweep beam */}
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(16,185,129,0.25)_360deg)] animate-[spin_4s_linear_infinite] pointer-events-none" />

              {/* Center Hospital Hub */}
              <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center z-20 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <Compass size={18} className="text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
              </div>

              {/* Render Emergency Markers mapped onto the radar */}
              {emergencies.map((emg, i) => {
                const angle = (i * (360 / emergencies.length)) * (Math.PI / 180);
                const radius = 50 + (i % 3) * 45;
                const top = `calc(50% + ${Math.sin(angle) * radius}px)`;
                const left = `calc(50% + ${Math.cos(angle) * radius}px)`;
                const isSelected = selectedEmergency?.id === emg.id;

                return (
                  <button
                    key={emg.id}
                    onClick={() => setSelectedEmergency(emg)}
                    style={{ top, left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all cursor-pointer group`}
                    title={`${emg.name} - ${emg.condition}`}
                  >
                    <div className="relative flex items-center justify-center">
                      {/* Pulse beacon */}
                      <span
                        className={`absolute w-8 h-8 rounded-full animate-ping opacity-75 ${
                          emg.urgency === "CRITICAL" ? "bg-rose-500" : "bg-amber-500"
                        }`}
                      />
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 shadow-lg transition-transform ${
                          isSelected ? "scale-135 ring-4 ring-white/30" : "hover:scale-120"
                        } ${
                          emg.urgency === "CRITICAL"
                            ? "bg-rose-600 border-rose-300 text-white"
                            : "bg-amber-500 border-amber-200 text-slate-950"
                        }`}
                      >
                        {i + 1}
                      </div>

                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-40 pointer-events-none">
                        <div className="bg-slate-900/95 border border-emerald-500/40 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl">
                          {emg.name} (NEWS2: {emg.news2Score})
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Emergency Quick Inspection Bar */}
          {selectedEmergency && (
            <div className="relative z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        selectedEmergency.urgency === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {selectedEmergency.urgency} • NEWS2: {selectedEmergency.news2Score}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{selectedEmergency.uhid}</span>
                  </div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedEmergency.name}
                    <span className="text-xs text-slate-400 font-normal">
                      ({selectedEmergency.age}y, {selectedEmergency.gender}, {selectedEmergency.bloodGroup})
                    </span>
                  </h4>
                  <p className="text-xs text-rose-300 font-medium mt-0.5">{selectedEmergency.condition}</p>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                    <MapPin size={13} className="text-emerald-400 shrink-0" />
                    <span>{selectedEmergency.address}</span>
                  </p>
                </div>

                {/* Primary Google Maps Navigation Button */}
                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openInGoogleMaps(selectedEmergency.lat, selectedEmergency.lon, "directions")}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
                  >
                    <Navigation size={15} />
                    Open Google Maps
                  </button>

                  <button
                    onClick={() => openInGoogleMaps(selectedEmergency.lat, selectedEmergency.lon, "view")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    View Satellite Pin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tracked Patients List & Controls (5 Cols) */}
        <div className="lg:col-span-5 p-6 bg-slate-50 flex flex-col h-full border-t lg:border-t-0 lg:border-l border-slate-200">
          
          {/* Search & Filter Header */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Activity size={18} className="text-emerald-600" />
                Active Distress Signals ({filteredEmergencies.length})
              </h3>
              <span className="text-xs font-semibold text-slate-500">Live Telemetry</span>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, UHID, or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2">
              {(["ALL", "CRITICAL", "URGENT"] as const).map((urg) => (
                <button
                  key={urg}
                  onClick={() => setFilterUrgency(urg)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterUrgency === urg
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Patient Cards */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[460px] pr-1 custom-scrollbar">
            {filteredEmergencies.map((emg) => {
              const isSelected = selectedEmergency?.id === emg.id;
              return (
                <div
                  key={emg.id}
                  onClick={() => setSelectedEmergency(emg)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                      : "bg-white hover:bg-slate-100/80 border-slate-200 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{emg.name}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            emg.urgency === "CRITICAL"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          NEWS2: {emg.news2Score}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{emg.uhid}</span>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                      <Clock size={11} /> {emg.timestamp}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 mb-2 line-clamp-1">{emg.condition}</p>

                  <div className="text-xs text-slate-600 flex items-start gap-1.5 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800 text-[11px] leading-tight">{emg.address}</p>
                      <p className="font-mono text-[10px] text-slate-600 mt-0.5">
                        GPS: {emg.lat.toFixed(4)}, {emg.lon.toFixed(4)} • ±{emg.accuracy}m
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons for each emergency */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openInGoogleMaps(emg.lat, emg.lon, "directions");
                      }}
                      className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Navigation size={13} />
                      Navigate in Google Maps
                    </button>

                    <a
                      href={`tel:${emg.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Call Patient / Relative"
                    >
                      <PhoneCall size={14} />
                    </a>

                    {emg.status === "PENDING_DISPATCH" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDispatchAmbulance(emg.id);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                        title="Dispatch Ambulance"
                      >
                        <Ambulance size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}