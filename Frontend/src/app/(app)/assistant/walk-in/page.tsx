"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Phone, CalendarDays, Clock, 
  MapPin, Printer, Check, User, Banknote, CreditCard, Smartphone, ShieldAlert, BadgeCheck, CheckCircle2, Barcode
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export default function WalkInPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', phone: '',
    symptoms: '', doctor: '', priority: 'Normal',
    paymentMethod: 'Cash', discount: ''
  });
  const [phoneDigits, setPhoneDigits] = useState<string[]>(Array(11).fill(''));
  const [tokenId, setTokenId] = useState('S-' + Math.floor(Math.random() * 900 + 100));

  // Validation & Success State
  const [errors, setErrors] = useState<string[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  
  // Derived Billing
  const fee = formData.doctor ? 1000 : 0; // Example dynamic fee
  const discountAmount = formData.discount ? (fee * (Number(formData.discount) / 100)) : 0;
  const total = fee - discountAmount;

  useEffect(() => {
    // Simulate fetching page layout/data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors.includes(field)) {
      setErrors(errors.filter(e => e !== field));
    }
  };

  const handleGenerate = () => {
    const newErrors = [];
    if (!formData.name.trim()) newErrors.push('name');
    if (!formData.age.trim()) newErrors.push('age');
    
    const fullPhone = phoneDigits.join('');
    if (fullPhone.length < 11) newErrors.push('phone');
    
    if (!formData.doctor) newErrors.push('doctor');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields.');
      return;
    }

    // Success logic
    setIsGenerated(true);
    toast.success(`Token ${tokenId} generated successfully!`);
  };

  const handleReset = () => {
    setFormData({
      name: '', age: '', gender: 'Male', phone: '',
      symptoms: '', doctor: '', priority: 'Normal',
      paymentMethod: 'Cash', discount: ''
    });
    setPhoneDigits(Array(11).fill(''));
    setErrors([]);
    setIsGenerated(false);
    setTokenId('S-' + Math.floor(Math.random() * 900 + 100));
  };

  const handlePhoneDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...phoneDigits];
    newDigits[index] = value;
    setPhoneDigits(newDigits);
    
    // Update formData for derived logic if needed
    setFormData(prev => ({ ...prev, phone: newDigits.join('') }));

    // Auto-focus next
    if (value && index < 10) {
      document.getElementById(`phone-digit-${index + 1}`)?.focus();
    }
  };

  const handlePhoneDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !phoneDigits[index] && index > 0) {
      document.getElementById(`phone-digit-${index - 1}`)?.focus();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col font-sans pb-24 -mt-6 lg:-mt-10 animate-pulse">
        {/* Skeleton Header */}
        <div className="bg-white/80 border-b border-white/50 px-4 lg:px-8 py-5 lg:py-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)] -mx-4 sm:-mx-6 lg:-mx-10 mb-6 sm:mb-8 pt-6 lg:pt-10">
          <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-2">
            <div className="h-8 bg-slate-200 rounded-lg w-64"></div>
            <div className="h-4 bg-slate-200 rounded-md w-80"></div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-0">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-8 h-[400px]"></div>
              <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-8 h-[200px]"></div>
            </div>
            <div className="xl:col-span-1">
              <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 h-[500px]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans pb-24 -mt-6 lg:-mt-10">
      
      {/* Header (Edge to Edge, Scrollable, Glassmorphism) */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/50 px-4 lg:px-8 py-5 lg:py-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)] -mx-4 sm:-mx-6 lg:-mx-10 mb-6 sm:mb-8 pt-6 lg:pt-10">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[20px] lg:text-[24px] font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 shadow-inner">
                <UserPlus className="text-emerald-600" size={24} />
              </div>
              Walk-in Registration
            </h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1">Register new walk-in patients and assign tokens instantly.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-0">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left: Registration Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="xl:col-span-2 flex flex-col gap-6"
          >
            {/* --- 1. Patient Details Card --- */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="p-5 lg:p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[14px]">1</span> 
                  Patient Details
                </h2>
              </div>
              <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Patient Full Name <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Rahim Uddin"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full h-[48px] bg-slate-50 border ${errors.includes('name') ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50'} rounded-xl pl-11 pr-4 text-[14px] font-medium text-slate-800 outline-none transition-all`}
                    />
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Age <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    placeholder="Years"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={`w-full h-[48px] bg-slate-50 border ${errors.includes('age') ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50'} rounded-xl px-4 text-[14px] font-medium text-slate-800 outline-none transition-all`}
                  />
                </div>

                {/* Gender */}
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Gender <span className="text-rose-500">*</span></label>
                  <div className="flex gap-3">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        onClick={() => handleInputChange('gender', g)}
                        className={`flex-1 h-[48px] rounded-xl text-[14px] font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                          formData.gender === g 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' 
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone - 11 Digit Boxes */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[13px] font-bold text-slate-700">Phone Number (11 Digits) <span className="text-rose-500">*</span></label>
                    {phoneDigits.join('').length > 0 && phoneDigits.join('').length < 11 && (
                      <span className="text-[12px] font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Incomplete</span>
                    )}
                    {phoneDigits.join('').length === 11 && (
                      <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>
                    )}
                  </div>
                  <div className={`flex gap-1 sm:gap-1.5 p-1 rounded-xl transition-all ${errors.includes('phone') ? 'bg-rose-50 p-2 border border-rose-200' : ''}`}>
                    {phoneDigits.map((digit, index) => (
                      <input 
                        key={index}
                        id={`phone-digit-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePhoneDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handlePhoneDigitKeyDown(index, e)}
                        placeholder="-"
                        className={`w-full min-w-0 max-w-[44px] h-10 sm:h-12 shrink-1 rounded-lg text-center text-[16px] sm:text-[18px] font-bold outline-none transition-all shadow-sm ${
                          digit 
                            ? 'bg-white border-2 border-indigo-400 text-indigo-700 placeholder-transparent' 
                            : 'bg-slate-50 text-slate-800 border border-slate-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 placeholder-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Symptoms / Reason for Visit</label>
                  <textarea 
                    rows={3}
                    placeholder="Briefly describe the symptoms..."
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange('symptoms', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[14px] font-medium text-slate-800 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all resize-none min-h-[100px]"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* --- 2. Assignment Card --- */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="p-5 lg:p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[14px]">2</span> 
                  Assignment & Priority
                </h2>
              </div>
              <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Assign Doctor <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'Dr. Farzana Alam', name: 'Dr. Farzana Alam', dept: 'Gynecology', color: 'pink' },
                      { id: 'Dr. Hasan', name: 'Dr. Hasan', dept: 'Cardiology', color: 'blue' }
                    ].map(doc => {
                      const isSelected = formData.doctor === doc.id;
                      const colors = {
                        pink: isSelected ? 'bg-pink-50 border-pink-400 ring-4 ring-pink-50' : 'bg-white border-slate-200 hover:border-pink-200',
                        blue: isSelected ? 'bg-blue-50 border-blue-400 ring-4 ring-blue-50' : 'bg-white border-slate-200 hover:border-blue-200'
                      }[doc.color];
                      
                      return (
                        <button 
                          key={doc.id}
                          onClick={() => handleInputChange('doctor', doc.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${colors} ${errors.includes('doctor') && !formData.doctor ? 'border-rose-300 ring-4 ring-rose-50' : ''}`}
                        >
                          <h3 className="font-bold text-slate-800 text-[15px]">{doc.name}</h3>
                          <p className="text-[13px] font-medium text-slate-500">{doc.dept}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Priority Level</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl h-[48px]">
                    <button 
                      onClick={() => handleInputChange('priority', 'Normal')}
                      className={`flex-1 rounded-[8px] text-[13px] font-bold transition-all ${formData.priority === 'Normal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Normal
                    </button>
                    <button 
                      onClick={() => handleInputChange('priority', 'Urgent')}
                      className={`flex-1 rounded-[8px] text-[13px] font-bold transition-all ${formData.priority === 'Urgent' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Urgent
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* --- 3. Billing & Payment Card --- */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="p-5 lg:p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[14px]">3</span> 
                  Billing & Payment
                </h2>
              </div>
              <div className="p-6 lg:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Payment Methods */}
                  <div className="flex-1 space-y-3">
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Select Payment Method</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button 
                        onClick={() => handleInputChange('paymentMethod', 'Cash')}
                        className={`h-[56px] rounded-xl flex items-center justify-center gap-2 text-[14px] font-bold border-2 transition-all ${formData.paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                      >
                        <Banknote size={20} /> Cash
                      </button>
                      <button 
                        onClick={() => handleInputChange('paymentMethod', 'bKash')}
                        className={`h-[56px] rounded-xl flex items-center justify-center gap-2 text-[14px] font-bold border-2 transition-all ${formData.paymentMethod === 'bKash' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                      >
                        <Smartphone size={20} /> bKash
                      </button>
                      <button 
                        onClick={() => handleInputChange('paymentMethod', 'Card')}
                        className={`h-[56px] rounded-xl flex items-center justify-center gap-2 text-[14px] font-bold border-2 transition-all ${formData.paymentMethod === 'Card' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                      >
                        <CreditCard size={20} /> Card
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="w-full md:w-[280px] bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-[14px] mb-2">
                      <span className="text-slate-500 font-medium">Consultation Fee</span>
                      <span className="font-bold text-slate-800">৳{fee}</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px] pb-3 border-b border-slate-200 mb-3 gap-4">
                      <span className="text-slate-500 font-medium whitespace-nowrap">Discount (%)</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={formData.discount}
                        onChange={(e) => handleInputChange('discount', e.target.value)}
                        className="w-20 h-8 bg-white border border-slate-200 rounded-lg px-2 text-right text-[14px] font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] font-bold text-slate-800">Total Payable</span>
                      <span className="text-[24px] font-black text-indigo-600">৳{total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end mt-2">
              <button 
                onClick={handleReset}
                className="h-[56px] px-8 bg-white border border-slate-200 text-slate-700 font-bold text-[15px] rounded-xl hover:bg-slate-50 transition-colors"
              >
                Clear Form
              </button>
              <button 
                onClick={handleGenerate}
                disabled={isGenerated}
                className={`h-[56px] px-10 text-white font-bold text-[16px] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${isGenerated ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25 active:scale-95'}`}
              >
                {isGenerated ? <><CheckCircle2 size={20} /> Token Generated</> : 'Generate Token & Bill'}
              </button>
            </div>
          </motion.div>

          {/* Right: Live Preview & Print */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="xl:col-span-1"
          >
            <div className="sticky top-[100px] flex flex-col gap-6">
              
              <div className={`bg-white rounded-[24px] shadow-sm border p-6 lg:p-8 flex flex-col items-center text-center transition-colors duration-500 ${isGenerated ? 'border-emerald-200 shadow-emerald-100/50' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between w-full mb-6">
                  <span className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">Live Preview</span>
                  {isGenerated && <span className="bg-emerald-100 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><BadgeCheck size={12}/> Ready</span>}
                </div>
                
                {/* The Ticket */}
                <div className="w-full relative bg-white border-2 border-dashed border-slate-200 rounded-[20px] p-6 lg:p-8 mb-6 shadow-sm">
                  {/* Decorative Ticket Cutouts */}
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white border-r-2 border-dashed border-slate-200 rounded-full -translate-y-1/2"></div>
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white border-l-2 border-dashed border-slate-200 rounded-full -translate-y-1/2"></div>

                  <h3 className="text-[18px] font-black text-slate-800 mb-6 text-center">Shustota AI Hospital</h3>
                  
                  <div className="flex flex-col items-center justify-center mb-6">
                    <div className={`mb-4 transition-opacity duration-500 ${isGenerated ? 'opacity-100' : 'opacity-30'}`}>
                      <img 
                        src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${tokenId}&scale=3&height=10&includetext=false`} 
                        alt="Token Barcode" 
                        className="h-[60px] w-auto object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">Token Number</div>
                    <div className={`text-[56px] font-black leading-none transition-colors ${isGenerated ? 'text-emerald-500' : 'text-slate-800'}`}>
                      {tokenId}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 text-left border-t-2 border-dashed border-slate-100 pt-6">
                    <div className="flex justify-between items-end gap-2">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Patient Name</p>
                        <p className="font-bold text-slate-800 text-[15px]">{formData.name || 'Not specified'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Age</p>
                        <p className="font-bold text-slate-800 text-[15px]">{formData.age ? `${formData.age} Y` : '--'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone Number</p>
                      <p className="font-bold text-slate-800 text-[15px]">{phoneDigits.join('') || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Assigned Doctor</p>
                      <p className="font-bold text-slate-800 text-[15px]">{formData.doctor || 'Not assigned'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Payment</p>
                        <p className="font-bold text-slate-700 text-[14px]">{formData.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Discount</p>
                        <p className="font-bold text-slate-700 text-[14px]">{formData.discount ? `${formData.discount}%` : '0%'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Paid</p>
                        <p className="font-black text-indigo-600 text-[16px]">৳{total}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Priority</p>
                        <p className={`font-bold text-[14px] ${formData.priority === 'Urgent' ? 'text-rose-500' : 'text-slate-700'}`}>{formData.priority}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!isGenerated}
                  className={`w-full h-[56px] font-bold text-[15px] rounded-xl flex items-center justify-center gap-2 transition-all ${isGenerated ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-md active:scale-95' : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'}`}
                >
                  <Printer size={20} /> Print Token
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
