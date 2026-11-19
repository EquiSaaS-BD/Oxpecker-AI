import { DoctorDashboardSkeleton } from "@/components/doctor/DoctorDashboardSkeleton";

export default function DoctorDashboardLoading() {
  return (
    <div className="w-full py-2">
      <DoctorDashboardSkeleton />
    </div>
  );
}
