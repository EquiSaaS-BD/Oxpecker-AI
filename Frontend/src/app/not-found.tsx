"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Home, Activity, Stethoscope, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4 py-32 min-h-[calc(100vh-200px)]">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.5, 0.8, 0.5] 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, 30, 0],
              opacity: [0.3, 0.6, 0.3] 
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-[#2F80ED]/5 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-[800px] w-full z-10 flex flex-col items-center text-center">
          
          {/* Main 404 Visual */}
          <div className="relative mb-[40px] flex items-center justify-center w-full -mt-[40px]">
            <motion.div 
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="z-10 relative"
            >
              <img 
                src="/images/404.png.png" 
                alt="Page Not Found Visual" 
                className="w-full max-w-[360px] md:max-w-[480px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(47,128,237,0.12)]"
              />
            </motion.div>
          </div>

          {/* Text Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-[32px] md:text-[42px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-900 to-slate-600 mb-[16px] tracking-tight">
              Page Not Found
            </h2>
            <p className="text-[16px] md:text-[18px] text-orange-400 font-medium max-w-[500px] mx-auto leading-relaxed mb-[40px]">
              We couldn't find the page you are looking for. It might have been moved, deleted, or perhaps the URL is misspelled.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-[16px] w-full sm:w-auto"
          >
            <button
              onClick={() => router.push('/')}
              className="w-full sm:w-auto px-[32px] h-[56px] bg-primary text-white rounded-[16px] font-bold text-[16px] hover:bg-primary/90 hover:shadow-[0_10px_30px_-10px_rgba(15,118,110,0.5)] transition-all flex items-center justify-center gap-[12px] group"
            >
              <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" />
              Back to Home
            </button>
            <button
              onClick={() => router.back()}
              className="w-full sm:w-auto px-[32px] h-[56px] bg-white text-slate-700 rounded-[16px] font-bold text-[16px] border-[2px] border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-[12px] group"
            >
              <ArrowLeft size={20} className="text-slate-400 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
