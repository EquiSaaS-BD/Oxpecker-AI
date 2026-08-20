"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShieldCheck, Save, Camera, Eye, EyeOff, User, Mail, Lock, Phone, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGetProfile, apiUpdateProfile, compressAndResizeImage } from "@/lib/api";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function SuperAdminProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    phone: "",
    title: "Supreme System Administrator"
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    setIsLoading(true);
    try {
      const res = await apiGetProfile();
      const prof = res.data.profile || {};
      setFormData({
        name: prof.name || user?.name || "Supreme Admin",
        email: prof.email || user?.email || "admin@oxpecker.com",
        password: prof.password || "supremeadmin",
        phone: prof.phone || "+880 1700-000000",
        title: "Supreme System Administrator"
      });
      if (prof.image) setImagePreview(prof.image);
      else if (user?.image) setImagePreview(user.image);
    } catch (e) {
      toast.error("Failed to load admin profile from database.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 99% WebP Canvas compression
      const compressedUrl = await compressAndResizeImage(file, 400, 400, 0.75);
      setImagePreview(compressedUrl);
      setFormData((prev: any) => ({ ...prev, image: compressedUrl }));
      toast.success("Profile photo compressed & updated! Click Save Changes.");
    } catch (err) {
      toast.error("Failed to process image.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data: updated, error } = await supabase
        .from("profiles")
        .update({
          name: formData.name.trim(),
          password: formData.password.trim(),
          phone: formData.phone.trim(),
          image: formData.image || imagePreview || undefined
        })
        .eq("email", formData.email)
        .select()
        .single();

      if (error) throw error;

      toast.success("Super Admin profile updated in Supabase database!");
      if (user) {
        updateUser({
          ...user,
          name: formData.name.trim(),
          image: formData.image || imagePreview || user.image
        });
      }
      loadAdminProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <Toaster position="top-center" richColors />

      <AdminPageHeader
        title="Super Admin Profile & Master Credentials"
        description="Manage your Supreme Administrator profile details, credentials, and avatar. Synchronized live with Supabase cloud database."
        icon={<ShieldCheck size={24} className="text-amber-500" />}
      />

      <div className="max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="bg-slate-900 px-8 py-10 text-white flex flex-col sm:flex-row items-center gap-6 relative">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white/50 shadow-lg relative">
              {imagePreview ? (
                <Image src={imagePreview} alt="Admin" fill className="object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{(formData.name || "S").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <label
              htmlFor="admin-avatar-upload"
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white"
              title="Change Profile Photo"
            >
              <Camera size={24} />
            </label>
            <input
              id="admin-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-extrabold flex items-center justify-center sm:justify-start gap-2">
              {formData.name}
              <ShieldCheck size={20} className="text-amber-400" />
            </h1>
            <p className="text-slate-300 text-sm mt-1 font-medium">{formData.title}</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">{formData.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Master Administrator Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address (Primary Admin)</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full h-11 pl-10 pr-4 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Account Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-10 pl-10 pr-10 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white font-mono"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs">
            <KeyRound size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <div className="font-bold mb-0.5">God-Level Privileges Active</div>
              <div>Changes to your name, password, or avatar sync directly to Supabase cloud database. Your credentials allow full CRUD access across all platform entities.</div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-8 h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md text-sm disabled:opacity-70"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Admin Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
