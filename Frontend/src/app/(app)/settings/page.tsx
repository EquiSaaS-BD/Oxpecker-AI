"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LogOut, User, Camera, Save, Shield, Bell, ChevronDown, ChevronUp, Droplet, Pencil, X, Check, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { ImageUploadCropper } from "@/components/shared/ImageUploadCropper";
import { apiGetProfile, apiUpdateProfile, compressAndResizeImage } from "@/lib/api";
import { MedicalLoader } from "@/components/shared/MedicalLoader";
import { HealthPassSettingsSection } from "@/components/health-card/HealthPassSettingsSection";
import { LocationAutocompleteInput } from "@/components/shared/LocationAutocompleteInput";

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  // Profile State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [nid, setNid] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Mode & Custom Dropdowns State
  const [isEditing, setIsEditing] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isBloodGroupOpen, setIsBloodGroupOpen] = useState(false);
  const genderDropdownRef = useRef<HTMLDivElement>(null);
  const bloodDropdownRef = useRef<HTMLDivElement>(null);

  // Expandable sections state (Security, Notifications only)
  const [expandedSection, setExpandedSection] = useState<'security' | 'notifications' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiGetProfile();
      const prof = res.data.profile || {};
      setName(prof.name || user?.name || "");
      setEmail(prof.email || user?.email || "");
      setPhone(prof.phone || "");
      setDob(prof.date_of_birth || prof.dob || "");
      setGender(prof.gender || "");
      setBloodGroup(prof.blood_group || prof.bloodGroup || "");
      setAddress(prof.address || "");
      setNid(prof.nid || "");
      setEmergencyContact(prof.emergency_contact || prof.emergencyContact || "");
      if (prof.image) setProfileImage(prof.image);
    } catch (e) {
      toast.error("Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load User Data from Supabase
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user, loadProfileData]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target as Node)) {
        setIsGenderOpen(false);
      }
      if (bloodDropdownRef.current && !bloodDropdownRef.current.contains(event.target as Node)) {
        setIsBloodGroupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Profile Completion Logic
  const calculateCompletion = () => {
    let score = 0;
    if (name?.trim()) score += 20;
    if (email?.trim()) score += 20;
    if (phone?.trim()) score += 15;
    if (dob) score += 15;
    if (gender) score += 10;
    if (bloodGroup) score += 10;
    if (address?.trim()) score += 10;
    return score;
  };
  const completionPercentage = calculateCompletion();

  // Handle Profile Picture Upload with 99% WebP Canvas Compressor
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedUrl = await compressAndResizeImage(file, 400, 400, 0.75);
        setProfileImage(compressedUrl);

        // Instantly sync with HealthPass Card in localStorage so it appears on card immediately!
        const targetUserId = user?.id || "current";
        const savedCard = localStorage.getItem(`hp_card_${targetUserId}`);
        const currentCard = savedCard ? JSON.parse(savedCard) : {};
        currentCard.patient_image = compressedUrl;
        localStorage.setItem(`hp_card_${targetUserId}`, JSON.stringify(currentCard));

        // Also update AuthContext & mock user state
        if (user) {
          updateUser({ ...user, image: compressedUrl });
        } else {
          const stored = localStorage.getItem("oxpecker_mock_user");
          if (stored) {
            try {
              const u = JSON.parse(stored);
              u.image = compressedUrl;
              localStorage.setItem("oxpecker_mock_user", JSON.stringify(u));
              localStorage.setItem("oxpecker_user", JSON.stringify(u));
            } catch {}
          }
        }

        toast.success("Profile photo uploaded & synced with your HealthPass card!", { icon: "📸" });
      } catch (err) {
        toast.error("Failed to process image.");
      }
    }
  };

  // Handle Form Save directly to Supabase profiles table
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiUpdateProfile({
        id: user?.id,
        email: user?.email || email,
        name,
        phone,
        date_of_birth: dob,
        dob,
        gender,
        blood_group: bloodGroup,
        bloodGroup,
        address,
        image: profileImage || undefined
      });

      toast.success("Profile updated successfully in database!");
      setIsEditing(false);
      setIsGenderOpen(false);
      setIsBloodGroupOpen(false);

      const targetUserId = user?.id || "current";
      const savedCard = localStorage.getItem(`hp_card_${targetUserId}`);
      const currentCard = savedCard ? JSON.parse(savedCard) : {};
      if (profileImage) currentCard.patient_image = profileImage;
      currentCard.patient_name = name;
      currentCard.english_name = name.toUpperCase();
      currentCard.blood_group = bloodGroup;
      currentCard.gender = gender;
      currentCard.date_of_birth = dob;
      currentCard.address = address;
      if (phone) currentCard.personal_phone = phone;
      localStorage.setItem(`hp_card_${targetUserId}`, JSON.stringify(currentCard));

      if (user) {
        const p = res?.data?.profile;
        updateUser({
          ...user,
          id: p?.id || user.id,
          name: p?.name || name,
          phone: p?.phone || phone,
          date_of_birth: p?.date_of_birth || dob,
          gender: p?.gender || gender,
          blood_group: p?.blood_group || bloodGroup,
          address: p?.address || address,
          image: p?.image || profileImage || user.image
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: 'security' | 'notifications') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <MedicalLoader text="Loading Profile" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-6">
        <p className="text-slate-500 font-medium">Please log in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] p-4 md:p-8">
      <Toaster position="top-center" richColors />
      <div className="max-w-[760px] mx-auto space-y-6 pb-16">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Profile & Account Settings</h1>

        {/* PROFILE COMPLETION CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full bg-white text-slate-900 flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-white ring-2 ring-slate-200">
              {profileImage ? (
                <Image src={profileImage} alt="Profile" fill className="object-cover" />
              ) : (
                <span>{(name || "U").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <ImageUploadCropper 
              onUpload={(base64) => { setProfileImage(base64); toast.success("Photo cropped & added! Click Save."); }}
              buttonText=""
              icon={<Camera size={22} />}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
            />
          </div>

          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900">{name || "User Profile"}</h2>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                {completionPercentage}% Complete
              </span>
            </div>
            {/* Enhanced High-Contrast Progress Bar */}
            <div className="w-full bg-slate-100 border border-slate-200/90 h-3 rounded-full overflow-hidden mb-2 p-[2px] shadow-inner">
              <div 
                className="bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 h-full rounded-full transition-all duration-700 shadow-xs" 
                style={{ width: `${Math.max(completionPercentage, 5)}%` }} 
              />
            </div>
            <p className="text-xs text-slate-500">{email} • {user.role?.toUpperCase()}</p>
          </div>
        </div>

        {/* PERSONAL DETAILS FORM */}
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User size={18} className="text-sky-600" /> Personal Details
            </h2>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-colors shadow-xs cursor-pointer"
              >
                <Pencil size={13} />
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsGenderOpen(false);
                  setIsBloodGroupOpen(false);
                  loadProfileData();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <X size={13} />
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={name}
                onChange={e => setName(e.target.value)}
                className={`w-full h-11 px-4 border rounded-xl text-sm transition-all duration-150 ${
                  !isEditing
                    ? "bg-slate-50/80 border-slate-200 text-slate-700 cursor-not-allowed select-none"
                    : "bg-white border-slate-200 text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full h-11 px-4 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone / Mobile Number</label>
              <input
                type="tel"
                disabled={!isEditing}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={`w-full h-11 px-4 border rounded-xl text-sm transition-all duration-150 ${
                  !isEditing
                    ? "bg-slate-50/80 border-slate-200 text-slate-700 cursor-not-allowed select-none"
                    : "bg-white border-slate-200 text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                }`}
                placeholder="+880 1700-000000"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Date of Birth</label>
                <span className="text-[10px] text-slate-400 font-normal">Type freely or pick</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  placeholder="e.g. 1995-03-15 or 15/03/1995"
                  className={`w-full h-11 pl-4 pr-11 border rounded-xl text-sm transition-all duration-150 ${
                    !isEditing
                      ? "bg-slate-50/80 border-slate-200 text-slate-700 cursor-not-allowed select-none"
                      : "bg-white border-slate-200 text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400 font-medium"
                  }`}
                />
                {isEditing && (
                  <label
                    className="absolute right-2.5 p-1.5 text-slate-400 hover:text-sky-600 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                    title="Open calendar picker"
                  >
                    <Calendar size={16} />
                    <input
                      type="date"
                      className="sr-only"
                      onChange={e => {
                        if (e.target.value) setDob(e.target.value);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Custom Gender Dropdown Pop-up */}
            <div className="relative" ref={genderDropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
              <button
                type="button"
                disabled={!isEditing}
                onClick={() => isEditing && setIsGenderOpen(!isGenderOpen)}
                className={`w-full h-11 px-4 border rounded-xl text-sm flex items-center justify-between transition-all duration-150 ${
                  !isEditing
                    ? "bg-slate-50/80 border-slate-200 text-slate-700 cursor-not-allowed select-none"
                    : isGenderOpen
                    ? "bg-white border-sky-500 ring-4 ring-sky-500/10 shadow-xs cursor-pointer text-slate-900"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer text-slate-900"
                }`}
              >
                <span className={gender ? "font-semibold text-slate-900" : "text-slate-400 font-normal"}>
                  {gender ? (
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        gender === "Male" ? "bg-sky-500" : gender === "Female" ? "bg-rose-500" : "bg-purple-500"
                      }`} />
                      {gender}
                    </span>
                  ) : (
                    "Select Gender..."
                  )}
                </span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${isGenderOpen ? "rotate-180 text-sky-600" : ""}`} 
                />
              </button>

              <AnimatePresence>
                {isEditing && isGenderOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
                  >
                    <div className="space-y-0.5">
                      {[
                        { label: "Male", desc: "Male biological gender", color: "bg-sky-100 text-sky-700" },
                        { label: "Female", desc: "Female biological gender", color: "bg-rose-100 text-rose-700" },
                        { label: "Other", desc: "Non-binary / Other", color: "bg-purple-100 text-purple-700" },
                      ].map((item) => {
                        const isSelected = gender === item.label;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setGender(item.label);
                              setIsGenderOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? "bg-sky-50 text-sky-900 font-bold border border-sky-100"
                                : "hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${item.color}`}>
                                {item.label.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{item.label}</p>
                                <p className="text-[11px] text-slate-400 font-normal">{item.desc}</p>
                              </div>
                            </div>
                            {isSelected && <Check size={16} className="text-sky-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom Blood Group Dropdown Pop-up */}
            <div className="relative" ref={bloodDropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Blood Group</label>
              <button
                type="button"
                disabled={!isEditing}
                onClick={() => isEditing && setIsBloodGroupOpen(!isBloodGroupOpen)}
                className={`w-full h-11 px-4 border rounded-xl text-sm flex items-center justify-between transition-all duration-150 ${
                  !isEditing
                    ? "bg-slate-50/80 border-slate-200 text-slate-700 cursor-not-allowed select-none"
                    : isBloodGroupOpen
                    ? "bg-white border-sky-500 ring-4 ring-sky-500/10 shadow-xs cursor-pointer text-slate-900"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer text-slate-900"
                }`}
              >
                <span className={bloodGroup ? "font-semibold text-slate-900" : "text-slate-400 font-normal"}>
                  {bloodGroup ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-xs font-bold">
                        <Droplet size={11} className="fill-rose-500 text-rose-500" />
                      </span>
                      <span className="font-bold text-rose-950">{bloodGroup}</span>
                    </span>
                  ) : (
                    "Select Blood Group..."
                  )}
                </span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${isBloodGroupOpen ? "rotate-180 text-sky-600" : ""}`} 
                />
              </button>

              <AnimatePresence>
                {isEditing && isBloodGroupOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
                  >
                    <div className="px-2 py-1 mb-1.5 flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Blood Type</span>
                      <Droplet size={13} className="text-rose-500 fill-rose-500" />
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => {
                        const isSelected = bloodGroup === bg;
                        return (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => {
                              setBloodGroup(bg);
                              setIsBloodGroupOpen(false);
                            }}
                            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? "bg-rose-50 text-rose-700 font-extrabold border-rose-300 shadow-xs scale-[1.02]"
                                : "bg-slate-50/60 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200/80 font-bold"
                            }`}
                          >
                            <span className="text-sm">{bg}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Full Residential Address
                </label>
                <span className="text-[11px] text-sky-600 font-medium">
                  Google Maps & Bangladesh Geo Autocomplete (EN / বাংলা)
                </span>
              </div>
              <LocationAutocompleteInput
                value={address}
                onChange={setAddress}
                disabled={!isEditing}
                onLocationSelect={(loc) => {
                  setAddress(loc.address);
                  if (user && loc.zila) {
                    const nowStr = new Date().toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const updatedLoc = {
                      address: loc.address,
                      zila: loc.zila,
                      post_code: loc.postcode || "1205",
                      division: loc.division || "Dhaka",
                      upazila: loc.upazila || "",
                      last_location_sync: nowStr,
                    };
                    localStorage.setItem(`hp_location_${user.id}`, JSON.stringify(updatedLoc));
                  }
                }}
                placeholder="Type house/road, area, upazila and district in English or বাংলা..."
              />
            </div>
          </div>

          {isEditing ? (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsGenderOpen(false);
                  setIsBloodGroupOpen(false);
                  loadProfileData();
                }}
                className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 h-11 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all shadow-md shadow-sky-600/20 text-sm disabled:opacity-70 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            </div>
          ) : (
            <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
              <span>Click "Edit Profile" above to update your personal information.</span>
            </div>
          )}
        </form>

        {/* HealthPass Medical ID Card Activation & Verification Section */}
        <HealthPassSettingsSection
          userData={{
            id: user?.id,
            name,
            bloodGroup,
            blood_group: bloodGroup,
            dob,
            gender,
            phone,
            image: profileImage || undefined,
            nid,
            emergency_contact: emergencyContact,
            address,
          }}
          onProfileUpdated={loadProfileData}
        />

        {/* EXPANDABLE SECTIONS (Security & Notifications) */}
        <div className="space-y-3">
          {/* Security Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('security')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-slate-700" />
                <div>
                  <span className="font-bold text-sm text-slate-900 block">Account Security</span>
                  <span className="text-xs text-slate-500">Password management and 2FA authentication</span>
                </div>
              </div>
              {expandedSection === 'security' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedSection === 'security' && (
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
                <p className="text-xs text-slate-600">Password reset and authentication security settings.</p>
                <button
                  type="button"
                  onClick={() => router.push('/reset-password')}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors"
                >
                  Change Password
                </button>
              </div>
            )}
          </div>

          {/* Notifications Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('notifications')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-slate-700" />
                <div>
                  <span className="font-bold text-sm text-slate-900 block">Notification Preferences</span>
                  <span className="text-xs text-slate-500">SMS, Email, and Appointment alerts</span>
                </div>
              </div>
              {expandedSection === 'notifications' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedSection === 'notifications' && (
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>SMS Appointment Reminders</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-slate-900" />
                </label>
                <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Email Medical Report Alerts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-slate-900" />
                </label>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 h-11 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-colors text-sm"
            >
              <LogOut size={16} /> Sign Out Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
