"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Laptop, Printer, ArrowRight, Activity } from 'lucide-react';

const ENABLE_HOSPITAL = false; // Toggle to true when hospital section is ready

export function SystemArchitectureDiagram() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 }
    }
  };

  const steps = [
    {
      step: 1,
      title: "Patient App",
      description: "Patients can easily book appointments, consult with our AI symptom checker, and view their medical records.",
      icon: Smartphone,
      color: "from-blue-500 to-cyan-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      step: 2,
      title: "Doctor Dashboard",
      description: "Doctors see a real-time live queue of patients, generate e-prescriptions instantly, and view full patient history.",
      icon: Laptop,
      color: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      step: 3,
      title: "Assistant Panel",
      description: "Assistants manage walk-in patients, print prescriptions sent by the doctor, and handle billing and payments.",
      icon: Printer,
      color: "from-purple-500 to-indigo-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    }
  ];

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden" id="how-it-works">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wide uppercase mb-6"
          >
            <Activity size={16} /> Workflow
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight"
          >
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Shustota</span> Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-[14px] sm:text-lg max-w-[95vw] lg:max-w-3xl mx-auto whitespace-nowrap overflow-hidden text-ellipsis px-4"
          >
            A seamlessly connected healthcare platform. Data flows in real-time between patients, doctors, and assistants.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 relative"
        >
          {steps.map((step, index) => (
            <React.Fragment key={step.step}>
              {/* Card */}
              <motion.div variants={cardVariants} className="w-full lg:w-1/3 relative z-10 group">
                <div className={`h-full bg-slate-900/50 backdrop-blur-xl border ${step.border} p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-slate-800/80`}>
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-br ${step.color}`}>
                      {step.step}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mb-6`}>
                    {React.createElement(step.icon, { size: 32, className: `text-transparent bg-clip-text bg-gradient-to-br ${step.color} stroke-current text-white` })}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Connecting Arrow (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center shrink-0 w-12 z-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                  >
                    <ArrowRight size={32} className="text-slate-700" />
                  </motion.div>
                </div>
              )}

              {/* Connecting Arrow (Mobile) */}
              {index < steps.length - 1 && (
                <div className="flex lg:hidden items-center justify-center py-2 z-0">
                   <ArrowRight size={24} className="text-slate-700 rotate-90" />
                </div>
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {ENABLE_HOSPITAL && (
           <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 w-full p-8 bg-slate-900/50 backdrop-blur-xl border border-rose-500/20 rounded-3xl text-center"
           >
              <h3 className="text-2xl font-bold text-white mb-2">Hospital Network (Coming Soon)</h3>
              <p className="text-slate-400">Connects multiple doctors and resources in one centralized dashboard.</p>
           </motion.div>
        )}
      </div>
    </section>
  );
}
