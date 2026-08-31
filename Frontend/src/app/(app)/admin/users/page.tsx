"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  Users, UserPlus, Edit2, Ban, ShieldAlert, CheckCircle2, Trash2,
  X as XIcon, Eye, EyeOff, Save, RefreshCw, Search, ShieldCheck, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-amber-50 text-amber-700 border-amber-200",
  doctor: "bg-sky-50 text-sky-700 border-sky-200",
  patient: "bg-emerald-50 text-emerald-700 border-emerald-200",
  hospital: "bg-purple-50 text-purple-700 border-purple-200",
  assistant: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "patient" | "doctor" | "hospital" | "assistant" | "admin" | "pending">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "patient", status: "active" });
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", role: "patient", status: "active" });
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      // 1. Fetch directly from Supabase database
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const formattedUsers = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name || "User",
        email: p.email,
        role: p.role || "patient",
        status: p.status || "active",
        password: p.password || "••••••••",
        joinDate: p.join_date || (p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0]),
        phone: p.phone,
        doctorId: p.doctor_id,
        assistantId: p.assistant_id
      }));

      setUsers(formattedUsers);
      // Cache locally for offline resilience
      localStorage.setItem("oxpecker_synced_users", JSON.stringify(formattedUsers));
    } catch (err: any) {
      console.error("Supabase load error:", err);
      setDbError(err.message || "Failed to load profiles from Supabase. Please ensure supabase_schema.sql has been executed in SQL editor.");
      // Fallback to locally cached sync if network offline
      const cached = localStorage.getItem("oxpecker_synced_users");
      if (cached) {
        try { setUsers(JSON.parse(cached)); } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert([{
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password.trim(),
          role: formData.role,
          status: formData.status,
          join_date: new Date().toISOString().split("T")[0]
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("User created successfully in database.");
      setShowAddModal(false);
      setFormData({ name: "", email: "", password: "", role: "patient", status: "active" });
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user in database.");
    }
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: user.password || "",
      role: user.role,
      status: user.status || "active"
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.email) {
      toast.error("Name and email are required.");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editForm.name.trim(),
          email: editForm.email.toLowerCase().trim(),
          password: editForm.password.trim(),
          role: editForm.role,
          status: editForm.status
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast.success("User updated successfully.");
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user.");
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (user.role === "admin" && users.filter(u => u.role === "admin").length <= 1) {
      toast.error("Cannot delete the only admin account.");
      return;
    }

    if (confirm(`Permanently delete user ${user.name} (${user.email})? This cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", user.id);

        if (error) throw error;

        toast.success("User permanently deleted from database.");
        loadUsers();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete user.");
      }
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`Status updated to ${newStatus}.`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  const togglePassword = (id: string) => setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredUsers = users
    .filter(u => activeTab === "all" ? true : activeTab === "pending" ? u.status === "pending" : u.role === activeTab)
    .filter(u => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.id?.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6 pb-24">
      <Toaster position="top-center" richColors />

      <AdminPageHeader
        title="Supreme User Governance"
        description="Live cloud database records: inspect credentials, edit profiles, alter roles, ban, or hard delete users in real time."
        icon={<Users size={24} />}
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-11 px-5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-all shadow-sm text-sm"
          >
            <UserPlus size={16} /> Add User
          </button>
        }
      />

      {dbError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs">
          <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
          <div>
            <div className="font-bold mb-0.5">Database Notice</div>
            <div>{dbError}</div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden flex-1">
          {(["all", "pending", "admin", "patient", "doctor", "hospital", "assistant"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {tab === "pending" ? "Pending Approvals" : tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === "all" ? users.length : tab === "pending" ? users.filter(u => u.status === "pending").length : users.filter(u => u.role === tab).length})
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, email or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-10 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
            />
          </div>
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 bg-white transition-colors shrink-0"
            title="Reload from Cloud Database"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync DB</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["User", "Database ID", "Password", "Role", "Status", "Joined", "Actions"].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 text-sm">
                    {isLoading ? "Loading users directly from Supabase database..." : "No users found in database."}
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <span className="text-slate-700 font-bold text-xs">{(user.name || "?").charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[13px] leading-tight flex items-center gap-1.5">
                          {user.name}
                          {user.role === "admin" && <ShieldCheck size={13} className="text-amber-500" />}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <code className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono select-all">{user.id}</code>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <code className="text-[12px] text-slate-700 font-mono select-all">
                        {showPasswords[user.id] ? (user.password || "-") : "••••••••"}
                      </code>
                      <button onClick={() => togglePassword(user.id)} className="text-slate-500 hover:text-slate-700 transition-colors p-1">
                        {showPasswords[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border capitalize ${ROLE_COLORS[user.role] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {user.status === "active" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 size={13} /> Active
                      </span>
                    ) : user.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                        <ShieldAlert size={13} /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                        <Ban size={13} /> Banned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-slate-500">{user.joinDate || "-"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={15} />
                      </button>
                      {user.status === "banned" ? (
                        <button
                          onClick={() => handleStatusChange(user.id, "active")}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Unban"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.id, "banned")}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Ban"
                        >
                          <Ban size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hard Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Edit User Account</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{editingUser.id}</p>
                </div>
                <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <XIcon size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="text"
                    value={editForm.password}
                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Role</label>
                    <select
                      value={editForm.role}
                      onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white capitalize"
                    >
                      {["patient", "doctor", "hospital", "assistant", "admin"].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white capitalize"
                    >
                      {["active", "pending", "banned"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  <button onClick={() => setEditingUser(null)} className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit} className="flex-1 h-11 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-colors shadow-md text-sm flex items-center justify-center gap-2">
                    <Save size={15} /> Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Add New User to Database</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <XIcon size={18} />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
                    placeholder="e.g. Dr. Kamal Hossain"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white"
                    placeholder="e.g. kamal@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white font-mono"
                    placeholder="Create user password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 bg-white capitalize"
                  >
                    {["patient", "doctor", "hospital", "assistant", "admin"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 h-11 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-colors shadow-md text-sm flex items-center justify-center gap-2">
                    <UserPlus size={15} /> Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
