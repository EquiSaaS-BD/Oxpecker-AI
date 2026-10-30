"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, BrainCircuit, Activity, TrendingUp, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight, Compass, Siren, ShieldCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatsBento } from "@/components/admin/StatsBento";
import { LiveEmergencyMap } from "@/components/admin/LiveEmergencyMap";
import { EmergencyAlertsCenter } from "@/components/admin/EmergencyAlertsCenter";
import { AdvancedVisualizations } from "@/components/admin/AdvancedVisualizations";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const chartData = [
  { name: "Mon", revenue: 4200, users: 310 },
  { name: "Tue", revenue: 5100, users: 440 },
  { name: "Wed", revenue: 4800, users: 590 },
  { name: "Thu", revenue: 6200, users: 720 },
  { name: "Fri", revenue: 7800, users: 890 },
  { name: "Sat", revenue: 8400, users: 950 },
  { name: "Sun", revenue: 9600, users: 1120 },
];

const recentActivity = [
  { id: 1, user: "Dr. Ahmed", action: "Approved clinical triage for Patient P-9823 (NEWS2: 8)", time: "5 mins ago", icon: Activity, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: 2, user: "Emergency Triage", action: "ICU Bed 04 Allocated at Dhaka Medical College", time: "14 mins ago", icon: Siren, color: "text-rose-700 bg-rose-50 border-rose-200" },
  { id: 3, user: "AI Diagnostic RAG", action: "DGHS 2024 Dengue guideline matched with 98.4% precision", time: "32 mins ago", icon: BrainCircuit, color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  { id: 4, user: "HealthPass System", action: "Universal Health ID UHID-BD-741920 verified via QR Gate Pass", time: "1 hour ago", icon: ShieldCheck, color: "text-sky-700 bg-sky-50 border-sky-200" },
  { id: 5, user: "Payment Settlement", action: "Automated bKash & Sonali Bank settlement processed for 12 doctors", time: "3 hours ago", icon: DollarSign, color: "text-amber-700 bg-amber-50 border-amber-200" },
];

export default function AdminDashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <AdminPageHeader 
        title="Clinical Command Center" 
        description="Unified national healthcare telemetry, real-time emergency triage, and live user tracking."
        icon={<Compass size={24} />}
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 shadow-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Azure Fastify Gateway: Operational
            </span>
          </div>
        }
      />

      {/* Dynamic User Statistics Bento Box */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <StatsBento />
      </motion.div>

      {/* Real-Time Emergency Alerts & Code-Red Command Center */}
      <EmergencyAlertsCenter />

      {/* Real-Time Live Location System & Google Maps Radar Dispatch */}
      <div id="emergency-radar">
        <LiveEmergencyMap />
      </div>

      {/* D3.js, Chart.js, Grafana Visual Suite */}
      <AdvancedVisualizations />

      {/* Analytics & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Charts Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 inline-block mb-1">
                Platform Growth Telemetry
              </span>
              <h2 className="text-xl font-black text-slate-950">Patient Consultations & Telehealth Traffic</h2>
              <p className="text-xs text-slate-500 font-medium">Weekly healthcare engagement metrics across Bangladesh</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer">
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>Year to Date</option>
            </select>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Consultations" />
                <Area type="monotone" dataKey="users" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Active Patients" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-7 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-950">System Activity</h2>
                <p className="text-xs text-slate-500 font-medium">Real-time audit log</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={activity.id} className="flex gap-3 relative">
                  <div className={`w-9 h-9 rounded-xl border flex flex-shrink-0 items-center justify-center ${activity.color} z-10 shadow-xs`}>
                    <activity.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{activity.user}</span>
                      <span className="text-[10px] font-semibold text-slate-600">{activity.time}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-snug">{activity.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Audit Trail Protected</span>
            <span>SHA-256 Verified</span>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}