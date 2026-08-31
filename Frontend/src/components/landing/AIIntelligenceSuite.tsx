"use client";

import { motion } from "framer-motion";
import { Stethoscope, FileText, ShieldAlert, Bot, Activity, ArrowRight, HeartPulse, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export function AIIntelligenceSuite() {
  const { t } = useLanguage();

  return (
    <section id="services" className="relative py-16 lg:py-28 bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 space-y-28">
        
        {/* Emergency profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert size={16} />
              <span>{t("Emergency Health Profile", "জরুরি চিকিৎসা প্রোফাইল")}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t("A Planned Emergency Profile for Faster Decisions", "দ্রুত সিদ্ধান্তের জন্য পরিকল্পিত জরুরি প্রোফাইল")}
            </h2>
            <p className="text-slate-600 text-base lg:text-lg leading-relaxed font-medium">
              {t(
                "The planned emergency profile is designed to help authorized doctors check a patient's blood group, serious allergies, and key medical history when the patient cannot respond.",
                "পরিকল্পিত জরুরি প্রোফাইলের মাধ্যমে রোগী কথা বলতে না পারলে অনুমোদিত ডাক্তার তার রক্তের গ্রুপ, গুরুতর অ্যালার্জি এবং প্রয়োজনীয় চিকিৎসার তথ্য দেখতে পারবেন।"
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                t("Blood Group & Basic Details", "রক্তের গ্রুপ ও সাধারণ তথ্য"),
                t("Serious Medicine Allergies", "গুরুতর ওষুধের অ্যালার্জি"),
                t("Major Diseases & Surgeries", "বড় রোগ ও অপারেশনের তথ্য"),
                t("Planned Access Controls", "পরিকল্পিত প্রবেশাধিকার নিয়ন্ত্রণ")
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5 text-slate-700 text-sm font-semibold">
                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <CheckCircle2 size={13} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Link
                href="/doctor/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95"
              >
                <span>{t("Preview Emergency Profile", "জরুরি প্রোফাইলের নমুনা দেখুন")}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="rounded-[2rem] p-6 sm:p-8 bg-gradient-to-br from-rose-50/90 to-orange-50/70 border border-rose-200/90 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-rose-200/70 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-rose-700 tracking-wider block">Emergency Profile Preview</span>
                    <h4 className="font-extrabold text-slate-900 text-base">Rafin Hossain (ID: BD-H-10928374)</h4>
                  </div>
                </div>
                <div className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-black">
                  O+ Positive
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white/90 rounded-xl border border-rose-200 flex items-start gap-2.5">
                  <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-900 font-bold block">Medicine Allergy:</strong>
                    <span className="text-slate-700 font-medium">Penicillin: sample record of a previous severe reaction. Confirm details before treatment.</span>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-xl border border-amber-200 flex items-start gap-2.5">
                  <Activity size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 font-bold block">Existing Conditions:</strong>
                    <span className="text-slate-700 font-medium">Type 2 diabetes, mild high blood pressure, daily metformin 500 mg</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Attending Hospital: <strong>Square Hospital ER</strong></span>
                <span className="text-emerald-700 font-bold">Sample Access Log</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Symptom guide */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="rounded-[2rem] p-6 sm:p-8 bg-slate-50 border border-slate-200 shadow-xl space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <HeartPulse size={24} className="text-orange-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg">Example Symptom Summary</h4>
                  <p className="text-xs text-slate-500 font-medium">Sample result for interface preview only</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Suggested urgency</span>
                  <span>Moderate</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full w-[60%]" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center group cursor-pointer hover:border-sky-300 transition-colors">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">Suggested Next Step</p>
                  <p className="font-bold text-sky-700 text-sm">Rest, hydrate, and talk to a doctor if it continues</p>
                </div>
                <ArrowRight size={18} className="text-sky-700 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <Stethoscope size={16} />
              <span>{t("Bengali & English Symptom Guide", "বাংলা ও ইংরেজি লক্ষণ সহায়িকা")}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t("Describe Symptoms in Everyday Bengali", "সহজ বাংলায় আপনার লক্ষণ লিখুন")}
            </h2>
            <p className="text-slate-600 text-base lg:text-lg leading-relaxed font-medium">
              {t(
                "Describe how you feel in everyday Bengali. The assistant shares general guidance and helps you choose which type of doctor to see. It does not replace a doctor's diagnosis.",
                "আপনার শারীরিক সমস্যা সহজ বাংলায় লিখুন। সহকারী সাধারণ স্বাস্থ্য তথ্য দেবে এবং কোন ধরনের ডাক্তার দেখানো দরকার তা বুঝতে সাহায্য করবে। এটি ডাক্তারের রোগ নির্ণয়ের বিকল্প নয়।"
              )}
            </p>
            <div className="pt-2">
              <Link href="/chat" className="inline-flex items-center gap-2 text-sky-700 font-extrabold hover:underline text-sm">
                {t("Start AI Health Chat", "এআই স্বাস্থ্য চ্যাট শুরু করুন")} <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Prescription and report scanner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <FileText size={16} />
              <span>{t("Prescription & Report Scanner", "প্রেসক্রিপশন ও রিপোর্ট স্ক্যানার")}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t("Understand Prescriptions in Simple Language", "সহজ ভাষায় প্রেসক্রিপশন বুঝুন")}
            </h2>
            <p className="text-slate-600 text-base lg:text-lg leading-relaxed font-medium">
              {t(
                "Upload a prescription or test report. The scanner reads medicine names, doses, schedules, and important instructions, then explains them in simple language.",
                "প্রেসক্রিপশন বা টেস্ট রিপোর্টের ছবি আপলোড করুন। স্ক্যানার ওষুধের নাম, ডোজ, সময় এবং জরুরি নির্দেশনা পড়ে সহজ ভাষায় বুঝিয়ে দেবে।"
              )}
            </p>
            <div className="pt-2">
              <Link href="/chat" className="inline-flex items-center gap-2 text-indigo-700 font-extrabold hover:underline text-sm">
                {t("Upload Prescription Now", "প্রেসক্রিপশন স্ক্যান করুন")} <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <div className="relative flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full max-w-md bg-white text-slate-900 rounded-[2rem] p-6 border border-slate-200 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-600">
                  <Bot size={16} /> Prescription Reader
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold px-2 py-0.5 rounded-full">Text Scan</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900 text-sm font-bold">Napa Extra 500mg+65mg</strong>
                    <span className="text-[11px] text-sky-700 font-mono font-bold">1 + 0 + 1 (3 Days)</span>
                  </div>
                  <p className="text-slate-600 font-medium">Instruction: Take after meal for acute headache or fever.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900 text-sm font-bold">Seclo 20mg (Omeprazole)</strong>
                    <span className="text-[11px] text-sky-700 font-mono font-bold">1 + 0 + 1 (14 Days)</span>
                  </div>
                  <p className="text-slate-600 font-medium">Instruction: Take 30 minutes before breakfast and dinner.</p>
                </div>
              </div>
              <div className="pt-2 text-center text-xs text-slate-500 font-medium">
                Example only. Follow the prescription instructions.
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default AIIntelligenceSuite;
