"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Phone } from "lucide-react";

interface EmergencyAlertData {
  condition: string;
  severity: "critical" | "high" | "moderate";
  message: string;
  callNumber: string;
  firstAidSteps?: string[];
}

const severityConfig = {
  critical: {
    badge: "bg-red-900/40 text-white border-red-400/30",
    label: "CRITICAL",
  },
  high: {
    badge: "bg-orange-900/40 text-orange-100 border-orange-400/30",
    label: "HIGH",
  },
  moderate: {
    badge: "bg-yellow-900/40 text-yellow-100 border-yellow-400/30",
    label: "MODERATE",
  },
};

export function EmergencyAlert({ alert }: { alert: EmergencyAlertData }) {
  const config = severityConfig[alert.severity] || severityConfig.critical;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative rounded-2xl overflow-hidden w-full max-w-md"
    >
      {/* Background with gradient + glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-650 to-red-800" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_60%)]" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Pulsing Warning Icon */}
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="shrink-0 w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20"
          >
            <AlertTriangle className="w-6 h-6 text-white" />
          </motion.div>

          <div className="flex-1 min-w-0">
            {/* Severity Badge */}
            <span
              className={`inline-block text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full border mb-2 ${config.badge}`}
            >
              {config.label}
            </span>

            {/* Condition */}
            <h3 className="text-xl font-bold text-white leading-tight">
              {alert.condition}
            </h3>
          </div>
        </div>

        {/* Message */}
        <p className="mt-3 text-sm text-white/85 leading-relaxed">
          {alert.message}
        </p>

        {/* First Aid Steps */}
        {alert.firstAidSteps && alert.firstAidSteps.length > 0 && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 p-3.5">
            <p className="text-xs font-bold text-white/90 uppercase tracking-wider mb-2.5">
              First Aid Steps
            </p>
            <ol className="space-y-2">
              {alert.firstAidSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold text-white mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/90 leading-snug">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Emergency Call Button */}
        <motion.a
          href={`tel:${alert.callNumber}`}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 flex items-center justify-center gap-2.5 w-full bg-white text-red-600 font-bold py-3.5 rounded-xl text-base shadow-lg cursor-pointer no-underline"
        >
          <Phone className="w-5 h-5" />
          CALL EMERGENCY — {alert.callNumber}
        </motion.a>
      </div>
    </motion.div>
  );
}
