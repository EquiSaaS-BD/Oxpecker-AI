"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldAlert, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { isHealthPassActivated } from "@/lib/healthpass";

export function HealthPassActivationBanner() {
  const { user } = useAuth();
  const [isActivated, setIsActivated] = useState(true);

  const checkStatus = () => {
    if (!user) return;
    setIsActivated(isHealthPassActivated(user.id));
  };

  useEffect(() => {
    checkStatus();

    const handleStatusChanged = () => {
      checkStatus();
    };

    window.addEventListener("healthpass_status_changed", handleStatusChanged);
    window.addEventListener("storage", handleStatusChanged);

    return () => {
      window.removeEventListener("healthpass_status_changed", handleStatusChanged);
      window.removeEventListener("storage", handleStatusChanged);
    };
  }, [user]);

  // Don't show if user is already activated
  if (isActivated) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm font-medium z-50 sticky top-0"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <AlertTriangle size={14} className="text-amber-100 animate-pulse" />
          </div>
          <p className="truncate">
            <strong className="font-extrabold uppercase tracking-wide">
              Activate Your HealthPass Card:
            </strong>{" "}
            <span className="opacity-95 hidden sm:inline">
              Your digital medical ID is currently inactive. Complete activation in Settings to enable hospital emergency scans.
            </span>
            <span className="opacity-95 sm:hidden">
              Card is inactive. Complete activation now.
            </span>
          </p>
        </div>

        <Link
          href="/settings#activate-card"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs shrink-0 shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <CreditCard size={13} />
          <span>Activate Now</span>
          <ArrowRight size={13} />
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}

export default HealthPassActivationBanner;
