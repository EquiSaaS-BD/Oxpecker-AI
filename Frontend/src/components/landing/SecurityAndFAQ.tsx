"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock, ShieldCheck, Key } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function SecurityAndFAQ() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: t("Is Shustota AI free?", "Shustota AI কি বিনামূল্যে?"),
      a: t(
        "Yes, Shustota AI is completely free. No subscriptions or hidden charges.",
        "হ্যাঁ, Shustota AI সম্পূর্ণ বিনামূল্যে। কোনো সাবস্ক্রিপশন বা হিডেন চার্জ নেই।"
      ),
    },
    {
      q: t("Can AI diagnose diseases?", "AI কি রোগ নির্ণয় করতে পারে?"),
      a: t(
        "No. Shustota AI only provides initial guidance. For serious issues, always consult a specialist doctor.",
        "না। Shustota AI শুধুমাত্র প্রাথমিক পরামর্শ দেয়। গুরুতর সমস্যায় অবশ্যই বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন।"
      ),
    },
    {
      q: t("Is my data secure?", "আমার ডেটা কি নিরাপদ?"),
      a: t(
        "Absolutely. We use end-to-end encryption and never share data with third parties.",
        "সম্পূর্ণ নিরাপদ। আমরা এন্ড-টু-এন্ড এনক্রিপশন ব্যবহার করি এবং কোনো তৃতীয় পক্ষের সাথে ডেটা শেয়ার করি না।"
      ),
    },
    {
      q: t("Can I upload prescriptions?", "আমি কি প্রেসক্রিপশন আপলোড করতে পারি?"),
      a: t(
        "Yes, our OCR technology can scan and extract information from your medical prescriptions instantly.",
        "হ্যাঁ, আমাদের অত্যাধুনিক OCR প্রযুক্তি আপনার আপলোড করা প্রেসক্রিপশন থেকে তাৎক্ষণিকভাবে ওষুধের তথ্য বের করতে পারে।"
      ),
    }
  ];

  return (
    <section id="faq" className="relative py-16 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Security Features */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
                <Lock size={16} />
                {t("Enterprise Security", "এন্টারপ্রাইজ সিকিউরিটি")}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0a1628] mb-4">
                {t("Your Privacy Comes First", "আপনার প্রাইভেসি আমাদের প্রথম অগ্রাধিকার")}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                {t(
                  "Your healthcare data is protected using enterprise-grade security. We ensure maximum privacy and strict compliance.",
                  "আপনার স্বাস্থ্য সম্পর্কিত সমস্ত ডেটা এন্টারপ্রাইজ-গ্রেড সিকিউরিটির মাধ্যমে সুরক্ষিত। আমরা সর্বোচ্চ গোপনীয়তা নিশ্চিত করি।"
                )}
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: "End-to-End Encryption" },
                { icon: Key, title: "JWT Authentication & 2FA" },
                { icon: Lock, title: "Secure Cloud Storage" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-emerald-600">
                    <item.icon size={20} />
                  </div>
                  <span className="font-bold text-slate-700">{item.title}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-[#0a1628] mb-8">
              {t("Frequently Asked Questions", "সচরাচর জিজ্ঞাসিত প্রশ্ন")}
            </h3>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all hover:border-primary/30 shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <span className="font-bold text-[#0a1628] pr-8">{faq.q}</span>
                    <ChevronDown
                      size={20}
                      className={`text-slate-400 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180 text-primary" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
