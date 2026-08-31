"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, MonitorPlay, UserCheck, Activity, Smartphone, Plus, X, ToggleLeft, ToggleRight, QrCode, Mail, Link as LinkIcon, CheckCircle2, Undo2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useDoctor } from '@/context/DoctorContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { title: "Today's Appointments", count: "42", icon: Users, color: "text-sky-600", bg: "bg-sky-50 border border-sky-200/80" },
  { title: "Patients Waiting", count: "12", icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border border-amber-200/80" },
  { title: "Completed", count: "18", icon: UserCheck, color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200/80" },
  { title: "Walk-in Patients", count: "14", icon: Activity, color: "text-purple-700", bg: "bg-purple-50 border border-purple-200/80" },
  { title: "Online Consultations", count: "8", icon: Smartphone, color: "text-teal-700", bg: "bg-teal-50 border border-teal-200/80" },
  { title: "Revenue", count: "৳28K", icon: MonitorPlay, color: "text-blue-700", bg: "bg-blue-50 border border-blue-200/80" },
];

const chartData = [
  { name: 'Mon', patients: 35 },
  { name: 'Tue', patients: 42 },
  { name: 'Wed', patients: 28 },
  { name: 'Thu', patients: 50 },
  { name: 'Fri', patients: 45 },
  { name: 'Sat', patients: 65 },
  { name: 'Sun', patients: 58 },
];

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteId, setInviteId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Front Desk / Receptionist");
  const [isInviting, setIsInviting] = useState(false);
  
  const { 
    queue, previousQueue, connectedAssistants, activityLog, 
    handleNextPatient, handleUndoPatient, addAssistant, removeAssistant 
  } = useDoctor();

  const [permissions, setPermissions] = useState({
    apt: true, queue: true, walkin: true, pay: true, notif: true, cal: true, 
    sched: true, checkin: true, report: true, analytics: true,
    presc: false, diag: false, medrec: false, docprof: false
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendInvite = async () => {
    let finalInviteId = inviteId;
    if (inviteId && (inviteId.length !== 12 || !/^\d+$/.test(inviteId))) {
      toast.error("Assistant ID must be exactly 12 digits if provided.");
      return;
    }
    if (!inviteId) {
      finalInviteId = `ast-${Math.floor(Math.random() * 1000000)}`;
    }
    if (!inviteEmail) {
      toast.error("Please enter email address.");
      return;
    }

    setIsInviting(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsInviting(false);

    // Add to pending
    const newAst = {
      id: finalInviteId,
      name: "Pending Assistant",
      status: "Pending Invite",
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]",
      isPending: true
    };
    
    addAssistant(newAst);
    
    const invitesStr = localStorage.getItem('oxpecker_invites');
    const invites = invitesStr ? JSON.parse(invitesStr) : [];
    invites.push({ 
      id: Date.now().toString(), 
      assistantId: finalInviteId, 
      email: inviteEmail, 
      role: inviteRole, 
      status: 'pending',
      doctorId: user?.id || 'doctor-test-101',
      doctorName: user?.name || 'Dr. Sarah Rahman',
      doctorEmail: user?.email || 'doctor@oxpecker.equisaas-bd.com'
    });
    localStorage.setItem('oxpecker_invites', JSON.stringify(invites));

    setShowInviteModal(false);
    setInviteId("");
    setInviteEmail("");
    toast.success("Invite sent successfully!");
  };

  const handleRemoveAssistant = (id: string) => {
    removeAssistant(id);
    toast.success("Assistant removed.");
    
    const notifsStr = localStorage.getItem('oxpecker_notifications');
    const notifs = notifsStr ? JSON.parse(notifsStr) : [];
    notifs.push({ id: Date.now().toString(), targetId: id, message: "You have been removed by Dr. Sarah.", read: false });
    localStorage.setItem('oxpecker_notifications', JSON.stringify(notifs));
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 bg-slate-50 min-h-full w-full max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-2">
        <h1 className="text-[20px] lg:text-[24px] font-bold text-slate-700">Live Monitor & Team Dashboard</h1>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white rounded-full shadow-none flex items-center gap-2 border border-slate-200">
            <span className="w-2.5 h-2.5 bg-[#22C55E] rounded-full animate-pulse"></span>
            <span className="text-[14px] font-bold text-slate-600 hidden sm:inline">Live Sync Active</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-[20px] p-4 sm:p-5 shadow-none border border-slate-200 flex flex-col justify-between hover:shadow-none transition-shadow h-full min-h-[140px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-[40px] h-[40px] rounded-[12px] flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <div>
              <h3 className="text-[28px] sm:text-[32px] font-extrabold text-slate-700 leading-none mb-1.5">{stat.count}</h3>
              <p className="text-[12px] sm:text-[13px] font-semibold text-slate-500 leading-snug">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Queue Progress */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="xl:col-span-2 bg-white rounded-[20px] shadow-none border border-slate-200 p-5 lg:p-8 flex flex-col gap-6 lg:gap-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
            <div className="w-full sm:max-w-[400px]">
              <h2 className="text-[20px] font-bold text-slate-700 mb-3">Current Queue Progress</h2>
              <div className="w-full h-[12px] bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-sky-600 rounded-full w-[45%]"></div>
              </div>
              <p className="text-[13px] text-slate-500 mt-2">18 of 42 patients completed</p>
            </div>
            <div className="text-left sm:text-right whitespace-nowrap shrink-0">
              <p className="text-[14px] text-slate-500 font-medium">Est. Waiting Time</p>
              <p className="text-[24px] font-bold text-[#F59E0B]">~45 mins</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Current Patient */}
            <div 
              onClick={() => {
                if (queue[0]) {
                  window.location.href = `/doctor/dashboard/prescription/new?patientName=${encodeURIComponent(queue[0].name || "")}&patientId=${queue[0].token || ""}&appointmentTime=10:00+AM`;
                }
              }}
              className="bg-gradient-to-br from-sky-50 via-slate-50 to-white p-5 sm:p-6 rounded-[16px] border border-sky-200 flex flex-col justify-between h-full cursor-pointer hover:border-sky-400 hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[13px] sm:text-[14px] text-sky-600 font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                    Current Patient
                  </span>
                  <button 
                    type="button" 
                    className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold hover:bg-emerald-600 hover:text-white transition-colors shrink-0"
                  >
                    Start Consultation
                  </button>
                </div>
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[40px] sm:text-[48px] font-extrabold text-slate-900 leading-none block mb-1.5">{queue[0]?.token || "-"}</span>
                    <span className="text-[16px] sm:text-[18px] font-bold text-slate-700 block truncate">{queue[0]?.name || "No Patient"}</span>
                    <p className="text-[13px] sm:text-[14px] text-slate-500 truncate mt-0.5">{queue[0]?.info || ""}</p>
                  </div>
                  <div className="w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-[22px] sm:text-[24px] font-bold text-sky-600 shrink-0">
                    {queue[0]?.name?.charAt(0) || "-"}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-5 border-t border-slate-200 flex gap-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUndoPatient();
                  }}
                  disabled={previousQueue.length === 0}
                  title="Undo Call Next"
                  className="w-[52px] sm:w-[60px] h-[48px] sm:h-[52px] shrink-0 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 font-bold rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Undo2 size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPatient();
                  }}
                  disabled={queue.length === 0}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold h-[48px] sm:h-[52px] rounded-xl shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <CheckCircle2 size={18} /> Call Next
                </button>
              </div>
            </div>

            {/* Next Patient */}
            <div className="bg-white p-5 sm:p-6 rounded-[16px] border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[13px] sm:text-[14px] text-slate-500 font-bold uppercase tracking-wider block mb-3">Next Patient</span>
                <div className="flex items-center justify-between gap-3 opacity-90">
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[34px] sm:text-[40px] font-bold text-slate-500 leading-none block mb-1.5">{queue[1]?.token || "-"}</span>
                    <span className="text-[15px] sm:text-[16px] font-bold text-slate-700 block truncate">{queue[1]?.name || "End of Queue"}</span>
                    <p className="text-[13px] sm:text-[14px] text-slate-500 truncate mt-0.5">{queue[1]?.info || ""}</p>
                  </div>
                  {queue[1] && (
                    <div className="w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[18px] sm:text-[20px] font-bold text-slate-500 shrink-0">
                      {queue[1].name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              
              {queue.length > 2 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[12px] sm:text-[13px] text-slate-500 font-medium bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-200 truncate">
                    <span className="font-bold text-slate-700">Upcoming:</span> {queue[2].token} - {queue[2].name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Connect Team */}
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[20px] shadow-none border border-slate-200 p-6 flex flex-col h-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-slate-700">Connected Assistant</h3>
              <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-sky-50 text-sky-700 border border-sky-200 text-sm font-bold rounded-lg hover:bg-sky-600 hover:text-white transition-colors flex items-center gap-1.5">
                <Plus size={16} /> Invite
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {connectedAssistants.map((ast) => (
                <div key={ast.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-[12px] border border-slate-200 group transition-colors hover:border-slate-300 gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className={`w-[40px] h-[40px] rounded-full ${ast.bg}/20 ${ast.color} font-bold flex items-center justify-center text-sm shrink-0`}>
                      {ast.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[15px] font-bold text-slate-700 leading-tight truncate">{ast.name}</h4>
                      <span className={`text-[13px] ${ast.color} font-medium flex items-center gap-1.5 mt-0.5 truncate`}>
                        {!ast.isPending && ast.status.includes('Online') && <span className={`w-1.5 h-1.5 rounded-full ${ast.bg} animate-pulse`}></span>}
                        {ast.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveAssistant(ast.id)} className="text-[12px] font-bold text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 shrink-0">
                    {ast.isPending ? 'Cancel' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[20px] shadow-none border border-slate-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[18px] font-bold text-slate-700">Weekly Patient Flow</h3>
            <select className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 outline-none">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="patients" stroke="#2F80ED" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#2F80ED" }} activeDot={{ r: 6, fill: "#2F80ED" }} />
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#2F80ED', fontWeight: 'bold' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Assistant Activity Log */}
      <h2 className="text-[20px] font-bold text-slate-700 pt-4">Live Assistant Activity Log</h2>
      <div className="w-full bg-white rounded-[20px] shadow-none border border-slate-200 overflow-hidden relative">
        <div className="w-full max-w-full overflow-x-auto custom-scrollbar max-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-[13px] text-slate-500 font-semibold h-[50px] uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Time</th>
                <th className="px-6 py-3 font-semibold">Assistant Name</th>
                <th className="px-6 py-3 font-semibold">Action</th>
                <th className="px-6 py-3 font-semibold">Patient Token</th>
                <th className="px-6 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {activityLog.map((log, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors h-[56px]">
                  <td className="px-6 py-3 font-medium text-slate-500 whitespace-nowrap">{log.time}</td>
                  <td className="px-6 py-3 font-semibold text-slate-700 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">{log.name.charAt(0)}</div>
                      <span>{log.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-700 whitespace-nowrap">{log.action}</td>
                  <td className="px-6 py-3 font-bold text-slate-600 whitespace-nowrap">{log.token}</td>
                  <td className={`px-6 py-3 font-bold text-right whitespace-nowrap ${log.color}`}>{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-[720px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 md:px-8 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10 shrink-0">
                <h2 className="text-[20px] font-bold text-slate-700">Invite Assistant</h2>
                <button onClick={() => setShowInviteModal(false)} className="p-2 text-slate-500 hover:text-slate-600 bg-slate-50 hover:bg-slate-50 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[13px] font-semibold text-slate-600 block mb-1.5">Assistant id (Optional)</label>
                    <input 
                      type="text" 
                      value={inviteId}
                      onChange={(e) => setInviteId(e.target.value.replace(/\D/g, ''))}
                      maxLength={12} 
                      placeholder="12-digit number"
                      className="w-full h-[50px] bg-slate-50 text-slate-700 border border-slate-300 rounded-[12px] px-4 text-[14px] focus:outline-none focus:border-sky-500 placeholder-slate-600" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[13px] font-semibold text-slate-600 block mb-1.5">Email Address *</label>
                    <input 
                      type="email" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="assistant@email.com"
                      className="w-full h-[50px] bg-slate-50 text-slate-700 border border-slate-300 rounded-[12px] px-4 text-[14px] focus:outline-none focus:border-sky-500 placeholder-slate-600" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-2">
                    <label className="text-[13px] font-semibold text-slate-600 block mb-1.5">Role *</label>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full h-[50px] bg-slate-50 text-slate-700 border border-slate-300 rounded-[12px] px-4 text-[14px] focus:outline-none focus:border-sky-500 appearance-none"
                    >
                      <option className="bg-white text-slate-700">Front Desk / Receptionist</option>
                      <option className="bg-white text-slate-700">Clinic Manager</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-[16px] font-bold text-slate-700 mb-3">Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 bg-slate-50 p-5 rounded-[16px] border border-slate-200">
                    <div className="col-span-1 md:col-span-2"><h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Management</h4></div>
                    <PermissionToggle label="Appointment Mgmt" active={permissions.apt} onClick={() => togglePermission('apt')} />
                    <PermissionToggle label="Queue Management" active={permissions.queue} onClick={() => togglePermission('queue')} />
                    <PermissionToggle label="Walk-in Patients" active={permissions.walkin} onClick={() => togglePermission('walkin')} />
                    <PermissionToggle label="Payments" active={permissions.pay} onClick={() => togglePermission('pay')} />
                    
                    <div className="col-span-1 md:col-span-2 mt-2"><h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Clinical (Disabled by default)</h4></div>
                    <PermissionToggle label="Prescriptions" active={permissions.presc} onClick={() => togglePermission('presc')} />
                    <PermissionToggle label="Medical Records" active={permissions.medrec} onClick={() => togglePermission('medrec')} />
                  </div>
                </div>
              </div>

              <div className="px-6 md:px-8 py-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 sticky bottom-0 z-10 shrink-0">
                <button onClick={() => setShowInviteModal(false)} className="px-6 py-2.5 text-slate-500 font-semibold rounded-[12px] hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleSendInvite}
                  disabled={isInviting}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-[12px] transition-colors shadow-none flex items-center gap-2"
                >
                  {isInviting ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : 'Send Invite'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PermissionToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => {
  return (
    <div className="flex items-center justify-between py-1 cursor-pointer group" onClick={onClick}>
      <span className="text-[14px] font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>
      <button className="text-slate-500 focus:outline-none">
        {active ? <ToggleRight size={32} className="text-sky-400" strokeWidth={1.5} /> : <ToggleLeft size={32} strokeWidth={1.5} />}
      </button>
    </div>
  );
};
