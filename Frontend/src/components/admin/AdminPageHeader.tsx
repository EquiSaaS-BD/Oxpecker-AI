"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function AdminPageHeader({ title, description, icon, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3.5"
      >
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm font-medium text-slate-600 mt-1">{description}</p>
          )}
        </div>
      </motion.div>

      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}