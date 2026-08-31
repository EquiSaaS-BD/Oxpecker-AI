"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  Bell, 
  ArrowLeft,
  ChevronRight,
  LogOut
} from "lucide-react";

export default function DoctorSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const settingsNav = [
    { label: "Profile Details", href: "/doctor/settings/profile", icon: User },
    { label: "Chambers & Schedule", href: "/doctor/settings/chambers", icon: MapPin },
    { label: "Education & Certifications", href: "/doctor/settings/education", icon: GraduationCap },
    { label: "Practice Locations", href: "/doctor/settings/locations", icon: Building2 },
    { label: "Account & Security", href: "/doctor/settings/security", icon: ShieldCheck },
    { label: "Notifications & Preferences", href: "/doctor/settings/notifications", icon: Bell },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 w-full overflow-hidden">
      
      {/* Settings Sidebar */}
      <aside className="w-full lg:w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0 h-auto lg:h-screen sticky top-0">
        
        {/* Header / Back Button */}
        <div className="h-[72px] flex items-center px-6 border-b border-slate-200">
          <button 
            onClick={() => router.push('/doctor/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-sky-400 transition-colors font-medium text-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </div>

        <div className="p-6 pb-2">
          <h2 className="text-xl font-bold text-slate-700 tracking-tight">Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your professional profile and preferences.</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {settingsNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  settings-nav-item flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? "bg-sky-600 text-white" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }
                `}
              >
                <item.icon size={18} className={`nav-icon ${isActive ? "text-slate-900" : "text-slate-500 group-hover:text-sky-400"}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={16} className="opacity-80" />}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 relative">
        <div className="max-w-4xl w-full mx-auto p-4 sm:p-8 lg:p-10 pb-20">
          {children}
        </div>
      </main>

    </div>
  );
}
