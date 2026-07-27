"use client";

import { useState, useEffect, useRef } from "react";
import { LogOut, User, Camera, Save, Shield, Bell, Moon, ChevronDown, ChevronUp, Droplet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import Image from "next/image";

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
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  // Dynamic color logic based on percentage
  const getCompletionColor = (percent: number) => {
    if (percent < 40) return "from-red-500 to-red-400"; // Red
    if (percent < 70) return "from-orange-500 to-amber-400"; // Orange/Yellow
    if (percent < 100) return "from-lime-500 to-green-400"; // Light Green
    return "from-[#22C55E] to-[#10B981]"; // Brand Green
  };
  
  const getCompletionBg = (percent: number) => {
    if (percent < 40) return "from-red-500 via-red-400 to-red-500";
    if (percent < 70) return "from-orange-500 via-amber-400 to-orange-500";
    if (percent < 100) return "from-lime-500 via-green-400 to-lime-500";
    return "from-[#22C55E] via-[#10B981] to-[#059669]";
  };
  
  const colorClass = getCompletionColor(completionPercentage);
  const bgClass = getCompletionBg(completionPercentage);
  
  // Expandable sections state
  const [expandedSection, setExpandedSection] = useState<'security' | 'notifications' | 'appearance' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load User Data on mount
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      const savedImage = localStorage.getItem(`shustota_img_${user.id}`);
      if (savedImage) setProfileImage(savedImage);
    }
  }, [user]);

  // Handle Profile Picture Upload Mock
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (user && typeof reader.result === 'string') {
          localStorage.setItem(`shustota_img_${user.id}`, reader.result);
          updateUser({ ...user, image: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully!", {
        style: { background: '#22C55E', color: '#fff', border: 'none' }
      });
    }, 800);
  };

  const toggleSection = (section: 'security' | 'notifications' | 'appearance') => {
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
      <Toaster position="top-center" />
      <div className="max-w-[760px] mx-auto">
        <h1 className="text-[28px] font-bold text-slate-900 mb-8 tracking-tight">Profile & Settings</h1>
        
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Profile Completion Bar */}
          <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Profile Completion</h3>
                <p className="text-[13px] text-slate-500 font-medium mt-0.5">Please complete at least 80% to book appointments seamlessly.</p>
              </div>
              <div className="text-right">
                <span className={`text-[20px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${colorClass} transition-all duration-500`}>
                  {completionPercentage}%
                </span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${bgClass} rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </section>
          
          {/* Profile Picture Section */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <div className="w-[100px] h-[100px] rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm overflow-hidden flex items-center justify-center relative">
                {profileImage ? (
                  <Image src={profileImage} alt="Profile" fill className="object-cover" />
                ) : (
                  <User size={40} className="text-slate-300" />
                )}
                
                {/* Upload Overlay */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                >
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                <span className="text-primary font-bold text-sm capitalize bg-primary/10 px-3 py-1 rounded-md">
                  {user.role || "Patient"}
                </span>
                <span className="text-slate-500 text-sm font-medium">{email}</span>
              </div>
            </div>
            <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto h-11 px-6 bg-primary hover:bg-[#0052cc] text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> Save Profile</>}
              </button>
            </div>
          </section>

          {/* Personal Information (Clean Professional UI) */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-[18px] font-bold text-slate-900 mb-6 pb-4 border-b border-slate-50">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-slate-600">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[14px]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-slate-600">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[14px]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-slate-600">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-slate-600">Date of Birth</label>
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-slate-600">Gender</label>
                <div className="relative">
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-[46px] px-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[14px] cursor-pointer appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-slate-600">Blood Group</label>
                <div className="relative">
                  <select 
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full h-[46px] px-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[14px] cursor-pointer appearance-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[13px] font-bold text-slate-600">Address</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[80px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[14px] resize-none"
                />
              </div>
            </div>
          </section>
        </form>

        {/* Preferences & Security (Interactive Accordions) */}
        <section className="mt-8">
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-50">
            
            {/* Security Settings */}
            <div>
              <button 
                onClick={() => toggleSection('security')}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Security Settings</div>
                    <div className="text-[13px] text-slate-500">Change password and authentication methods</div>
                  </div>
                </div>
                {expandedSection === 'security' ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              {expandedSection === 'security' && (
                <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-600 mb-1">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full h-10 px-3 border border-slate-200 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-slate-600 mb-1">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full h-10 px-3 border border-slate-200 rounded-md" />
                    </div>
                  </div>
                  <button className="bg-slate-900 text-white px-5 py-2 rounded-md text-[14px] font-medium hover:bg-slate-800 transition-colors">
                    Update Password
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div>
              <button 
                onClick={() => toggleSection('notifications')}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                    <Bell size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Notifications</div>
                    <div className="text-[13px] text-slate-500">Manage email, SMS and push alerts</div>
                  </div>
                </div>
                {expandedSection === 'notifications' ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              {expandedSection === 'notifications' && (
                <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[14px] font-medium text-slate-700">Email Notifications for Appointments</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[14px] font-medium text-slate-700">SMS Alerts</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[14px] font-medium text-slate-700">Marketing & Promotional Emails</span>
                    <input type="checkbox" className="w-4 h-4 accent-primary" />
                  </label>
                </div>
              )}
            </div>

            {/* Appearance */}
            <div>
              <button 
                onClick={() => toggleSection('appearance')}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <Moon size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Appearance</div>
                    <div className="text-[13px] text-slate-500">Switch between light and dark mode</div>
                  </div>
                </div>
                {expandedSection === 'appearance' ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              {expandedSection === 'appearance' && (
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-4">
                  <button className="flex-1 py-3 border-2 border-primary bg-white text-primary font-bold rounded-xl shadow-sm text-sm">
                    Light Mode
                  </button>
                  <button className="flex-1 py-3 border-2 border-slate-200 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm">
                    Dark Mode (Soon)
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Danger Zone */}
        <section className="mt-8 pb-12">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors"
          >
            <LogOut size={20} />
            Sign Out Securely
          </button>
        </section>

      </div>
    </div>
  );
}
