"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  { 
    question: "Is Oxpecker AI completely free for patients?", 
    answer: "Yes, Oxpecker AI is 100% free for patients. You can consult our AI symptom checker, search verified doctors, view medicine guides, and check hospital bed availability without any subscription or hidden fees." 
  },
  { 
    question: "How does the AI Symptom Checker work?", 
    answer: "Simply type your symptoms or health queries in plain Bengali or English. Our medical AI analyzes your symptoms and recommends the appropriate specialist department (e.g. Neurologist, Cardiologist) along with care advice." 
  },
  { 
    question: "How do I book a doctor chamber appointment?", 
    answer: "Browse our directory of BMDC-verified specialist doctors, view their chamber locations, schedule times, and consultation fees, then click 'Book Appointment' to reserve your slot." 
  },
  { 
    question: "How does Prescription & Report Scanning work?", 
    answer: "Upload a photo of your prescription or diagnostic test report. Our AI automatically extracts medicine names, dosages, timings, and food instructions, presenting them in clear Bengali." 
  },
  { 
    question: "Is my personal healthcare data secure?", 
    answer: "We prioritize patient privacy using enterprise-grade end-to-end encryption. Your medical data is strictly private and never shared with third parties." 
  },
];

export function FaqAccordion({
  items = DEFAULT_ITEMS,
  title,
  className,
  ...props
}: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto py-4 relative font-sans", className)} {...props}>
      {title && (
        <h2 className="text-center font-bold text-2xl md:text-3xl mb-8 text-slate-800">
          {title}
        </h2>
      )}
      
      <ul className="w-full mx-auto list-none p-0 flex flex-col">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              className={cn(
                "w-full relative transition-all duration-300 ease-in mb-3 rounded-xl overflow-hidden",
                "border border-slate-200/80 bg-white shadow-xs hover:border-sky-300",
                isActive ? "border-sky-400 shadow-md ring-1 ring-sky-300/40" : ""
              )}
            >
              <button
                className={cn(
                  "flex flex-row items-center justify-start w-full min-h-[56px] py-4 relative m-0 px-4 pl-12 sm:pl-14 cursor-pointer",
                  "border-l-[6px] transition-colors duration-200 text-left outline-none text-sm md:text-base font-bold",
                  isActive 
                    ? "border-l-sky-600 bg-sky-50/50 text-slate-900" 
                    : "border-l-slate-300 bg-white text-slate-700 hover:border-l-sky-400 hover:bg-slate-50/50"
                )}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                {/* Plus/Minus Icon */}
                <span 
                  className={cn(
                    "absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 transition-all duration-200 leading-none select-none font-bold",
                    isActive ? "text-[26px] text-sky-600" : "text-[22px] text-slate-400"
                  )}
                >
                  {isActive ? "−" : "+"}
                </span>
                
                <span className="pr-6 leading-snug">{item.question}</span>
                
                {/* Chevron */}
                <span 
                  className={cn(
                    "absolute right-4 sm:right-6 block w-2 h-2 border-t-[2.5px] border-r-[2.5px] transition-transform duration-200 ease-in-out shrink-0",
                    isActive ? "rotate-[-44deg] border-sky-600" : "rotate-[133deg] border-slate-400"
                  )}
                />
              </button>

              <div 
                className={cn(
                  "grid transition-all duration-300 ease-in-out w-full",
                  "border-l-[6px]",
                  isActive ? "grid-rows-[1fr] border-l-sky-600 bg-sky-50/30" : "grid-rows-[0fr] border-l-transparent"
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-row items-start justify-start w-full px-4 pl-12 sm:pl-14 pb-5 pt-1 text-xs sm:text-sm font-medium leading-relaxed text-slate-600 border-t border-slate-100">
                    <span className="opacity-95">{item.answer}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
