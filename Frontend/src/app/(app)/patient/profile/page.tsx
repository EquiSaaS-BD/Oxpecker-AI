export default function PatientProfilePage() {
  return (
    <>

{/*  TopNavBar  */}
<header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-lg py-sm bg-surface/10 backdrop-blur-md dark:bg-on-surface/10 bg-white/5 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-all">
<div className="font-display text-display text-primary dark:text-primary-fixed-dim tracking-tight">Shustota</div>
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim cursor-pointer hover:bg-primary-container/10 transition-colors p-sm rounded-full active:scale-95 duration-150" >account_circle</span>
</div>
</header>
<main className="flex-grow container mx-auto px-margin max-w-[1440px] pb-3xl">
<div className="mb-lg mt-md">
<h1 className="font-headline-lg text-headline-lg hidden md:block">রোগীর প্রোফাইল</h1>
<h1 className="font-headline-lg-mobile text-headline-lg-mobile md:hidden">রোগীর প্রোফাইল</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-xs">সর্বশেষ আপডেট: আজ সকাল ১০:৩০</p>
</div>
{/*  Bento Grid Layout  */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
{/*  Patient Info Card (Span 4)  */}
<div className="md:col-span-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-md flex flex-col items-center text-center shadow-sm relative overflow-hidden">
<div className="absolute top-0 w-full h-24 bg-primary-container/10"></div>
<img className="w-2xl h-2xl rounded-full object-cover border-4 border-surface-container-lowest relative z-10 mt-md bg-surface-variant" data-alt="A highly professional and clear headshot of a middle-aged South Asian male patient in a modern clinical setting. Soft, natural light illuminates his face, set against a clean, white background to convey a sense of calm and medical precision. The overall aesthetic is clean, modern, and reassuring." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHWKsQHzU2XBjhIZfk50aEF5M9JY17HdJRSLIuNDE2vXoKUloIbZfTWr_RhDA6efqub-yJBb7vFKCvC6iG4MS8wOOs21RbLSn7aU-AFxRKFGswfYamOihHgizCkubUOAJbxT3Do5t_pv3NFdxrX8NWRmQR8B5yzyjYHHssxx9ka7TWgKbYZrRGfEPsupMabTbbfYWzevMSTP1zmqxmjiHfmSVU_RDvOSma5AAKaK8voJMQIl8CKcRMUrZ7LOuo0yhnyvY80HBeBCYI"/>
<h2 className="font-headline-md text-headline-md mt-md text-on-surface">রহিম উদ্দিন</h2>
<p className="font-body-md text-body-md text-on-surface-variant">রোগী আইডি: #SHU-8492</p>
<div className="mt-lg w-full flex flex-col gap-sm text-left">
<div className="flex justify-between items-center border-b border-outline-variant/10 pb-sm">
<span className="font-label-md text-label-md text-on-surface-variant">বয়স / লিঙ্গ</span>
<span className="font-body-sm text-body-sm font-medium">৪৫ / পুরুষ</span>
</div>
<div className="flex justify-between items-center border-b border-outline-variant/10 pb-sm">
<span className="font-label-md text-label-md text-on-surface-variant">রক্তের গ্রুপ</span>
<span className="font-body-sm text-body-sm font-medium text-error">O+</span>
</div>
<div className="flex justify-between items-center border-b border-outline-variant/10 pb-sm">
<span className="font-label-md text-label-md text-on-surface-variant">যোগাযোগ</span>
<span className="font-body-sm text-body-sm font-medium flex items-center gap-xs">+৮৮০ ১৭১২-৩৪৫৬৭৮ <span className="material-symbols-outlined text-[16px] text-tertiary" title="Verified">verified</span></span>
</div><div className="flex justify-between items-center border-b border-outline-variant/10 pb-sm">
<span className="font-label-md text-label-md text-on-surface-variant">পরিচয় যাচাইকরণ</span>
<span className="font-body-sm text-body-sm font-medium flex items-center gap-xs">NID: যাচাইকৃত <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span></span>
</div>
<div className="mt-md">
<span className="font-label-md text-label-md text-on-surface-variant block mb-xs">সংযুক্ত অ্যাকাউন্ট</span>
<div className="flex gap-sm">
<span className="material-symbols-outlined text-on-surface-variant/70 hover:text-primary cursor-pointer transition-colors">facebook</span>
<span className="material-symbols-outlined text-on-surface-variant/70 hover:text-primary cursor-pointer transition-colors">google</span>
<span className="material-symbols-outlined text-on-surface-variant/70 hover:text-primary cursor-pointer transition-colors">link</span>
</div>
</div></div>
<button className="mt-lg w-full bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded-DEFAULT hover:bg-primary transition-colors">প্রোফাইল সম্পাদনা করুন</button>
</div>
{/*  Health Metrics (Vitals) (Span 8)  */}
<div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-sm">
{/*  Vitals Cards  */}
<div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-md flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex justify-between items-start">
<div className="font-label-md text-label-md text-on-surface-variant">রক্তচাপ</div>
<span className="material-symbols-outlined text-secondary" >favorite</span>
</div>
<div className="mt-sm">
<div className="font-headline-lg text-headline-lg text-on-surface">120/80 <span className="font-body-sm text-body-sm text-on-surface-variant">mmHg</span></div>
<div className="mt-xs inline-flex items-center gap-xs px-sm py-xs bg-tertiary-container/10 rounded-full text-tertiary font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px]">check_circle</span> স্বাভাবিক
                        </div>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-md flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex justify-between items-start">
<div className="font-label-md text-label-md text-on-surface-variant">হৃদস্পন্দন</div>
<span className="material-symbols-outlined text-secondary" >ecg</span>
</div>
<div className="mt-sm">
<div className="font-headline-lg text-headline-lg text-on-surface">72 <span className="font-body-sm text-body-sm text-on-surface-variant">bpm</span></div>
<div className="mt-xs inline-flex items-center gap-xs px-sm py-xs bg-tertiary-container/10 rounded-full text-tertiary font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px]">trending_up</span> স্থিতিশীল
                        </div>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-md flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex justify-between items-start">
<div className="font-label-md text-label-md text-on-surface-variant">রক্তের শর্করা (ফাস্টিং)</div>
<span className="material-symbols-outlined text-error" >water_drop</span>
</div>
<div className="mt-sm">
<div className="font-headline-lg text-headline-lg text-on-surface">5.8 <span className="font-body-sm text-body-sm text-on-surface-variant">mmol/L</span></div>
<div className="mt-xs inline-flex items-center gap-xs px-sm py-xs bg-error-container/50 rounded-full text-error font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px]">warning</span> সীমানায়
                        </div>
</div>
</div>
{/*  Medical History Summary (Span Full within 8)  */}
<div className="col-span-1 sm:col-span-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-md">
<div className="flex justify-between items-center mb-md">
<h3 className="font-headline-sm text-headline-sm text-on-surface">চিকিৎসার ইতিহাস</h3>
<button className="font-label-md text-label-md text-primary hover:underline">সব দেখুন</button>
</div>
<div className="space-y-sm">
<div className="flex items-start gap-md p-sm rounded-md hover:bg-surface-container-low transition-colors">
<div className="bg-secondary-container/20 p-sm rounded-full text-secondary">
<span className="material-symbols-outlined">prescriptions</span>
</div>
<div>
<h4 className="font-body-md text-body-md font-semibold text-on-surface">উচ্চ রক্তচাপ নিয়ন্ত্রণ</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">ডাঃ শফিকুল ইসলাম - গত ২ বছর ধরে চিকিৎসাধীন</p>
</div>
</div>
<div className="flex items-start gap-md p-sm rounded-md hover:bg-surface-container-low transition-colors">
<div className="bg-secondary-container/20 p-sm rounded-full text-secondary">
<span className="material-symbols-outlined">vaccines</span>
</div>
<div>
<h4 className="font-body-md text-body-md font-semibold text-on-surface">বার্ষিক স্বাস্থ্য পরীক্ষা</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">শস্তোতা ডায়াগনস্টিক - ১৫ জানুয়ারী, ২০২৪</p>
</div>
</div>
</div>
</div>
</div>
{/*  Upcoming Appointments (Span 6)  */}
<div className="md:col-span-6 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-md">
<div className="flex justify-between items-center mb-md">
<h3 className="font-headline-sm text-headline-sm text-on-surface">আসন্ন অ্যাপয়েন্টমেন্ট</h3>
<button className="bg-surface-container text-on-surface font-label-md text-label-md py-xs px-sm rounded hover:bg-surface-variant transition-colors flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">add</span> নতুন</button>
</div>
<div className="border border-outline-variant/20 rounded-md p-sm flex items-center justify-between bg-surface-bright shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary-container">
<div className="flex items-center gap-md">
<div className="flex flex-col items-center justify-center bg-primary-container/10 text-primary-container rounded-md w-12 h-12">
<span className="font-label-md text-label-md block">মে</span>
<span className="font-headline-sm text-headline-sm block leading-none">১২</span>
</div>
<div>
<h4 className="font-body-md text-body-md font-semibold text-on-surface">ডাঃ নাদিয়া সুলতানা</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">কার্ডিওলজিস্ট • বিকাল ৪:০০</p>
</div>
</div>
<span className="material-symbols-outlined text-outline-variant">chevron_right</span>
</div>
</div>
{/*  AI Insights / Reminders (Span 6)  */}
<div className="md:col-span-6 bg-gradient-to-br from-white to-surface-container-low border-l-2 border-l-secondary rounded-lg p-md shadow-md">
<div className="flex items-center gap-sm mb-md text-secondary">
<span className="material-symbols-outlined" >auto_awesome</span>
<h3 className="font-headline-sm text-headline-sm">এআই স্বাস্থ্য পরামর্শ</h3>
</div>
<p className="font-body-md text-body-md text-on-surface mb-sm">আপনার সাম্প্রতিক রক্তচাপের রিপোর্ট অনুযায়ী, আপনার অবস্থা স্থিতিশীল। আপনার নির্ধারিত ঔষধ চালিয়ে যান এবং খাদ্যতালিকায় লবণের পরিমাণ কমানোর চেষ্টা করুন।</p>
<div className="flex gap-sm">
<button className="bg-secondary text-on-secondary font-label-md text-label-md py-xs px-sm rounded-DEFAULT hover:bg-on-secondary-container transition-colors">খাদ্যতালিকা দেখুন</button>
<button className="border border-secondary text-secondary font-label-md text-label-md py-xs px-sm rounded-DEFAULT hover:bg-secondary/10 transition-colors">বিস্তারিত</button>
</div>
</div>
</div>
</main>
{/*  Footer  */}
<footer className="w-full px-lg py-md flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-lowest/30 backdrop-blur-sm dark:bg-on-surface/5 border-t border-outline-variant/10 mt-auto">
<div className="font-headline-sm text-headline-sm font-bold text-primary text-secondary dark:text-secondary-fixed-dim">
            © 2024 Shustota Medical Systems. Advanced Diagnostic Intelligence.
        </div>
<div className="flex gap-md font-label-md text-label-md text-secondary dark:text-secondary-fixed-dim">
<a className="text-on-surface-variant/70 hover:text-primary transition-all" href="#">Privacy Policy</a>
<a className="text-on-surface-variant/70 hover:text-primary transition-all" href="#">Terms of Service</a>
<a className="text-on-surface-variant/70 hover:text-primary transition-all" href="#">Clinical Standards</a>
<a className="text-on-surface-variant/70 hover:text-primary transition-all" href="#">Contact Support</a>
</div>
</footer>

    </>
  );
}
