"use client";

import { UserPlus, FolderHeart, HeartPulse, Stethoscope } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    {
      stepNumber: "01",
      icon: UserPlus,
      title: t("Create Your Health ID", "ডিজিটাল হেলথ আইডি খুলুন"),
      desc: t(
        "Sign up with your phone number to receive a personal Health ID card for yourself and your family.",
        "আপনার মোবাইল নম্বর দিয়ে মাত্র কয়েক সেকেন্ডে নিজস্ব ডিজিটাল হেলথ আইডি তৈরি করুন।"
      ),
    },
    {
      stepNumber: "02",
      icon: FolderHeart,
      title: t("Keep Records Organized", "প্রেসক্রিপশন ও রিপোর্ট সংরক্ষণ করুন"),
      desc: t(
        "Save prescriptions and lab reports together so they stay readable and easy to revisit before appointments.",
        "আগের প্রেসক্রিপশন ও ডায়াগনস্টিক রিপোর্ট এক জায়গায় রাখুন, যাতে ডাক্তার দেখানোর আগে সহজে খুঁজে পাওয়া যায়।"
      ),
    },
    {
      stepNumber: "03",
      icon: HeartPulse,
      title: t("Ready for Emergencies", "জরুরি মুহূর্তে দ্রুত সহায়তা"),
      desc: t(
        "Blood group, critical medicine allergies, and family emergency contacts stay accessible on your emergency card.",
        "জরুরি অবস্থায় রক্তের গ্রুপ, গুরুতর অ্যালার্জি ও পরিবারের জরুরি নম্বর হেলথ কার্ডের মাধ্যমে দ্রুত জানা যায়।"
      ),
    },
    {
      stepNumber: "04",
      icon: Stethoscope,
      title: t("Consult the Right Specialist", "সঠিক বিশেষজ্ঞ ডাক্তার খুঁজুন"),
      desc: t(
        "Understand symptoms and prescriptions in plain Bengali, compare nearby hospitals, and book the right specialist.",
        "সহজ বাংলায় লক্ষণ ও প্রেসক্রিপশন বুঝে নিন, কাছের হাসপাতাল যাচাই করুন এবং সঠিক বিশেষজ্ঞের সাথে যোগাযোগ করুন।"
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Clean Editorial Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0B6E99] mb-2.5">
            {t("How It Works", "কাজের ধাপসমূহ")}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t(
              "Simple steps for everyday and emergency care",
              "সহজ ৪ ধাপে দৈনন্দিন ও জরুরি স্বাস্থ্যসেবা"
            )}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            {t(
              "Built so patients, caregivers, and doctors spend less time searching for lost papers and more time on actual care.",
              "পুরনো কাগজ খোঁজার ঝামেলা কমিয়ে রোগী ও চিকিৎসকের মূল্যবান সময় বাঁচাতে পুরো প্রক্রিয়াটি সহজভাবে সাজানো হয়েছে।"
            )}
          </p>
        </div>

        {/* Editorial 4-Step Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.stepNumber}
                className="group border-t-2 border-slate-200 hover:border-[#0B6E99] transition-colors pt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    {step.stepNumber}
                  </span>
                  <Icon
                    size={19}
                    strokeWidth={1.8}
                    className="text-slate-600 group-hover:text-[#0B6E99] transition-colors"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
