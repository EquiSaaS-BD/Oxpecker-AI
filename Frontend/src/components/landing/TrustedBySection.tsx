"use client";

import { Users, Stethoscope, MessageSquare, Star } from "lucide-react";
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

export function TrustedBySection() {
  const { lang, t } = useLanguage();
  const isBn = lang === "bn";

  const users = useCountUp(10000);
  const doctors = useCountUp(500);
  const rating = useCountUp(49);
  const queries = useCountUp(250000);

  return (
    <section className="relative border-y border-slate-100 bg-white overflow-hidden">
      
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,61,155,0.03)_0%,transparent_70%)] animate-neural-pulse" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {t("Trusted Healthcare Technology", "নির্ভরযোগ্য স্বাস্থ্যপ্রযুক্তি")}
          </p>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {[
            { icon: Users, val: users, suffix: "+", label: t("Active Users", "সক্রিয় ব্যবহারকারী"), color: "text-primary", bg: "bg-primary/10" },
            { icon: Stethoscope, val: doctors, suffix: "+", label: t("Expert Doctors", "বিশেষজ্ঞ ডাক্তার"), color: "text-secondary", bg: "bg-secondary/10" },
            { icon: MessageSquare, val: queries, suffix: "+", label: t("AI Queries Served", "AI সেবা প্রদান"), color: "text-tertiary", bg: "bg-tertiary/10" },
            { icon: Star, val: rating, suffix: "/5", isFloat: true, label: t("User Rating", "ইউজার রেটিং"), color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center gap-4 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <s.icon size={28} className={s.color} />
              </div>
              <div>
                <span className="text-3xl lg:text-4xl font-extrabold text-[#0a1628] tabular-nums tracking-tight">
                  <span ref={s.val.ref}>
                    {s.isFloat 
                      ? localizedDigits(Math.round((s.val.value / 10) * 10) / 10, isBn) 
                      : localizedDigits(s.val.value, isBn)}
                  </span>
                  {s.suffix && <span className="text-xl lg:text-2xl text-slate-400 ml-1">{isBn && s.suffix === "/5" ? "/৫" : s.suffix}</span>}
                </span>
                <p className="text-sm font-medium text-slate-500 mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Marquee */}
        <div className="relative flex overflow-hidden shustota-marquee-mask">
          <div className="animate-shustota-line whitespace-nowrap flex items-center gap-16 py-4 px-8 opacity-40 grayscale">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="text-xl font-bold text-slate-500 font-mono tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Partner Clinic {i}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
