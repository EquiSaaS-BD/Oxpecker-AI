import { Bell, Menu } from 'lucide-react';
import Image from 'next/image';

export default function DoctorTopNav() {
  return (
    <header className="h-[80px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-6">
        <h2 className="text-[20px] font-bold text-slate-800 hidden md:block">Doctor Dashboard</h2>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] text-sm font-semibold rounded-full border border-[#22C55E]/20">
          Online
        </span>
        <button aria-label="Notifications" className="relative p-2 text-slate-400 hover:text-[#2F80ED] transition-colors">
          <Bell size={24} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-[15px] font-bold text-slate-700 leading-tight">Dr. Sarah Rahman</span>
            <span className="text-[12px] text-slate-500">Cardiologist</span>
          </div>
          <div className="w-[48px] h-[48px] rounded-full overflow-hidden border-2 border-slate-100 relative bg-slate-200">
            <Image src="/images/signup-doctor.png" alt="Doctor" fill className="object-cover" />
          </div>
        </div>
        <button aria-label="Toggle menu" className="md:hidden text-slate-500">
          <Menu size={28} />
        </button>
      </div>
    </header>
  );
}
