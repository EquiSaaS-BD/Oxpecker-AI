"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
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
      
      <ul className="w-full mx-auto list-none p-0 flex flex-col gap-3">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              className={cn(
                "w-full rounded-xl overflow-hidden transition-all duration-200",
                "border border-slate-200/80 bg-white shadow-xs hover:border-sky-300",
                isActive ? "border-sky-400 shadow-md ring-1 ring-sky-300/40" : ""
              )}
            >
              <button
                type="button"
                className={cn(
                  "flex items-center justify-between w-full min-h-[52px] py-3 px-3.5 sm:px-5 cursor-pointer",
                  "border-l-[4px] sm:border-l-[6px] transition-colors duration-200 text-left outline-none text-xs sm:text-sm md:text-base font-bold gap-3",
                  isActive 
                    ? "border-l-sky-600 bg-sky-50/50 text-slate-900" 
                    : "border-l-slate-300 bg-white text-slate-700 hover:border-l-sky-400 hover:bg-slate-50/50"
                )}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <span 
                    className={cn(
                      "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-extrabold transition-colors",
                      isActive ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {isActive ? "−" : "+"}
                  </span>
                  
                  <span className="flex-1 leading-snug break-words pr-1">{item.question}</span>
                </div>
                
                <ChevronDown 
                  className={cn(
                    "w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200",
                    isActive && "rotate-180 text-sky-600"
                  )}
                />
              </button>

              {isActive && (
                <div className="w-full border-l-[4px] sm:border-l-[6px] border-l-sky-600 bg-sky-50/30 px-3.5 sm:px-5 pb-4 pt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-600 border-t border-slate-100">
                  <p className="opacity-95">{item.answer}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
