import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, BadgeCheck, UserCircle2, Stethoscope, Eye } from "lucide-react";
import { DoctorProfile } from "@/lib/mockData";

interface DoctorCardProps {
  doctor: DoctorProfile;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/40 group hover:border-primary/20 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,61,155,0.12)] transition-all duration-300">
      
      {/* Top: Avatar & Rating */}
      <div className="flex items-start justify-between mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden shadow-md ring-2 ring-green-500 ring-offset-2 ring-offset-white relative">
          <Image 
            src={doctor.image} 
            alt={doctor.name} 
            fill 
            sizes="64px"
            className="object-cover" 
          />
        </div>
        <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg text-xs font-bold">
          <Star size={12} className="fill-orange-500" />
          {doctor.rating}
        </div>
      </div>

      {/* Name & Verified */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-bold text-xl text-[#0a1628] truncate">{doctor.name}</h3>
        {doctor.verified && <BadgeCheck size={20} className="text-blue-500 fill-blue-50 shrink-0" />}
      </div>

      {/* Details with Icons */}
      <div className="space-y-2.5 mt-4 mb-6">
        <div className="flex items-center gap-2.5 text-slate-500 text-sm">
          <Stethoscope size={16} className="text-primary shrink-0" />
          <span className="truncate font-medium">{doctor.specialty}</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-500 text-sm">
          <UserCircle2 size={16} className="text-primary shrink-0" />
          <span className="font-medium">{doctor.experienceYears} Years Experience</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-500 text-sm">
          <MapPin size={16} className="text-primary shrink-0" />
          <span className="truncate font-medium">{doctor.location}</span>
        </div>
      </div>

      {/* View Profile Button */}
      <Link 
        href={`/doctors/${doctor.id}`}
        className="w-full bg-slate-50 border border-slate-200 hover:border-primary hover:bg-primary hover:text-white text-primary font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-md"
      >
        <Eye size={16} />
        View Profile
      </Link>
    </div>
  );
}
