"use client";

import React, { useState } from "react";
import { Search, Edit, MoreVertical, Phone, Video, Info, Paperclip, Send, Smile, ChevronLeft } from "lucide-react";

const mockChats = [
  { id: 1, name: "Dr. Aminul Islam", role: "General Physician", lastMessage: "Can you review Rahim's ECG?", time: "10:30 AM", unread: 2, online: true },
  { id: 2, patientName: "Karim Ali", role: "Patient", lastMessage: "Thank you doctor, feeling better now.", time: "Yesterday", unread: 0, online: false },
  { id: 3, name: "Lab Technician", role: "Staff", lastMessage: "Blood reports for Fatima are ready.", time: "Yesterday", unread: 0, online: true },
  { id: 4, patientName: "Nasima Akter", role: "Patient", lastMessage: "When should I take the red pill?", time: "Mon", unread: 0, online: false },
  { id: 5, name: "Dr. Sarah", role: "Neurologist", lastMessage: "I'll forward the MRI scans soon.", time: "Sun", unread: 0, online: false },
];

export function Messenger() {
  const [activeChatId, setActiveChatId] = useState(1);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  return (
    <div className="flex h-full bg-white relative overflow-hidden">
      
      {/* 1. Left Sidebar (Inbox) */}
      <div className={`w-full md:w-[340px] flex-shrink-0 md:border-r border-slate-200 flex-col h-full bg-white z-10 ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
        {/* Inbox Header (Height: 72px) */}
        <div className="h-[72px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-[20px] font-bold text-[#111827]">Messages</h2>
          <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-[#2F80ED] hover:bg-blue-50 rounded-full transition-colors">
            <Edit size={18} />
          </button>
        </div>

        {/* Search Box (Height: 40px) */}
        <div className="px-4 pb-4 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search messages..."
              className="w-full h-[40px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-[10px] text-[14px] text-slate-700 outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {mockChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => { setActiveChatId(chat.id); setShowChatOnMobile(true); }}
              className={`h-[80px] px-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-transparent
                ${activeChatId === chat.id ? 'bg-blue-50 border-blue-100' : 'hover:bg-slate-50'}
              `}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[16px]">
                  {(chat.name || chat.patientName)?.charAt(0)}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-[15px] font-semibold truncate ${activeChatId === chat.id ? 'text-[#2F80ED]' : 'text-slate-800'}`}>
                    {chat.name || chat.patientName}
                  </p>
                  <span className={`text-[11px] font-medium shrink-0 ml-2 ${chat.unread > 0 ? 'text-[#2F80ED]' : 'text-slate-400'}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-[13px] truncate pr-2 ${chat.unread > 0 ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 bg-[#2F80ED] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Active Chat Area (Right Side) */}
      <div className={`flex-1 flex-col h-full bg-[#F8FAFC] ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}>
        {/* Chat Header (Height: 72px) */}
        <div className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 pr-2">
            <button 
              className="md:hidden p-1.5 sm:p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors shrink-0"
              onClick={() => setShowChatOnMobile(false)}
            >
              <ChevronLeft size={22} />
            </button>
            <div className="relative shrink-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#2F80ED] font-bold text-[14px]">
                A
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[14px] md:text-[16px] font-bold text-slate-800 leading-tight truncate">Dr. Aminul Islam</h2>
              <p className="text-[11px] md:text-[12px] font-medium text-emerald-500 truncate">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 md:gap-2 text-slate-500 shrink-0">
            <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"><Phone size={18} className="md:w-5 md:h-5" /></button>
            <button className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 items-center justify-center hover:bg-slate-100 rounded-full transition-colors"><Video size={18} className="md:w-5 md:h-5" /></button>
            <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />
            <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"><Info size={18} className="md:w-5 md:h-5" /></button>
          </div>
        </div>

        {/* Message Bubbles Area (Padding: 24px) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 flex flex-col gap-4 md:gap-6">
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-slate-200/50 rounded-full text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today</span>
          </div>

          {/* Received Bubble */}
          <div className="flex items-end gap-2 max-w-[90%] md:max-w-[70%]">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 shrink-0" />
            <div className="bg-white border border-slate-200 p-3 md:p-[12px_16px] rounded-[16px] rounded-bl-none shadow-sm text-[14px] md:text-[15px] text-slate-700 leading-[1.5]">
              Hello Dr. Rafin, I have a patient named Rahim Uddin. He was experiencing some chest pain yesterday.
            </div>
          </div>
          <div className="flex items-end gap-2 max-w-[90%] md:max-w-[70%] mt-[-8px] md:mt-[-16px]">
            <div className="w-6 h-6 md:w-8 md:h-8 shrink-0 opacity-0" />
            <div className="bg-white border border-slate-200 p-3 md:p-[12px_16px] rounded-[16px] rounded-bl-none shadow-sm text-[14px] md:text-[15px] text-slate-700 leading-[1.5]">
              Can you review his recent ECG? I've already uploaded the report to the system.
            </div>
          </div>

          {/* Sent Bubble */}
          <div className="flex flex-col items-end gap-1 w-full mt-2 md:mt-4">
            <div className="flex items-end gap-2 max-w-[90%] md:max-w-[70%] flex-row-reverse">
              <div className="bg-[#2F80ED] text-white p-3 md:p-[12px_16px] rounded-[16px] rounded-br-none shadow-sm text-[14px] md:text-[15px] leading-[1.5]">
                Sure Dr. Aminul, I'm checking the report right now.
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium mr-1 md:mr-2">10:32 AM</span>
          </div>
        </div>

        {/* Message Input Area */}
        <div className="min-h-[70px] md:min-h-[80px] bg-white border-t border-slate-200 p-3 md:p-[16px_24px] flex items-center shrink-0">
          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-[24px] pl-1 md:pl-2 pr-1 md:pr-2">
            <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full transition-colors shrink-0">
              <Smile size={18} className="md:w-5 md:h-5" />
            </button>
            <input 
              type="text" 
              placeholder="Type your message..."
              className="flex-1 h-[40px] md:h-[48px] bg-transparent border-none outline-none text-[14px] md:text-[15px] text-slate-700 placeholder:text-slate-400 px-2 min-w-0"
            />
            <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full transition-colors shrink-0 mr-1">
              <Paperclip size={18} className="md:w-5 md:h-5" />
            </button>
            <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#2F80ED] text-white hover:bg-[#2563EB] rounded-full transition-colors shrink-0 shadow-sm">
              <Send size={16} className="md:w-[18px] md:h-[18px] ml-0.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
