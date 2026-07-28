"use client";

import { useState, useEffect } from 'react';
import { Search, Bell, Menu, Check, X as XIcon, Info, LayoutDashboard, Users, Calendar, UserPlus, FileText, Clock, CreditCard, BarChart3, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast, Toaster } from 'sonner';

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
  { name: "Settings", href: "/assistant/settings", icon: Settings },
];

export default function AssistantTopNav() {
  const { user, updateUser } = useAuth();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [assignedDoctor, setAssignedDoctor] = useState<{name: string, location: string} | null>(null);
  
  // Format current date e.g., Oct 24, 2026
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    const loadData = () => {
      // Load invites targeted at this assistant
      if ((user as any)?.assistantId) {
        const invitesStr = localStorage.getItem('shustota_invites');
        if (invitesStr) {
          const allInvites = JSON.parse(invitesStr);
          setInvites(allInvites.filter((i: any) => i.assistantId === (user as any).assistantId && i.status === 'pending'));
        }
      }
      
      // Load notifications targeted at this assistant
      if (user?.id) {
        const notifStr = localStorage.getItem('shustota_notifications');
        if (notifStr) {
          const allNotifs = JSON.parse(notifStr);
          setNotifications(allNotifs.filter((n: any) => n.targetId === (user as any).assistantId || n.targetId === user.id));
        }

        // Load assigned doctor info
        if ((user as any).doctorId) {
          const usersStr = localStorage.getItem('shustota_users');
          if (usersStr) {
            const users = JSON.parse(usersStr);
            const doc = users.find((u: any) => u.id === (user as any).doctorId);
            if (doc) {
              setAssignedDoctor({
                name: doc.name || 'Assigned Doctor',
                location: doc.location || 'Central Hospital'
              });
            }
          }
        }
      }
    };

    // Initial load
    loadData();

    // Real-time sync across tabs
    window.addEventListener('storage', loadData);
    
    // Polling fallback to ensure instant updates even in the same tab session
    const interval = setInterval(loadData, 1000);

    return () => {
      window.removeEventListener('storage', loadData);
      clearInterval(interval);
    };
  }, [user, showNotifications]);

  const handleAcceptInvite = (inviteId: string) => {
    const invitesStr = localStorage.getItem('shustota_invites');
    if (invitesStr) {
      const allInvites = JSON.parse(invitesStr);
      let doctorName = "the doctor";
      let doctorId = "";
      
      const updatedInvites = allInvites.map((i: any) => {
        if (i.id === inviteId) {
          doctorName = i.doctorName || doctorName;
          doctorId = i.doctorId || "";
          return { ...i, status: 'accepted' };
        }
        return i;
      });
      
      localStorage.setItem('shustota_invites', JSON.stringify(updatedInvites));
      setInvites(updatedInvites.filter((i: any) => i.assistantId === (user as any)?.assistantId && i.status === 'pending'));

      if (doctorId && user) {
        const usersStr = localStorage.getItem('shustota_users');
        if (usersStr) {
          const users = JSON.parse(usersStr);
          const uIdx = users.findIndex((u: any) => u.id === user.id);
          if (uIdx !== -1) {
            users[uIdx].doctorId = doctorId;
            localStorage.setItem('shustota_users', JSON.stringify(users));
          }
        }
        updateUser({ ...user, doctorId });
        
        // Update Doctor's connected assistants list so they see it in real-time
        const asstStr = localStorage.getItem('shustota_assistants');
        if (asstStr) {
          const docAssistants = JSON.parse(asstStr);
          const aIdx = docAssistants.findIndex((a: any) => a.id === user.assistantId);
          if (aIdx !== -1) {
            docAssistants[aIdx].status = "Connected";
            docAssistants[aIdx].name = user.name;
            docAssistants[aIdx].color = "text-[#22C55E]";
            docAssistants[aIdx].bg = "bg-[#22C55E]";
            docAssistants[aIdx].isPending = false;
            localStorage.setItem('shustota_assistants', JSON.stringify(docAssistants));
          }
        }
      }

      toast.success(`Invite accepted! You are now connected to ${doctorName}.`);
    }
  };

  const handleRejectInvite = (inviteId: string) => {
    const invitesStr = localStorage.getItem('shustota_invites');
    if (invitesStr) {
      const allInvites = JSON.parse(invitesStr);
      const updatedInvites = allInvites.map((i: any) => 
        i.id === inviteId ? { ...i, status: 'rejected' } : i
      );
      localStorage.setItem('shustota_invites', JSON.stringify(updatedInvites));
      setInvites(updatedInvites.filter((i: any) => i.assistantId === (user as any)?.assistantId && i.status === 'pending'));
    }
  };

  const totalNotifs = invites.length + notifications.length;

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
    { name: "Settings", href: "/assistant/settings", icon: Settings },
  ];

  return (
    <>
    <header className="h-[80px] bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 sticky top-0 z-40 pt-safe-top relative">
      <Toaster position="top-center" />
      
      {/* Left side: Hamburger & Doctor Profile */}
      <div className="flex items-center gap-4 sm:gap-6 w-1/3 z-10 relative">
        {/* Mobile menu toggle (Leftmost) */}
        <button 
          onClick={() => setShowMobileMenu(true)}
          aria-label="Toggle menu" 
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Menu size={26} strokeWidth={2.5} />
        </button>

        {/* Doctor Info (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col">
          <h2 className="text-[15px] font-bold text-slate-800">
            {assignedDoctor ? assignedDoctor.name : "Not Connected"}
          </h2>
          <span className="text-[13px] text-slate-500">
            {assignedDoctor ? `Chamber: ${assignedDoctor.location}` : "Awaiting Doctor Invite"}
          </span>
        </div>
      </div>

      {/* Middle: Global Search (Desktop) / Brand Logo (Mobile) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center w-full max-w-[400px] mt-[env(safe-area-inset-top)]">
        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center gap-2 mx-auto">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <Image src="/images/shustota icon.png" alt="Shustota Icon" fill className="object-contain" />
          </div>
          <span className="text-[20px] font-black text-slate-800 tracking-tight">Shustota</span>
        </div>
        
        {/* Desktop Search Bar */}
        <div className="hidden lg:flex w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patients, appointments..." 
            className="w-full h-11 pl-12 pr-4 bg-slate-100/50 border border-slate-200 rounded-2xl text-[14px] text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED]/30 transition-all"
          />
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 lg:gap-6 w-1/3">
        <div className="hidden xl:block text-[14px] font-medium text-slate-500 mr-2">
          {currentDate}
        </div>

        <button className="h-[48px] px-6 bg-assistant-danger/10 text-assistant-danger rounded-[12px] font-semibold text-[15px] hover:bg-assistant-danger hover:text-white transition-all hidden sm:block">
          Emergency
        </button>
        
        <div className="relative hidden lg:block">
          <button 
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-assistant-primary transition-colors focus:outline-none"
          >
            <Bell size={24} />
            {totalNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-assistant-danger rounded-full border-2 border-white"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-[120%] w-[360px] bg-white rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-slate-800">Notifications</h3>
                  {totalNotifs > 0 && (
                    <span className="bg-assistant-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {totalNotifs} New
                    </span>
                  )}
                </div>
                
                <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                  {totalNotifs === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <Bell size={32} className="text-slate-200 mb-3" />
                      <p className="text-slate-500 font-medium">No new notifications</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {/* Invites */}
                      {invites.map(invite => (
                        <div key={invite.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-assistant-primary/10 flex items-center justify-center shrink-0">
                              <Info size={20} className="text-assistant-primary" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-bold text-slate-800">Clinic Invitation</h4>
                              <p className="text-[13px] text-slate-500 mt-0.5 leading-snug">
                                Dr. Sarah Rahman has invited you to join as <strong>{invite.role}</strong>.
                              </p>
                              <div className="flex gap-2 mt-3">
                                <button 
                                  onClick={() => handleAcceptInvite(invite.id)}
                                  className="flex-1 bg-assistant-primary hover:bg-[#0c9c74] text-white text-[12px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                  <Check size={14} /> Accept
                                </button>
                                <button 
                                  onClick={() => handleRejectInvite(invite.id)}
                                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                  <XIcon size={14} /> Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* General Notifications */}
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors opacity-80">
                          <div className="flex gap-3 items-center">
                            <div className="w-2 h-2 rounded-full bg-assistant-danger shrink-0 mt-1"></div>
                            <p className="text-[13px] text-slate-700 font-medium leading-snug">{notif.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href="/assistant/settings" className="flex items-center gap-3 cursor-pointer transition-transform active:scale-95">
          <div className="w-10 h-10 sm:w-[48px] sm:h-[48px] rounded-full overflow-hidden border-2 border-slate-100 relative bg-slate-200 shadow-sm shrink-0">
            <Image src={user?.image || "/images/signup-doctor.png"} alt="Assistant Profile" fill className="object-cover" />
          </div>
        </Link>

      </div>

    </header>

      {/* Mobile Sidebar Drawer (Moved outside header to avoid clipping from backdrop-blur/overflow-hidden) */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl z-[60] flex flex-col lg:hidden border-r border-slate-100"
            >
              <div className="h-[80px] flex items-center justify-between px-6 border-b border-slate-100 shrink-0 bg-slate-50">
                <Link href="/" onClick={() => setShowMobileMenu(false)}>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                      <Image src="/images/shustota icon.png" alt="Shustota Icon" fill className="object-contain" />
                    </div>
                    <span className="text-[18px] font-black text-slate-800 tracking-tight">Shustota</span>
                  </div>
                </Link>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 text-slate-400 bg-white rounded-full shadow-sm hover:text-slate-800 transition-colors">
                  <XIcon size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const isNotification = item.name === "Notifications";
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center justify-between h-[52px] px-4 rounded-[14px] transition-all duration-200 ${
                        isActive 
                          ? "bg-gradient-to-tr from-[#2F80ED] to-[#2F80ED]/90 text-white font-semibold shadow-md" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-slate-400"} />
                        <span className="text-[14px]">{item.name}</span>
                      </div>
                      
                      {/* Notification Badge */}
                      {isNotification && totalNotifs > 0 && (
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${isActive ? "bg-white text-[#2F80ED]" : "bg-red-500 text-white"}`}>
                          {totalNotifs} New
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>

              <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50">
                <button className="flex items-center gap-3 h-[52px] px-4 w-full rounded-[14px] text-red-500 hover:bg-red-100 transition-all font-bold">
                  <LogOut size={22} />
                  <span className="text-[14px]">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
