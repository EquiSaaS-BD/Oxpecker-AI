"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Stethoscope, Pill, Syringe, HeartPulse, 
  Activity, Crosshair, Droplet, Thermometer, 
  Microscope, Hospital
} from "lucide-react";

const ICONS = [
  { Icon: Stethoscope, color: "text-blue-500/20" },
  { Icon: Pill, color: "text-purple-500/20" },
  { Icon: Syringe, color: "text-pink-500/20" },
  { Icon: HeartPulse, color: "text-rose-500/20" },
  { Icon: Activity, color: "text-green-500/20" },
  { Icon: Crosshair, color: "text-indigo-500/20" },
  { Icon: Droplet, color: "text-cyan-500/20" },
  { Icon: Thermometer, color: "text-orange-500/20" },
  { Icon: Microscope, color: "text-teal-500/20" },
  { Icon: Hospital, color: "text-sky-500/20" },
];

export function FloatingMedicalBackground() {
  const [mounted, setMounted] = useState(false);
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Generate random positions once on the client to avoid hydration mismatch
    const generated = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      iconIndex: Math.floor(Math.random() * ICONS.length),
      size: Math.floor(Math.random() * 40) + 30, // 30px to 70px
      left: Math.floor(Math.random() * 100), // 0 to 100vw
      top: Math.floor(Math.random() * 100), // 0 to 100vh
      duration: Math.floor(Math.random() * 25) + 25, // 25s to 50s
      delay: Math.random() * 10, // 0s to 10s
      direction: Math.random() > 0.5 ? 1 : -1,
    }));
    setElements(generated);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((el) => {
        const { Icon, color } = ICONS[el.iconIndex];
        return (
          <motion.div
            key={el.id}
            initial={{ 
              x: `${el.left}vw`, 
              y: `${el.top}vh`, 
              rotate: 0,
              opacity: 0
            }}
            animate={{
              x: [
                `${el.left}vw`, 
                `${el.left + (20 * el.direction)}vw`, 
                `${el.left - (10 * el.direction)}vw`, 
                `${el.left}vw`
              ],
              y: [
                `${el.top}vh`, 
                `${el.top - 20}vh`, 
                `${el.top + 10}vh`, 
                `${el.top}vh`
              ],
              rotate: [0, 90 * el.direction, 180 * el.direction, 360 * el.direction],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: el.duration,
              delay: el.delay,
              repeat: Infinity,
              ease: "linear",
              opacity: {
                duration: el.duration,
                times: [0, 0.1, 0.9, 1],
                repeat: Infinity
              }
            }}
            className={`absolute ${color}`}
            style={{ width: el.size, height: el.size }}
          >
            <Icon size={el.size} strokeWidth={1.5} />
          </motion.div>
        );
      })}
    </div>
  );
}
