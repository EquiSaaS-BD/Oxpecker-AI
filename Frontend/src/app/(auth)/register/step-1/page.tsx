"use client";
export default function RegisterStep1Page() {
  return (
    <>

{/*  Top Navigation  */}
<header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-lg py-sm bg-surface/10 backdrop-blur-md  shadow-sm bg-white/5 backdrop-blur-xl">
<div className="flex items-center">
<span className="font-display text-display text-primary  tracking-tight">Oxpecker</span>
</div>
<div className="flex items-center gap-4">
<a className="text-on-surface-variant font-medium text-body-sm hover:text-primary transition-colors" href="#">Login</a>
</div>
</header>
<main className="flex-grow flex items-center justify-center pt-32 pb-xl px-4 relative z-10">
<div className="w-full max-w-6xl glass-panel rounded-xl overflow-hidden flex flex-col lg:flex-row shadow-2xl">
{/*  Left Info Panel  */}
<div className="w-full lg:w-1/3 bg-primary text-on-primary p-xl flex flex-col justify-between relative overflow-hidden">
<div className="absolute inset-0 opacity-20" ></div>
<div className="relative z-10">
<h1 className="font-headline-lg text-headline-lg mb-sm">নিবন্ধন করুন</h1>
<p className="font-body-md text-on-primary-container opacity-90 mb-lg">Secure Multi-Role Access</p>
<p className="font-body-sm opacity-80 leading-relaxed">
                        Join the Oxpecker network. Select your designated role to access specialized diagnostic intelligence and patient management tools. Ensure your information matches your official documentation for seamless verification.
                    </p>
</div>
<div className="relative z-10 mt-2xl lg:mt-0">
<div className="flex items-center gap-sm mb-md">
<span className="material-symbols-outlined text-tertiary-fixed-dim" >verified_user</span>
<span className="font-label-md text-label-md">End-to-End Encrypted</span>
</div>
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-tertiary-fixed-dim" >medical_information</span>
<span className="font-label-md text-label-md">HIPAA Compliant Architecture</span>
</div>
</div>
</div>
{/*  Right Form Panel  */}
<div className="w-full lg:w-2/3 p-xl lg:p-2xl bg-surface/80 flex flex-col">
{/*  Stepper  */}
<div className="mb-xl">
<div className="flex items-center justify-between relative">
<div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-outline-variant/30 z-0"></div>
{/*  Step 1 Indicator  */}
<div className="relative z-10 flex flex-col items-center gap-xs" id="stepper-1">
<div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md font-bold transition-colors">১</div>
<span className="font-label-md text-xs text-primary">ভূমিকা</span>
</div>
{/*  Step 2 Indicator  */}
<div className="relative z-10 flex flex-col items-center gap-xs" id="stepper-2">
<div className="w-8 h-8 rounded-full bg-surface border-2 border-outline-variant text-outline-variant flex items-center justify-center font-label-md font-bold transition-colors">২</div>
<span className="font-label-md text-xs text-outline-variant">তথ্য</span>
</div>
{/*  Step 3 Indicator  */}
<div className="relative z-10 flex flex-col items-center gap-xs" id="stepper-3">
<div className="w-8 h-8 rounded-full bg-surface border-2 border-outline-variant text-outline-variant flex items-center justify-center font-label-md font-bold transition-colors">৩</div>
<span className="font-label-md text-xs text-outline-variant">নিরাপত্তা</span>
</div>
</div>
</div>
<form action="#" className="flex-grow flex flex-col" id="registration-form" method="POST">
{/*  Step 1: Role Selection  */}
<div className="flex-grow space-y-md" id="step-1">
<div>
<h2 className="font-headline-sm text-headline-sm text-primary mb-xs">১. ভূমিকার নির্বাচন</h2>
<p className="font-body-sm text-on-surface-variant mb-lg">Select your primary role within the ecosystem</p>
<div className="grid grid-cols-1 md:grid-cols-3 gap-md">
{/*  Role: Patient/User  */}
<label className="cursor-pointer">
<input defaultChecked className="peer sr-only" name="user_role" type="radio" value="user"/>
<div className="p-lg border-2 border-outline-variant rounded-xl text-center hover:bg-surface-container transition-colors peer-checked:role-card-active h-full flex flex-col items-center justify-center">
<span className="material-symbols-outlined text-primary mb-sm text-5xl" >how_to_reg</span>
<p className="font-headline-sm text-headline-sm text-on-surface">ব্যবহারকারী / রোগী</p>
<p className="text-sm text-on-surface-variant mt-2">Patient / User</p>
</div>
</label>
{/*  Role: Doctor  */}
<label className="cursor-pointer">
<input className="peer sr-only" name="user_role" type="radio" value="doctor"/>
<div className="p-lg border-2 border-outline-variant rounded-xl text-center hover:bg-surface-container transition-colors peer-checked:role-card-active h-full flex flex-col items-center justify-center">
<span className="material-symbols-outlined text-secondary mb-sm text-5xl" >stethoscope</span>
<p className="font-headline-sm text-headline-sm text-on-surface">ডাক্তার</p>
<p className="text-sm text-on-surface-variant mt-2">Physician</p>
</div>
</label>
{/*  Role: Hospital Admin  */}
<label className="cursor-pointer">
<input className="peer sr-only" name="user_role" type="radio" value="hospital"/>
<div className="p-lg border-2 border-outline-variant rounded-xl text-center hover:bg-surface-container transition-colors peer-checked:role-card-active h-full flex flex-col items-center justify-center">
<span className="material-symbols-outlined text-secondary mb-sm text-5xl" >local_hospital</span>
<p className="font-headline-sm text-headline-sm text-on-surface">হাসপাতাল</p>
<p className="text-sm text-on-surface-variant mt-2">Hospital Admin</p>
</div>
</label>
</div>
</div>
<div className="mt-auto pt-xl flex justify-end">
<button className="px-xl py-sm bg-primary text-on-primary rounded-md font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors flex items-center justify-center gap-xs shadow-md" onClick={() => {}} type="button">
<span>পরবর্তী (Next)</span>
<span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
{/*  Step 2: Personal Details  */}
<div className="step-hidden flex-grow space-y-md" id="step-2">
<div>
<h2 className="font-headline-sm text-headline-sm text-primary mb-xs">২. ব্যক্তিগত তথ্য</h2>
<p className="font-body-sm text-on-surface-variant mb-lg">Personal Identifiable Information</p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface-variant block">পুরো নাম <span className="text-error">*</span></label>
<input className="w-full bg-surface border border-outline-variant rounded-md px-md py-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" placeholder="Full Name" type="text"/>
</div>
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface-variant block">ইমেইল <span className="text-error">*</span></label>
<div className="relative">
<input className="w-full bg-surface border border-outline-variant rounded-md pl-md pr-12 py-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" placeholder="name@enterprise.com" type="email"/>
<span className="material-symbols-outlined absolute right-3 top-2.5 text-outline-variant" title="Needs Verification">mark_email_unread</span>
</div>
</div>
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface-variant block">ফোন নম্বর <span className="text-error">*</span></label>
<div className="flex">
<select className="bg-surface border border-outline-variant rounded-l-md px-3 py-sm font-body-md text-on-surface border-r-0 focus:border-primary focus:ring-0">
<option>+880</option>
<option>+1</option>
<option>+44</option>
</select>
<input className="flex-grow bg-surface border border-outline-variant rounded-r-md px-md py-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" placeholder="1XXX-XXXXXX" type="tel"/>
</div>
</div>
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface-variant block">দেশ</label>
<select className="w-full bg-surface border border-outline-variant rounded-md px-md py-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow">
<option>বাংলাদেশ (Bangladesh)</option>
<option>United States</option>
<option>United Kingdom</option>
</select>
</div>
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface-variant block">জন্ম তারিখ</label>
<input className="w-full bg-surface border border-outline-variant rounded-md px-md py-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" type="date"/>
</div>
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface-variant block">লিঙ্গ</label>
<select className="w-full bg-surface border border-outline-variant rounded-md px-md py-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow">
<option disabled  value="">Select Gender</option>
<option>পুরুষ (Male)</option>
<option>মহিলা (Female)</option>
<option>অন্যান্য (Other)</option>
</select>
</div>
</div>
</div>
<div className="mt-auto pt-xl flex justify-between items-center">
<button className="px-lg py-sm border border-outline-variant text-on-surface rounded-md font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-xs" onClick={() => {}} type="button">
<span className="material-symbols-outlined text-sm">arrow_back</span>
<span>পেছনে (Back)</span>
</button>
<button className="px-xl py-sm bg-primary text-on-primary rounded-md font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors flex items-center justify-center gap-xs shadow-md" onClick={() => {}} type="button">
<span>পরবর্তী (Next)</span>
<span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
{/*  Step 3: Security & Actions  */}
<div className="step-hidden flex-grow space-y-md" id="step-3">
<div>
<h2 className="font-headline-sm text-headline-sm text-primary mb-xs">৩. নিরাপত্তা</h2>
<p className="font-body-sm text-on-surface-variant mb-lg">Authentication Setup</p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface-variant block">পাসওয়ার্ড <span className="text-error">*</span></label>
<div className="relative">
<input className="w-full bg-surface border border-outline-variant rounded-md px-md py-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" placeholder="••••••••" type="password"/>
<span className="material-symbols-outlined absolute right-3 top-2.5 text-outline cursor-pointer hover:text-primary">visibility</span>
</div>
</div>
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface-variant block">রেফারেল কোড (ঐচ্ছিক)</label>
<input className="w-full bg-surface border border-outline-variant rounded-md px-md py-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" placeholder="Enter Code" type="text"/>
</div>
</div>
{/*  Consent  */}
<div className="flex items-start gap-sm mb-lg">
<input className="mt-1 rounded border-outline-variant text-primary focus:ring-primary" id="terms" type="checkbox"/>
<label className="font-body-sm text-on-surface-variant leading-tight" htmlFor="terms">
                                    আমি <a className="text-primary hover:underline" href="#">শর্তাবলী</a> এবং <a className="text-primary hover:underline" href="#">গোপনীয়তা নীতি</a> এর সাথে একমত। <br/>
<span className="text-[10px] opacity-70">I agree to the Terms of Service and Privacy Policy.</span>
</label>
</div>
</div>
{/*  Actions  */}
<div className="mt-auto pt-xl flex flex-col md:flex-row gap-md items-center justify-between">
<button className="px-lg py-sm border border-outline-variant text-on-surface rounded-md font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-xs" onClick={() => {}} type="button">
<span className="material-symbols-outlined text-sm">arrow_back</span>
<span>পেছনে (Back)</span>
</button>
<div className="flex flex-col md:flex-row items-center gap-md">

<button className="w-full md:w-auto px-xl py-sm bg-primary text-on-primary rounded-md font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors flex items-center justify-center gap-xs shadow-md" type="button">
<span>অ্যাকাউন্ট তৈরি করুন</span>
<span className="material-symbols-outlined text-sm">check_circle</span>
</button>
</div>
</div>
</div>
</form>
</div>
</div>
</main>
{/*  Footer  */}
<footer className="w-full px-lg py-md flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-lowest/30 backdrop-blur-sm  border-t border-outline-variant/10 mt-auto relative z-10">
<div className="font-headline-sm text-headline-sm font-bold text-primary">Oxpecker</div>
<div className="font-label-md text-label-md text-secondary ">
            © 2024 Oxpecker Medical Systems. Advanced Diagnostic Intelligence.
        </div>
<div className="flex gap-md">
<a className="font-label-md text-label-md text-on-surface-variant/70 hover:text-primary transition-all" href="#">Privacy Policy</a>
<a className="font-label-md text-label-md text-on-surface-variant/70 hover:text-primary transition-all" href="#">Terms of Service</a>
<a className="font-label-md text-label-md text-on-surface-variant/70 hover:text-primary transition-all" href="#">Clinical Standards</a>
<a className="font-label-md text-label-md text-on-surface-variant/70 hover:text-primary transition-all" href="#">Contact Support</a>
</div>
</footer>


    </>
  );
}
