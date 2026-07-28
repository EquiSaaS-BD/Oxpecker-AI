"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, Calendar, CreditCard, MessageSquare, UserPlus, Clock } from "lucide-react";
import { NotificationDetailModal } from "@/components/assistant/NotificationDetailModal";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AssistantNotificationsPage() {
  const { user, updateUser } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  React.useEffect(() => {
    if (!user) return;
    
    const loadData = () => {
      const allNotifs: any[] = [];
      const currentAssistantId = (user as any).assistantId;
      
      // Load invites targeted at this assistant
      if (currentAssistantId) {
        const invitesStr = localStorage.getItem('shustota_invites');
        if (invitesStr) {
          try {
            const allInvites = JSON.parse(invitesStr);
            const targetedInvites = allInvites.filter((i: any) => i.assistantId === currentAssistantId && i.status === 'pending');
            
            targetedInvites.forEach((inv: any) => {
               allNotifs.push({
                 id: inv.id,
                 type: 'doctor_invite',
                 title: 'Connection Request',
                 message: `${inv.doctorName || 'A Doctor'} (${inv.email}) wants to connect with you. If you accept, you will gain access to their queue.`,
                 time: 'Just now',
                 unread: true,
                 doctorName: inv.doctorName || inv.email,
                 specialty: inv.role || "General"
               });
            });
          } catch (e) {}
        }
      }
      
      // Load system notifications
      const notifStr = localStorage.getItem('shustota_notifications');
      if (notifStr) {
        try {
          const sysNotifs = JSON.parse(notifStr);
          const targeted = sysNotifs.filter((n: any) => n.targetId === currentAssistantId || n.targetId === user.id);
          
          targeted.forEach((n: any) => {
            allNotifs.push({
               id: n.id,
               type: 'message',
               title: 'System Alert',
               message: n.message,
               time: 'Just now',
               unread: !n.read
            });
          });
        } catch (e) {}
      }
      
      setNotifications(allNotifs);
    };

    loadData();
    window.addEventListener('storage', loadData);
    const interval = setInterval(loadData, 1000);
    
    return () => {
      window.removeEventListener('storage', loadData);
      clearInterval(interval);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number | string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleOpenNotification = (notif: any) => {
    if (notif.unread) {
      markAsRead(notif.id);
    }
    setSelectedNotification(notif);
  };

  const handleInviteResponse = (id: number | string, status: 'accepted' | 'declined') => {
    // Find the invite in localStorage
    const invitesStr = localStorage.getItem('shustota_invites');
    let doctorName = "the doctor";
    let doctorId = "";
    
    if (invitesStr) {
      const allInvites = JSON.parse(invitesStr);
      const inviteIndex = allInvites.findIndex((i: any) => i.id === id);
      
      if (inviteIndex !== -1) {
        allInvites[inviteIndex].status = status;
        doctorName = allInvites[inviteIndex].doctorName || doctorName;
        doctorId = allInvites[inviteIndex].doctorId || "";
        localStorage.setItem('shustota_invites', JSON.stringify(allInvites));
      }
    }

    if (status === 'accepted' && doctorId && user) {
      // 1. Update global users list
      const usersStr = localStorage.getItem('shustota_users');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const uIdx = users.findIndex((u: any) => u.id === user.id);
        if (uIdx !== -1) {
          users[uIdx].doctorId = doctorId;
          localStorage.setItem('shustota_users', JSON.stringify(users));
        }
      }
      
      // 2. Update current auth user context
      updateUser({ ...user, doctorId });
      toast.success(`You are now officially connected to ${doctorName}!`);

      // 3. Update Doctor's connected assistants list so they see it in real-time
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

    // Update local state to reflect UI change instantly
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, status: status, message: status === 'accepted' ? `You are now connected with ${doctorName}.` : "You declined the connection request." } : n
    ));
    
    if (selectedNotification && selectedNotification.id === id) {
       setSelectedNotification({
         ...selectedNotification,
         status: status,
         message: status === 'accepted' ? `You are now connected with ${doctorName}. You can now manage their patients and prescriptions.` : "You declined the connection request."
       });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "doctor_invite": return <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border-2 border-white shadow-sm"><UserPlus size={22} /></div>;
      case "appointment": return <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-blue-100 text-[#2F80ED] flex items-center justify-center shrink-0"><Calendar size={22} /></div>;
      case "payment": return <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><CreditCard size={22} /></div>;
      case "message": return <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0"><MessageSquare size={22} /></div>;
      default: return <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><Bell size={22} /></div>;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 lg:pb-10 relative overflow-hidden">
      
      {/* Decorative background blobs for glassmorphism refraction */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Page Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] lg:text-[28px] font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                <Bell className="text-[#2F80ED]" size={24} strokeWidth={2.5} />
              </div>
              Notifications
              {unreadCount > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-[12px] font-bold px-3 py-1 rounded-full ml-2 shadow-[0_4px_12px_rgba(239,68,68,0.3)]">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-slate-500 mt-2 text-[14px] lg:text-[15px]">Stay updated with your latest alerts and requests.</p>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center justify-center sm:justify-start gap-2 text-[14px] font-bold text-[#2F80ED] bg-white/60 backdrop-blur-md hover:bg-blue-50 border border-white/80 px-5 py-3 sm:py-2.5 rounded-[14px] active:scale-95 transition-all shadow-sm"
            >
              <CheckCircle2 size={18} strokeWidth={2.5} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4 max-w-[1200px] mx-auto w-full mt-2 lg:mt-4">
        
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Bell size={32} className="text-slate-300" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-600 mb-1">No Notifications</h3>
            <p className="text-[14px] text-slate-400 max-w-[300px]">When a doctor sends you an invite or you receive alerts, they will appear here.</p>
          </div>
        )}

        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            onClick={() => handleOpenNotification(notif)}
            className={`p-4 lg:p-6 rounded-[20px] lg:rounded-[24px] border transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden ${
              notif.unread 
                ? "bg-white/80 backdrop-blur-xl border-[#2F80ED]/20 shadow-[0_8px_30px_rgba(47,128,237,0.08)] hover:shadow-[0_8px_30px_rgba(47,128,237,0.12)]" 
                : "bg-white/40 backdrop-blur-lg border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/60"
            }`}
          >
            {/* Unread Indicator Line */}
            {notif.unread && (
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2F80ED] to-blue-400" />
            )}

            <div className="flex gap-4 lg:gap-6">
              {getIcon(notif.type)}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className={`text-[16px] lg:text-[18px] font-bold ${notif.unread ? "text-slate-800" : "text-slate-600"} flex items-center gap-2 tracking-tight`}>
                    {notif.title}
                    {notif.status === 'accepted' && <span className="bg-emerald-100/80 text-emerald-700 text-[11px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">Connected</span>}
                  </h3>
                  {notif.unread && <div className="w-2.5 h-2.5 rounded-full bg-[#2F80ED] mt-1.5 shrink-0 shadow-[0_0_10px_rgba(47,128,237,0.5)] hidden sm:block" />}
                </div>
                <p className={`text-[14px] lg:text-[15px] leading-relaxed mb-3 lg:w-5/6 line-clamp-2 ${notif.unread ? "text-slate-600 font-medium" : "text-slate-500"}`}>
                  {notif.message}
                </p>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{notif.time}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
      </div>

      <NotificationDetailModal 
        isOpen={!!selectedNotification} 
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
        onInviteResponse={handleInviteResponse}
      />

    </div>
  );
}
