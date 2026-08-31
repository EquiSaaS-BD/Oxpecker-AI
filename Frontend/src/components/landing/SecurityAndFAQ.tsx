"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck, Key, Server } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { generateFaqJsonLd } from "@/config/seo";

export function SecurityAndFAQ() {
  const { t } = useLanguage();

  const faqContent = [
    {
      question: {
        en: "What is a Digital Health ID?",
        bn: "ডিজিটাল হেলথ আইডি কী?",
      },
      answer: {
        en: "A Digital Health ID is linked to your phone number. It keeps your prescriptions and test reports together so care providers can understand your medical history when needed.",
        bn: "হেলথ আইডি হলো আপনার মোবাইল নম্বরের সাথে যুক্ত একটি প্রোফাইল। এতে প্রেসক্রিপশন ও টেস্ট রিপোর্ট এক জায়গায় রাখা যায়, যাতে প্রয়োজনের সময় চিকিৎসক আপনার আগের তথ্য বুঝতে পারেন।",
      },
    },
    {
      question: {
        en: "How can doctors access my information in an emergency?",
        bn: "জরুরি অবস্থায় ডাক্তাররা কীভাবে তথ্য পাবেন?",
      },
      answer: {
        en: "The planned emergency profile is intended to let authorized doctors check key details such as your blood group and serious allergies. The system is also intended to record emergency access for review.",
        bn: "পরিকল্পিত জরুরি প্রোফাইলের মাধ্যমে অনুমোদিত ডাক্তার রক্তের গ্রুপ ও গুরুতর অ্যালার্জির মতো তথ্য দেখতে পারবেন। জরুরি তথ্য দেখার ঘটনাও পর্যালোচনার জন্য রেকর্ডে রাখার পরিকল্পনা রয়েছে।",
      },
    },
    {
      question: {
        en: "How do I check available ICU beds?",
        bn: "খালি আইসিইউ বা বেড কীভাবে দেখা যায়?",
      },
      answer: {
        en: "The planned service will show ICU and general bed updates shared by connected hospitals, helping patients decide where to go.",
        bn: "পরিকল্পিত সেবায় যুক্ত হাসপাতালের দেওয়া আইসিইউ ও সাধারণ বেডের আপডেট দেখা যাবে, যা কোথায় যেতে হবে তা ঠিক করতে সাহায্য করবে।",
      },
    },
    {
      question: {
        en: "How is my health information protected?",
        bn: "আমার স্বাস্থ্য তথ্য কীভাবে সুরক্ষিত রাখা হয়?",
      },
      answer: {
        en: "The platform is being designed with role-based access and reviewable emergency access logs. These controls must be completed and independently tested before handling sensitive records.",
        bn: "দায়িত্বভিত্তিক প্রবেশাধিকার ও পর্যালোচনা করা যায় এমন জরুরি লগসহ প্ল্যাটফর্মটি তৈরি করা হচ্ছে। সংবেদনশীল তথ্য ব্যবহারের আগে এসব ব্যবস্থা সম্পূর্ণ করে আলাদাভাবে পরীক্ষা করতে হবে।",
      },
    },
    {
      question: {
        en: "How can the AI assistant help me?",
        bn: "এআই সহকারী কীভাবে সাহায্য করবে?",
      },
      answer: {
        en: "The AI assistant can explain symptoms and prescription instructions in simple Bengali or English. It provides general guidance and does not replace a doctor's diagnosis.",
        bn: "এআই সহকারী সহজ বাংলা বা ইংরেজিতে লক্ষণ ও প্রেসক্রিপশনের নির্দেশনা বুঝতে সাহায্য করে। এটি সাধারণ তথ্য দেয়, ডাক্তারের রোগ নির্ণয়ের বিকল্প নয়।",
      },
    },
  ];

  const faqItems = faqContent.map((item) => ({
    question: t(item.question.en, item.question.bn),
    answer: t(item.answer.en, item.answer.bn),
  }));

  const faqJsonLd = generateFaqJsonLd(
    faqContent.map((item) => ({
      question: item.question.en,
      answer: item.answer.en,
    }))
  );

  return (
    <section id="faq" className="relative py-16 lg:py-28 bg-white overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
                {t("Privacy & Security", "প্রাইভেসি ও নিরাপত্তা")}
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                {t("Privacy Is Part of the Plan", "তথ্য সুরক্ষা আমাদের পরিকল্পনার অংশ")}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                {t(
                  "We are designing role-based access and reviewable emergency logs. These safeguards must be tested before sensitive records are handled.",
                  "দায়িত্বভিত্তিক প্রবেশাধিকার ও পর্যালোচনা করা যায় এমন জরুরি লগ তৈরি করা হচ্ছে। সংবেদনশীল তথ্য ব্যবহারের আগে এসব ব্যবস্থা পরীক্ষা করতে হবে।"
                )}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { icon: ShieldCheck, title: t("Role-Based Access Planned", "দায়িত্বভিত্তিক প্রবেশাধিকার পরিকল্পিত") },
                { icon: Server, title: t("Reviewable Logs Planned", "পর্যালোচনাযোগ্য লগ পরিকল্পিত") },
                { icon: Key, title: t("Security Testing Required", "নিরাপত্তা পরীক্ষা প্রয়োজন") }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5 bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-2xl shadow-sm">
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
              {t("Frequently Asked Questions", "সাধারণ জিজ্ঞাসা")}
            </h3>
            <FaqAccordion items={faqItems} className="max-w-none py-0" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default SecurityAndFAQ;
