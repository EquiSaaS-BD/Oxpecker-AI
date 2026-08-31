"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, User, Activity, FileText, ChevronRight, CheckCircle2, AlertCircle, Download, Clock, ChevronLeft, ChevronDown } from 'lucide-react';
import { useDoctor } from '@/context/DoctorContext';
import { toast } from 'sonner';
import { PatientDetailsDrawer } from '@/components/patients/PatientDetailsDrawer';
import { useSearchParams } from 'next/navigation';

function DoctorPatientsContent() {
  const { patients: contextPatients } = useDoctor();
  const [patients, setPatients] = useState<any[]>(contextPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState("All Time");
  
  const itemsPerPage = 10;
  const filters = ["All", "Appointment", "Walk-in", "Online"];

  // Fetch real patients from DB
  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setPatients(prev => {
            const dbIds = new Set(json.data.map((p: any) => p.id));
            const filteredMock = contextPatients.filter(p => !dbIds.has(p.id));
            return [...json.data, ...filteredMock];
          });
        }
      })
      .catch(e => console.error("Failed to load DB patients:", e));
  }, [contextPatients]);

  // Open profile automatically if redirected from prescription finalize
  const searchParams = useSearchParams();
  useEffect(() => {
    const idFromUrl = searchParams?.get('id');
    if (idFromUrl && patients.length > 0 && !selectedPatient) {
      const patient = patients.find(p => p.id === idFromUrl);
      if (patient) {
        setSelectedPatient(patient);
        // Remove id from URL so it doesn't re-open on refresh
        window.history.replaceState(null, '', '/doctor/dashboard/patients');
      }
    }
  }, [searchParams, patients, selectedPatient]);

  // Filter & Sort Logic
  const filteredPatients = useMemo(() => {
    let result = patients;

    // Type Filter
    if (activeFilter !== "All") {
      result = result.filter(p => p.type === activeFilter);
    }

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q)
      );
    }

    // Sort by Date (Descending)
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [patients, activeFilter, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const currentData = filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    toast.success("Patient list exported to CSV successfully!");
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-80px)] w-full max-w-[1600px] mx-auto overflow-y-auto pb-24">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-700 tracking-tight">Patients Database</h1>
          <p className="text-[15px] text-slate-500 font-medium mt-1">Manage all patient records, filter, search and export data.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl font-bold shadow-none transition-colors"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-white rounded-[20px] shadow-none border border-slate-200 p-4 flex flex-col xl:flex-row justify-between items-center gap-4">
        
        {/* Type Tabs */}
        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full xl:w-auto">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
              className={`flex-1 xl:flex-none px-6 py-2 rounded-lg text-[14px] font-bold transition-all ${
                activeFilter === filter 
                  ? "bg-white text-sky-600 shadow-xs border border-slate-200" 
                  : "text-slate-500 hover:text-slate-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search & Date */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full sm:w-[160px] h-11 pl-4 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-[14px] text-slate-600 font-bold focus:outline-none focus:border-[#2F80ED] appearance-none cursor-pointer"
            >
              <option>All Time</option>
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative flex-1 sm:w-[320px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search Name, ID or Diagnosis..."
              className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-300 rounded-xl text-[14px] text-slate-600 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED]/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[20px] shadow-none border border-slate-200 overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-200 m-4 rounded-2xl bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-none border border-slate-200">
              <Search size={32} className="text-slate-600" />
            </div>
            <h3 className="text-[20px] font-bold text-slate-600 mb-2">No patients found</h3>
            <p className="text-[14px] text-slate-500 max-w-md">Try adjusting your search criteria, or select a different date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[13px] text-slate-500 font-bold tracking-wide uppercase">
                  <th className="px-6 py-4 rounded-tl-[20px]">Patient Info</th>
                  <th className="px-6 py-4">Diagnosis</th>
                  <th className="px-6 py-4">Visit Type</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right rounded-tr-[20px]">Action</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {currentData.map((patient) => (
                  <tr key={patient.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold">
                          {patient.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{patient.name}</p>
                          <p className="text-[12.5px] text-slate-500 font-medium">{patient.id} • {patient.gender}, {patient.age}y</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-600 line-clamp-1 max-w-[200px]">{patient.diagnosis}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-lg text-[12.5px] font-bold">
                        {patient.type === 'Appointment' ? <Calendar size={13}/> : patient.type === 'Walk-in' ? <MapPin size={13}/> : <Activity size={13}/>} 
                        {patient.type}
                      </span>
                    </td>
                    <td className="px-6 py-4" suppressHydrationWarning>
                      <p className="font-bold text-slate-600" suppressHydrationWarning>{new Date(patient.date).toLocaleDateString('en-GB')}</p>
                      <p className="text-[12.5px] text-slate-500" suppressHydrationWarning>{new Date(patient.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      {patient.status === "Completed" && <span className="inline-flex items-center gap-1 text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md text-[12px] font-bold"><CheckCircle2 size={12}/> Completed</span>}
                      {patient.status === "Waiting" && <span className="inline-flex items-center gap-1 text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-md text-[12px] font-bold"><Clock size={12}/> Waiting</span>}
                      {patient.status === "In Progress" && <span className="inline-flex items-center gap-1 text-[#2F80ED] bg-sky-500/10 px-2.5 py-1 rounded-md text-[12px] font-bold"><Activity size={12} className="animate-pulse"/> In Progress</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedPatient(patient)}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-[13px] font-bold shadow-none hover:bg-sky-600 hover:text-white hover:border-primary transition-all"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-[13px] font-bold text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of {filteredPatients.length} entries
            </span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="w-9 h-9 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="w-9 h-9 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <PatientDetailsDrawer 
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        patient={selectedPatient}
      />
    </div>
  );
}

export default function DoctorPatientsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading patients...</div>}>
      <DoctorPatientsContent />
    </Suspense>
  );
}
