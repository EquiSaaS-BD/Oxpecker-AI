"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Activity, Flame, Droplet, Target, UploadCloud, Camera, Image as ImageIcon, 
  ScanBarcode, Plus, Edit2, Trash2, ChevronRight, TrendingDown, Scale, 
  HeartPulse, Calendar, ShoppingCart, Award, Bell, Clock, Star, MapPin 
} from "lucide-react";

export default function NutritionDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <NutritionSkeleton />;
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F8FAFC] font-sans pb-[100px] lg:pb-10 relative">
      <div className="max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row gap-8 px-4 md:px-6 lg:px-8 py-6 md:py-8">
        
        {/* LEFT MAIN CONTENT */}
        <div className="flex-1 min-w-0 w-full max-w-[1280px] space-y-8">
          
          {/* Section 1 & 2: Header & Calorie Progress combined logically */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview / Calories */}
            <div className="lg:col-span-1 bg-white rounded-[18px] p-6 border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center h-[280px]">
              <h2 className="text-[18px] font-bold text-slate-800 mb-4">Today's Nutrition</h2>
              <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#6DDA6E" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="62.8" className="transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[24px] font-[800] text-slate-900">92</span>
                  <span className="text-[12px] font-bold text-slate-400">/ 100 Score</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4 h-[280px]">
              <StatCard icon={<Flame className="text-orange-500" />} title="Calories" value="1,450" target="/ 2,200 kcal" color="bg-orange-50" />
              <StatCard icon={<Droplet className="text-blue-500" />} title="Water" value="1.5" target="/ 3.0 L" color="bg-blue-50" />
              <StatCard icon={<Activity className="text-purple-500" />} title="Protein" value="85" target="/ 120 g" color="bg-purple-50" />
              <StatCard icon={<Target className="text-primary" />} title="Weight" value="72.5" target="kg" color="bg-[#6DDA6E]/10" />
            </div>
          </div>

          {/* Section 3: AI Food Scanner */}
          <div className="bg-white rounded-[18px] p-6 border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[320px] flex flex-col">
            <h2 className="text-[20px] font-bold text-slate-800 mb-4">AI Food Scanner</h2>
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-[16px] bg-slate-50 hover:bg-[#6DDA6E]/5 hover:border-[#6DDA6E]/50 transition-colors flex flex-col items-center justify-center cursor-pointer group">
              <div className="flex gap-4 mb-6">
                <button className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-600 group-hover:text-primary transition-colors border border-slate-100"><Camera size={24} /></button>
                <button className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-600 group-hover:text-primary transition-colors border border-slate-100"><ImageIcon size={24} /></button>
              </div>
              <h3 className="text-[16px] font-bold text-slate-700">Scan or Upload Food Image</h3>
              <p className="text-[13px] text-slate-500 mt-1">Get instant calorie and macro breakdown</p>
            </div>
          </div>

          {/* Section 4: Today's Meals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold text-slate-800">Today's Meals</h2>
              <button className="text-primary font-bold text-[14px] flex items-center gap-1"><Plus size={16} /> Add Meal</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <MealCard title="Breakfast" name="Oatmeal & Berries" cal="320" p="12g" c="45g" f="8g" img="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=200&h=200&fit=crop" />
              <MealCard title="Lunch" name="Grilled Chicken Salad" cal="450" p="35g" c="15g" f="22g" img="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop" />
              <MealCard title="Snacks" name="Greek Yogurt" cal="150" p="15g" c="10g" f="0g" img="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop" />
              <MealCard title="Dinner" name="Baked Salmon" cal="530" p="42g" c="20g" f="25g" img="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop" />
            </div>
          </div>

          {/* Section 7: Body Goal Planner */}
          <div>
            <h2 className="text-[20px] font-bold text-slate-800 mb-4">Body Goal Planner</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GoalCard title="Weight Loss" active />
              <GoalCard title="Muscle Gain" />
              <GoalCard title="Fat Loss" />
              <GoalCard title="Keto Diet" />
            </div>
          </div>

          {/* Section 9: Healthy Alternatives */}
          <div>
            <h2 className="text-[20px] font-bold text-slate-800 mb-4">Healthy Alternatives</h2>
            <div className="flex overflow-x-auto gap-5 pb-4 scrollbar-hide">
              <AltCard bad="Burger" good="Grilled Chicken" saved="450" />
              <AltCard bad="White Rice" good="Brown Rice" saved="120" />
              <AltCard bad="Soft Drink" good="Lemon Water" saved="210" />
              <AltCard bad="Potato Chips" good="Roasted Nuts" saved="180" />
            </div>
          </div>

          {/* Section 5, 11, 12: Analytics & Reports Mocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[18px] p-6 border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[18px] font-bold text-slate-800 mb-6">Health Impact Analysis</h2>
              <div className="space-y-4">
                <ImpactRow name="Heart Health" level="Excellent" val={95} color="bg-green-500" />
                <ImpactRow name="Kidney Health" level="Good" val={80} color="bg-blue-500" />
                <ImpactRow name="Liver Health" level="Warning" val={60} color="bg-yellow-500" />
                <ImpactRow name="Diabetes Risk" level="Low" val={20} color="bg-primary" />
              </div>
            </div>
            
            <div className="bg-white rounded-[18px] p-6 border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[18px] font-bold text-slate-800 mb-6">AI Nutrition Insights</h2>
              <ul className="space-y-4">
                <InsightItem text="Your protein intake is 15% below target. Add more lean meat or legumes." type="warning" />
                <InsightItem text="Excellent water hydration today! Keep it up." type="success" />
                <InsightItem text="High sugar detected in yesterday's snacks. Try replacing with fruits." type="alert" />
              </ul>
            </div>
          </div>

          {/* Section 15: Achievements */}
          <div>
            <h2 className="text-[20px] font-bold text-slate-800 mb-4">Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AchievementCard title="7 Day Streak" icon={<Flame size={32} className="text-orange-500" />} />
              <AchievementCard title="Water Goal" icon={<Droplet size={32} className="text-blue-500" />} />
              <AchievementCard title="Protein King" icon={<Activity size={32} className="text-purple-500" />} />
              <AchievementCard title="Balanced Diet" icon={<Scale size={32} className="text-primary" />} />
            </div>
          </div>

        </div>

        {/* RIGHT STICKY PANEL (Section 17 & Summary) */}
        <div className="hidden lg:block w-[340px] shrink-0">
          <div className="sticky top-[100px] space-y-6">
            
            {/* Summary Card */}
            <div className="bg-white rounded-[18px] p-6 border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-[16px] font-bold text-slate-800 mb-4">Daily Snapshot</h3>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Calories Left</span>
                <span className="font-bold text-slate-900">750 kcal</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Diet Score</span>
                <span className="font-bold text-[#6DDA6E]">92/100</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-500 font-medium">Current Goal</span>
                <span className="font-bold text-slate-900">Weight Loss</span>
              </div>
            </div>

            {/* Reminders (Section 16) */}
            <div className="bg-white rounded-[18px] p-6 border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-[16px] font-bold text-slate-800 mb-4 flex items-center gap-2"><Bell size={18}/> Reminders</h3>
              <ReminderRow title="Drink Water" time="In 20 mins" />
              <ReminderRow title="Evening Snack" time="5:00 PM" />
              <ReminderRow title="Vitamins" time="8:00 PM" />
            </div>

            {/* Consult Nutritionist (Section 17) */}
            <div className="bg-white rounded-[18px] p-6 border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6DDA6E]/10 rounded-full blur-2xl -z-10"></div>
              <div className="w-[90px] h-[90px] mx-auto rounded-full bg-slate-200 mb-4 border-4 border-white shadow-sm relative overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1594824432258-2022d4f3b14b?w=200&h=200&fit=crop" alt="Doctor" fill className="object-cover" />
              </div>
              <h3 className="text-[18px] font-bold text-slate-900">Dr. Sarah Rahman</h3>
              <p className="text-[13px] font-medium text-slate-500 mb-2">Clinical Nutritionist • 8 Yrs Exp</p>
              <div className="flex justify-center items-center gap-1 text-[13px] font-bold text-amber-500 mb-5">
                <Star size={14} className="fill-current" /> 4.9 (120 Reviews)
              </div>
              <button className="w-full py-3 bg-primary hover:bg-[#5bc25c] text-white font-bold rounded-xl transition-colors shadow-md shadow-primary/20">
                Book Appointment
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full h-[74px] bg-white border-t border-[#E5E7EB] px-4 flex items-center justify-between z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] pb-safe">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
          <span className="text-[18px] font-[800] text-slate-900">750 <span className="text-[14px]">kcal</span></span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
          <span className="text-[18px] font-[800] text-primary">92</span>
        </div>
        <button className="h-[44px] px-6 bg-primary text-white font-bold rounded-xl shadow-md shadow-primary/20">
          Book Expert
        </button>
      </div>

    </div>
  );
}

// Subcomponents
const StatCard = ({ icon, title, value, target, color }: any) => (
  <div className="bg-white rounded-[16px] p-4 border border-[#E5E7EB] flex flex-col justify-between">
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center mb-2`}>{icon}</div>
    <div>
      <h4 className="text-[13px] font-bold text-slate-500 mb-1">{title}</h4>
      <div className="flex items-baseline gap-1">
        <span className="text-[20px] font-[800] text-slate-900">{value}</span>
        <span className="text-[12px] font-medium text-slate-400">{target}</span>
      </div>
    </div>
  </div>
);

const MealCard = ({ title, name, cal, p, c, f, img }: any) => (
  <div className="bg-white rounded-[18px] p-5 border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[220px] flex flex-col">
    <div className="flex justify-between items-start mb-3">
      <span className="text-[11px] font-[800] text-slate-400 uppercase tracking-widest">{title}</span>
      <div className="flex gap-2">
        <button className="text-slate-400 hover:text-primary transition-colors"><Edit2 size={14} /></button>
        <button className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    </div>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-[60px] h-[60px] bg-slate-100 rounded-full relative overflow-hidden shrink-0">
        <Image src={img} alt={name} fill className="object-cover" />
      </div>
      <div>
        <h3 className="text-[15px] font-bold text-slate-800 leading-tight mb-1 line-clamp-2">{name}</h3>
        <span className="text-[13px] font-bold text-primary">{cal} kcal</span>
      </div>
    </div>
    <div className="mt-auto flex justify-between bg-slate-50 p-2 rounded-lg text-[11px] font-bold text-slate-600">
      <div className="flex flex-col items-center"><span>{p}</span><span className="text-slate-400 font-medium text-[9px]">PRO</span></div>
      <div className="flex flex-col items-center"><span>{c}</span><span className="text-slate-400 font-medium text-[9px]">CARB</span></div>
      <div className="flex flex-col items-center"><span>{f}</span><span className="text-slate-400 font-medium text-[9px]">FAT</span></div>
    </div>
  </div>
);

const GoalCard = ({ title, active }: any) => (
  <div className={`h-[130px] rounded-[18px] border-2 flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${active ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-[#E5E7EB] bg-white hover:border-slate-300'}`}>
    <Target size={28} className={`mb-3 ${active ? 'text-primary' : 'text-slate-400'}`} />
    <span className={`text-[14px] font-bold text-center ${active ? 'text-primary' : 'text-slate-700'}`}>{title}</span>
  </div>
);

const AltCard = ({ bad, good, saved }: any) => (
  <div className="w-[240px] shrink-0 h-[160px] bg-white rounded-[18px] border border-[#E5E7EB] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center relative overflow-hidden">
    <div className="absolute top-0 right-0 w-16 h-16 bg-[#6DDA6E]/10 rounded-bl-full"></div>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[13px] font-bold text-rose-500 line-through">{bad}</span>
      <ChevronRight size={14} className="text-slate-300" />
      <span className="text-[14px] font-[800] text-[#065f46]">{good}</span>
    </div>
    <div className="flex items-center gap-2 mt-2">
      <TrendingDown size={18} className="text-primary" />
      <span className="text-[12px] font-bold text-slate-500">Saves <strong className="text-primary">{saved} kcal</strong></span>
    </div>
  </div>
);

const ImpactRow = ({ name, level, val, color }: any) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-[14px] font-bold text-slate-700">{name}</span>
      <span className={`text-[12px] font-bold ${level === 'Warning' ? 'text-yellow-600' : 'text-slate-500'}`}>{level}</span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }}></div>
    </div>
  </div>
);

const InsightItem = ({ text, type }: any) => (
  <li className={`p-4 rounded-xl text-[13px] font-medium flex items-start gap-3 ${
    type === 'warning' ? 'bg-orange-50 text-orange-800' : 
    type === 'success' ? 'bg-[#6DDA6E]/10 text-[#065f46]' : 
    'bg-rose-50 text-rose-800'
  }`}>
    <div className="mt-0.5 shrink-0">
      {type === 'warning' ? <Flame size={16} className="text-orange-500" /> : 
       type === 'success' ? <CheckCircle2 size={16} className="text-primary" /> : 
       <Activity size={16} className="text-rose-500" />}
    </div>
    {text}
  </li>
);

const AchievementCard = ({ title, icon }: any) => (
  <div className="h-[120px] bg-white rounded-[18px] border border-[#E5E7EB] flex flex-col items-center justify-center p-4 text-center">
    <div className="mb-2">{icon}</div>
    <span className="text-[12px] font-bold text-slate-700">{title}</span>
  </div>
);

const ReminderRow = ({ title, time }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Clock size={14}/></div>
      <span className="text-[14px] font-bold text-slate-700">{title}</span>
    </div>
    <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{time}</span>
  </div>
);

const CheckCircle2 = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

// Skeleton UI Component
function NutritionSkeleton() {
  return (
    <div className="w-full h-full overflow-y-auto bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-[280px] bg-slate-200 animate-pulse rounded-[18px]"></div>
            <div className="lg:col-span-2 grid grid-cols-2 gap-4 h-[280px]">
              {[1,2,3,4].map(i => <div key={i} className="bg-slate-200 animate-pulse rounded-[16px]"></div>)}
            </div>
          </div>
          <div className="h-[320px] bg-slate-200 animate-pulse rounded-[18px]"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-[220px] bg-slate-200 animate-pulse rounded-[18px]"></div>)}
          </div>
        </div>
        <div className="hidden lg:block w-[340px] h-[800px] bg-slate-200 animate-pulse rounded-[18px]"></div>
      </div>
    </div>
  );
}
