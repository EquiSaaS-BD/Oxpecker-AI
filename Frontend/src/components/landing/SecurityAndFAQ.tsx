"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck, Key } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

export function SecurityAndFAQ() {
  const { t } = useLanguage();

  const faqItems = [
    {
      question: t("Is Oxpecker AI free for patients?", "Oxpecker AI কি সাধারণ ব্যবহারকারীদের জন্য সম্পূর্ণ বিনামূল্যে?"),
      answer: t(
        "Yes, Oxpecker AI is completely free for patients across Bangladesh. You can consult our AI symptom checker, search verified doctors, view medicine guides, and check hospital bed availability without any subscription or hidden fees.",
        "হ্যাঁ, Oxpecker AI সম্পূর্ণ বিনামূল্যে। কোনো সাবস্ক্রিপশন বা হিডেন চার্জ ছাড়াই আপনি এআই পরামর্শ, বিশেষজ্ঞ ডাক্তার খোঁজা, ঔষধের সঠিক তথ্য জানা এবং হাসপাতাল বেড ট্র্যাকিং সেবা নিতে পারবেন।"
      ),
    },
    {
      question: t("How does the AI Symptom Checker work?", "এআই লক্ষণ বিশ্লেষক কীভাবে কাজ করে?"),
      answer: t(
        "Simply describe your symptoms or health queries in plain Bengali or English. Our AI analyzes your inputs and recommends the appropriate specialist department (e.g. Neurologist, Cardiologist) along with initial care advice.",
        "আপনার লক্ষণ বা শারীরিক সমস্যা বাংলা বা ইংরেজিতে সহজ ভাষায় লিখুন। আমাদের এআই সাথে সাথে লক্ষণ বিশ্লেষণ করে কোন বিষয়ের ডাক্তারকে দেখাতে হবে এবং প্রাথমিক স্বাস্থ্য নির্দেশিকা প্রদান করবে।"
      ),
    },
    {
      question: t("How do I book a doctor chamber appointment?", "ডাক্তারদের চেম্বারের শিডিউল ও ভিজিট ফি কীভাবে দেখব?"),
      answer: t(
        "Browse our medical directory of BMDC-verified specialist doctors, view their chamber locations, schedule times, and consultation fees, then click 'Book Appointment' to reserve your slot.",
        "আমাদের ডাক্তার ডিরেক্টরিতে গিয়ে হৃদরোগ, মেডিসিন, শিশু রোগসহ সকল বিষয়ের ডাক্তারদের চেম্বারের ঠিকানা, দেখার সময় এবং ভিজিট ফি সরাসরি দেখে বুকিং করতে পারবেন।"
      ),
    },
    {
      question: t("How does Prescription & Report Scanning work?", "প্রেসক্রিপশন ও টেস্ট রিপোর্ট স্ক্যানার কীভাবে কাজ করে?"),
      answer: t(
        "Upload a photo of your prescription or diagnostic test report. Our AI automatically extracts medicine names, dosages, timings, and food instructions, presenting them in clear Bengali.",
        "আপনার ডাক্তার সাহেবের প্রেসক্রিপশন বা ল্যাব টেস্ট রিপোর্টের ছবি আপলোড করুন। এআই স্বয়ংক্রিয়ভাবে ওষুধের নাম, ডোজ, খাওয়ার নিয়ম এবং গুরুত্বপূর্ণ সতর্কবার্তা বের করে বাংলা ভাষায় প্রদর্শন করবে।"
      ),
    },
    {
      question: t("Is my personal health data protected & secure?", "আমার ব্যক্তিগত স্বাস্থ্য ডেটা কতটা সুরক্ষিত?"),
      answer: t(
        "Absolutely. Your healthcare data is protected using enterprise-grade end-to-end encryption. Your information is strictly private and never shared with third parties.",
        "সম্পূর্ণ সুরক্ষিত। আমরা এন্টারপ্রাইজ-গ্রেড এন্ড-টু-এন্ড এনক্রিপশন ব্যবহার করি। আপনার ব্যক্তিগত স্বাস্থ্য সম্পর্কিত সমস্ত ডেটা সর্বোচ্চ গোপনীয়তায় সংরক্ষিত থাকে।"
      ),
    },
  ];

  return (
    <section id="faq" className="relative py-16 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Security Features */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-4">
                <Lock size={15} />
                {t("Enterprise Security", "এন্টারপ্রাইজ সিকিউরিটি")}
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                {t("Your Privacy Comes First", "আপনার প্রাইভেসি আমাদের প্রথম অগ্রাধিকার")}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                {t(
                  "Your healthcare data is protected using enterprise-grade security. We ensure maximum privacy and strict compliance across all services.",
                  "আপনার স্বাস্থ্য সম্পর্কিত সমস্ত ডেটা এন্টারপ্রাইজ-গ্রেড সিকিউরিটির মাধ্যমে সুরক্ষিত। আমরা সর্বোচ্চ গোপনীয়তা ও নিরাপদ ডেটা ইনফ্রাস্ট্রাকচার নিশ্চিত করি।"
                )}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { icon: ShieldCheck, title: t("End-to-End Encrypted Data", "এন্ড-টু-এন্ড এনক্রিপ্টেড ডেটা") },
                { icon: Key, title: t("Multi-Factor Patient Auth", "নিরাপদ পেশেন্ট অথেন্টিকেশন") },
                { icon: Lock, title: t("HIPAA-Compliant Privacy Standards", "সর্বোচ্চ প্রাইভেসি ও স্ট্যান্ডার্ডস") }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5 bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-emerald-600 border border-slate-100 shrink-0">
                    <item.icon size={18} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6">
              {t("Frequently Asked Questions", "সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ")}
            </h3>
            <FaqAccordion items={faqItems} className="max-w-none py-0" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default SecurityAndFAQ;
