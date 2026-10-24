"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  dotColor?: string;
  count?: number | string;
  badge?: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (val: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  prefix?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  align?: "left" | "right";
  menuWidth?: string;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  disabled = false,
  prefix,
  icon: Icon,
  align = "left",
  menuWidth,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-11 px-3.5 rounded-xl border bg-white flex items-center justify-between text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none select-none ${
          disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""
        } ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/10 text-slate-900 shadow-sm"
            : "border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50/50"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && <Icon size={15} className="text-blue-600 shrink-0" />}
          {selectedOption?.dotColor && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dotColor}`} />
          )}
          <span className="truncate">
            {prefix && <span className="text-slate-400 font-normal mr-1">{prefix}</span>}
            <strong className="font-bold text-slate-900">
              {selectedOption ? selectedOption.label : placeholder}
            </strong>
          </span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {selectedOption?.count !== undefined && (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
              {selectedOption.count}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute top-[calc(100%+6px)] z-50 bg-white rounded-2xl border border-slate-200/90 shadow-xl py-1.5 max-h-72 overflow-y-auto ${
              align === "right" ? "right-0" : "left-0"
            } ${menuWidth ? menuWidth : "w-full min-w-[200px]"}`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer transition-colors text-left ${
                    isSelected
                      ? "bg-blue-50/80 text-blue-900 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    {opt.dotColor && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotColor}`} />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {opt.count !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          isSelected
                            ? "bg-blue-200/60 text-blue-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {opt.count}
                      </span>
                    )}
                    {isSelected && (
                      <Check size={14} className="text-blue-600 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
