"use client";

import { useState, useEffect, useRef } from "react";
import { LogOut, User, Camera, Save, Shield, Bell, ChevronDown, ChevronUp, Droplet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { apiGetProfile, apiUpdateProfile, compressAndResizeImage } from "@/lib/api";

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
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Expandable sections state (Security, Notifications only)
  const [expandedSection, setExpandedSection] = useState<'security' | 'notifications' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load User Data from Supabase
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
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
      if (prof.image) setProfileImage(prof.image);
    } catch (e) {
      toast.error("Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  };

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
        toast.success("Profile photo uploaded & compressed. Click 'Save Changes'.");
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
      await apiUpdateProfile({
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

      toast.success("Profile updated successfully!");

      if (user) {
        updateUser({
          ...user,
          name,
          phone,
          date_of_birth: dob,
          gender,
          blood_group: bloodGroup,
          address,
          image: profileImage || user.image
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
            <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-white ring-2 ring-slate-200">
              {profileImage ? (
                <Image src={profileImage} alt="Profile" fill className="object-cover" />
              ) : (
                <span>{(name || "U").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera size={22} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900">{name || "User Profile"}</h2>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                {completionPercentage}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
              <div className="bg-slate-900 h-full transition-all duration-500 rounded-full" style={{ width: `${completionPercentage}%` }} />
            </div>
            <p className="text-xs text-slate-500">{email} • {user.role?.toUpperCase()}</p>
          </div>
        </div>

        {/* PERSONAL DETAILS FORM */}
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User size={18} className="text-slate-700" /> Personal Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email" disabled value={email}
                className="w-full h-11 px-4 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone / Mobile Number</label>
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
                placeholder="+880 1700-000000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth</label>
              <input
                type="date" value={dob} onChange={e => setDob(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
              <select
                value={gender} onChange={e => setGender(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
              >
                <option value="">Select Gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Blood Group</label>
              <select
                value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
              >
                <option value="">Select Blood Group...</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Address</label>
              <input
                type="text" value={address} onChange={e => setAddress(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
                placeholder="House/Road, Thana, District"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit" disabled={isSaving}
              className="flex items-center gap-2 px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm text-sm disabled:opacity-70"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>

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
