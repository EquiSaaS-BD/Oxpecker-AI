"use client";

import { useState } from "react";
import { 
  Bell, Smartphone, Mail, Volume2, Globe2, Save
} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function NotificationsSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    pushAppointments: true,
    pushMessages: true,
    pushUpdates: false,
    smsAppointments: true,
    smsReminders: true,
    emailDaily: true,
    emailWeekly: false,
    emailMarketing: false,
    soundEnabled: true,
    language: "en"
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Preferences updated successfully!");
    }, 1000);
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#2F80ED]' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="flex justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              Notifications & Preferences
            </h1>
            <p className="text-slate-500 mt-1">Manage how you receive alerts and customize your dashboard experience.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left Column: Notification Channels */}
        <div className="space-y-8">
          
          {/* Push Notifications */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <Bell size={20} className="text-[#2F80ED]" /> Push Notifications (Browser/App)
              </h3>
            </div>
            <div className="p-2">
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800">New Appointments</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Alert when a patient books a new slot.</p>
                </div>
                <ToggleSwitch checked={preferences.pushAppointments} onChange={() => handleToggle('pushAppointments')} />
              </div>
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800">Assistant Messages</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Alert for internal team chat and updates.</p>
                </div>
                <ToggleSwitch checked={preferences.pushMessages} onChange={() => handleToggle('pushMessages')} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800">Platform Updates</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Receive news about new Shusthota features.</p>
                </div>
                <ToggleSwitch checked={preferences.pushUpdates} onChange={() => handleToggle('pushUpdates')} />
              </div>
            </div>
          </div>

          {/* SMS Alerts */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full">
            <div className="p-6 border-b border-slate-100 bg-[#8B5CF6]/5">
              <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <Smartphone size={20} className="text-[#8B5CF6]" /> SMS Alerts
              </h3>
            </div>
            <div className="p-2">
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800">Appointment Confirmation</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Receive SMS when an appointment is confirmed.</p>
                </div>
                <ToggleSwitch checked={preferences.smsAppointments} onChange={() => handleToggle('smsAppointments')} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800">Daily Schedule Reminder</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Morning SMS with your daily patient queue.</p>
                </div>
                <ToggleSwitch checked={preferences.smsReminders} onChange={() => handleToggle('smsReminders')} />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Email & Preferences */}
        <div className="space-y-8">
          
          {/* Email Notifications */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full">
            <div className="p-6 border-b border-slate-100 bg-[#F59E0B]/5">
              <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <Mail size={20} className="text-[#F59E0B]" /> Email Summaries
              </h3>
            </div>
            <div className="p-2">
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800">Daily Summary</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Get a daily email of completed appointments.</p>
                </div>
                <ToggleSwitch checked={preferences.emailDaily} onChange={() => handleToggle('emailDaily')} />
              </div>
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800">Weekly Analytics</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Receive a weekly report of patient flow.</p>
                </div>
                <ToggleSwitch checked={preferences.emailWeekly} onChange={() => handleToggle('emailWeekly')} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800">Marketing & Offers</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Occasional emails about subscription plans.</p>
                </div>
                <ToggleSwitch checked={preferences.emailMarketing} onChange={() => handleToggle('emailMarketing')} />
              </div>
            </div>
          </div>

          {/* System Preferences */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full">
            <div className="p-6 border-b border-slate-100 bg-[#10B981]/5">
              <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <Volume2 size={20} className="text-[#10B981]" /> System Preferences
              </h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800">Dashboard Sound</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Play a sound on new notifications.</p>
                </div>
                <ToggleSwitch checked={preferences.soundEnabled} onChange={() => handleToggle('soundEnabled')} />
              </div>

              <div className="h-[1px] w-full bg-slate-100"></div>

              <div>
                <label className="block text-[14px] font-bold text-slate-800 mb-1.5 flex items-center gap-2">
                  <Globe2 size={16} className="text-slate-500" /> Interface Language
                </label>
                <p className="text-[13px] text-slate-500 mb-3">Select the default language for your dashboard.</p>
                <select 
                  value={preferences.language}
                  onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                  className="w-full h-[48px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-800 font-semibold focus:outline-none focus:border-[#2F80ED] transition-all cursor-pointer"
                >
                  <option value="en">English (Default)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                </select>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
