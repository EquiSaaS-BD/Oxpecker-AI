"use client";

import { Users, Stethoscope, MessageSquare, Star, Building2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, value };
}

function localizedDigits(n: number, isBn: boolean) {
  if (!isBn) return n.toLocaleString("en-US");
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n
    .toString()
    .split("")
    .map((d) => map[Number(d)] ?? d)
    .join("");
}

const CONNECTED_HOSPITALS = [
  { name: "Square Hospital Dhaka", bnName: "স্কয়ার হাসপাতাল ঢাকা" },
  { name: "Labaid Specialized Hospital", bnName: "ল্যাবএইড স্পেশালাইজড হাসপাতাল" },
  { name: "Popular Diagnostic Centre", bnName: "পপুলার ডায়াগনস্টিক সেন্টার" },
  { name: "United Hospital Gulshan", bnName: "ইউনাইটেড হাসপাতাল গুলশান" },
  { name: "Evercare Hospital Dhaka", bnName: "এভারকেয়ার হাসপাতাল ঢাকা" },
  { name: "Ibn Sina Specialized Hospital", bnName: "ইবনে সিনা স্পেশালাইজড হাসপাতাল" },
  { name: "Central Hospital Limited", bnName: "সেন্ট্রাল হাসপাতাল লিমিটেড" },
  { name: "BRB Hospitals Limited", bnName: "বিআরবি হাসপাতাল লিমিটেড" },
];

export function TrustedBySection() {
  const { lang, t } = useLanguage();
  const isBn = lang === "bn";

  const users = useCountUp(10000);
  const doctors = useCountUp(500);
  const rating = useCountUp(49);
  const queries = useCountUp(250000);

  return (
    <section className="relative border-y border-slate-200/80 bg-white overflow-hidden py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-200 px-4 py-1.5 rounded-full inline-block mb-2">
            {t("Trusted Healthcare Technology", "নির্ভরযোগ্য স্বাস্থ্যসেবা নেটওয়ার্ক")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {t("Empowering Patients, Doctors & Hospitals", "রোগী, ডাক্তার ও হাসপাতালের আস্থা")}
          </h2>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {[
            {
              icon: Users,
              val: users,
              suffix: "+",
              label: t("Active Patients", "সক্রিয় পেশেন্ট"),
              color: "text-emerald-600",
              bg: "bg-emerald-50 border border-emerald-200"
            },
            {
              icon: Stethoscope,
              val: doctors,
              suffix: "+",
              label: t("Specialist Doctors", "বিশেষজ্ঞ ডাক্তার"),
              color: "text-sky-600",
              bg: "bg-sky-50 border border-sky-200"
            },
            {
              icon: MessageSquare,
              val: queries,
              suffix: "+",
              label: t("AI Consultations Served", "AI হেলথ কনসাল্টেশন"),
              color: "text-purple-600",
              bg: "bg-purple-50 border border-purple-200"
            },
            {
              icon: Star,
              val: rating,
              suffix: "/5",
              isFloat: true,
              label: t("Patient Satisfaction", "পেশেন্ট স্যাটিসফ্যাকশন"),
              color: "text-amber-500",
              bg: "bg-amber-50 border border-amber-200"
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center p-6 bg-slate-50/70 border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-4 transition-transform duration-300`}>
                <s.icon size={26} className={s.color} />
              </div>
              <div>
                <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                  <span ref={s.val.ref}>
                    {s.isFloat 
                      ? localizedDigits(Math.round((s.val.value / 10) * 10) / 10, isBn) 
                      : localizedDigits(s.val.value, isBn)}
                  </span>
                  {s.suffix && (
                    <span className="text-xl lg:text-2xl text-slate-500 font-bold ml-1">
                      {isBn && s.suffix === "/5" ? "/৫" : s.suffix}
                    </span>
                  )}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Real Hospital Marquee */}
        <div className="relative flex overflow-hidden border-t border-slate-100 pt-10">
          <div className="animate-oxpecker-line whitespace-nowrap flex items-center gap-10 py-2">
            {[...CONNECTED_HOSPITALS, ...CONNECTED_HOSPITALS].map((h, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <Building2 size={16} className="text-sky-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  {isBn ? h.bnName : h.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
