"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function TestimonialsSection() {
  const { t } = useLanguage();

  const testimonials = [
    {
      initial: "R",
      name: t("Rafin Ahmed", "রাফিন আহমেদ"),
      role: t("Software Engineer", "সফটওয়্যার ইঞ্জিনিয়ার"),
      quote: t(
        "Shustota AI has completely transformed my family's healthcare. I got advice from the AI even at 2 AM which was perfectly accurate.",
        "Shustota AI আমার পরিবারের স্বাস্থ্যসেবা সম্পূর্ণ পাল্টে দিয়েছে। রাত ২টায়ও AI থেকে পরামর্শ পেয়েছি যা একদম সঠিক ছিল।"
      ),
      color: "bg-primary text-white",
    },
    {
      initial: "S",
      name: t("Sabrina Chowdhury", "সাবরিনা চৌধুরী"),
      role: t("Teacher", "শিক্ষক"),
      quote: t(
        "Being able to write symptoms in Bengali is amazing. The AI even tells me what to say to the doctor, which helps me a lot.",
        "বাংলায় লক্ষণ লিখতে পারা অসাধারণ। ডাক্তারের কাছে যাওয়ার আগে কী বলব সেটাও AI বলে দেয়, যা আমাকে অনেক সাহায্য করে।"
      ),
      color: "bg-secondary text-white",
    },
    {
      initial: "A",
      name: t("Arif Hossain", "আরিফ হোসেন"),
      role: t("Business Owner", "ব্যবসায়ী"),
      quote: t(
        "The medicine info feature is great. I can find affordable alternatives by checking generic names. Everyone should have this app.",
        "ওষুধের তথ্য ফিচারটা দারুণ। জেনেরিক নাম দেখে সস্তায় ভালো ওষুধ পাচ্ছি। এটি প্রত্যেকের ফোনে থাকা উচিত।"
      ),
      color: "bg-tertiary text-white",
    },
  ];

  return (
    <section className="relative py-16 lg:py-32 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0a1628]">
            <span className="text-secondary uppercase tracking-widest text-sm sm:text-2xl lg:text-3xl mr-2">{t("Testimonials:", "ব্যবহারকারীদের মতামত:")}</span>
            <span>{t("What Our Users Say", "আমাদের ব্যবহারকারীরা কী বলছেন")}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-1 mb-6">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} size={18} className="fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed flex-1 mb-8 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${testimonial.color}`}>
                  {testimonial.initial}
                </div>
                <div>
                  <h4 className="font-bold text-[#0a1628]">{testimonial.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
