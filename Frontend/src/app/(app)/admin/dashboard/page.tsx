"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, BrainCircuit, Activity, TrendingUp, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatsBento } from "@/components/admin/StatsBento";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const chartData = [
  { name: 'Mon', revenue: 4000, users: 240 },
  { name: 'Tue', revenue: 3000, users: 139 },
  { name: 'Wed', revenue: 2000, users: 980 },
  { name: 'Thu', revenue: 2780, users: 390 },
  { name: 'Fri', revenue: 1890, users: 480 },
  { name: 'Sat', revenue: 2390, users: 380 },
  { name: 'Sun', revenue: 3490, users: 430 },
];

const recentActivity = [
  { id: 1, user: "Dr. Ahmed", action: "Approved new prescription for Patient P-9823", time: "10 mins ago", icon: Activity, color: "text-emerald-600" },
  { id: 2, user: "System", action: "Completed AI Model fine-tuning (Gemini 2.0)", time: "1 hour ago", icon: BrainCircuit, color: "text-indigo-600" },
  { id: 3, user: "Sarah Jenkins", action: "Registered as new patient", time: "2 hours ago", icon: Users, color: "text-blue-600" },
  { id: 4, user: "Payment Gateway", action: "Failed transaction from ID #84920", time: "3 hours ago", icon: AlertCircle, color: "text-rose-600" },
  { id: 5, user: "Admin", action: "Updated 12 medicine prices", time: "5 hours ago", icon: DollarSign, color: "text-amber-600" },
];

export default function AdminDashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div>
      <AdminPageHeader 
        title="Command Center" 
        description="Platform overview and system health metrics."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <StatsBento />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Charts Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue & Traffic Overview</h2>
              <p className="text-sm text-slate-500">Weekly performance metrics</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-sm text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500/50">
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="users" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 flex flex-col h-full"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">View All</button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            {recentActivity.map((activity, i) => (
              <div key={activity.id} className="flex gap-4 relative">
                {i !== recentActivity.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-200" />
                )}
                <div className={`w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex flex-shrink-0 items-center justify-center ${activity.color} z-10`}>
                  <activity.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{activity.user}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{activity.action}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
