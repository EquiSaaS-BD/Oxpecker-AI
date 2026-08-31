import { PageLayout } from "@/components/layout/PageLayout";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ShieldCheck, Network, Database, Lock } from "lucide-react";
import { generateFaqJsonLd } from "@/config/seo";

const SYSTEM_FAQS = [
  {
    question: "ডিজিটাল হেলথ আইডি কী?",
    answer: "হেলথ আইডি হলো আপনার মোবাইল নম্বরের সাথে যুক্ত একটি প্রোফাইল। এতে প্রেসক্রিপশন ও টেস্ট রিপোর্ট এক জায়গায় গুছিয়ে রাখা যাবে।"
  },
  {
    question: "জরুরি অবস্থায় ডাক্তাররা কীভাবে আমার তথ্য পাবেন?",
    answer: "পরিকল্পিত জরুরি প্রোফাইলের মাধ্যমে অনুমোদিত ডাক্তার রক্তের গ্রুপ, গুরুতর অ্যালার্জি এবং বড় রোগের তথ্য দেখতে পারবেন। কে তথ্য দেখেছেন, সেটিও রেকর্ডে রাখার পরিকল্পনা রয়েছে।"
  },
  {
    question: "আমার ব্যক্তিগত তথ্য কীভাবে সুরক্ষিত রাখা হয়?",
    answer: "দায়িত্বভিত্তিক প্রবেশাধিকার ও পর্যালোচনা করা যায় এমন জরুরি লগসহ প্ল্যাটফর্মটি তৈরি করা হচ্ছে। সংবেদনশীল তথ্য ব্যবহারের আগে এসব নিরাপত্তা ব্যবস্থা সম্পূর্ণ করে পরীক্ষা করতে হবে।"
  },
  {
    question: "হাসপাতালগুলোর খালি সিট কীভাবে দেখা যায়?",
    answer: "পরিকল্পিত সেবায় যুক্ত হাসপাতালগুলোর দেওয়া আইসিইউ ও সাধারণ বেডের আপডেট দেখা যাবে। এতে কোথায় যেতে হবে তা ঠিক করা সহজ হবে।"
  },
  {
    question: "জরুরি প্রোফাইলে কোন তথ্য থাকবে?",
    answer: "রক্তের গ্রুপ, গুরুতর ওষুধের অ্যালার্জি, বড় রোগ এবং আগের গুরুত্বপূর্ণ অপারেশনের তথ্য রাখা যাবে। প্রয়োজন হলে আপনি এই তথ্য হালনাগাদ করতে পারবেন।"
  }
];

const PATIENT_FAQS = [
  {
    question: "Oxpecker AI প্ল্যাটফর্ম কি বিনামূল্যে ব্যবহার করা যায়?",
    answer: "হেলথ আইডি খোলা, সাধারণ স্বাস্থ্য তথ্য দেখা, ডাক্তার ও হাসপাতাল খোঁজা এবং বেডের তথ্য দেখার মতো মৌলিক সেবাগুলো বিনামূল্যে ব্যবহার করা যাবে।"
  },
  {
    question: "আমি কীভাবে আমার আগের রিপোর্টগুলো সেভ করব?",
    answer: "আপনি আমাদের এআই স্ক্যানার ব্যবহার করে পুরোনো প্রেসক্রিপশন বা রিপোর্টের ছবি তুলে সহজেই আপনার প্রোফাইলে আপলোড করে রাখতে পারবেন।"
  },
  {
    question: "আমি কি সরাসরি ডাক্তারদের অ্যাপয়েন্টমেন্ট নিতে পারব?",
    answer: "হ্যাঁ। তালিকাভুক্ত ডাক্তারের সময় ও চেম্বারের তথ্য দেখে অ্যাপয়েন্টমেন্ট বুক করতে পারবেন।"
  },
  {
    question: "এআই সহকারী কি ডাক্তারের বিকল্প?",
    answer: "না। এআই সহকারী সাধারণ স্বাস্থ্য তথ্য বুঝতে সাহায্য করে, কিন্তু রোগ নির্ণয় বা চিকিৎসার জন্য নিবন্ধিত ডাক্তারের পরামর্শ নিতে হবে।"
  }
];

export default function FAQPage() {
  const allFaqs = [...SYSTEM_FAQS, ...PATIENT_FAQS];
  
  const faqJsonLd = generateFaqJsonLd(allFaqs.map(f => ({
    question: f.question,
    answer: f.answer
  })));

  return (
    <PageLayout title="সাধারণ জিজ্ঞাসা" breadcrumb="প্রশ্ন ও উত্তর">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-4xl mx-auto space-y-16 py-6">
        
        {/* Intro */}
        <div className="text-center space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Oxpecker AI নিয়ে সাধারণ জিজ্ঞাসা
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            হেলথ আইডি, জরুরি চিকিৎসা এবং হাসপাতালের বেড আপডেট নিয়ে সাধারণ প্রশ্নের উত্তর।
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Network, title: "এক প্ল্যাটফর্ম" },
            { icon: ShieldCheck, title: "জরুরি সেবা" },
            { icon: Lock, title: "তথ্য সুরক্ষা" },
            { icon: Database, title: "বেড আপডেট" }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <feature.icon size={24} className="text-sky-600 mb-2" />
              <span className="text-xs font-bold text-slate-800">{feature.title}</span>
            </div>
          ))}
        </div>

        {/* Security and system section */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">নিরাপত্তা ও সিস্টেম</h3>
            <p className="text-sm text-slate-500 mt-1">আপনার তথ্য কতটা সুরক্ষিত এবং সিস্টেম কীভাবে কাজ করে।</p>
          </div>
          <FaqAccordion items={SYSTEM_FAQS} />
        </div>

        {/* Patient Usage Section */}
        <div className="space-y-6 pt-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">রোগীদের জন্য সুবিধা</h3>
            <p className="text-sm text-slate-500 mt-1">রোগীরা কীভাবে আমাদের প্ল্যাটফর্ম ব্যবহার করে উপকৃত হবেন।</p>
          </div>
          <FaqAccordion items={PATIENT_FAQS} />
        </div>

        {/* Developer CTA */}
        <div className="mt-12 p-8 rounded-[2rem] bg-white text-slate-900 text-center space-y-4 shadow-xl">
          <h4 className="text-lg font-bold">আপনি কি হাসপাতাল বা ডাক্তার?</h4>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            আমাদের সাথে যুক্ত হয়ে আপনার হাসপাতালের আইসিইউ ও সাধারণ সিটের তথ্য সাধারণ মানুষের কাছে পৌঁছে দিন।
          </p>
          <a href="/contact" className="inline-block mt-4 px-6 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors">
            আমাদের সাথে যোগাযোগ করুন
          </a>
        </div>

      </div>
    </PageLayout>
  );
}
