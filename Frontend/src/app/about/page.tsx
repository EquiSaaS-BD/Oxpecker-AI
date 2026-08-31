import { PageLayout } from "@/components/layout/PageLayout";

export default function AboutPage() {
  return (
    <PageLayout title="Oxpecker AI সম্পর্কে" breadcrumb="আমাদের সম্পর্কে">
      <div className="max-w-3xl mx-auto space-y-10 py-6 text-slate-700 leading-relaxed font-normal">
        
        {/* National Mission */}
        <section className="space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            আমাদের উদ্দেশ্য
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            বাংলাদেশের স্বাস্থ্যসেবাকে এক প্ল্যাটফর্মে নিয়ে আসা
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            বর্তমানে আমাদের হাসপাতালগুলো আলাদা আলাদা কাজ করে। জরুরি অবস্থায় রোগী অজ্ঞান থাকলে ডাক্তাররা তার আগের রোগের কথা জানতে পারেন না।
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            এতে সময় নষ্ট হয় এবং না জেনে ওষুধ দিলে বিপদের ঝুঁকি থাকে।
          </p>
          <p className="text-base text-slate-900 font-semibold leading-relaxed">
            Oxpecker AI প্ল্যাটফর্মের লক্ষ্য হলো হাসপাতাল, ডাক্তার এবং রোগীর স্বাস্থ্য তথ্য এক জায়গায় এনে চিকিৎসাসেবা সহজ করা।
          </p>
        </section>

        {/* 4 Core Pillars */}
        <section className="space-y-6 pt-6 border-t border-slate-200">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            আমাদের মূল সেবাসমূহ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">ডিজিটাল হেলথ আইডি</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                আপনার ফোন নম্বরের সাথে যুক্ত এই আইডিতে প্রেসক্রিপশন ও রিপোর্ট এক জায়গায় গুছিয়ে রাখা যাবে।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
              <h4 className="font-bold text-rose-900 text-base">পরিকল্পিত জরুরি স্বাস্থ্য প্রোফাইল</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                পরিকল্পিত জরুরি প্রোফাইলে রক্তের গ্রুপ, গুরুতর অ্যালার্জি এবং বড় রোগের তথ্য রাখা যাবে, যাতে দ্রুত সিদ্ধান্ত নিতে সুবিধা হয়।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <h4 className="font-bold text-emerald-900 text-base">হাসপাতালের বেড আপডেট</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                যুক্ত হাসপাতালগুলো তথ্য দিলে আইসিইউ ও সাধারণ বেডের হালনাগাদ অবস্থা দেখা যাবে।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2">
              <h4 className="font-bold text-sky-900 text-base">বাংলায় স্মার্ট এআই সহকারী</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                আমাদের এআই বাংলায় আপনার লক্ষণ বুঝতে, প্রেসক্রিপশন পড়তে এবং কোন ধরনের ডাক্তার দেখানো দরকার তা জানতে সাহায্য করে।
              </p>
            </div>
          </div>
        </section>

        {/* Development team */}
        <section className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-slate-900 space-y-3 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700">
            নির্মাতা দল
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            EquiSaaS Agency
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Oxpecker AI প্ল্যাটফর্মটি EquiSaaS Agency তৈরি ও পরিচালনা করছে। কারিগরি নেতৃত্বে আছেন Kholipha Ahmmad Al-Amin।
          </p>
        </section>

      </div>
    </PageLayout>
  );
}
