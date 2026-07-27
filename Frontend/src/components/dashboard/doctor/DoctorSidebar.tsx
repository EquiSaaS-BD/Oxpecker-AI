import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Calendar, Clock, CreditCard, 
  Settings, LogOut, FileText, Activity 
} from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { name: "Live Monitor", href: "/doctor", icon: Activity },
  { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
  { name: "Patients", href: "/doctor/patients", icon: Users },
  { name: "Prescriptions", href: "/doctor/prescriptions", icon: FileText },
  { name: "Schedule", href: "/doctor/schedule", icon: Clock },
  { name: "Revenue", href: "/doctor/revenue", icon: CreditCard },
  { name: "Team Settings", href: "/doctor/settings/team", icon: Settings },
];

export default function DoctorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] h-screen bg-white border-r border-slate-200 flex flex-col flex-shrink-0 sticky top-0 left-0 overflow-hidden z-50">
      <div className="h-[80px] flex items-center px-6 border-b border-slate-200 shrink-0">
        <Link href="/">
          <Image src="/images/shustota ai logo.png" alt="Shustota AI" width={180} height={60} className="h-10 w-auto object-contain" />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith('/doctor/settings') && item.href.includes('settings'));
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-4 h-[52px] px-4 rounded-[14px] transition-all duration-200 ${
                  isActive 
                    ? "bg-[#2F80ED] text-white font-semibold shadow-[0_4px_12px_rgba(47,128,237,0.3)]" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <item.icon size={22} className={isActive ? "text-white" : "text-slate-400"} />
                <span className="text-[15px]">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 shrink-0">
        <button className="flex items-center gap-4 h-[52px] px-4 w-full rounded-[14px] text-red-500 hover:bg-red-50 transition-all font-medium">
          <LogOut size={22} />
          <span className="text-[15px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
