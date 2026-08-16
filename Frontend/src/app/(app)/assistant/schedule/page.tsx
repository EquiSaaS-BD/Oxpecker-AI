"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, ChevronLeft, ChevronRight, 
  CheckCircle2, Users, Map
} from 'lucide-react';
import Image from 'next/image';

const mockDoctors = [
  { id: 1, name: "Dr. Farzana Alam", dept: "Gynecology", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop", totalSlots: 120, activeChambers: 3 },
  { id: 2, name: "Dr. Hasan Mahmud", dept: "Cardiology", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop", totalSlots: 90, activeChambers: 2 },
];

const weeklySchedule = [
  {
    id: 'mon',
    day: 'Monday',
    date: 'Oct 12, 2026',
    isToday: true,
    chambers: [
      {
        name: 'Popular Diagnostic Center',
        address: 'House 16, Road 2, Dhanmondi, Dhaka',
        time: '09:00 AM - 02:00 PM',
        booked: 24,
        capacity: 30,
        status: 'Active'
      },
      {
        name: 'Labaid Specialized Hospital',
        address: 'House 6, Road 4, Dhanmondi, Dhaka',
        time: '04:00 PM - 09:00 PM',
        booked: 18,
        capacity: 25,
        status: 'Upcoming'
      }
    ]
  },
  {
    id: 'tue',
    day: 'Tuesday',
    date: 'Oct 13, 2026',
    isToday: false,
    chambers: [
      {
        name: 'Square Hospital',
        address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, Dhaka',
        time: '10:00 AM - 04:00 PM',
        booked: 12,
        capacity: 40,
        status: 'Upcoming'
      }
    ]
  },
  {
    id: 'wed',
    day: 'Wednesday',
    date: 'Oct 14, 2026',
    isToday: false,
    chambers: [] // Off day or no schedule yet
  },
  {
    id: 'thu',
    day: 'Thursday',
    date: 'Oct 15, 2026',
    isToday: false,
    chambers: [
      {
        name: 'Popular Diagnostic Center',
        address: 'House 16, Road 2, Dhanmondi, Dhaka',
        time: '09:00 AM - 02:00 PM',
        booked: 5,
        capacity: 30,
        status: 'Upcoming'
      }
    ]
  },
  {
    id: 'fri',
    day: 'Friday',
    date: 'Oct 16, 2026',
    isToday: false,
    chambers: [
      {
        name: 'Shustota Medical Center',
        address: 'Gulshan 2, Dhaka',
        time: '03:00 PM - 10:00 PM',
        booked: 45,
        capacity: 50,
        status: 'Upcoming'
      }
    ]
  }
];

export default function DoctorSchedulePage() {
  const [selectedDoctor, setSelectedDoctor] = useState(mockDoctors[0]);
  const [currentWeek, setCurrentWeek] = useState("Oct 12 - Oct 18, 2026");
  const [activeTab, setActiveTab] = useState<'This Week' | 'Next Week'>('This Week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching schedule data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [activeTab]); // Re-trigger loading when switching weeks

  if (isLoading) {
    return (
      <div className="w-full flex flex-col font-sans pb-24 -mt-6 lg:-mt-10 animate-pulse">
        {/* Skeleton Header */}
        <div className="bg-white/80 border-b border-white/50 px-4 lg:px-10 py-5 lg:py-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)] -mx-4 sm:-mx-6 lg:-mx-10 mb-6 sm:mb-8 pt-6 lg:pt-10">
          <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="h-8 bg-slate-200 rounded-lg w-48 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded-md w-64"></div>
            </div>
            <div className="h-[48px] bg-slate-200 rounded-xl w-[240px]"></div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-0">
          {/* Skeleton Doctor Card */}
          <div className="bg-white rounded-[20px] p-5 lg:p-6 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-[64px] h-[64px] rounded-full bg-slate-200 shrink-0"></div>
              <div>
                <div className="h-6 bg-slate-200 rounded-md w-32 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded-md w-24"></div>
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-[14px] p-4 flex items-center gap-4 min-w-[140px]">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-slate-200 rounded-md w-12"></div>
                  <div className="h-3 bg-slate-200 rounded-md w-16"></div>
                </div>
              </div>
              <div className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-[14px] p-4 flex items-center gap-4 min-w-[140px]">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-slate-200 rounded-md w-12"></div>
                  <div className="h-3 bg-slate-200 rounded-md w-16"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton Weekly Roster Header */}
          <div className="flex items-center justify-between mb-4 mt-8">
            <div className="h-6 bg-slate-200 rounded-md w-32"></div>
            <div className="h-8 bg-slate-200 rounded-lg w-40"></div>
          </div>

          {/* Skeleton Roster Days */}
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-[16px] border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="md:w-[200px] shrink-0 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0">
                  <div className="h-5 bg-slate-200 rounded-md w-24 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded-md w-20"></div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-slate-200 rounded-md w-48"></div>
                      <div className="h-3 bg-slate-200 rounded-md w-64"></div>
                    </div>
                    <div className="h-10 bg-slate-200 rounded-xl w-[140px]"></div>
                    <div className="w-full lg:w-[160px] h-12 bg-slate-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans pb-24 -mt-6 lg:-mt-10">
      
      {/* Page Header (Scrollable & Edge to Edge) */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/50 px-4 lg:px-10 py-5 lg:py-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)] -mx-4 sm:-mx-6 lg:-mx-10 mb-6 sm:mb-8 pt-6 lg:pt-10">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[20px] lg:text-[24px] font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-inner">
                <Calendar className="text-indigo-600" size={24} />
              </div>
              Doctor Schedule
            </h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1">Manage doctor availability, locations, and daily shifts.</p>
          </div>
          
          <div className="w-full md:w-auto flex items-center bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-sm">
            <button 
              onClick={() => setActiveTab('This Week')}
              className={`flex-1 md:flex-none h-[40px] px-5 rounded-lg text-[13px] font-bold transition-all ${activeTab === 'This Week' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              This Week
            </button>
            <button 
              onClick={() => setActiveTab('Next Week')}
              className={`flex-1 md:flex-none h-[40px] px-5 rounded-lg text-[13px] font-bold transition-all ${activeTab === 'Next Week' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              Next Week
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-0">
        
        {/* Doctor Summary Card */}
        <div className="bg-white rounded-[20px] p-5 lg:p-6 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-[64px] h-[64px] rounded-full overflow-hidden border-2 border-slate-100 shadow-sm shrink-0">
              <Image src={selectedDoctor.image} alt={selectedDoctor.name} fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-[18px] font-bold text-slate-800">{selectedDoctor.name}</h2>
                <span className="bg-emerald-100 text-emerald-700 p-1 rounded-full"><CheckCircle2 size={14}/></span>
              </div>
              <p className="text-[14px] font-medium text-slate-500">{selectedDoctor.dept}</p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-[14px] p-4 flex items-center gap-4 min-w-[140px]">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2F80ED] flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[24px] font-black text-slate-800 leading-none">{selectedDoctor.totalSlots}</p>
                <p className="text-[12px] font-bold text-slate-500 mt-1">Total Slots</p>
              </div>
            </div>
            
            <div className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-[14px] p-4 flex items-center gap-4 min-w-[140px]">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Map size={20} />
              </div>
              <div>
                <p className="text-[24px] font-black text-slate-800 leading-none">{selectedDoctor.activeChambers}</p>
                <p className="text-[12px] font-bold text-slate-500 mt-1">Chambers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Chamber Schedule */}
        <div className="flex items-center justify-between mb-4 mt-8">
          <h3 className="text-[18px] font-bold text-slate-800">Weekly Roster</h3>
          <div className="flex items-center gap-2 text-[14px] font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <Calendar size={16} className="text-[#2F80ED]" />
            {currentWeek}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {weeklySchedule.map((daySchedule) => (
            <div 
              key={daySchedule.id} 
              className={`bg-white rounded-[16px] border overflow-hidden shadow-sm transition-all ${daySchedule.isToday ? 'border-[#2F80ED] ring-1 ring-[#2F80ED]/10' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex flex-col md:flex-row">
                
                {/* Day/Date Column */}
                <div className={`p-5 md:w-[200px] shrink-0 border-b md:border-b-0 md:border-r flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center ${daySchedule.isToday ? 'bg-[#2F80ED]/5 border-[#2F80ED]/20' : 'bg-slate-50/50 border-slate-100'}`}>
                  <div>
                    <h4 className={`text-[16px] font-bold ${daySchedule.isToday ? 'text-[#2F80ED]' : 'text-slate-800'}`}>
                      {daySchedule.day}
                    </h4>
                    <p className={`text-[13px] font-medium mt-0.5 ${daySchedule.isToday ? 'text-[#2F80ED]/80' : 'text-slate-500'}`}>
                      {daySchedule.date}
                    </p>
                  </div>
                  {daySchedule.isToday && (
                    <span className="bg-[#2F80ED] text-white px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase shadow-sm">
                      Today
                    </span>
                  )}
                </div>

                {/* Chambers/Shifts Content */}
                <div className="flex-1 p-5 flex flex-col gap-4">
                  {daySchedule.chambers.length === 0 ? (
                    <div className="h-full min-h-[80px] flex items-center justify-center text-[14px] font-medium text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Off Day / No Schedule
                    </div>
                  ) : (
                    daySchedule.chambers.map((chamber, idx) => (
                      <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col lg:flex-row justify-between lg:items-center gap-4 hover:shadow-md hover:border-indigo-100 transition-all">
                        
                        {/* Chamber Info */}
                        <div className="flex-1">
                          <h5 className="text-[15px] font-bold text-slate-800 mb-1.5">{chamber.name}</h5>
                          <div className="flex items-start gap-1.5 text-slate-500">
                            <MapPin size={16} className="shrink-0 mt-0.5" />
                            <span className="text-[13px] font-medium leading-snug">{chamber.address}</span>
                          </div>
                        </div>

                        {/* Timing Badge */}
                        <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 shrink-0">
                          <Clock size={16} />
                          <span className="text-[13px] font-bold">{chamber.time}</span>
                        </div>

                        {/* Booking Status Mini Bar */}
                        <div className="w-full lg:w-[160px] shrink-0 flex flex-col justify-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[12px] font-bold text-slate-600">Booked</span>
                            <span className="text-[12px] font-bold text-slate-800">{chamber.booked}/{chamber.capacity}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${(chamber.booked / chamber.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
