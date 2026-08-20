"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Laptop, Printer, ArrowRight, Activity } from 'lucide-react';

export function SystemArchitectureDiagram() {
  const steps = [
    {
      step: 1,
      title: "Patient App",
      description: "Book appointments, consult AI symptom checker, and view medical records.",
      icon: Smartphone,
    },
    {
      step: 2,
      title: "Doctor Dashboard",
      description: "Real-time queue of patients, generate e-prescriptions instantly, view full patient history.",
      icon: Laptop,
    },
    {
      step: 3,
      title: "Assistant Panel",
      description: "Manage walk-in patients, print prescriptions, and handle billing.",
      icon: Printer,
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="how-it-works">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold tracking-wide uppercase mb-6"
          >
            <Activity size={16} /> Workflow
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tighter"
          >
            How Oxpecker Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto"
          >
            A seamlessly connected healthcare platform. Data flows in real-time between patients, doctors, and assistants.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 relative">
          {steps.map((step, index) => (
            <React.Fragment key={step.step}>
              {/* Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-full lg:w-1/3 relative z-10 group"
              >
                <div className="h-full bg-white border border-slate-200 p-8 rounded-[2rem] spatial-shadow transition-all duration-300 hover:-translate-y-1 hover:border-slate-300">
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {step.step}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-slate-900">
                    <step.icon size={28} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Connecting Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center shrink-0 w-12 z-0">
                  <ArrowRight size={32} className="text-slate-300" />
                </div>
              )}
              {index < steps.length - 1 && (
                <div className="flex lg:hidden items-center justify-center py-2 z-0">
                   <ArrowRight size={24} className="text-slate-300 rotate-90" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
