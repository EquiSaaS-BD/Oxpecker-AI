import { DoctorDashboardSkeleton } from "@/components/doctor/DoctorDashboardSkeleton";

export default function HospitalDashboardLoading() {
  return (
    <div className="w-full py-2">
      <DoctorDashboardSkeleton />
    </div>
  );
}
