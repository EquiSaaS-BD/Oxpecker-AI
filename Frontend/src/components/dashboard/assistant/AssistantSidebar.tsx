import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Calendar, UserPlus, FileText, 
  Clock, CreditCard, Bell, BarChart3, Settings, LogOut 
} from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { name: "Dashboard", href: "/assistant", icon: LayoutDashboard },
  { name: "Patient Management", href: "/assistant/patients", icon: FileText },
  { name: "Appointments", href: "/assistant/appointments", icon: Calendar },
  { name: "Walk-in Patients", href: "/assistant/walk-in", icon: UserPlus },
  { name: "Doctor Schedule", href: "/assistant/schedule", icon: Clock },
  { name: "Prescription Queue", href: "/assistant/prescriptions", icon: FileText },
  { name: "Payments", href: "/assistant/payments", icon: CreditCard },
  { name: "Notifications", href: "/assistant/notifications", icon: Bell },
  { name: "Reports", href: "/assistant/reports", icon: BarChart3 },
];

export default function AssistantSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[88px] xl:w-[280px] h-screen bg-white border-r border-assistant-border hidden lg:flex flex-col flex-shrink-0 sticky top-0 left-0 overflow-hidden z-50 transition-all duration-300">
      <div className="h-[80px] flex items-center justify-center xl:justify-start xl:px-6 border-b border-assistant-border shrink-0">
        <Link href="/">
          {/* Mobile/Tablet Logo (Icon only) */}
          <div className="relative w-10 h-10 xl:hidden">
            <Image src="/images/Oxpecker_icon.png" alt="Shustota Icon" fill className="object-contain" />
          </div>
          {/* Desktop Logo (Full) */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image src="/images/Oxpecker_icon.png" alt="Shustota Icon" fill className="object-contain" />
            </div>
            <span className="text-[20px] font-black text-slate-800 tracking-tight">Shustota</span>
          </div>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 xl:px-4 flex flex-col gap-4 overflow-x-hidden">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isNotification = item.name === "Notifications";
            const unreadCount = 3; // Production level mock count

            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center justify-center xl:justify-start h-[52px] xl:px-4 rounded-[14px] transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-gradient-to-tr from-[#2F80ED] to-[#2F80ED]/90 text-white shadow-md" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                title={item.name}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"} />
                  <span className="text-[15px] font-medium hidden xl:block whitespace-nowrap">{item.name}</span>
                </div>
                
                {/* Notification Badge - Desktop */}
                {isNotification && (
                  <span className={`hidden xl:flex px-2 py-0.5 text-[11px] font-bold rounded-full ml-auto ${isActive ? "bg-white text-[#2F80ED]" : "bg-red-500 text-white"}`}>
                    {unreadCount} New
                  </span>
                )}
                
                {/* Notification Dot - Tablet */}
                {isNotification && (
                  <span className="xl:hidden absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="p-4 border-t border-assistant-border shrink-0">
        <Link href="/assistant/settings" className="flex items-center justify-center xl:justify-start gap-4 h-[52px] xl:px-4 w-full rounded-[14px] text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all font-medium group" title="Settings">
          <Settings size={24} className="group-hover:text-slate-600" />
          <span className="text-[15px] hidden xl:block whitespace-nowrap">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
