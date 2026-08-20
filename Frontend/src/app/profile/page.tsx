"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiGetProfile, apiUpdateProfile, compressAndResizeImage } from "@/lib/api";
import { toast, Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Save, User, UserCog, Stethoscope, Building2, Camera, Upload } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading, updateUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      loadProfile();
    }
    if (!isAuthLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, isAuthLoading]);

  const loadProfile = async () => {
    try {
      const response = await apiGetProfile();
      const prof = response.data.profile || {};
      setProfileData(prof);
      setFormData(prof);
      if (prof.image || prof.avatar_url) {
        setImagePreview(prof.image || prof.avatar_url);
      }
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB");
      return;
    }

    try {
      const dataUrl = await compressAndResizeImage(file);
      setImagePreview(dataUrl);
      setFormData((prev: any) => ({ ...prev, image: dataUrl, avatar_url: dataUrl }));
      toast.success("Profile photo uploaded. Click 'Save Changes' to apply.");
    } catch (err) {
      toast.error("Failed to process image file");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiUpdateProfile(formData);
      toast.success("Profile saved successfully to database!");
      if (user && res?.data?.profile) {
        const p = res.data.profile;
        updateUser({
          ...user,
          name: p.name || user.name,
          phone: p.phone || user.phone,
          date_of_birth: p.date_of_birth || user.date_of_birth,
          gender: p.gender || user.gender,
          blood_group: p.blood_group || user.blood_group,
          address: p.address || user.address,
          image: p.image || user.image
        });
      }
      loadProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  const role = user?.role;

  const InputField = ({ label, id, type = "text", ...props }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <input
        type={type}
        id={id}
        value={formData[id] || ""}
        onChange={(e) => handleInputChange(id, e.target.value)}
        className="w-full h-11 rounded-xl px-4 border border-slate-200 focus:border-slate-900 outline-none transition-all text-sm bg-white"
        {...props}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <Toaster position="top-center" richColors />
      
      <main className="flex-1 w-full max-w-4xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 px-8 py-10 text-white flex flex-col sm:flex-row items-center gap-6 relative">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white/50 shadow-lg relative">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Profile" fill className="object-cover" />
                ) : (
                  <>
                    {role === "patient" && <User size={40} />}
                    {role === "doctor" && <Stethoscope size={40} />}
                    {role === "hospital" && <Building2 size={40} />}
                  </>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white"
                title="Change Photo"
              >
                <Camera size={24} />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{formData.full_name || formData.name || user?.name}</h1>
              <p className="text-slate-300 mt-1 capitalize font-medium flex items-center justify-center sm:justify-start gap-2 text-sm">
                <UserCog size={15} />
                {role} Profile
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">{formData.email || user?.email}</p>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <h2 className="text-base font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Personal & Account Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              <InputField label="Full Name" id="full_name" />
              <InputField label="Email Address" id="email" disabled className="w-full h-11 rounded-xl px-4 border border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed text-sm" />
              <InputField label="Phone Number" id="phone" placeholder="+880 1700-000000" />
              
              {role === "patient" && (
                <>
                  <InputField label="Date of Birth" id="date_of_birth" type="date" />
                  <InputField label="Gender" id="gender" placeholder="Male / Female / Other" />
                  <InputField label="Blood Group" id="blood_group" placeholder="e.g. A+" />
                  <InputField label="Emergency Contact" id="emergency_contact" placeholder="+880 1..." />
                </>
              )}

              {role === "doctor" && (
                <>
                  <InputField label="Specialty" id="specialty" />
                  <InputField label="Qualification" id="qualification" />
                  <InputField label="Experience (Years)" id="experience_years" type="number" />
                  <InputField label="Consultation Fee (৳)" id="consultation_fee" type="number" />
                </>
              )}

              {role === "hospital" && (
                <>
                  <InputField label="Hospital Name" id="hospital_name" />
                  <InputField label="City" id="city" />
                  <InputField label="Bed Count" id="bed_count" type="number" />
                </>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
