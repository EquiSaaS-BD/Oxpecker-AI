"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  Bell, 
  ArrowLeft,
  ChevronRight,
  LogOut,
  Settings,
  Stethoscope
} from "lucide-react";

export default function DoctorSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const settingsNav = [
    { label: "Settings Overview", href: "/doctor/settings", icon: Settings },
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
      <aside className="w-full lg:w-[280px] bg-white border-r border-slate-200/90 flex flex-col shrink-0 h-auto lg:h-screen sticky top-0 shadow-xs z-20">
        
        {/* Top Header: Official Brand Logo */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <Link href="/doctor/dashboard" className="flex items-center gap-2" title="Doctor Dashboard">
            <Image
              src="/images/Oxpecker_full_size.png"
              alt="Oxpecker AI"
              width={140}
              height={36}
              className="object-contain block transition-all"
            />
          </Link>
          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
            DOCTOR
          </span>
        </div>

        {/* Back to Dashboard Navigation Link */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-100">
          <button 
            type="button"
            onClick={() => router.push('/doctor/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors font-semibold text-xs py-1.5 px-2 rounded-lg hover:bg-slate-50 w-full cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-sky-600" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Doctor Identity Mini Profile Card */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-sky-400/40 relative overflow-hidden shrink-0 shadow-2xs">
              <Image
                src={user?.image || "/images/signup-doctor.png"}
                alt={user?.name || "Doctor"}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                {user?.name || "Dr. Attending Physician"}
              </h3>
              <p className="text-[10px] text-sky-600 font-medium truncate flex items-center gap-1">
                <Stethoscope size={10} />
                <span>Specialist Physician</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto scrollbar-hide">
          <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Doctor Settings
          </div>
          {settingsNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group
                  ${isActive 
                    ? "bg-sky-50 text-sky-700 border border-sky-200 shadow-xs" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <item.icon size={17} className={`nav-icon ${isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-sky-500 opacity-80 shrink-0" />}
              </Link>
            );
          })}
        </nav>
        
        {/* FIXED BOTTOM SECTION: Settings & Logout Button Permanently Anchored */}
        <div className="p-3 border-t border-slate-200/90 bg-white space-y-1.5 shrink-0 shadow-xs">
          <Link
            href="/doctor/settings"
            className={`
              flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
              ${pathname === "/doctor/settings"
                ? "bg-slate-100 text-slate-800"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }
            `}
          >
            <Settings size={16} className="text-slate-500" />
            <span className="flex-1">Settings Overview</span>
          </Link>

          <button 
            type="button"
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-all cursor-pointer group"
          >
            <LogOut size={16} className="text-rose-500 group-hover:text-rose-700 transition-transform group-hover:-translate-x-0.5" />
            <span className="flex-1 text-left">লগআউট (Sign Out)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 relative">
        <div className="max-w-4xl w-full mx-auto p-4 sm:p-8 lg:p-10 pb-24">
          {children}
        </div>
      </main>

    </div>
  );
}
