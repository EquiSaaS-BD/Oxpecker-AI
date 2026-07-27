"use client";

export function DoctorDashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl skeleton-pulse" />
              <div className="w-14 h-6 rounded-full skeleton-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-20 rounded skeleton-pulse" />
              <div className="h-4 w-32 rounded skeleton-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table Skeleton */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="h-5 w-36 rounded skeleton-pulse" />
            <div className="h-8 w-24 rounded-lg skeleton-pulse" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="w-9 h-9 rounded-full skeleton-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 rounded skeleton-pulse" />
                  <div className="h-3 w-24 rounded skeleton-pulse" />
                </div>
                <div className="h-6 w-16 rounded-full skeleton-pulse" />
                <div className="h-8 w-16 rounded-lg skeleton-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Appointments Skeleton */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="h-5 w-40 rounded skeleton-pulse mb-5" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full skeleton-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3.5 w-28 rounded skeleton-pulse" />
                    <div className="h-3 w-20 rounded skeleton-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 rounded-full skeleton-pulse" />
                  <div className="h-5 w-14 rounded-full skeleton-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
