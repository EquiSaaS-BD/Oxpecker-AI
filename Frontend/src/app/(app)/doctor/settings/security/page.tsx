"use client";

import { useState } from "react";
import { 
  ShieldAlert, KeyRound, Smartphone, Monitor, Lock, AlertTriangle, Eye, EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const activeSessions = [
    { id: 1, device: "Windows 11 - Chrome", location: "Dhaka, Bangladesh", time: "Active now", current: true, icon: Monitor },
    { id: 2, device: "iPhone 15 Pro - Safari", location: "Dhaka, Bangladesh", time: "Last active: 2 hours ago", current: false, icon: Smartphone },
  ];

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    }, 1500);
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(`Two-Factor Authentication ${!twoFactorEnabled ? 'Enabled' : 'Disabled'}.`);
  };

  const handleLogoutSession = (id: number) => {
    toast.success("Session terminated securely.");
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            Account & Security
          </h1>
          <p className="text-slate-500 mt-1">Manage your password, 2FA, and active sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left Column: Password & 2FA */}
        <div className="space-y-8">
          
          {/* Change Password */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <KeyRound size={20} className="text-[#2F80ED]" /> Change Password
              </h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPassword.current ? "text" : "password"} 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] transition-all"
                  />
                  <button 
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword.new ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] transition-all"
                  />
                  <button 
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword.confirm ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 text-[14px] text-slate-800 focus:outline-none focus:border-[#2F80ED] transition-all"
                  />
                  <button 
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleUpdatePassword}
                disabled={isChangingPassword}
                className="w-full h-[48px] bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-all mt-2"
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>

          {/* 2FA */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full">
            <div className="p-6 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${twoFactorEnabled ? 'bg-[#22C55E]/10' : 'bg-slate-100'}`}>
                  <ShieldAlert size={24} className={twoFactorEnabled ? 'text-[#22C55E]' : 'text-slate-400'} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-800">Two-Factor Authentication</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                </div>
              </div>
              <button 
                onClick={handleToggle2FA}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${twoFactorEnabled ? 'bg-[#22C55E]' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {twoFactorEnabled && (
              <div className="px-6 pb-6 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
                  <Lock size={16} className="text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-600">
                    2FA is currently <strong className="text-[#22C55E]">Enabled</strong>. You will receive an OTP via SMS to your registered phone number upon every new login.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Sessions */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full h-fit">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
              <Monitor size={20} className="text-[#2F80ED]" /> Active Sessions
            </h3>
            <button className="text-[13px] font-bold text-red-500 hover:text-red-600">
              Logout All
            </button>
          </div>
          
          <div className="p-2">
            {activeSessions.map((session, i) => {
              const Icon = session.icon;
              return (
                <div key={session.id} className={`p-4 flex items-center justify-between ${i !== activeSessions.length -1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                        {session.device}
                        {session.current && (
                          <span className="text-[10px] uppercase font-bold bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </h4>
                      <p className="text-[13px] text-slate-500 mt-0.5">{session.location} • {session.time}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <button 
                      onClick={() => handleLogoutSession(session.id)}
                      className="text-[13px] font-bold text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="p-6 bg-[#F59E0B]/5 border-t border-[#F59E0B]/20">
            <div className="flex gap-3">
              <AlertTriangle size={18} className="text-[#F59E0B] shrink-0 mt-0.5" />
              <p className="text-[13px] text-slate-600 leading-relaxed">
                If you notice any unfamiliar devices in this list, immediately change your password and click "Logout All".
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
