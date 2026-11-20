"use client";

import { ShieldCheck, KeyRound, History } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { generateFaqJsonLd } from "@/config/seo";

export function SecurityAndFAQ() {
  const { t } = useLanguage();

  const faqContent = [
    {
      question: {
        en: "What is an Oxpecker Health ID?",
        bn: "অক্সপেকার হেলথ আইডি কী?",
      },
      answer: {
        en: "An Oxpecker Health ID links your basic medical profile, prescriptions, and diagnostic reports in one place so you can share accurate history with doctors during clinic visits or emergencies.",
        bn: "অক্সপেকার হেলথ আইডি হলো আপনার মোবাইল নম্বরের সাথে যুক্ত একটি ডিজিটাল স্বাস্থ্য প্রোফাইল। এখানে প্রেসক্রিপশন ও টেস্ট রিপোর্ট একসাথে রাখা যায়, যাতে যে কোনো চেম্বার বা জরুরি বিভাগে চিকিৎসক আপনার পূর্বের তথ্য দ্রুত বুঝতে পারেন।",
      },
    },
    {
      question: {
        en: "How can doctors view my information in an emergency?",
        bn: "জরুরি অবস্থায় ডাক্তাররা কীভাবে আমার তথ্য পাবেন?",
      },
      answer: {
        en: "Authorized doctors can scan your emergency Health Card ID to view essential facts like blood group, severe drug allergies, and your family emergency contact, with every lookup recorded in access logs.",
        bn: "অনুমোদিত চিকিৎসক আপনার হেলথ কার্ডের QR কোড বা আইডি নম্বর ব্যবহার করে রক্তের গ্রুপ, গুরুতর ওষুধের অ্যালার্জি এবং পরিবারের জরুরি যোগাযোগ নম্বর দেখতে পারবেন। প্রতিটি অ্যাক্সেস লগ হিসেবে সংরক্ষিত থাকে।",
      },
    },
    {
      question: {
        en: "How do I check hospital beds and ICU availability?",
        bn: "হাসপাতালের খালি বেড ও আইসিইউ তথ্য কীভাবে দেখব?",
      },
      answer: {
        en: "Open the Hospitals directory to view departments, emergency contact numbers, and reported ICU, cabin, and ward availability across major hospitals in Dhaka and other districts.",
        bn: "হাসপাতাল ডিরেক্টরিতে গিয়ে ঢাকা ও অন্যান্য জেলার প্রধান হাসপাতালগুলোর বিভাগ, জরুরি ফোন নম্বর এবং আইসিইউ, কেবিন ও ওয়ার্ডের তথ্য একসাথে দেখে নিতে পারবেন।",
      },
    },
    {
      question: {
        en: "How is my health information kept private?",
        bn: "আমার স্বাস্থ্য তথ্য কীভাবে নিরাপদ রাখা হয়?",
      },
      answer: {
        en: "Your account uses HttpOnly encrypted sessions and role-based access boundaries so patients, doctors, clinic assistants, and hospitals only access records relevant to their authorized permissions.",
        bn: "আমাদের সিস্টেমে এনক্রিপ্টেড সেশন ও দায়িত্বভিত্তিক প্রবেশাধিকার (RBAC) ব্যবহার করা হয়, যাতে রোগী, ডাক্তার, অ্যাসিস্ট্যান্ট এবং হাসপাতাল কেবল নিজ নিজ অনুমোদিত তথ্যই দেখতে পারেন।",
      },
    },
    {
      question: {
        en: "Does the symptom and report reader replace visiting a doctor?",
        bn: "লক্ষণ ও রিপোর্ট সহায়িকা কি ডাক্তার দেখানোর বিকল্প?",
      },
      answer: {
        en: "No. It explains medical terms, lab reference ranges, and prescription schedules in plain Bengali to help you prepare for a consultation and pick the right specialist—never to diagnose or prescribe.",
        bn: "না। এটি কেবল সহজ বাংলায় রিপোর্টের মান, ওষুধের নিয়ম ও কোন বিভাগের ডাক্তার দেখানো উচিত তা বুঝতে সাহায্য করে—রোগ নির্ণয় বা চিকিৎসার বিকল্প নয়।",
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

  const safeguards = [
    {
      icon: KeyRound,
      title: t("Role-Based Access Control", "দায়িত্বভিত্তিক প্রবেশাধিকার নিয়ন্ত্রণ"),
      desc: t(
        "Strict boundaries between patient records, doctor chambers, clinic staff, and hospital portals.",
        "রোগী, ডাক্তার, অ্যাসিস্ট্যান্ট ও হাসপাতাল পোর্টালের মধ্যে আলাদা অনুমোদন স্তর।"
      ),
    },
    {
      icon: ShieldCheck,
      title: t("Encrypted Sessions & Storage", "সুরক্ষিত সেশন ও তথ্য সংরক্ষণ"),
      desc: t(
        "Authenticated sessions protected with signed HttpOnly cookies and isolated workspace scoping.",
        "সাইন্ড ও সুরক্ষিত সেশন কুকি এবং আলাদা ওয়ার্কস্পেস নিরাপত্তা।"
      ),
    },
    {
      icon: History,
      title: t("Transparent Emergency Logs", "স্বচ্ছ জরুরি অ্যাক্সেস লগ"),
      desc: t(
        "Emergency Health Card lookups are logged so patients can review when critical data was viewed.",
        "জরুরি কার্ড কখন ও কোন প্রয়োজনে দেখা হয়েছে তা পর্যালোচনার ব্যবস্থা।"
      ),
    },
  ];

  return (
    <section
      id="faq"
      className="relative py-16 lg:py-24 bg-white border-t border-slate-200/80"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Privacy & Safeguards Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0B6E99] mb-2.5">
                {t("Privacy & Safeguards", "তথ্য সুরক্ষা")}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                {t(
                  "Built Around Patient Privacy",
                  "আপনার তথ্যের গোপনীয়তা আমাদের অঙ্গীকার"
                )}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {t(
                  "Medical records belong to the patient. Every portal and lookup flow is structured so sensitive history stays protected and purposeful.",
                  "আপনার চিকিৎসার তথ্যের মালিক আপনি নিজেই। প্রতিটি পোর্টাল এমনভাবে তৈরি যাতে সংবেদনশীল তথ্য অকারণে কারো কাছে উন্মুক্ত না হয়।"
                )}
              </p>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {safeguards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="py-4 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={17} strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ Accordion Column */}
          <div className="lg:col-span-7">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
              {t("Frequently Asked Questions", "সাধারণ জিজ্ঞাসা")}
            </h3>
            <FaqAccordion items={faqItems} className="max-w-none py-0" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SecurityAndFAQ;
